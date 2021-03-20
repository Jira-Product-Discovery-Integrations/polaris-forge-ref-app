import {
  defaults,
  ErrorHandlerMap,
  ClientError,
  ProviderError,
} from "@atlassianintegrations/polaris-forge-object-resolver";

export const slackErrorHandlers: ErrorHandlerMap = {
  401: () => ({ meta: defaults.meta.unauthorized }),
  403: () => ({ meta: defaults.meta.permissionDenied }),
  429: (err: ClientError) => {
    throw new ProviderError(
      `Slack 429, ${JSON.stringify(err)}`,
      "RESOLVE_UNSUPPORTED_ERR",
      429
    );
  },
  500: (err: ClientError) => {
    throw new ProviderError(
      `Slack 500, ${JSON.stringify(err)}`,
      "RESOLVE_UNSUPPORTED_ERR",
      500
    );
  },
};

export const jiraErrorHandlers: ErrorHandlerMap = {
  401: () => ({ meta: defaults.meta.unauthorized }),
  403: () => ({ meta: defaults.meta.permissionDenied }),
  404: () => ({ meta: defaults.meta.unauthorized }),
  429: (err: ClientError) => {
    throw new ProviderError(
      `Slack 429, ${JSON.stringify(err)}`,
      "RESOLVE_UNSUPPORTED_ERR",
      429
    );
  },
  500: (err: ClientError) => {
    throw new ProviderError(
      `Slack 500, ${JSON.stringify(err)}`,
      "RESOLVE_UNSUPPORTED_ERR",
      500
    );
  },
};
