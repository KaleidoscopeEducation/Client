import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import * as Menu from '@ariakit/react/menu';
import { AuthType, SearchCategories, RerankerTypes } from 'librechat-data-provider';
import type { UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';
import type { SearchApiKeyFormData } from '~/hooks/Plugins/useAuthSearchTool';
import type { MenuItemProps } from '~/common';
import { Input, Button, OGDialog, Label } from '~/components/ui';
import OGDialogTemplate from '~/components/ui/OGDialogTemplate';
import DropdownPopup from '~/components/ui/DropdownPopup';
import { useGetStartupConfig } from '~/data-provider';
import { useLocalize } from '~/hooks';
import { set } from 'lodash';
import { Textarea } from '~/components/ui/Textarea';

export default function StudentHelpDialog({
  isOpen,
  onSubmit,
  onOpenChange,
  isToolAuthenticated,
  register,
  triggerRef,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SearchApiKeyFormData) => void;
  isToolAuthenticated: boolean;
  register: UseFormRegister<SearchApiKeyFormData>;
  triggerRef?: React.RefObject<HTMLInputElement>;
}) {
  const localize = useLocalize();
  const { data: config } = useGetStartupConfig();
  const [selectedReranker, setSelectedReranker] = useState<
    RerankerTypes.JINA | RerankerTypes.COHERE
  >(
    config?.webSearch?.rerankerType === RerankerTypes.COHERE
      ? RerankerTypes.COHERE
      : RerankerTypes.JINA,
  );

  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  // const [scraperDropdownOpen, setScraperDropdownOpen] = useState(false);
  // const [rerankerDropdownOpen, setRerankerDropdownOpen] = useState(false);
  const [assignmentNumberDropdownOpen, setAssignmentNumberDropdownOpen] = useState(false);

  const classItems: MenuItemProps[] = [
    {
      label: 'Art',
      onClick: () => {},
    },
    {
      label: 'Creative Writing',
      onClick: () => {},
    },
    {
      label: 'Gardening',
      onClick: () => {},
    },
    {
      label: 'Movement & Mindfulness',
      onClick: () => {},
    },
    {
      label: 'Music',
      onClick: () => {},
    },
  ];


  //numbers 1-10 for assignment selection
  const assignmentNumbers = Array.from({ length: 10 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  }));

  const title = 'Tell us a little more about your student';
  const secondLine =
    'Select the class subject, the number of assignments, and add any details or instructions you want to include.';
  const assistantTitle = 'Assistant';
  const numberOfAssignmentsTitle = 'Number of Assignments';
  const additionalGuidanceTitle = 'Additional Guidance';

  return (
    <OGDialog open={isOpen} onOpenChange={onOpenChange} triggerRef={triggerRef}>
      <OGDialogTemplate
        className="w-11/12 sm:w-[500px]"
        title=""
        main={
          <>
            <div className="mb-4 text-center font-medium">{title}</div>
            <div className="mb-4 text-center text-sm">{secondLine}</div>
            <form onSubmit={onSubmit}>
              {/* Search Provider Section */}
              {/* {providerAuthType !== AuthType.SYSTEM_DEFINED && ( */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-md w-fit font-medium">{assistantTitle}</Label>
                </div>
                <DropdownPopup
                  menuId="search-provider-dropdown"
                  items={classItems}
                  isOpen={providerDropdownOpen}
                  setIsOpen={setProviderDropdownOpen}
                  trigger={
                    <Menu.MenuButton
                      onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                      className="flex items-center rounded-md border border-border-light px-3 py-1 text-sm text-text-secondary"
                    >
                      {'Class Subject'}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Menu.MenuButton>
                  }
                />
              </div>
              {/* )} */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-md w-fit font-medium">{numberOfAssignmentsTitle}</Label>
                </div>
                <DropdownPopup
                  menuId="search-provider-dropdown"
                  items={assignmentNumbers}
                  isOpen={assignmentNumberDropdownOpen}
                  setIsOpen={setAssignmentNumberDropdownOpen}
                  trigger={
                    <Menu.MenuButton
                      onClick={() => setAssignmentNumberDropdownOpen(!assignmentNumberDropdownOpen)}
                      className="flex items-center rounded-md border border-border-light px-3 py-1 text-sm text-text-secondary"
                    >
                      {'Number of Assignments'}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Menu.MenuButton>
                  }
                />
              </div>
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-md w-fit font-medium">{additionalGuidanceTitle}</Label>
                </div>
                <Textarea
                  placeholder={'Feel free to add any important details or instructions!'}
                  autoComplete="one-time-code"
                  readOnly={true}
                  onFocus={(e) => (e.target.readOnly = false)}
                  {...register('cohereApiKey')}
                  className="w-full rounded-md border border-border-light px-3 py-1 text-sm text-text-secondary focus:border-primary focus:outline-none"
                />
              </div>
            </form>
          </>
        }
        selection={{
          selectHandler: onSubmit,
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
