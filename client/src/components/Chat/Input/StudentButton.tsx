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
import CheckboxButton from '~/components/ui/CheckboxButton';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import { useVerifyAgentToolAuth } from '~/data-provider';
import { ephemeralAgentByConvoId } from '~/store';
import { Button } from '~/components/ui';
import { UserPlus } from 'lucide-react';
import StudentHelpDialog from '../StudentHelp/StudentHelpDialog';
import { on } from 'events';
import { StudentHelpFormData } from '~/hooks/Plugins/useStudentHelpForm';

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
      console.log('Student Help Form Submitted', form);
      setIsDialogOpen(false);
      convoCleanup?.();
    },
  });

  const handleChange = () => {
    console.log('Student Details Form');
    setIsDialogOpen(!isDialogOpen);
  };

  const extraClassName = descriptionClassName;

  console.log(extraClassName);

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleChange}
        aria-label="Generate Files"
        className={`flex w-full items-center justify-start gap-3 rounded-lg py-3 pl-[30%] pr-[30%] text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''} ${buttonClassName || ''}`}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
          <UserPlus className="h-5 w-5 text-orange-500" />
        </span>
        <div className="ml-4 flex flex-col leading-snug">
          <span className="text-sm font-medium">{label}</span>
          <span className={`text-xs text-muted-foreground ${descriptionClassName || ''}`}>
            {description}
          </span>
        </div>
      </Button>
      <StudentHelpDialog
        onSubmit={onSubmit}
        authTypes={authTypes}
        isOpen={isDialogOpen}
        triggerRef={triggerRef}
        register={methods.register}
        // onRevoke={handleRevokeApiKey}
        onOpenChange={setIsDialogOpen}
        handleSubmit={methods.handleSubmit}
        isToolAuthenticated={isAuthenticated}
      />
    </>
  );
}

export default memo(StudentDetailsFormButton);
