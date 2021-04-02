export interface Account {
  __typename: "User";
  accountId: string;
  name: string;
  picture: string;
}

export interface AppInfo {
  __typename: "PolarisConnectApp";
  /**
   * id of CaaS app
   */
  id: string;
  /**
   * name of CaaS app
   */
  name: string;
  /**
   * avatarUrl of CaaS app
   */
  avatarUrl: string;
  /**
   * oauthClientId of CaaS app
   */
  oauthClientId: string;
}

export interface PolarisInsight {
  __typename: "PolarisInsight";
  /**
   * ARI of the insight, for example:
   *
   *    `ari:cloud:cebeacbd-f85e-483c-96ac-fd432a12ad1c:polaris-insight/10004`
   */
  id: string;
  account?: Account;
  /**
   * Array of snippets attached to this data point.
   */
  snippets: PolarisSnippet[];
  /**
   * Description in ADF format.  See
   * https://developer.atlassian.com/platform/atlassian-document-format/
   */
  description: any;
  /**
   * Creation time of data point in RFC3339 format
   */
  created: string;
  /**
   * Updated time of data point in RFC3339 format
   */
  updated: string;
}

export interface PolarisSnippet {
  __typename: "PolarisSnippet";
  /**
   * ARI of the snippet, for example:
   *
   *    `ari:cloud:cebeacbd-f85e-483c-96ac-fd432a12ad1c:polaris-snippet/10004`
   */
  id: string;
  /**
   * Data in JSON format
   */
  data: any;
  /**
   * Timestamp of when the snippet was last updated
   */
  updated: string;
  /**
   * OauthClientId of CaaS app
   */
  oauthClientId: string;
  appInfo: AppInfo;
  /**
   * Snippet url that is source of data
   */
  url?: string;
  /**
   * Snippet-level properties in JSON format.
   */
  properties: any;
}
