export type ClientOptions = {
  /**
   * Use Novu Cloud US (https://api.novu.co) or EU deployment (https://eu.api.novu.co). Defaults to US.
   */
  apiUrl?: string;

  /**
   * Specify your Novu secret key, to secure the Bridge Endpoint, and Novu API communication.
   * Novu communicates securely with your endpoint using a signed HMAC header,
   * ensuring that only trusted requests from Novu are actioned by your Bridge API.
   * The secret key is used to sign the HMAC header.
   */
  secretKey?: string;

  /**
   * Explicitly use HMAC signature verification.
   * Setting this to `false` will enable Novu to communicate with your Bridge API
   * without requiring a valid HMAC signature.
   * This is useful for local development and testing.
   *
   * In production you must specify an `secretKey` and set this to `true`.
   *
   * Defaults to true.
   */
  strictAuthentication?: boolean;

  /**
   * Additional fetch options to be passed to the fetch API.
   * This can be used to set custom agent, headers, etc.
   */
  fetchOptions?: Record<string, any>;
};
