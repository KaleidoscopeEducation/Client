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
} from 'librechat-data-provider';
import { useLocalize, useHasAccess, useGenFilesForm } from '~/hooks';
import CheckboxButton from '~/components/ui/CheckboxButton';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import { useVerifyAgentToolAuth } from '~/data-provider';
import { ephemeralAgentByConvoId } from '~/store';
import { Button } from '~/components/ui';
import { FilePlus2 } from 'lucide-react';
import FileGenDialog from '~/components/Chat/FileGenerator/FileGenDIalog';
import { TextareaAutosize } from '~/components/ui';

const storageCondition = (value: unknown, rawCurrentValue?: string | null) => {
  if (rawCurrentValue) {
    try {
      const currentValue = rawCurrentValue?.trim() ?? '';
      if (currentValue === 'true' && value === false) {
        return true;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return value !== undefined && value !== null && value !== '' && value !== false;
};

const label = 'Generate Assignments';

function GenerateFilesButton({
  conversationId,
  className,
}: {
  conversationId?: string | null;
  className?: string;
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
  const { methods, onSubmit, isDialogOpen, setIsDialogOpen, handleRevokeApiKey } = useGenFilesForm(
    {},
  );

  // const handleChange = useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>, isChecked: boolean) => {
  //     setIsDialogOpen(true);
  //     e.preventDefault();
  //     return;
  //   },
  //   [setIsDialogOpen, isAuthenticated],
  // );

  const handleChange = () => {
    // console.log('Generate Files Modal Opened');

    setIsDialogOpen(!isDialogOpen);
  };

  return (
    <>
      <Button
        className={`mainChatButton ${className}`}
        variant="secondary"
        onClick={handleChange}
        aria-label="Generate Files"
      >
        <FilePlus2 className="h-4 w-4" color="#72b147" size={1}></FilePlus2>
        {label}
      </Button>
      <FileGenDialog
        onSubmit={onSubmit}
        authTypes={authTypes}
        isOpen={isDialogOpen}
        triggerRef={triggerRef}
        register={methods.register}
        onRevoke={handleRevokeApiKey}
        onOpenChange={setIsDialogOpen}
        handleSubmit={methods.handleSubmit}
        isToolAuthenticated={isAuthenticated}
      />
    </>
  );
}

export default memo(GenerateFilesButton);
