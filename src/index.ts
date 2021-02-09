import { ObjectProvider, Client, EventPayload, ResolverResponse, getResourceUrl } from '@atlassian/polaris-forge-object-resolver';
import { matchSlackMessage, matchJiraIssue } from './patterns';
import { resolveSlackMessage } from './resolvers';
import { formatSlackMessage, formatJiraIssue } from './formatters';
import { slackErrorHandlers, jiraErrorHandlers } from './errors';
import { storage } from '@forge/api';

export async function runSlack(event: EventPayload): Promise<ResolverResponse> {
  const provider = new ObjectProvider({
    client: new Client({
      baseUrl: 'https://slack.com',
        outboundAuthorization: { authKey: 'slack' }
    }),
    linkResolvers: {
      message: {
        pattern: matchSlackMessage,
        resolver: resolveSlackMessage,
        formatter: formatSlackMessage,
      },
    },
    errorHandlers: slackErrorHandlers,
  });
  return await provider.execute(event);
}

export async function runAtlassian(event: EventPayload, context: { principal: { accountId }}): Promise<ResolverResponse> {
  console.log(context.principal.accountId)
  const match = matchJiraIssue[0].exec(getResourceUrl(event))
  const token = (event as any).authToken ?  Buffer.from((event as any).authToken).toString('base64') : await storage.get(context.principal.accountId)
  console.log(token, 'token')
  const provider = new ObjectProvider({
    client: new Client({
      baseUrl: `https://${match.groups.cloudName}.atlassian.net`,
    }),
    linkResolvers: {
      issue: {        
        pattern: matchJiraIssue,
        resolver: async (client, url, match) => client.get(`/rest/api/3/issue/${match.issueKey}`, { headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${token}`
          }}),
        formatter: formatJiraIssue,
      },
    },
    errorHandlers: jiraErrorHandlers,
  });
  const response = await provider.execute(event);
  console.log('response',(response as any).status)
  if (!(response as any).status && (event as any).authToken) {
    await storage.set(context.principal.accountId, token)
  }
  return response
}