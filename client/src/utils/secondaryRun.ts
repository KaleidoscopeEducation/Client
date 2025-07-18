import { flattenConversation } from '~/utils/formatConversation';
import { QueryKeys, TMessage } from 'librechat-data-provider';
import { queryClient } from '~/queryClientSingleton'; // ← import your singleton
import { v4 as uuid } from 'uuid';                   // if you need random ids
import { useQueryClient } from '@tanstack/react-query';

/* --------------------------------------------------------- */
/* 1. Launch the run                                          */
/* --------------------------------------------------------- */

export async function launchSecondaryRun({
  conversationTree,
  assistantId, // the *other* assistant (starts with "asst_")
  conversationId,
}: {
  conversationTree: TMessage[]; // your nested tree
  assistantId: string;
  conversationId: string;
}) {
  const flatMsgs = flattenConversation(conversationTree);

  const res = await fetch('/api/assistants/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assistant_id: assistantId,
      thread: { messages: flatMsgs },
      instructions: `
        Please return your answer primarily as one or more files (PDF, DOCX, or CSV).
        You may include a short textual summary, but attach the actual content as files.
      `,
    }),
  });

  const { id: runId } = await res.json();
  streamRunEvents({ runId, conversationId });
}

/* --------------------------------------------------------- */
/* 2. Listen to events                                        */
/* --------------------------------------------------------- */

function streamRunEvents({ runId, conversationId }: { runId: string; conversationId: string }) {
  const es = new EventSource(`/api/assistants/runs/${runId}/events?stream=true`);

  let pendingText = '';

  es.onmessage = (ev) => {
    const data = JSON.parse(ev.data);

    switch (data.event) {
      case 'tokens':
        pendingText += data.token;
        break;

      case 'file':
        // if some tokens accumulated, flush them as a normal assistant message
        if (pendingText.trim()) {
          addAssistantText(pendingText, conversationId);
          pendingText = '';
        }
        handleIncomingFile(data.file_id, conversationId);
        break;

      case 'completed':
        if (pendingText.trim()) {
          addAssistantText(pendingText, conversationId);
        }
        es.close();
        break;

      case 'error':
        console.error('Secondary run error →', data);
        es.close();
        break;
    }
  };

  es.onerror = (e) => {
    console.error('SSE error', e);
    es.close();
  };
}

/* --------------------------------------------------------- */
/* 3. File handler                                            */
/* --------------------------------------------------------- */

async function handleIncomingFile(fileId: string, convoId: string) {
  const head = await fetch(`/api/files/${fileId}`, { method: 'HEAD' });
  const disp = head.headers.get('content-disposition') ?? '';
  const [, filename = fileId] = /filename="(.+?)"/.exec(disp) ?? [];
  const size = Number(head.headers.get('content-length') ?? 0);

  addFileMessageToChat({ url: `/api/files/${fileId}`, name: filename, size }, convoId);
}

/* --------------------------------------------------------- */
/* 4. Inject assistant messages into the current chat cache   */
/* --------------------------------------------------------- */

function addAssistantText(
  text: string,
  convoId: string,
  queryClient: ReturnType<typeof useQueryClient>,
  {
    parentId = null, // pass the messageId you’re replying to (or null if root)
    fileIds = Partial < TFile > [], // list of file_ids returned from the upload step
  }: { parentId?: string | null; fileIds?: string[] } = {},
) {
  const now = new Date().toISOString();

  const newMsg: TMessage = {
    /* ── mandatory ─────────────────── */
    messageId: uuid(),
    conversationId: convoId,
    parentMessageId: parentId, // <- this field fixed the type error
    text,
    isCreatedByUser: false,

    /* ── optional but useful ───────── */
    sender: 'Assistant',
    endpoint: 'assistants',
    model: 'secondary-run',

    createdAt: now,
    updatedAt: now,

    /* attachments (empty if none) ─── */
    files: fileIds,
  };

  // push into the cache so LibreChat UI shows it immediately
  queryClient.setQueryData<TMessage[]>([QueryKeys.messages, convoId], (old = []) => [
    ...old,
    newMsg,
  ]);
}

function addFileMessageToChat(
  { url, name, size }: { url: string; name: string; size: number },
  convoId: string,
) {
  const newMsg: TMessage = {
    messageId: uuid(),
    conversationId: convoId,
    sender: 'Assistant',
    role: 'assistant',
    text: `📎 ${name}`,
    files: [{ id: url, name, size }],
    file_ids: [],
    createdAt: new Date().toISOString(),
    isCreatedByUser: false,
    endpoint: 'assistants',
    model: 'secondary-run',
  };

  queryClient.setQueryData<TMessage[]>(
    [QueryKeys.messages, convoId],
    (old = []) => [...old, newMsg],
  );
}
