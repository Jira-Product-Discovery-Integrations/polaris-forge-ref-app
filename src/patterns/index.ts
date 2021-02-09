import { ObjectPattern } from '@atlassian/polaris-forge-object-resolver';

export const matchSlackMessage: ObjectPattern = [
  /^https:\/\/.+?\.slack\.com\/archives\/(?<channelId>[C|G][A-Z0-9][^/]+)\/p(?<messageId>[0-9]+)$/,
];