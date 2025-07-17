// src/components/ModeButton.tsx
import { use } from 'i18next';
import { QueryKeys, Constants } from 'librechat-data-provider';
import type { TMessage, TStartupConfig } from 'librechat-data-provider';
import { set } from 'lodash';
import { ComponentType, useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { modeState, Mode } from '~/store/mode';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import store from '~/store';
import { useLocalize, useNewConvo } from '~/hooks';
import {
  ModelSelectorProvider,
  useModelSelectorContext,
} from '~/components/Chat/Menus/Endpoints/ModelSelectorContext';
import type * as t from 'librechat-data-provider';

type SharedProps = {
  className?: string;
  conversationId?: string;
  modeButtonClassNames?: string;
  startupConfig?: t.TStartupConfig | undefined;
};

interface ModeButtonProps<P> {
  Component: ComponentType<P & SharedProps>;
  mode: Mode;
  props: P & SharedProps;
  index?: number;
  startupConfig?: TStartupConfig | undefined;
}

/** Adds `onClick` behaviour without touching the original component source */
export function ModeButton<P extends object>({
  Component,
  mode,
  props,
  index = 0,
  startupConfig = undefined,
}: ModeButtonProps<P>) {
  const setMode = useSetRecoilState(modeState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { conversation } = store.useCreateConversationAtom(index);
  const { newConversation: newConvo } = useNewConvo(index);

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      /* 0️⃣ – flip the UI mode first so the change is instant */
      setMode(mode);
      /* 1️⃣ – Ctrl/Cmd‑click opens a blank chat in a new tab */
      if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
        window.open('/c/new', '_blank');
        return;
      }
      /* 2️⃣ – wipe the message cache for the current conversation */
      queryClient.setQueryData<TMessage[]>(
        [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
        [],
      );
      /* 3️⃣ – ensure future queries refetch fresh data */
      queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
      /* 4️⃣ – spin up a brand‑new conversation */
      newConvo();
      navigate('/c/new', { state: { focusChat: true } });
      /* 5️⃣ – close the sidebar on small screens */
      // if (isSmallScreen && toggleNav) {
      //   toggleNav();
      // }
    },
    [setMode, mode, queryClient, newConvo, navigate],
  );

  const convoCleanup = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      /* 0️⃣ – flip the UI mode first so the change is instant */
      setMode(mode);
      /* 1️⃣ – Ctrl/Cmd‑click opens a blank chat in a new tab */
      if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
        window.open('/c/new', '_blank');
        return;
      }
      /* 2️⃣ – wipe the message cache for the current conversation */
      queryClient.setQueryData<TMessage[]>(
        [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
        [],
      );
      /* 3️⃣ – ensure future queries refetch fresh data */
      queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
      /* 4️⃣ – spin up a brand‑new conversation */
      newConvo();
      navigate('/c/new', { state: { focusChat: true } });
      /* 5️⃣ – close the sidebar on small screens */
      // if (isSmallScreen && toggleNav) {
      //   toggleNav();
      // }
    },
    [setMode, mode, queryClient, newConvo, navigate],
  );

  return (
    <ModelSelectorProvider startupConfig={startupConfig}>
      <button
        type="button"
        className={`text-left ${props.modeButtonClassNames}`}
        // onClick={(e) => handleClick(e)}
        // convoCleanup={convoCleanup}
      >
        <Component {...props} convoCleanup={convoCleanup} mode={mode} />
      </button>
    </ModelSelectorProvider>
  );
}
function navigate(arg0: string, arg1: { state: { focusChat: boolean } }) {
  throw new Error('Function not implemented.');
}

function newConvo() {
  throw new Error('Function not implemented.');
}
