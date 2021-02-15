import { ObjectPattern } from '@atlassian/polaris-forge-object-resolver';

export const matchSlackMessage: ObjectPattern = [
  /^https:\/\/.+?\.slack\.com\/archives\/(?<channelId>[C|G][A-Z0-9][^/]+)\/p(?<messageId>[0-9]+)$/,
];

export const matchJiraIssue: ObjectPattern = [
  /^https:\/\/(?<cloudName>.+)\.(atlassian\.net|jira-dev\.com)\/browse\/(?<issueKey>.+-\d+)#?$/,
];