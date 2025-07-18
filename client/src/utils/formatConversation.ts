// Types LibreChat actually stores: tweak if your fields differ
type RawMessage = {
  sender: 'User' | 'Assistant';
  text?: string;
  content?: { type: 'text'; text: { value: string } }[];
  file_ids?: string[];
  children?: RawMessage[];
  createdAt: string;
};

export type AgentMessage = {
  role: 'user' | 'assistant';
  content: string;
  file_ids?: string[];
};

/**
 * Flattens LibreChat's tree of messages into the linear array
 * the Agents / Assistants run API expects.
 */
export function flattenConversation(root: RawMessage[]): AgentMessage[] {
  const flat: (AgentMessage & { _createdAt: string })[] = [];

  const walk = (nodes: RawMessage[]) => {
    for (const m of nodes) {
      flat.push({
        role: m.sender === 'User' ? 'user' : 'assistant',
        content:
          m.text ??
          m.content
            ?.filter((c) => c.type === 'text')
            .map((c) => c.text.value)
            .join('') ??
          '',
        file_ids: m.file_ids ?? [],
        _createdAt: m.createdAt,
      });

      if (m.children?.length) walk(m.children);
    }
  };

  walk(root);

  // chronological order (safer when assistant edits are allowed)
  return flat
    .sort((a, b) => new Date(a._createdAt).getTime() - new Date(b._createdAt).getTime())
    .map(({ _createdAt, ...rest }) => rest); // strip helper key
}
