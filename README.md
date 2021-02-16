### Polaris Forge Ref App Readme

## How to start

1. Install Forge CLI using this guide: [https://developer.atlassian.com/platform/forge/getting-started](https://developer.atlassian.com/platform/forge/getting-started)
 
2. Install dependencies for project

```bash
npm i 
```

3. Create `.env` file from `.env.default` and define missing variables (ignore FORGE_APP_ID for now).

4. Generate manifest from template with command:

```bash
npm run manifest
```

5. Once Forge CLI is installed you need to create new app using command (confirm app details rewrite on promt):

```bash
forge register
```

6. Copy generated `FORGE_APP_ID` from `app` section in `manifest.yml` back to `.env` 

7. Deploy app to development env (`--no-verify ` is required)


```bash
 forge deploy -e development --no-verify 
```

8. Install app to some cloud 

```bash
 forge install -p Jira -s <YOUR_SITE_NAME>.atlassian.net
```
9. Go to Polaris Data Tab and test your URL's

10. (Optional) If you want to test OAUTH2 link example, you need to folow those steps:
    - At first you need to register a Slack app [Create App](https://api.slack.com/apps?new_app=1)
    - Configure it with required scopes that are defined in `manifest.yml`.
    - Set `Redirect URL` in Slack app config to `https://id.atlassian.com/outboundAuth/finish`.
    - Set your OAUTH2 Client and Secret to Forge app config using CLI command: 

```bash
npm run externalAuth:set -- --email $EMAIL --api-token $ATLASSIAN_API_TOKEN --forge-app-id $FORGE_APP_ID --forge-env $FORGE_ENV --service-key $EXTERNAL_AUTH_SERVICE_KEY --client-id $SLACK_CLIENT_ID --client-secret $SLACK_CLIENT_SECRET
```

**`$EXTERNAL_AUTH_SERVICE_KEY` is defined in `manifest.yml` in `externalAuth` section as `key` and equals to `slack` in our case. **

11. All set 🎉

### Addtional docs

1. All our example build on top of `@atlassianintegrations/polaris-forge-object-resolver` library. README available here: [README](https://www.npmjs.com/package/@atlassianintegrations/polaris-forge-object-resolver)

2. Link patterns that are resolvable by this ref app:

    - Any issue link from Jira site where app was installed. For example: `https://<YOUR_SITE_NAME>.atlassian.net/browse/ISSUE-KEY-1`
    - Any slack message link from workspace where Slack app was installed. For example `https://<YOUR_WORKSPACE>.slack.com/archives/C01736E6Z37/p1613475464011300` 