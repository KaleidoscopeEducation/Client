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
import { MessageCircleQuestion } from 'lucide-react';

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

const label = 'Help Me Get Started';

function GetStartedButton({
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
        onClick={() => console.log('Help Me Get Started')}
        aria-label="Generate Files"
      >
        <MessageCircleQuestion className="h-4 w-4" color="#599bf8" size={1}></MessageCircleQuestion>
        {label}
      </Button>
    </>
  );
}

export default memo(GetStartedButton);
