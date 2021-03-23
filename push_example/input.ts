import { JSONSchema } from "@atlassianintegrations/polaris-object-provider";

export const createInsightInput = (
  cloudID: string,
  projectID: string,
  issueID: string,
  clientId: string,
  userMessage?: string
): any => {
  // More info about ADF here: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure
  const descriptionAdf = {
    version: 1,
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is my first Polaris data",
          },
        ],
      },
    ],
  };
  const data: JSONSchema.Data = {
    type: "card",
    group: {
      name: "Chat message",
      id: "chat_message",
    },
    context: {
      icon:
        "https://wac-cdn.atlassian.com/dam/jcr:616e6748-ad8c-48d9-ae93-e49019ed5259/Atlassian-horizontal-blue-rgb.svg?cdnVersion=1462",
      url: "https://developer.atlassian.com",
      title: "New Shiny App",
    },
    content: {
      description: `new description: ${userMessage}`,
    },
    properties: {
      reactions: {
        name: "Reactions",
        value: 11,
      },
      watchers_count: {
        name: "Watchers count",
        value: 31,
      },
      group: {
        name: "Item group",
        value: "pet project",
      },
      labels: {
        name: "Labels",
        value: ["important", "spaceship"],
      },
    },
  };

  return {
    cloudID: cloudID,
    projectID: projectID,
    issueID: issueID,
    description: descriptionAdf,
    data: [],
    snippets: [
      {
        oauthClientId: clientId,
        url: "https://developer.atlassian.com",
        data: data,
      },
      {
        oauthClientId: clientId,
        url: "https://google.com",
        data: null,
        properties: {
          labels: {
            name: "Labels",
            value: ["search engine"],
          },
        },
      },
    ],
  };
};
