import gql from "graphql-tag";
import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { PolarisInsight } from "./types";

const CREATE_INSIGHT_MUTATION = gql`
  query getPolarisInsights($project: ID!, $container: ID) {
    polarisInsights(project: $project, container: $container) {
      id
      snippets {
        id
        oauthClientId
        data
        url
        properties
      }
    }
  }
`;

const client = new ApolloClient({
  link: createHttpLink({
    uri: "https://api-private.atlassian.com/graphql",
    fetch: require("node-fetch"),
  }),
  cache: new InMemoryCache(),
});

export const getPolarisInsights = (
  token: string,
  variables: any
): Promise<PolarisInsight[]> => {
  return client
    .query({
      query: CREATE_INSIGHT_MUTATION,
      variables: variables,
      context: {
        headers: {
          Authorization: token,
          "X-ExperimentalApi": "polaris-v0",
        },
      },
    })
    .then((response: any) => {
      if (
        !response.data ||
        response.data.polarisInsights === undefined ||
        response.data.polarisInsights === null
      ) {
        throw new Error(
          "polaris-insights.fetch-error: no data or no data node"
        );
      }
      return response.data.polarisInsights || [];
    });
};
