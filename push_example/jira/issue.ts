export const getIssue = (token, siteUrl, issueKey) => {
    return fetch(`${siteUrl}/rest/api/3/issue/${issueKey}`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            })
            .then(async (response) => {
                if (response.status === 200) {
                  return await response.json();
                }
                throw new Error(`${response.status}: ${response.statusText}`);
            });
}