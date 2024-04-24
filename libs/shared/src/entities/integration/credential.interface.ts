export interface ICredentials {
  apiKey?: string;
  user?: string;
  secretKey?: string;
  domain?: string;
  password?: string;
  host?: string;
  port?: string;
  secure?: boolean;
  region?: string;
  accountSid?: string;
  messageProfileId?: string;
  token?: string;
  from?: string;
  senderName?: string;
  contentType?: string;
  applicationId?: string;
  clientId?: string;
  projectName?: string;
  serviceAccount?: string;
  baseUrl?: string;
  webhookUrl?: string;
  requireTls?: boolean;
  ignoreTls?: boolean;
  tlsOptions?: Record<string, unknown>;
  redirectUrl?: string;
  hmac?: boolean;
  ipPoolName?: string;
  apiKeyRequestHeader?: string;
  secretKeyRequestHeader?: string;
  idPath?: string;
  datePath?: string;
  authenticateByToken?: boolean;
  authenticationTokenKey?: string;
  accessKey?: string;
  instanceId?: string;
  apiToken?: string;
  apiURL?: string;
  appID?: string;
  alertUid?: string;
  title?: string;
  imageUrl?: string;
  state?: string;
  externalLink?: string;
  topic?: string;
  channelId?: string;
}
