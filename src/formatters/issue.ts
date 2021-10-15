import { JSONSchema } from "@atlassianintegrations/polaris-forge-object-resolver";

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

export const formatJiraIssue = function formatJiraIssue(
  issue: any
): JSONSchema.Data {
  return {
    type: "card",
    group: {
      name: "Jira Issue",
      id: `jira_issue_${issue.fields.issuetype.id}_${issue.fields.project.id}`,
    },
    context: {
      icon: issue.fields.issuetype.iconUrl,
      url: issue.self,
      title: `${issue.key}: ${issue.fields.summary}`,
    },
    content: {
      description: "Some long description", // optional
      preview: {
        type: "image",
        src:
          "https://content.fortune.com/wp-content/uploads/2020/02/100-Best-Companies-2020-Atlassian.jpg",
      }, // optional
    },
    properties: {
      watches: {
        name: "Watchers count",
        value: issue.fields.watches.watchCount,
      },
      votes: {
        name: "Votes count",
        value: issue.fields.votes.votes,
      },
      comments: {
        name: "Comments count",
        value: issue.fields.comment.comments.length,
      },
      type: {
        name: "Issue type",
        value: issue.fields.issuetype.name,
      },
      task_duration: {
        name: "Task duration",
        type: "duration",
        value: 1000 * 30 * 30,
      },
      user_createdat: {
        name: "User created at",
        type: "timestamp",
        value: new Date().getTime() + 1000 * 30 * 30,
      },
    },
  };
};
