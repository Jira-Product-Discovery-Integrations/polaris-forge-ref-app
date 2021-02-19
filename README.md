### Polaris Unfurling Reference Application Readme

When a user adds a URL from your application to a Polaris idea, Polaris will try to unfurl it to retrieve more data, using a provider for your app. 
This data can then be used to prioritize ideas in Polaris. This refapp shows you how to create one of these unfurl providers. 

Polaris currently supports 2 authentication mechanisms:
- API keys: the user pastes a user API key to authenticate with your app's API
- OAuth2 Authorization Code Grant Flow: the user authenticates with your app's API using this flow (recommended: it's more user friendly)

We've added 2 examples in this refapp: 

1. An unfurl provider for Jira issue URLs, using API keys, which works for any issue link the user has access to, in the form of `https://<YOUR_SITE_NAME>.atlassian.net/browse/ISSUE-KEY-1`

2. An unfurl provider for a slack message URL in a Slack workspace where a custom app was installed, in the form of `https://<YOUR_WORKSPACE>.slack.com/archives/C01736E6Z37/p1613475464011300`, using the OAuth2 Authorization Code Grant Flow

The unfurl providers are built on and hosted on [Atlassian Forge](https://developer.atlassian.com/platform/forge/), our development platform, talking to your app's API.

## Getting started

1. Install the Forge CLI using this guide: [https://developer.atlassian.com/platform/forge/getting-started](https://developer.atlassian.com/platform/forge/getting-started)
 
2. Install dependencies for the project

```bash
npm i 
```

3. Create a `.env` file from `.env.default` and define missing variables (ignore `FORGE_APP_ID` for now).

4. Generate a manifest from the template using the following command:

```bash
npm run manifest
```

5. Once the Forge CLI is installed, create new app using this command (confirm app details rewrite when prompted):

```bash
forge register
```

6. Find your `FORGE_APP_ID` using this command:

```bash
npm run forge:appInfo
```

6. Copy the generated `FORGE_APP_ID` back to `.env` 

7. Deploy the app to the development environment (`--no-verify ` is required)


```bash
 forge deploy -e development --no-verify 
```

8. Install the app on a Jira site:

```bash
 forge install -p Jira -s <YOUR_SITE_NAME>.atlassian.net
```
9. Open a Polaris idea, open the Data Tab and test unfurling a URL to a Jira issue. Something in the form of: `https://<YOUR_SITE_NAME>.atlassian.net/browse/ISSUE-KEY-1` (from the same site or another site should work, as long as the user has access to this URL). This should return a card with information about the Jira issue.

10. Test a URL using OAuth2 authentication, we've added an example unfurling a link to a Slack message: 

First, create a Slack app [Create App](https://api.slack.com/apps?new_app=1)
- Open the "OAuth & Permissions" tab
- Set `Redirect URL` to `https://id.atlassian.com/outboundAuth/finish`.
- In the `Scopes / User Token Scopes` section add the OAuth scopes listed in `manifest.yml`.

Then run the following command to set up the OAuth2 client for your custom Slack app in Forge:

```bash
npm run externalAuth:set -- --email $EMAIL --api-token $ATLASSIAN_API_TOKEN --forge-app-id $FORGE_APP_ID --forge-env $FORGE_ENV --service-key $EXTERNAL_AUTH_SERVICE_KEY --client-id $SLACK_CLIENT_ID --client-secret $SLACK_CLIENT_SECRET
```

With the following values:
- `$EMAIL` is your @atlassian.com email address
- `$ATLASSIAN_API_TOKEN`: [generate an Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens)
- `$FORGE_APP_ID`: run `npm run forge:appInfo` command to find your Forge app id
- set `$FORGE_ENV` to `development`
- set `$EXTERNAL_AUTH_SERVICE_KEY` to `slack`
- `$SLACK_CLIENT_ID`: Copy the value from the Slack app configuration, in `Basic information / App Credentials / Client ID`
- `$SLACK_CLIENT_SECRET`: Copy the value from the Slack app configuration, in `Basic information / App Credentials / Client Secret`

11. Go to Slack, in a public channel, and copy the link to a Slack message (Right click on a message > copy link). Open a Polaris idea, open the Data Tab and test unfurling that URL. It should return a card with information about the Slack message.

12. All set 🎉

13. In addition to pull model we support pushing data via API. Read more [here](push_example/README.md)

### Addtional docs

1. All our example build on top of the `@atlassianintegrations/polaris-forge-object-resolver` library. The README available here: [README](https://www.npmjs.com/package/@atlassianintegrations/polaris-forge-object-resolver)
