import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import * as Menu from '@ariakit/react/menu';
import { AuthType, SearchCategories, RerankerTypes } from 'librechat-data-provider';
import type { UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';
// import type { SearchApiKeyFormData } from '~/hooks/Plugins/useAuthSearchTool';
import type { MenuItemProps } from '~/common';
import { Input, Button, OGDialog, Label } from '~/components/ui';
import OGDialogTemplate from '~/components/ui/OGDialogTemplate';
import DropdownPopup from '~/components/ui/DropdownPopup';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { set } from 'lodash';
import { Textarea } from '~/components/ui/Textarea';
import { useModelSelectorContext } from '~/components/Chat/Menus/Endpoints/ModelSelectorContext';
import { on } from 'events';
import { useFormContext } from 'react-hook-form';
import { ConversationNameFormData } from '~/hooks/Plugins/useConversationNameForm';

export default function ConversationNameDialog({
  isOpen,
  onSubmit,
  onOpenChange,
  register,
  triggerRef,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ConversationNameFormData) => void;
  register: UseFormRegister<ConversationNameFormData>;
  triggerRef?: React.RefObject<HTMLInputElement>;
}) {
  const localize = useLocalize();
  const { data: config } = useGetStartupConfig();

  // const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  // const [scraperDropdownOpen, setScraperDropdownOpen] = useState(false);
  // const [rerankerDropdownOpen, setRerankerDropdownOpen] = useState(false);
  // const [assignmentNumberDropdownOpen, setAssignmentNumberDropdownOpen] = useState(false);
  // const { handleSelectSpec, endpointsConfig } = useModelSelectorContext();
  // const [assistant, setSelectedSubject] = useState<string | null>(null);
  // const [selectedAssignmentNumber, setSelectedAssignmentNumber] = useState<string | null>(null);
  const { handleSubmit } = useFormContext<ConversationNameFormData>();

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

  const title = 'Tell us a little more about your student';
  const secondLine =
    'Select the class subject, the number of assignments, and add any details or instructions you want to include.';
  const assistantTitle = 'Assistant';
  const numberOfAssignmentsTitle = 'Number of Assignments';
  const additionalGuidanceTitle = 'Student Name';

  return (
    <OGDialog open={isOpen} onOpenChange={onOpenChange} triggerRef={triggerRef}>
      <OGDialogTemplate
        className="w-11/12 sm:w-[500px]"
        title=""
        main={
          <>
            <div className="mb-4 text-center font-medium">{title}</div>
            <div className="mb-4 text-center text-sm">{secondLine}</div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-md w-fit font-medium">{additionalGuidanceTitle}</Label>
                </div>
                <Textarea
                  placeholder={'What is the name of your student?'}
                  autoComplete="one-time-code"
                  readOnly={true}
                  onFocus={(e) => (e.target.readOnly = false)}
                  {...register('studentName', { required: true })}
                  className="w-full rounded-md border border-border-light px-3 py-1 text-sm text-text-secondary focus:border-primary focus:outline-none"
                />
              </div>
            </form>
          </>
        }
        selection={{
          selectHandler: handleSubmit(onSubmit),
          selectClasses: 'bg-green-500 hover:bg-green-600 text-white',
          selectText: localize('com_ui_save'),
        }}
        // buttons={
        //   isToolAuthenticated && (
        //     <Button
        //       onClick={onRevoke}
        //       className="bg-destructive text-white transition-all duration-200 hover:bg-destructive/80"
        //     >
        //       {localize('com_ui_revoke')}
        //     </Button>
        //   )
        // }
        showCancelButton={true}
      />
    </OGDialog>
  );
}