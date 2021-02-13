const { env } = require('string-env-interpolation')
const { readFileSync, writeFileSync } = require('fs')

const isProd = process.env.BITBUCKET_DEPLOYMENT_ENVIRONMENT === 'Production'

const configObj = {
  FORGE_ENV: process.env.FORGE_ENV,
  FORGE_APP_ID: process.env.FORGE_APP_ID,
  BITBUCKET_DEPLOYMENT_ENVIRONMENT: process.env.BITBUCKET_DEPLOYMENT_ENVIRONMENT,
  build: `https://bitbucket.org/${process.env.BITBUCKET_REPO_FULL_NAME}/addon/pipelines/home#!/results/${process.env.BITBUCKET_BUILD_NUMBER}`,
  'Identity manage apps': isProd
    ? 'https://id.atlassian.com/manage-profile/apps'
    : 'https://id.stg.internal.atlassian.com/manage-profile/apps',
}

writeFileSync('./manifest.yml', env(readFileSync('./manifest.template.yml', 'utf-8')))