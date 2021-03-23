export const getIssue = (
  token: string,
  siteUrl: string,
  issueKey: string
): any => {
  return fetch(`${siteUrl}/rest/api/3/issue/${issueKey}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  }).then(async (response) => {
    if (response.status === 200) {
      return await response.json();
    }
    throw new Error(
      `Failed to fetch issue. Status ${response.status}: ${response.statusText}`
    );
  });
};
