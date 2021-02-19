import { JSONSchema } from '@atlassianintegrations/polaris-object-provider'

export const createInsightInput = (cloudID: string, projectID: string, issueID: string, clientId: string, userMessage: string) => {
  // More info about ADF here: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure
  const descriptionAdf = {
    "version": 1,
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This is my first Polaris data"
          }
        ]
      }
    ]
  }
  const data: JSONSchema.Data = {
    type: "messages",
    context: {
      icon:
        "https://wac-cdn.atlassian.com/dam/jcr:616e6748-ad8c-48d9-ae93-e49019ed5259/Atlassian-horizontal-blue-rgb.svg?cdnVersion=1462",
      url: "https://developer.atlassian.com",
      title: "New Shiny App",
    },
    content: [
      {
        type: "messagesItem",
        sender: {
          name: "John Doe",
        },
        time: 1607521706765,
        message:
          typeof userMessage === 'string' && userMessage.length > 0 ? userMessage : "Spaceship is the super fund investing where the world is going. Because it's not just the future. It's your future.",
      }
    ]
  }
  return {
    cloudID: cloudID,
    projectID: projectID,
    issueID: issueID,
    description: descriptionAdf,
    data: [],
    snippets: [
      {
        oauthClientId: clientId,
        url:
          "https://developer.atlassian.com",
        data: data,
        properties: { reactions: 11, "watchers count": 31, group: "pet project", labels: ["important", "spaceship"] }
      },
      {
        oauthClientId: clientId,
        url:
          "https://google.com",
        data: null,
        properties: { labels: ["search engine"] }
      }
    ],
  };
};
