export const getPolarisInsightsInput = (
  cloudID: string,
  projectID: string,
  issueID: string
): any => ({
  project: `ari:cloud:jira:${cloudID}:project/${projectID}`,
  container: `ari:cloud:jira:${cloudID}:issue/${issueID}`,
});
