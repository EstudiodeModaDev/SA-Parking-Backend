export type getGraphTokenDTO = {
  grant_type: string;
  client_id: string;
  client_secret: string;
  assertion: string | undefined;
  scope: string;
  requested_token_use: string;
};
