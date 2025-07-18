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
  button,
  TMessage,
  QueryKeys,
} from 'librechat-data-provider';
import ApiKeyDialog from '~/components/SidePanel/Agents/Code/ApiKeyDialog';
import {
  useLocalize,
  useHasAccess,
  useCodeApiKeyForm,
  useGenFilesForm,
  useStudentHelpForm,
} from '~/hooks';
import CheckboxButton from '~/components/ui/CheckboxButton';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import { useVerifyAgentToolAuth } from '~/data-provider';
import { ephemeralAgentByConvoId } from '~/store';
import { Button } from '~/components/ui';
import { UserPlus } from 'lucide-react';
import StudentHelpDialog from '../StudentHelp/StudentHelpDialog';
import { on } from 'events';
import { StudentHelpFormData } from '~/hooks/Plugins/useStudentHelpForm';
import { useForm, FormProvider } from 'react-hook-form';
import { useModelSelectorContext } from '../Menus/Endpoints/ModelSelectorContext';
import { modeState, Mode } from '~/store/mode';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import store from '~/store';

// const storageCondition = (value: unknown, rawCurrentValue?: string | null) => {
//   if (rawCurrentValue) {
//     try {
//       const currentValue = rawCurrentValue?.trim() ?? '';
//       if (currentValue === 'true' && value === false) {
//         return true;
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   }
//   return value !== undefined && value !== null && value !== '' && value !== false;
// };

const label = 'Get help with a student';
const description = 'Interact with Kaleidoscope to better understand your student';

function StudentDetailsFormButton({
  conversationId,
  className,
  mode,
  convoCleanup,
  descriptionClassName,
  buttonClassName,
  index = 0,
}: {
  conversationId?: string | null;
  className?: string;
  convoCleanup?: () => void;
  mode: Mode;
  index?: number;
  props?: {
    label?: string;
    description?: string;
    descriptionClassName?: string;
    buttonClassName?: string;
  };
}) {
  const setMode = useSetRecoilState(modeState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { conversation } = store.useCreateConversationAtom(index);
  const [currentMode] = useRecoilState(modeState);

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

  const findSpecByName = <T extends { name: string }>(specs: T[], target: string): T | undefined =>
    specs.find((s) => s.name === target);

  const handleChange = () => {
    const spec = findSpecByName(modelSpecs, 'data-gathering-assistant');
    if (!spec) return;

    setMode(mode);
    queryClient.setQueryData<TMessage[]>(
      [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
      [],
    );
    queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
    navigate('/c/new', { state: { focusChat: true } });

    console.log('Student Button Pressed');
    // setIsDialogOpen(!isDialogOpen);
    handleSelectSpec(spec);
  };

  return (
    <>
      <Button
        variant={currentMode === 'student' ? 'outline' : 'secondary'}
        onClick={handleChange}
        aria-label="Generate Files"
        className={`flex w-full items-center justify-start gap-3 rounded-lg py-3 pl-[30%] pr-[30%] text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''} ${buttonClassName || ''}`}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
          <UserPlus className="h-5 w-5" color="#c28770" />
        </span>
        <div className="ml-4 flex flex-col leading-snug">
          <span className="text-sm font-medium">{label}</span>
          <span className={`text-xs text-muted-foreground ${descriptionClassName || ''}`}>
            {description}
          </span>
        </div>
      </Button>
      {/* <FormProvider {...methods}>
        <StudentHelpDialog
          // onSubmit={onSubmit}
          onSubmit={methods.handleSubmit(onSubmit)}
          authTypes={authTypes}
          isOpen={isDialogOpen}
          triggerRef={triggerRef}
          register={methods.register}
          // onRevoke={handleRevokeApiKey}
          onOpenChange={setIsDialogOpen}
          handleSubmit={methods.handleSubmit}
          isToolAuthenticated={isAuthenticated}
        />
      </FormProvider> */}
    </>
  );
}

export default memo(StudentDetailsFormButton);
function setMode(mode: any) {
  throw new Error('Function not implemented.');
}

