# JPD Insights Skill

Use this skill to **read and write Insights (data points) on Jira Product Discovery (JPD) ideas** via the Polaris GraphQL API, using OAuth 3LO authentication with persistent token storage (no re-auth required after the first time).

---

## Prerequisites

### 1. Node.js
Ensure Node.js is available:
```bash
node --version  # must be v14+
```

### 2. Create a 3LO OAuth App (one-time setup)
1. Go to: https://developer.atlassian.com/console/myapps/create-3lo-app/
2. Give it a name (e.g. "JPD Insights Tool")
3. Go to **Permissions** → **Add** → `Jira platform REST API` → **Configure** → enable:
   - ✅ View user profiles (`read:jira-user`)
   - ✅ View Jira issue data (`read:jira-work`)
   - ✅ Create and manage issues (`write:jira-work`)
4. Go to **Authorization** → set Callback URL to: `http://localhost:7777`
5. Go to **Settings** → **Authentication details** → copy **Client ID** and **Secret**

> **Important:** The `offline_access` scope (for refresh tokens) must also be added. When constructing the auth URL, include it in the scope list so the token can be refreshed automatically without re-authorizing.

---

## Reference Implementation
The official reference app is at:
- Get insights: https://github.com/Jira-Product-Discovery-Integrations/polaris-forge-ref-app/tree/master/get-insights-example
- Push insights: https://github.com/Jira-Product-Discovery-Integrations/polaris-forge-ref-app/tree/master/push-example

Clone it with:
```bash
git clone --depth 1 https://github.com/Jira-Product-Discovery-Integrations/polaris-forge-ref-app.git
cd polaris-forge-ref-app
npm install
```

---

## Token Storage Strategy (avoid re-auth every time)

**Every time** you need to make a JPD API call, follow this exact decision tree — do NOT skip to the browser auth flow if a token file already exists:

```
Does ~/.jpd-insights-token.json exist?
├── NO  → Run full browser auth flow (Step 1–3 below), save tokens, continue
└── YES → Read the file
          Is Date.now() < expires_at?
          ├── YES → Use access_token as-is, continue
          └── NO  → Refresh the token (no browser needed):
                    POST to https://auth.atlassian.com/oauth/token with grant_type=refresh_token
                    Save new access_token + new expires_at (keep same refresh_token unless a new one is returned)
                    Continue with new access_token
```

### Token file format (`~/.jpd-insights-token.json`):
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_at": 1716042000000
}
```

`expires_at` = Unix timestamp in milliseconds = `Date.now() + (expires_in * 1000)` where `expires_in` is typically `3600` (1 hour).

### Step: Refresh the token (no browser needed)
Run this when `Date.now() >= expires_at`:
```bash
REFRESH_RESPONSE=$(curl -s -X POST "https://auth.atlassian.com/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "client_id": "<CLIENT_ID>",
    "client_secret": "<CLIENT_SECRET>",
    "refresh_token": "<REFRESH_TOKEN_FROM_FILE>"
  }')

# Extract new access token and save back to file
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['access_token'])")
NEW_EXPIRES_AT=$(python3 -c "import time; print(int(time.time()*1000) + 3600000)")

# Update the token file (preserve refresh_token if no new one returned)
python3 -c "
import json, time
with open('/tmp/refresh.json') as f:
    r = json.load(f)
token = json.load(open(os.path.expanduser('~/.jpd-insights-token.json')))
token['access_token'] = r['access_token']
token['expires_at'] = int(time.time()*1000) + r.get('expires_in', 3600)*1000
if 'refresh_token' in r:
    token['refresh_token'] = r['refresh_token']
json.dump(token, open(os.path.expanduser('~/.jpd-insights-token.json'), 'w'))
print('Token refreshed, valid for', r.get('expires_in', 3600), 'seconds')
"
```

> **Note:** Refresh tokens require `offline_access` in the authorization scope. Always include it: `read:jira-user read:jira-work write:jira-work offline_access`

> **Note:** If the refresh call returns a 401 or an error, the refresh token has expired (they last ~30-90 days). In that case, delete `~/.jpd-insights-token.json` and run the full browser auth flow again.

---

## Authentication Flow (first time only)

### Step 1: Build the authorization URL
```
https://auth.atlassian.com/authorize
  ?audience=api.atlassian.com
  &client_id=<CLIENT_ID>
  &scope=read%3Ajira-user%20read%3Ajira-work%20write%3Ajira-work%20offline_access
  &redirect_uri=http%3A%2F%2Flocalhost%3A7777
  &state=
  &response_type=code
  &prompt=consent
```

### Step 2: Start a local callback server on port 7777
The server listens for the OAuth redirect, extracts the `?code=` parameter, then:

### Step 3: Exchange the code for tokens
```bash
curl -s -X POST "https://auth.atlassian.com/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "client_id": "<CLIENT_ID>",
    "client_secret": "<CLIENT_SECRET>",
    "code": "<CODE_FROM_CALLBACK>",
    "redirect_uri": "http://localhost:7777"
  }'
```

Response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "read:jira-work write:jira-work read:jira-user offline_access"
}
```

Save `access_token`, `refresh_token`, and `Date.now() + (expires_in * 1000)` as `expires_at` to `~/.jpd-insights-token.json`.

### Step 4: Get the Cloud ID for your Atlassian site
```bash
curl -s "https://api.atlassian.com/oauth/token/accessible-resources" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"
```

Response:
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

Match the `url` field to your JPD site URL to get the `id` (Cloud ID).

### Step 5: Get issue details (to extract issue ID and project ID)
```bash
curl -s "https://api.atlassian.com/ex/jira/<CLOUD_ID>/rest/api/3/issue/<ISSUE_KEY>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json"
```

You need: `id` (issue ID) and `fields.project.id` (project ID) from the response.

---

## GraphQL Endpoint

All JPD Insights operations use:
```
POST https://api-private.atlassian.com/graphql
```

Required headers:
```
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
X-ExperimentalApi: polaris-v0
```

> ⚠️ The `X-ExperimentalApi: polaris-v0` header is **required** — without it the API returns errors.

---

## Get Insights for a JPD Idea

### GraphQL Query
```graphql
query getPolarisInsights($project: ID!, $container: ID) {
  polarisInsights(project: $project, container: $container) {
    id
    aaid
    container
    description
    snippets {
      id
      oauthClientId
      data
      url
      properties
    }
    created
    updated
  }
}
```

> **Note:** `container` is a scalar `ID` field (not an object) — it returns the issue ARI directly, e.g. `"ari:cloud:jira:<CLOUD_ID>:issue/<ISSUE_ID>"`. Do NOT use `container { id }` — that will cause a validation error.

### Variables
```json
{
  "project": "ari:cloud:jira:<CLOUD_ID>:project/<PROJECT_ID>",
  "container": "ari:cloud:jira:<CLOUD_ID>:issue/<ISSUE_ID>"
}
```

### curl example
```bash
curl -s -X POST "https://api-private.atlassian.com/graphql" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "X-ExperimentalApi: polaris-v0" \
  -d '{
    "query": "query getPolarisInsights($project: ID!, $container: ID) { polarisInsights(project: $project, container: $container) { id aaid container description snippets { id oauthClientId data url properties } created updated } }",
    "variables": {
      "project": "ari:cloud:jira:<CLOUD_ID>:project/<PROJECT_ID>",
      "container": "ari:cloud:jira:<CLOUD_ID>:issue/<ISSUE_ID>"
    }
  }'
```

### Example response
```json
{
  "data": {
    "polarisInsights": [
      {
        "id": "ari:cloud:jira:<CLOUD_ID>:polaris-insight/8583766",
        "aaid": "557057:...",
        "container": "ari:cloud:jira:<CLOUD_ID>:issue/<ISSUE_ID>",
        "description": {
          "type": "doc",
          "version": 1,
          "content": [{"type": "paragraph", "content": [{"type": "text", "text": "My insight description"}]}]
        },
        "snippets": [
          {
            "id": "ari:cloud:jira:<CLOUD_ID>:polaris-snippet/9441549",
            "oauthClientId": "<CLIENT_ID>",
            "data": { "type": "card", "context": {"url": "https://...", "title": "..."}, "content": {"description": "..."} },
            "url": "https://developer.atlassian.com/cloud/jira/product-discovery/",
            "properties": {"reactions": {"name": "Reactions", "value": 7}}
          }
        ],
        "created": "2026-05-18T13:53:28.923126Z",
        "updated": "2026-05-18T13:53:28.923126Z"
      }
    ]
  }
}
```

> **Key finding:** An insight with 0 snippets is valid — it means the insight has a description but no linked data cards attached yet.

---

## Get All Insights Across an Entire Project (Space)

To fetch insights for **all ideas in a project** at once, simply omit the `container` variable — the API returns every insight in the project.

### GraphQL Query
```graphql
query getAllPolarisInsights($project: ID!) {
  polarisInsights(project: $project) {
    id
    aaid
    container
    description
    snippets {
      id
      oauthClientId
      data
      url
      properties
    }
    created
    updated
  }
}
```

### Variables
```json
{
  "project": "ari:cloud:jira:<CLOUD_ID>:project/<PROJECT_ID>"
}
```

> **Key difference from per-idea query:** No `container` variable — just `project`. This returns every insight across all ideas in the project.

> **Note:** The API warns that queries must have an operation name — always name your query (e.g. `query getAllPolarisInsights`) to avoid this warning.

### curl example
```bash
curl -s -X POST "https://api-private.atlassian.com/graphql" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "X-ExperimentalApi: polaris-v0" \
  -d '{
    "query": "query getAllPolarisInsights($project: ID!) { polarisInsights(project: $project) { id aaid container description snippets { id oauthClientId data url properties } created updated } }",
    "variables": {
      "project": "ari:cloud:jira:<CLOUD_ID>:project/<PROJECT_ID>"
    }
  }'
```

> **Tested:** Returns all insights from all ideas in the project in a single call — no pagination needed.

> ⚠️ **Note on `oauthClientId`:** The `polarisInsights` query returns all insights for the project/idea regardless of how they were created — via the JPD UI, Chrome extension, or API. Each insight's `snippets[].oauthClientId` tells you which app or integration created that snippet (`polaris` = created natively in the JPD UI).

---

## Create (Push) an Insight on a JPD Idea

### GraphQL Mutation
```graphql
mutation createInsight($input: CreatePolarisInsightInput!) {
  createPolarisInsight(input: $input) {
    success
    errors {
      message
    }
    node {
      id
      aaid
      container
      description
      snippets {
        data
        properties
        oauthClientId
        id
      }
      created
      updated
    }
  }
}
```

### Variables
```json
{
  "input": {
    "cloudID": "<CLOUD_ID>",
    "projectID": "<PROJECT_ID>",
    "issueID": "<ISSUE_ID>",
    "description": {
      "version": 1,
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [{"type": "text", "text": "Your insight description here"}]
        }
      ]
    },
    "data": [],
    "snippets": [
      {
        "oauthClientId": "<CLIENT_ID>",
        "url": "https://your-link.com",
        "data": {
          "type": "card",
          "group": {"name": "Group Name", "id": "group_id"},
          "context": {
            "icon": "https://example.com/icon.png",
            "url": "https://your-link.com",
            "title": "Link Title"
          },
          "content": {
            "description": "Text shown in the data card"
          },
          "properties": {
            "reactions": {"name": "Reactions", "value": 7},
            "labels": {"name": "Labels", "value": ["tag1", "tag2"]}
          }
        }
      }
    ]
  }
}
```

> **Important schema notes (from live testing):**
> - The input type is `CreatePolarisInsightInput` (NOT `PolarisCreateInsightInput`)
> - `cloudID`, `projectID`, `issueID` are **plain IDs**, not ARIs (unlike the query variables)
> - `data: []` is required at the top level (empty array)
> - The mutation returns `node` (NOT `insight`) — check `success: true` before reading `node.id`
> - `snippets[].data` is a structured card object, not a plain string

### curl example (write payload to file first)
```bash
# Write payload to file
cat > /tmp/push_payload.json << 'PAYLOAD'
{
  "query": "mutation createInsight($input: CreatePolarisInsightInput!) { createPolarisInsight(input: $input) { success errors { message } node { id container snippets { id data url properties } created updated } } }",
  "variables": {
    "input": {
      "cloudID": "<CLOUD_ID>",
      "projectID": "<PROJECT_ID>",
      "issueID": "<ISSUE_ID>",
      "description": {"version": 1, "type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Your description"}]}]},
      "data": [],
      "snippets": [{"oauthClientId": "<CLIENT_ID>", "url": "https://your-link.com", "data": {"type": "card", "context": {"url": "https://your-link.com", "title": "Your Title"}, "content": {"description": "Your card text"}}}]
    }
  }
}
PAYLOAD

curl -s -X POST "https://api-private.atlassian.com/graphql" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -H "X-ExperimentalApi: polaris-v0" \
  -d @/tmp/push_payload.json
```

### Successful response
```json
{
  "data": {
    "createPolarisInsight": {
      "success": true,
      "errors": null,
      "node": {
        "id": "ari:cloud:jira:<CLOUD_ID>:polaris-insight/8583766",
        "container": "ari:cloud:jira:<CLOUD_ID>:issue/<ISSUE_ID>",
        "snippets": [
          {
            "id": "ari:cloud:jira:<CLOUD_ID>:polaris-snippet/9441549",
            "data": {"type": "card", "context": {"url": "...", "title": "..."}, ...},
            "url": "https://your-link.com",
            "properties": {...}
          }
        ],
        "created": "2026-05-18T13:53:28.923126Z",
        "updated": "2026-05-18T13:53:28.923126Z"
      }
    }
  }
}
```

---

## Quick Reference: ID Lookup Cheat Sheet

| What you need | How to get it |
|---|---|
| Cloud ID | `GET /oauth/token/accessible-resources` → match site URL → `id` |
| Project ID | `GET /rest/api/3/issue/<KEY>` → `fields.project.id` |
| Issue ID | `GET /rest/api/3/issue/<KEY>` → `id` |
| Issue Key | From the issue URL: `https://<site>.atlassian.net/browse/<KEY>` |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `"Issue url host doesn't not match to any accessible resource"` | The Atlassian site isn't authorized for the 3LO app | Make sure you authorized on the correct site in the browser |
| `"polaris-insights.fetch-error: no data or no data node"` | The GraphQL returned null — site not accessible or wrong cloud ID | Check cloud ID matches the correct site |
| `"Validation error (UnknownType): Unknown type 'PolarisCreateInsightInput'"` | Wrong input type name in mutation | Use `CreatePolarisInsightInput` (not `PolarisCreateInsightInput`) |
| `401 Unauthorized` | Expired or wrong token | Refresh the token using the refresh_token grant |
| `"This site can't be reached"` after auth redirect | Normal! The callback server closed after receiving the code | This is expected — check for output/results |

---

## Tested Against (Live Session — 2026-05-18)
- Site: `atlassian-product-managers.atlassian.net`
- Cloud ID: `ec0ae96c-b3b8-47d5-98c1-e95a40c4248d`
- Issue: `SPC-19` (type: Feature / JPD idea)
- Successfully: fetched 2 existing insights, created 1 new insight with description + snippet
- Reference repo cloned, deps installed with `npm install`, ran via `npx ts-node`
