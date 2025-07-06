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

export default function FileGenDialog({
  isOpen,
  onSubmit,
  onRevoke,
  onOpenChange,
  authTypes,
  isToolAuthenticated,
  register,
  handleSubmit,
  triggerRef,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SearchApiKeyFormData) => void;
  onRevoke: () => void;
  authTypes: [string, AuthType][];
  isToolAuthenticated: boolean;
  register: UseFormRegister<SearchApiKeyFormData>;
  handleSubmit: UseFormHandleSubmit<SearchApiKeyFormData>;
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
  const [rerankerDropdownOpen, setRerankerDropdownOpen] = useState(false);
  const [assignmentNumberDropdownOpen, setAssignmentNumberDropdownOpen] = useState(false);

  const providerItems: MenuItemProps[] = [
    {
      label: localize('com_ui_web_search_provider_serper'),
      onClick: () => {},
    },
  ];

  const scraperItems: MenuItemProps[] = [
    {
      label: localize('com_ui_web_search_scraper_firecrawl'),
      onClick: () => {},
    },
  ];

  const rerankerItems: MenuItemProps[] = [
    {
      label: localize('com_ui_web_search_reranker_jina'),
      onClick: () => setSelectedReranker(RerankerTypes.JINA),
    },
    {
      label: localize('com_ui_web_search_reranker_cohere'),
      onClick: () => setSelectedReranker(RerankerTypes.COHERE),
    },
  ];

  //numbers 1-10 for assignment selection
  const assignmentNumbers = Array.from({ length: 10 }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  }));

  const showProviderDropdown = !config?.webSearch?.searchProvider;
  const showScraperDropdown = !config?.webSearch?.scraperType;
  const showRerankerDropdown = !config?.webSearch?.rerankerType;

  // Determine which categories are SYSTEM_DEFINED
  const providerAuthType = authTypes.find(([cat]) => cat === SearchCategories.PROVIDERS)?.[1];
  const scraperAuthType = authTypes.find(([cat]) => cat === SearchCategories.SCRAPERS)?.[1];
  const rerankerAuthType = authTypes.find(([cat]) => cat === SearchCategories.RERANKERS)?.[1];
  const title = 'Generate Assignments';
  const secondLine =
    'Select your assistant, the number of assignments, and add additional guidance.';
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
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Search Provider Section */}
              {providerAuthType !== AuthType.SYSTEM_DEFINED && (
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-md w-fit font-medium">{assistantTitle}</Label>
                  </div>
                  <DropdownPopup
                    menuId="search-provider-dropdown"
                    items={providerItems}
                    isOpen={providerDropdownOpen}
                    setIsOpen={setProviderDropdownOpen}
                    trigger={
                      <Menu.MenuButton
                        onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                        className="flex items-center rounded-md border border-border-light px-3 py-1 text-sm text-text-secondary"
                      >
                        {'Assistant 1'}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Menu.MenuButton>
                    }
                  />
                </div>
              )}
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
          selectHandler: handleSubmit(onSubmit),
          selectClasses: 'bg-green-500 hover:bg-green-600 text-white',
          selectText: localize('com_ui_save'),
        }}
        buttons={
          isToolAuthenticated && (
            <Button
              onClick={onRevoke}
              className="bg-destructive text-white transition-all duration-200 hover:bg-destructive/80"
            >
              {localize('com_ui_revoke')}
            </Button>
          )
        }
        showCancelButton={true}
      />
    </OGDialog>
  );
}
