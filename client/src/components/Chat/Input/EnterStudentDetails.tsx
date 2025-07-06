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
import ApiKeyDialog from '~/components/SidePanel/Agents/Code/ApiKeyDialog';
import { useLocalize, useHasAccess, useCodeApiKeyForm } from '~/hooks';
import CheckboxButton from '~/components/ui/CheckboxButton';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import { useVerifyAgentToolAuth } from '~/data-provider';
import { ephemeralAgentByConvoId } from '~/store';
import { Button } from '~/components/ui';
import { UserPlus } from 'lucide-react';

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

const label = 'Enter Student Details';

function StudentDetailsFormButton({
  conversationId,
  className,
}: {
  conversationId?: string | null;
  className?: string;
}) {
  return (
    <>
      <Button
        className={`mainChatButton ${className}`}
        variant="secondary"
        onClick={() => console.log('Student Details Form')}
        aria-label="Generate Files"
      >
        <UserPlus className="h-4 w-4" color="#da7b41" size={1}></UserPlus>
        {label}
      </Button>
    </>
  );
}

export default memo(StudentDetailsFormButton);
