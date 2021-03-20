import { Client, Matches } from '@atlassianintegrations/polaris-forge-object-resolver';
import { getMessage, getChannel, getUser } from './requests';

export async function resolveSlackMessage(client: Client, url: string, matches: Matches) {
  const message = (await getMessage(client, matches)) as any;
  const channel = await getChannel(client, matches);
  const user = await getUser(client, message.user);
  return {
    user,
    channel,
    message,
    url,
  };
}
