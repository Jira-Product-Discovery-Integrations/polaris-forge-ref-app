import { JSONSchema } from '@atlassian/polaris-forge-object-resolver';

export interface ChannelFormatterParams {
  url: string;
  name: string;
  num_members: number;
  purpose: {
    value: string;
  };
  topic: {
    value: string;
  };
}

export const formatJiraIssue = function formatJiraIssue(issue: any): JSONSchema.Data {
  return {
    type: "card",
    context: {
      icon:
        issue.fields.issuetype.iconUrl,
      url: issue.self,
      title: `${issue.key}: ${issue.fields.summary}`,
    },
    properties: {
      watches: issue.fields.watches.watchCount,
      votes: issue.fields.votes.votes,
      comments: issue.fields.comment.comments.length,
      type: issue.fields.issuetype.name
    },
  }
};
