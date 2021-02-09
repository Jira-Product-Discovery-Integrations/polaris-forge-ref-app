import { ObjectProvider, Client, EventPayload, ResolverResponse } from '@atlassian/polaris-forge-object-resolver';
import { matchSlackMessage } from './patterns';
import { resolveSlackMessage } from './resolvers';
import { formatSlackMessage } from './formatters';
import { errorHandlers } from './errors';

export async function run(event: EventPayload): Promise<ResolverResponse> {
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
    errorHandlers,
  });
  return await provider.execute(event);
}