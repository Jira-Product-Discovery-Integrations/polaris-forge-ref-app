import { JSONSchema } from '@atlassianintegrations/polaris-object-provider'

export const createInsightInput = (cloudID, projectID, issueID, clientId) => {
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
          "PS I am really annoyed that the best way to get a log snippet out of splunk is to screenshot it :cry:",
      },
    ],
    properties: { test1: 100 },
  }
  return {
    cloudID: cloudID,
    projectID: projectID,
    issueID: issueID,
    description: null,
    data: [],
    snippets: [
      {
        oauthClientId: clientId,
        url:
          "https://developer.atlassian.com",
        data: data,
      },
      {
        oauthClientId: clientId,
        url:
          "https://google.com",
        data: null,
      }
    ],
  };
};
