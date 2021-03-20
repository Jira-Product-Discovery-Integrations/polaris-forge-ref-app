import { Client, ClientError, Matches } from '@atlassianintegrations/polaris-forge-object-resolver';
import { WebAPICallResult } from '@slack/web-api';

export interface ChannelQueryParams {
  channel?: string;
  timestamp?: string;
  user?: string;
}

async function request(
  client: Client,
  pathname: string,
  params: { query: ChannelQueryParams },
  handleExpectedError?: (res: WebAPICallResult) => void,
): Promise<WebAPICallResult> {
  const res = await client.get(pathname, params);

  if (res.ok) return res;

  if (handleExpectedError) {
    handleExpectedError(res);
  }

  console.log(res.error)

  switch (res.error) {
    case 'not_authed':
      throw new ClientError(401, 'Missing token', res, false);
    case 'invalid_auth':
    case 'account_inactive':
    case 'token_revoked':
      throw new ClientError(401, 'Invalid token', res, true);
    case 'missing_scope':
      throw new ClientError(401, 'Missing scope', res, true);
    default:
      throw new ClientError(500, 'Unknown error', res);
  }
}

export async function getMessage(client: Client, match: Matches) {
  const messageId = match?.["messageId"] || ''
  const messageTs = `${messageId.slice(
    0,
    messageId.length - 6
  )}.${messageId.slice(-6)}`;

  const { message } = await request(
    client,
    '/api/reactions.get',
    {
      query: { channel: match?.['channelId'], timestamp: messageTs },
    },
  );

  return message;
}

export async function getChannel(client: Client, match: Matches) {
  const { channel } = await request(
    client,
    '/api/conversations.info',
    {
      query: { channel: match?.['channelId'] },
    },
    function handleChannelNotFound(res: WebAPICallResult) {
      // It might be that the user doesn't have access to this channel or they
      // are logged into a wrong workspace, It can also mean a typo and the
      // channel is actually not found.
      // Using '403' here to map it to 'defaults.meta.permissionDenied', so
      // "Restricted link, try another account" will be rendered.
      if (res.error === 'channel_not_found') {
        throw new ClientError(403, 'Channel not found', res);
      }
    },
  );

  return channel;
}


export async function getUser(client: Client, userId: string) {
  const { user } = await request(
    client,
    '/api/users.info',
    {
      query: { user: userId },
    },
  );

  return user;
}