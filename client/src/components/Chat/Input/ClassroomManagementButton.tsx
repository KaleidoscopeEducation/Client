import debounce from 'lodash/debounce';
import React, { memo, useMemo, useCallback, useRef } from 'react';
import { useRecoilState } from 'recoil';
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
import { useLocalize, useHasAccess, useGenFilesForm, useNewConvo } from '~/hooks';
import CheckboxButton from '~/components/ui/CheckboxButton';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import { useVerifyAgentToolAuth } from '~/data-provider';
import { ephemeralAgentByConvoId } from '~/store';
import { Button } from '~/components/ui';
import { UsersRound, MessageCircleQuestion } from 'lucide-react';
import FileGenDialog from '~/components/Chat/FileGenerator/FileGenDialog';
import { TextareaAutosize } from '~/components/ui';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import store from '~/store';
import { useQueryClient } from '@tanstack/react-query';
import { modeState, Mode } from '~/store/mode';
import { useNavigate } from 'react-router-dom';
import type { TMessage, TStartupConfig } from 'librechat-data-provider';
import { useModelSelectorContext } from '../Menus/Endpoints/ModelSelectorContext';

const label = 'Application Help';
const description = 'Learn how to get the most out of the Kaleidoscope site';

function ClassroomManagementButton({
  conversationId,
  className,
  index = 0,
  mode,
  descriptionClassName,
  buttonClassName,
}: {
  conversationId?: string | null;
  className?: string;
  index?: number;
  mode: Mode;
  props?: {
    label?: string;
    description?: string;
    descriptionClassName?: string;
    buttonClassName?: string;
  };
}) {
  // const triggerRef = useRef<HTMLInputElement>(null);
  // const { data } = useVerifyAgentToolAuth(
  //   { toolId: Tools.web_search },
  //   {
  //     retry: 1,
  //   },
  // );
  // const authTypes = useMemo(() => data?.authTypes ?? [], [data?.authTypes]);
  // const isAuthenticated = useMemo(() => data?.authenticated ?? false, [data?.authenticated]);
  // const { methods, onSubmit, isDialogOpen, setIsDialogOpen, handleRevokeApiKey } = useGenFilesForm(
  //   {},
  // );

  // const handleChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>, isChecked: boolean) => {
  //     setIsDialogOpen(true);
  //     e.preventDefault();
  //     return;
  //   },
  //   [setIsDialogOpen, isAuthenticated],
  // );

  const {
    // LibreChat
    modelSpecs,
    mappedEndpoints,
    endpointsConfig,
    // State
    searchValue,
    searchResults,
    selectedValues,

    // Functions
    setSearchValue,
    setSelectedValues,
    // Dialog
    keyDialogOpen,
    keyDialogEndpoint,
    handleSelectSpec,
  } = useModelSelectorContext();

  const setMode = useSetRecoilState(modeState);
  const [currentMode] = useRecoilState(modeState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { conversation } = store.useCreateConversationAtom(index);
  const { newConversation: newConvo } = useNewConvo(index);
  const findSpecByName = <T extends { name: string }>(specs: T[], target: string): T | undefined =>
    specs.find((s) => s.name === target);

  const handleChange = () => {
    const spec = findSpecByName(modelSpecs, 'application-help');
    if (!spec) return;

    console.log('setting mode to:', mode);
    setMode(mode);
    queryClient.setQueryData<TMessage[]>(
      [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
      [],
    );
    queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
    navigate('/c/new', { state: { focusChat: true } });

    console.log('✔️ Classroom Management');
    handleSelectSpec(spec);
  };

  return (
    <>
      <Button
        className={`flex w-full items-center justify-start gap-3 rounded-lg py-3 pl-[15%] pr-[30%] text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''} ${buttonClassName || ''}`}
        variant={currentMode === 'classroom' ? 'outline' : 'secondary'}
        onClick={handleChange}
        aria-label="Generate Files"
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
          <MessageCircleQuestion
            className="h-5 w-5"
            color="#72b147"
            size={1}
          ></MessageCircleQuestion>
        </span>
        <div className="ml-4 flex flex-col leading-snug">
          <span className="text-sm font-medium">{label}</span>
          <span className={`text-xs text-muted-foreground ${descriptionClassName || ''}`}>
            {description}
          </span>
        </div>
      </Button>
      {/* <FileGenDialog
        onSubmit={onSubmit}
        authTypes={authTypes}
        isOpen={isDialogOpen}
        triggerRef={triggerRef}
        register={methods.register}
        onRevoke={handleRevokeApiKey}
        onOpenChange={setIsDialogOpen}
        handleSubmit={methods.handleSubmit}
        isToolAuthenticated={isAuthenticated}
      /> */}
    </>
  );
}

export default memo(ClassroomManagementButton);
