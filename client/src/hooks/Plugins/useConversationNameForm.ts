import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { modeState, Mode } from '~/store/mode';
import { useQueryClient } from '@tanstack/react-query';
import store from '~/store';
import type { TMessage, TStartupConfig } from 'librechat-data-provider';
import { QueryKeys, Constants } from 'librechat-data-provider';
import { useNavigate } from 'react-router-dom';
import { useUpdateConversationMutation } from '~/data-provider';


export interface ConversationNameFormData {
  studentName: string;
}

export default function useConversationNameForm({
  onSubmit,
  index = 0,
  mode = null,
}: {
  onSubmit?: (data: ConversationNameFormData) => void;
}) {
  const methods = useForm<ConversationNameFormData>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const setMode = useSetRecoilState(modeState);
  const queryClient = useQueryClient();
  const { conversation } = store.useCreateConversationAtom(index);
  const navigate = useNavigate();
  const { mutateAsync: renameConversation } = useUpdateConversationMutation(
    conversation?.conversationId ?? Constants.NEW_CONVO,
  );
  // const { mutateAsync: createConversation } = useCreateConversationMutation();


  const submitHandler = useCallback(
    (data: ConversationNameFormData) => {
      console.log('here in userConversationNameForm');
      setMode(mode);
      queryClient.setQueryData<TMessage[]>(
        [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
        [],
      );
      queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
      // navigate('/c/new', { state: { focusChat: true } });

      console.log('✔️ Conversation Name data', data);
      onSubmit?.(data);

      methods.reset();
      // setIsDialogOpen(false);
    },
    [onSubmit, methods],
  );

  return {
    isDialogOpen,
    setIsDialogOpen,
    methods,
    onSubmit: submitHandler,
  };
}
