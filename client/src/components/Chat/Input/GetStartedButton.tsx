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
  QueryKeys,
} from 'librechat-data-provider';
import ApiKeyDialog from '~/components/SidePanel/Agents/Code/ApiKeyDialog';
import { useLocalize, useHasAccess, useCodeApiKeyForm, useNewConvo } from '~/hooks';
import CheckboxButton from '~/components/ui/CheckboxButton';
import useLocalStorage from '~/hooks/useLocalStorageAlt';
import { useVerifyAgentToolAuth } from '~/data-provider';
import { ephemeralAgentByConvoId } from '~/store';
import { Button } from '~/components/ui';
import { MessageCircleQuestion } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { TMessage, TStartupConfig } from 'librechat-data-provider';
import { modeState, Mode } from '~/store/mode';
import { useNavigate } from 'react-router-dom';
import store from '~/store';
import { useModelSelectorContext } from '../Menus/Endpoints/ModelSelectorContext';

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

const label = 'Help Me Get Started';
const description = 'A space for you to process your thoughts';

function GetStartedButton({
  conversationId,
  className,
  mode,
  index = 0,
  descriptionClassName,
  buttonClassName,
}: {
  conversationId?: string | null;
  className?: string;
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
  const [currentMode] = useRecoilState(modeState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { conversation } = store.useCreateConversationAtom(index);
  const { newConversation: newConvo } = useNewConvo(index);

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

    console.log('setting mode to:', mode);
    setMode(mode);
    queryClient.setQueryData<TMessage[]>(
      [QueryKeys.messages, conversation?.conversationId ?? Constants.NEW_CONVO],
      [],
    );
    queryClient.invalidateQueries({ queryKey: [QueryKeys.messages] });
    navigate('/c/new', { state: { focusChat: true } });
    console.log('✔️ Help Me Get Started');
    handleSelectSpec(spec);
  };

  return (
    <>
      <Button
        variant={currentMode === 'start' ? 'outline' : 'secondary'}
        onClick={handleChange}
        aria-label={`${label} - ${description}`}
        className={`flex w-full items-center justify-start gap-3 rounded-lg py-3 pl-[30%] pr-[30%] text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${className ?? ''} ${buttonClassName || ''}`}
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center">
          <MessageCircleQuestion
            className="h-5 w-5"
            color="#ebb951"
            size={3}
          ></MessageCircleQuestion>
        </span>
        <div className="ml-4 flex flex-col leading-snug">
          <span className="text-sm font-medium">{label}</span>
          <span className={`text-xs text-muted-foreground ${descriptionClassName || ''}`}>
            {description}
          </span>
        </div>
      </Button>
    </>
  );
}

export default memo(GetStartedButton);
