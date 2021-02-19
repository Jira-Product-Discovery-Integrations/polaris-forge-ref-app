#!/usr/bin/env node
'use strict';
import { getAccessToken } from './jira/accessToken';
import { getAccessibleResources } from './jira/accessibleResources';
import { getIssue } from './jira/issue';
import { createInsight } from './polaris/createInsight';
import { createInsightInput } from './input';
import { createServer } from './server';
import * as meow from 'meow';
import * as chalk from "chalk";

global.fetch = require('node-fetch');

const PORT = 7777;
const redirectUrl = `http://localhost:${PORT}`;

const cli = meow(
  `
	Usage
	  $ --issue-url https://pi-dev-sandbox.atlassian.net/browse/AT5-4 --atlassian-app-client-id <APP_CLIENT_ID> --atlassian-app-client-secret <APP_CLIENT_SECRET>
`,
  {
    flags: {
      issueUrl: {
        type: 'string',
        isRequired: true,
      },
      atlassianAppClientId: {
        type: 'string',
        isRequired: true,
      },
      atlassianAppClientSecret: {
        type: 'string',
        isRequired: true,
      },
      userMessage: {
        type: 'string',
      },
    },
  },
);

const { issueUrl, atlassianAppClientId, atlassianAppClientSecret, userMessage } = cli.flags;

const matchJiraIssue = /^(?<cloudHost>https:\/\/.+\.atlassian\.net)\/browse\/(?<issueKey>.+-\d+)#?$/;

const match = matchJiraIssue.exec(issueUrl)

if (!match || !match.groups || !match.groups.cloudHost || !match.groups.issueKey) {
  throw new Error('issueUrl flag is invalid')
}

const { cloudHost, issueKey } = match.groups;

const appScopes = [
  "read:jira-user",
  "read:jira-work"
];

const getAuthorizationLink = (redirectUrl) => {
  return `https://auth.atlassian.com/authorize?\
audience=api.atlassian.com&\
client_id=${atlassianAppClientId}&\
scope=${encodeURIComponent(appScopes.join(' '))}&\
redirect_uri=${encodeURIComponent(redirectUrl)}&\
state=&\
response_type=code&\
prompt=consent`;
};

const onRequest = async (query) => {
  try {
    const token = await getAccessToken(atlassianAppClientId, atlassianAppClientSecret, redirectUrl, query.code);
    const accessibleResources = await getAccessibleResources(token);
    if (accessibleResources.length === 0) {
      throw new Error('Get accessible resources call to Jira returned empty list')
    }
    let cloudId = null;
    for (let accessibleResource of accessibleResources) {
      if (accessibleResource.url === cloudHost) {
        cloudId = accessibleResource.id;
      }
    }
    if (!cloudId) {
      throw new Error('Issue url host doesn\'t not match to any accessible resource')
    }
    const issue = await getIssue(token, cloudHost, issueKey)

    await createInsight(token, {
      input: createInsightInput(cloudId, issue.fields.project.id, issue.id, atlassianAppClientId, userMessage)
    })
  } catch (err) {
    console.error(chalk.bold.red(err))
    process.exit(1);
  }
};

const onSuccess = (res) => {
  res.end(`<meta charset="UTF-8"> <h3 style="margin: 40px auto; text-align: center;">Success 🥳. Open the issue <a href="${issueUrl}" target="_blank">${issueUrl}</a> and navigate to Data tab to see results.</h3>`);
}

(async () => {
  await createServer(PORT, onRequest, onSuccess);
  console.log(`Authorization url: ${chalk.bold.green(getAuthorizationLink(redirectUrl))}`)
})();
