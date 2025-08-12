import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys, Constants } from 'librechat-data-provider';
import type { TMessage } from 'librechat-data-provider';
import { TooltipAnchor, Button } from '~/components/ui';
import { NewChatIcon } from '~/components/svg';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useChatContext } from '~/Providers';
import { useLocalize } from '~/hooks';
import { modeState, Mode } from '~/store/mode';
import { Home } from 'lucide-react';

export default function HeaderNewChat() {
  const localize = useLocalize();
  const queryClient = useQueryClient();
  const { conversation, newConversation } = useChatContext();
  const setMode = useSetRecoilState(modeState);

  const clickHandler: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log(modeState);
    setMode(null);
    if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
      window.open('/c/new', '_blank');
      return;
    }
    queryClient.setQueryData<TMessage[]>(
      [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
      [],
    );
    queryClient.invalidateQueries([QueryKeys.messages]);
    newConversation();
  };

  return (
    <TooltipAnchor
      description={localize('com_ui_new_chat')}
      render={
        <Button
          size="icon"
          variant="outline"
          data-testid="wide-header-new-chat-button"
          aria-label={localize('com_ui_new_chat')}
          className="rounded-xl border border-border-light bg-surface-secondary p-2 hover:bg-surface-hover max-md:hidden"
          onClick={clickHandler}
        >
          <NewChatIcon />
          {/* <Home className="h-5 w-5" /> */}
        </Button>
      }
    />
  );
}
