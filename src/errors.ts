import { ErrorHandlerMap } from '@atlassian/polaris-forge-object-resolver/src/provider/types';
import { defaults } from '@atlassian/polaris-forge-object-resolver';
import { ClientError, ProviderError } from '@atlassian/polaris-forge-object-resolver';

export const errorHandlers: ErrorHandlerMap = {
  401: () => ({ meta: defaults.meta.unauthorized, data: undefined }),
  403: () => ({ meta: defaults.meta.permissionDenied, data: undefined }),
  429: (err: ClientError) => {
    throw new ProviderError(`Slack 429, ${JSON.stringify(err)}`, 'RESOLVE_UNSUPPORTED_ERR', 429);
  },
  500: (err: ClientError) => {
    throw new ProviderError(`Slack 500, ${JSON.stringify(err)}`, 'RESOLVE_UNSUPPORTED_ERR', 500);
  },
};
