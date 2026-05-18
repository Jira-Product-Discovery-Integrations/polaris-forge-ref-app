# JPD Insights API — Setup Guide

This guide walks you through the one-time setup needed before you (or an AI agent) can read and write Insights on Jira Product Discovery (JPD) ideas via the API.

---

## What you'll need

- A **Jira Product Discovery** project (any site on `*.atlassian.net`)
- An **Atlassian developer account** (free — same login as your Atlassian account)
- **Node.js v14+** installed on your machine (check with `node --version`)

---

## Step 1: Create a 3LO OAuth App

The JPD Insights API uses **OAuth 2.0 (3-legged / 3LO)** — meaning users authorize access via a browser flow, and the app receives a token it can use to call the API on their behalf.

1. Go to: **https://developer.atlassian.com/console/myapps/create-3lo-app/**
   - Log in with your Atlassian account if prompted

2. Fill in the app details:
   - **App name:** anything you like (e.g. "JPD Insights Tool")
   - Click **Create**

3. You'll land on your new app's dashboard.

---

## Step 2: Add API Permissions

Your app needs permission to read and write Jira data.

1. In the left sidebar, click **Permissions**
2. Find **Jira platform REST API** and click **Add**
3. Click **Configure** next to it
4. Enable these 3 scopes:
   - ✅ `read:jira-user` — View user profiles
   - ✅ `read:jira-work` — View Jira issue data
   - ✅ `write:jira-work` — Create and manage issues
5. Click **Save**

> **Why these scopes?** The API needs to look up the issue you're attaching insights to (`read:jira-work`), identify who's creating the insight (`read:jira-user`), and write the insight data (`write:jira-work`).

---

## Step 3: Set the Callback URL

The OAuth flow redirects your browser to a local server that captures the authorization code.

1. In the left sidebar, click **Authorization**
2. Click **Add** next to **OAuth 2.0 (3LO)**
3. Set the **Callback URL** to exactly:
   ```
   http://localhost:7777
   ```
4. Click **Save**

> **Why localhost?** The auth flow opens a browser window, and after you approve access, Atlassian redirects to this URL. A temporary local server running on port 7777 captures the `?code=` parameter from the redirect.

---

## Step 4: Copy Your Credentials

1. In the left sidebar, click **Settings**
2. Scroll to **Authentication details**
3. Copy:
   - **Client ID** — a long alphanumeric string (e.g. `hhJ5nKxZE330oXB1T0UnoNwF0eUbp2KN`)
   - **Secret** — click the eye icon to reveal it

Keep these safe — you'll need them each time you run the auth flow.

---

## Step 5: Run the First-Time Authorization

This is the **only time** you'll need to use a browser for auth. After this, the tool will silently refresh your token automatically.

### Save the auth script

Create a file called `jpd-auth.mjs` with the following content, replacing `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with the values from Step 4:

```js
import http from 'http';
import { URL } from 'url';
import { writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:7777";
const TOKEN_FILE = join(homedir(), '.jpd-insights-token.json');

// offline_access = gives us a refresh token so we never need to re-authorize
const SCOPES = "read:jira-user read:jira-work write:jira-work offline_access";

const AUTH_URL = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=&response_type=code&prompt=consent`;

console.log("\nOpen this URL in your browser:\n");
console.log(AUTH_URL);
console.log("\nWaiting for authorization...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:7777');
  const code = url.searchParams.get('code');
  if (!code) { res.end('No code received.'); return; }

  const tokenRes = await fetch("https://auth.atlassian.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error("❌ Token exchange failed:", tokenData);
    res.end("Authorization failed. Check your Client ID and Secret.");
    server.close();
    return;
  }

  const tokenFile = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: Date.now() + (tokenData.expires_in * 1000),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  writeFileSync(TOKEN_FILE, JSON.stringify(tokenFile, null, 2));

  console.log(`✅ Success! Token saved to ${TOKEN_FILE}`);
  console.log(`   Scopes: ${tokenData.scope}`);
  console.log(`   Has refresh token: ${!!tokenData.refresh_token}`);
  console.log(`   Expires: ${new Date(tokenFile.expires_at).toISOString()}`);
  console.log("\nYou're all set. You won't need to authorize again.");

  res.setHeader("Content-Type", "text/html");
  res.end("<h2>✅ Authorized! You can close this tab.</h2><p>Token saved to <code>~/.jpd-insights-token.json</code>.</p>");
  server.close();
});

server.listen(7777);
```

### Run it

```bash
node jpd-auth.mjs
```

It will print an authorization URL. Open it in your browser, log in if prompted, and click **Accept** on the consent screen.

Your browser will show "This site can't be reached" or redirect to a blank page — **this is normal**. The local server captured the auth code and has already exchanged it for a token.

### Check it worked

```bash
cat ~/.jpd-insights-token.json
```

You should see something like:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_at": 1748563200000,
  "client_id": "hhJ5...",
  "client_secret": "ATOA..."
}
```

---

## Step 6: Verify Access to Your JPD Site

Make sure your Atlassian site is accessible with this token:

```bash
ACCESS_TOKEN=$(python3 -c "import json,os; print(json.load(open(os.path.expanduser('~/.jpd-insights-token.json')))['access_token'])")

curl -s "https://api.atlassian.com/oauth/token/accessible-resources" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

You should see your JPD site listed with its `id` (Cloud ID) and `url`. Example:
```json
[
  {
    "id": "ec0ae96c-b3b8-47d5-98c1-e95a40c4248d",
    "url": "https://your-site.atlassian.net",
    "name": "your-site",
    "scopes": ["read:jira-work", "write:jira-work", "read:jira-user"]
  }
]
```

> If your site doesn't appear, make sure you authorized on the correct Atlassian account (the one that has access to the JPD project).

---

## How Token Refresh Works (automatic)

Your access token expires after **1 hour**. But you also received a **refresh token**, which lasts **30–90 days** and allows silent renewal with no browser interaction.

Every time the skill is used, it automatically:
1. Reads `~/.jpd-insights-token.json`
2. Checks if `expires_at` has passed
3. If yes: posts to `https://auth.atlassian.com/oauth/token` with `grant_type=refresh_token` to get a new access token
4. Updates the file with the new token

**You only need to re-authorize if:**
- You delete `~/.jpd-insights-token.json`
- The refresh token expires (after ~30–90 days of no use)
- You revoke the app's access manually at https://id.atlassian.com/manage-profile/apps

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "This site can't be reached" in browser | Normal — the auth succeeded. Check your terminal output. |
| `access_token` missing from token file | Your Client ID or Secret is wrong. Re-run `jpd-auth.mjs`. |
| Site not in accessible resources | You authorized with a different Atlassian account. Re-run auth and log in with the right account. |
| `401 Unauthorized` on API calls | Token expired and refresh failed. Delete `~/.jpd-insights-token.json` and re-run `jpd-auth.mjs`. |
| Refresh token expired | Same as above — delete the file and re-authorize. |
| Port 7777 already in use | Run `lsof -ti:7777 | xargs kill` to free the port, then retry. |

---

## Next Steps

Once setup is complete, hand off to the **JPD Insights Skill** (`SKILL.md`) — it handles all API calls using the token you just created.

The skill can:
- **Get** all insights (data points) for any JPD idea
- **Create** new insights with a description, link, and structured data card
