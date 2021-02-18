export const getAccessibleResources = (token) => {
    return fetch("https://api.atlassian.com/oauth/token/accessible-resources", {
        headers: {
            "Content-Type": "application/json",
            Authorization: token,
        }
    }).then(response => {
        if (response.status === 200) {
            return response.json();
        }
        throw new Error(`${response.status}: ${response.statusText}`);
    });
}