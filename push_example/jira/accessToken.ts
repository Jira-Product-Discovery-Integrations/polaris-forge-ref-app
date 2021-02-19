export const getAccessToken = (clientId, clientSecret, redirectUrl, code) => {
    return fetch("https://auth.atlassian.com/oauth/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUrl,
              }),
            })
            .then(async (response) => {
                if (response.status === 200) {
                  const data = await response.json();
                  return `${data.token_type} ${data.access_token}`;
                }
                throw new Error(`${response.status}: ${response.statusText}`);
            });
}