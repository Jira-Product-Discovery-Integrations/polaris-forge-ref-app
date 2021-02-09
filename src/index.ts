import { ObjectProvider, Client, EventPayload, ResolverResponse, getResourceUrl, defaults } from '@atlassian/polaris-forge-object-resolver';
import api from '@forge/api';

export async function runOAuth2(event: EventPayload): Promise<ResolverResponse> {
  let match = /^https:\/\/(?<cloudName>.+)\.atlassian\.net/.exec(getResourceUrl(event));


  const response = await api.fetch(`https://${match.groups?.cloudName}.atlassian.net/rest/api/3/issue/AT-1`, {
    method: "GET",
    headers: {
      Authorization: "Bearer {oauth2}",
      'Content-Type': 'application/json',
    }
  }).then((response) => {
    return response.json()
  }).catch(err => ({err}))

  console.log(response)

  const provider = new ObjectProvider({
    client: new Client({
        baseUrl: `https://${match.groups?.cloudName}.atlassian.net`,
        outboundAuthorization: { authKey: 'oauth2' }
    }),
    linkResolvers: {
      issue: {
        pattern: [/^https:\/\/(?<cloudName>.+)\.atlassian\.net\/browse\/(?<issueKey>.+-\d+)$/],
        resolver: async (client, url, matches) => {
          const response = await client.get(`/rest/api/3/issue/${matches.issueKey}`)
          console.log(response)
          return  response
        },
        formatter: (data) => ({
            "type": "card",
            "context": {
              "url": "https://dog-house.com",
              "icon":  "https://dog-house.com/icon.png",
              "title": "House of dogs"
            },
            "content": {
              "description": "'In the Doghouse' is a science fiction short story by American writers Orson Scott Card and Jay A Parry."
            },
            "properties": {}
        }),
      },
    },
    errorHandlers: {
      401: () => ({ meta: defaults.meta.unauthorized, data: undefined }),
      403: () => ({ meta: defaults.meta.permissionDenied, data: undefined }),
      404: (err) => ({  meta: err.hasTokens ? defaults.meta.notFound : defaults.meta.unauthorized, data: undefined }),
    },
  });
  return await provider.execute(event);
}