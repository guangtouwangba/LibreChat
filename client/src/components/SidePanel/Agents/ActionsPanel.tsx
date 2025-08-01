import { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  AuthTypeEnum,
  AuthorizationTypeEnum,
  TokenExchangeMethodEnum,
} from 'librechat-data-provider';
import {
  OGDialogTemplate,
  TrashIcon,
  OGDialog,
  OGDialogTrigger,
  Label,
  useToastContext,
} from '@librechat/client';
import ActionsAuth from '~/components/SidePanel/Builder/ActionsAuth';
import { useAgentPanelContext } from '~/Providers/AgentPanelContext';
import { useDeleteAgentAction } from '~/data-provider';
import type { ActionAuthForm } from '~/common';
import ActionsInput from './ActionsInput';
import { useLocalize } from '~/hooks';
import { Panel } from '~/common';

export default function ActionsPanel() {
  const localize = useLocalize();
  const { showToast } = useToastContext();
  const { setActivePanel, action, setAction, agent_id } = useAgentPanelContext();
  const deleteAgentAction = useDeleteAgentAction({
    onSuccess: () => {
      showToast({
        message: localize('com_assistants_delete_actions_success'),
        status: 'success',
      });
      setActivePanel(Panel.builder);
      setAction(undefined);
    },
    onError(error) {
      showToast({
        message: (error as Error).message ?? localize('com_assistants_delete_actions_error'),
        status: 'error',
      });
    },
  });

  const methods = useForm<ActionAuthForm>({
    defaultValues: {
      /* General */
      type: AuthTypeEnum.None,
      saved_auth_fields: false,
      /* API key */
      api_key: '',
      authorization_type: AuthorizationTypeEnum.Basic,
      custom_auth_header: '',
      /* OAuth */
      oauth_client_id: '',
      oauth_client_secret: '',
      authorization_url: '',
      client_url: '',
      scope: '',
      token_exchange_method: TokenExchangeMethodEnum.DefaultPost,
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (action?.metadata.auth) {
      reset({
        type: action.metadata.auth.type || AuthTypeEnum.None,
        saved_auth_fields: false,
        api_key: action.metadata.api_key ?? '',
        authorization_type: action.metadata.auth.authorization_type || AuthorizationTypeEnum.Basic,
        oauth_client_id: action.metadata.oauth_client_id ?? '',
        oauth_client_secret: action.metadata.oauth_client_secret ?? '',
        authorization_url: action.metadata.auth.authorization_url ?? '',
        client_url: action.metadata.auth.client_url ?? '',
        scope: action.metadata.auth.scope ?? '',
        token_exchange_method:
          action.metadata.auth.token_exchange_method ?? TokenExchangeMethodEnum.DefaultPost,
      });
    }
  }, [action, reset]);

  return (
    <FormProvider {...methods}>
      <form className="h-full grow overflow-hidden">
        <div className="h-full overflow-auto px-2 pb-12 text-sm">
          <div className="relative flex flex-col items-center px-16 py-6 text-center">
            <div className="absolute left-0 top-6">
              <button
                type="button"
                className="btn btn-neutral relative"
                onClick={() => {
                  setActivePanel(Panel.builder);
                  setAction(undefined);
                }}
              >
                <div className="flex w-full items-center justify-center gap-2">
                  <ChevronLeft />
                </div>
              </button>
            </div>

            {!!action && (
              <OGDialog>
                <OGDialogTrigger asChild>
                  <div className="absolute right-0 top-6">
                    <button
                      type="button"
                      disabled={!agent_id || !action.action_id}
                      className="btn btn-neutral border-token-border-light relative h-9 rounded-lg font-medium"
                    >
                      <TrashIcon className="text-red-500" />
                    </button>
                  </div>
                </OGDialogTrigger>
                <OGDialogTemplate
                  showCloseButton={false}
                  title={localize('com_ui_delete_action')}
                  className="max-w-[450px]"
                  main={
                    <Label className="text-left text-sm font-medium">
                      {localize('com_ui_delete_action_confirm')}
                    </Label>
                  }
                  selection={{
                    selectHandler: () => {
                      if (!agent_id) {
                        return showToast({
                          message: localize('com_agents_no_agent_id_error'),
                          status: 'error',
                        });
                      }
                      deleteAgentAction.mutate({
                        action_id: action.action_id,
                        agent_id,
                      });
                    },
                    selectClasses:
                      'bg-red-700 dark:bg-red-600 hover:bg-red-800 dark:hover:bg-red-800 transition-color duration-200 text-white',
                    selectText: localize('com_ui_delete'),
                  }}
                />
              </OGDialog>
            )}

            <div className="text-xl font-medium">{(action ? 'Edit' : 'Add') + ' ' + 'actions'}</div>
            <div className="text-xs text-text-secondary">
              {localize('com_assistants_actions_info')}
            </div>
            {/* <div className="text-sm text-text-secondary">
            <a href="https://help.openai.com/en/articles/8554397-creating-a-gpt" target="_blank" rel="noreferrer" className="font-medium">Learn more.</a>
          </div> */}
          </div>
          <ActionsAuth />
          <ActionsInput action={action} agent_id={agent_id} setAction={setAction} />
        </div>
      </form>
    </FormProvider>
  );
}
