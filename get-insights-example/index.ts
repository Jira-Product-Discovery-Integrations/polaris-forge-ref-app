#!/usr/bin/env node
"use strict";
import { getAccessToken } from "./jira/accessToken";
import { getAccessibleResources } from "./jira/accessibleResources";
import { getIssue } from "./jira/issue";
import { getPolarisInsights } from "./polaris/getPolarisInsights";
import { getPolarisInsightsInput } from "./input";
import { createServer } from "./server";
import * as meow from "meow";
import * as chalk from "chalk";
import * as http from "http";
import { ParsedUrlQuery } from "querystring";
import { PolarisInsight } from "./polaris/types";

global.fetch = require("node-fetch");

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
        type: "string",
        isRequired: true,
      },
      atlassianAppClientId: {
        type: "string",
        isRequired: true,
      },
      atlassianAppClientSecret: {
        type: "string",
        isRequired: true,
      },
    },
  }
);

const { issueUrl, atlassianAppClientId, atlassianAppClientSecret } = cli.flags;

const matchJiraIssue = /^(?<cloudHost>https:\/\/.+\.atlassian\.net)\/browse\/(?<issueKey>.+-\d+)#?$/;

const match = matchJiraIssue.exec(issueUrl);

if (
  !match ||
  !match.groups ||
  !match.groups.cloudHost ||
  !match.groups.issueKey
) {
  throw new Error("issueUrl flag is invalid");
}

const { cloudHost, issueKey } = match.groups;

const appScopes = ["read:jira-user", "read:jira-work", "write:jira-work"];

const getAuthorizationLink = (redirectUrl: string) => {
  return `https://auth.atlassian.com/authorize?\
audience=api.atlassian.com&\
client_id=${atlassianAppClientId}&\
scope=${encodeURIComponent(appScopes.join(" "))}&\
redirect_uri=${encodeURIComponent(redirectUrl)}&\
state=&\
response_type=code&\
prompt=consent`;
};

const onRequest = async (query: ParsedUrlQuery) => {
  if (!query.code) {
    throw new Error("Query parameter code is undefined");
  }
  try {
    const token = await getAccessToken(
      atlassianAppClientId,
      atlassianAppClientSecret,
      redirectUrl,
      String(query.code)
    );
    const accessibleResources = await getAccessibleResources(token);
    if (accessibleResources.length === 0) {
      throw new Error(
        "Get accessible resources call to Jira returned empty list"
      );
    }
    let cloudId = null;
    for (const accessibleResource of accessibleResources) {
      if (accessibleResource.url === cloudHost) {
        cloudId = accessibleResource.id;
      }
    }
    if (!cloudId) {
      throw new Error(
        "Issue url host doesn't not match to any accessible resource"
      );
    }

    const issue = await getIssue(token, cloudId, issueKey);

    return await getPolarisInsights(
      token,
      getPolarisInsightsInput(cloudId, issue.fields.project.id, issue.id)
    );
  } catch (err) {
    console.error(chalk.bold.red(err));
    process.exit(1);
  }
};

const onSuccess = (
  polarisInsights: PolarisInsight[],
  res: http.ServerResponse
) => {
  let list = "";
  for (const polarisInsight of polarisInsights) {
    for (const snippet of polarisInsight.snippets) {
      list += `
        <li>
          <ul>
            <li>Snippet id: ${snippet.id}</li>
            <li>Snippet data: ${JSON.stringify(snippet.data)}</li>
            <li>Snippet properties: ${JSON.stringify(snippet.properties)}</li>
          </ul>
        </li>
      `;
    }
  }
  res.end(
    `<meta charset="UTF-8" />
      ${!polarisInsights.length ? "No data points added to this issue" : list}
    `
  );
};

(async () => {
  await createServer(PORT, onRequest, onSuccess);
  console.log(
    `Authorization url: ${chalk.bold.green(getAuthorizationLink(redirectUrl))}`
  );
})();
