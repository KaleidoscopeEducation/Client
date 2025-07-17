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
  button,
} from 'librechat-data-provider';
import ApiKeyDialog from '~/components/SidePanel/Agents/Code/ApiKeyDialog';
import {
  useLocalize,
  useHasAccess,
  useCodeApiKeyForm,
  useGenFilesForm,
  useStudentHelpForm,
} from '~/hooks';
import { FilePlus2 } from 'lucide-react';
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

const label = 'Generate Files';
// const description = 'Interact with Kaleidoscope to better understand your student';

function FileGenFormButton({
  conversationId,
  className,
  convoCleanup,
  descriptionClassName,
  buttonClassName,
}: {
  conversationId?: string | null;
  className?: string;
  convoCleanup?: () => void;
  props?: {
    label?: string;
    description?: string;
    descriptionClassName?: string;
    buttonClassName?: string;
  };
}) {
  const triggerRef = useRef<HTMLInputElement>(null);
  const { data } = useVerifyAgentToolAuth(
    { toolId: Tools.web_search },
    {
      retry: 1,
    },
  );
  const authTypes = useMemo(() => data?.authTypes ?? [], [data?.authTypes]);
  const isAuthenticated = useMemo(() => data?.authenticated ?? false, [data?.authenticated]);
  const { methods, onSubmit, isDialogOpen, setIsDialogOpen } = useStudentHelpForm({
    onSubmit: (form: StudentHelpFormData) => {
      console.log('File Gen Form Submitted', form);
      setIsDialogOpen(false);
      // convoCleanup?.();
    },
  });

  const handleChange = () => {
    console.log('Generate Files');
    setIsDialogOpen(!isDialogOpen);
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleChange}
        aria-label="Generate Files"
        className={`flex w-full items-center gap-0 rounded-lg py-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''} ${buttonClassName || ''}`}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
          <FilePlus2 className="h-5 w-5" color="#ebb951" size={1}></FilePlus2>
        </span>
        <div className="ml-4 flex flex-col leading-snug">
          <span className="text-sm font-medium">{label}</span>
        </div>
      </Button>
      <FormProvider {...methods}>
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
      </FormProvider>
    </>
  );
}

export default memo(FileGenFormButton);
