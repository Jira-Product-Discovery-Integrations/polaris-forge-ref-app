#!/usr/bin/env bash
set -eux

curl --location --request POST $FORGE_GRAPHQL_GATEWAY \
-u $FORGE_EMAIL:$FORGE_API_TOKEN \
--header 'Content-Type: application/json' \
--data-raw '{"query":"mutation setExternalAuthCredentials($input: SetExternalAuthCredentialsInput!) {\n  setExternalAuthCredentials(input: $input) {\n    success\n    statusCode\n    message\n  }\n}","variables":{"input":{"environment":{"appId":"ari:cloud:ecosystem::app/'"$FORGE_APP_ID"'","key":"'"$FORGE_ENV"'"},"serviceKey":"zendesk","credentials":{"clientId":"'"$PROVIDER_CLIENT_ID"'","clientSecret":"'"$PROVIDER_CLIENT_SECRET"'"}}}}'