FROM node

WORKDIR /usr/app

RUN npm set @atlassian:registry https://packages.atlassian.com/api/npm/atlassian-npm/

RUN npm i @atlassian/forge-object-resolver
RUN npm i @atlassian/polaris-forge-object-resolver