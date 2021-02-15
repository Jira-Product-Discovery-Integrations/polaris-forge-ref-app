const { env } = require('string-env-interpolation')
const { readFileSync, writeFileSync } = require('fs')
writeFileSync('./manifest.yml', env(readFileSync('./manifest.template.yml', 'utf-8')))