import { Client, Matches } from "@atlassianintegrations/polaris-forge-object-resolver";

export const resolveJiraIssue = async (client: Client , url: string, match: Matches) =>
  client.get(`/rest/api/3/issue/${match?.["issueKey"]}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
