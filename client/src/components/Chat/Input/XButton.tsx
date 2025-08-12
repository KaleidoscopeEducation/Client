import debounce from 'lodash/debounce';
import React, { memo, useMemo, useCallback, useRef } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { TerminalSquareIcon } from 'lucide-react';
import {
  Tools,
  AuthType,
  Constants,
  LocalStorageKeys,
  PermissionTypes,
  Permissions,
  QueryKeys,
} from 'librechat-data-provider';
import ApiKeyDialog from '~/components/SidePanel/Agents/Code/ApiKeyDialog';
import { useLocalize, useHasAccess, useCodeApiKeyForm, useNewConvo } from '~/hooks';
import CheckboxButton from '~/components/ui/CheckboxButton';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import { useVerifyAgentToolAuth } from '~/data-provider';
import { ephemeralAgentByConvoId } from '~/store';
import { Button } from '~/components/ui';
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { TMessage, TStartupConfig } from 'librechat-data-provider';
import { modeState, Mode } from '~/store/mode';
import { useNavigate } from 'react-router-dom';
import store from '~/store';
import { useChatContext } from '~/Providers';

const label = 'Help Me Get Started';
const description = 'A space for you to process your thoughts';

function XButton({
  conversationId,
  className,
  mode,
  index = 0,
}: {
  conversationId?: string | null;
  className?: string;
  mode: Mode;
  index?: number;
}) {
  const setMode = useSetRecoilState(modeState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { conversation, newConversation } = useChatContext();

  const { newConversation: newConvo } = useNewConvo(index);

  const handleChange = () => {
    setMode(null);

    queryClient.setQueryData<TMessage[]>(
      [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
      [],
    );
    queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
    // navigate('/c/new', { state: { focusChat: true } });
    newConversation();

    console.log('✔️ XButton Clicked. Going back to home.');
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleChange}
        aria-label={`${label} - ${description}`}
        className={`flex w-full items-center justify-start gap-3 rounded-lg py-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''}`}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
          <X className="h-5 w-5" color="#007BFF" size={3}></X>
        </span>
      </Button>
    </>
  );
}

export default memo(XButton);
