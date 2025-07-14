import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { modeState, Mode } from '~/store/mode';
import { useQueryClient } from '@tanstack/react-query';
import store from '~/store';
import type { TMessage, TStartupConfig } from 'librechat-data-provider';
import { QueryKeys, Constants } from 'librechat-data-provider';
import { useNavigate } from 'react-router-dom';



export interface StudentHelpFormData {
  assistant: string;
  assignmentCount: number;
  notes: string;
  index?: number;
}

export default function useStudentHelpForm({
  onSubmit,
  index = 0,
  mode = null,
}: {
  onSubmit?: (data: StudentHelpFormData) => void;
}) {
  const methods = useForm<StudentHelpFormData>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const setMode = useSetRecoilState(modeState);
  const queryClient = useQueryClient();
  const { conversation } = store.useCreateConversationAtom(index);
  const navigate = useNavigate();

  const submitHandler = useCallback(
    (data: StudentHelpFormData) => {
      // 🟢 THIS is where you run ANY logic you need
      // e.g. send to backend or start GPT call

      setMode(mode);
      /* 1️⃣ – Ctrl/Cmd‑click opens a blank chat in a new tab */
      // window.open('/c/new', '_blank');
     
      /* 2️⃣ – wipe the message cache for the current conversation */
      queryClient.setQueryData<TMessage[]>(
        [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
        [],
      );
      /* 3️⃣ – ensure future queries refetch fresh data */
      queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
      /* 4️⃣ – spin up a brand‑new conversation */
      // newConvo();
      navigate('/c/new', { state: { focusChat: true } });

      console.log('✔️ Student-Help data', data);
      onSubmit?.(data);

      // close dialog and clear form
      methods.reset();
      setIsDialogOpen(false);
    },
    [onSubmit, methods],
  );

  return {
    methods,
    isDialogOpen,
    setIsDialogOpen,
    onSubmit: submitHandler,
  };
}
