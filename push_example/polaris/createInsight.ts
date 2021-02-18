import gql from "graphql-tag";
import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";

const CREATE_INSIGHT_MUTATION = gql`
  mutation createInsight($input: CreatePolarisInsightInput!) {
    createPolarisInsight(input: $input) {
      success
      errors {
        message
      }
      node {
        id
        aaid
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
`;

const client = new ApolloClient({
  link: createHttpLink({ uri: "https://api-private.atlassian.com/graphql", fetch: require('node-fetch') }),
  cache: new InMemoryCache(),
});

export const createInsight = (token, variables) => {
    return client.mutate({
        mutation: CREATE_INSIGHT_MUTATION,
        variables: variables,
        context: {
          headers: {
              Authorization: token,
              'X-ExperimentalApi': 'polaris-v0'
            },
        }
      })
      .then((response: any) => {
          const { data, errors } = response;
          if (!data || errors || !data.createPolarisInsight || !data.createPolarisInsight.success || !data.createPolarisInsight.node.id) {
            throw new Error(`Failed to create insight: ${JSON.stringify(data)}`)
          }
          return data.createPolarisInsight.node.id;
      })
}
