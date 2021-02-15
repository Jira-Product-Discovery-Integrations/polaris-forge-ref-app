import { Client } from "@atlassianintegrations/polaris-forge-object-resolver";
import { MessageMatch } from "../patterns/type";

export const resolveJiraIssue = async (client: Client , url: string, match: MessageMatch) =>
  client.get(`/rest/api/3/issue/${match.issueKey}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
