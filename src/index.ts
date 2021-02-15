import { ObjectProvider, Client, EventPayload, ResolverResponse, getResourceUrl } from '@atlassianintegrations/polaris-forge-object-resolver';
import { matchSlackMessage, matchJiraIssue } from './patterns';
import { resolveSlackMessage, resolveJiraIssue } from './resolvers';
import { formatSlackMessage, formatJiraIssue } from './formatters';
import { slackErrorHandlers, jiraErrorHandlers } from './errors';

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

export async function runAtlassian(event: EventPayload): Promise<ResolverResponse> {
  const match = matchJiraIssue[0].exec(getResourceUrl(event))
  const provider = new ObjectProvider({
    client: new Client({
      baseUrl: `https://${match.groups.cloudName}.atlassian.net`,
    }),
    linkResolvers: {
      issue: {        
        pattern: matchJiraIssue,
        resolver: resolveJiraIssue,
        formatter: formatJiraIssue,
      },
    },
    errorHandlers: jiraErrorHandlers,
  });
  return await provider.execute(event);
}