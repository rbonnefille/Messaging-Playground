import { ClientCredentials } from "simple-oauth2";
import type {
    AccessToken,
    ClientCredentialTokenConfig,
    ModuleOptions,
} from "simple-oauth2";

const {
    ZENDESK_SUBDOMAIN: subdomain,
    ZENDESK_OAUTH_CLIENT_ID: clientId,
    ZENDESK_OAUTH_CLIENT_SECRET: clientSecret,
    ZENDESK_OAUTH_CLIENT_SCOPE: clientScope,
} = process.env;

if (!subdomain || !clientId || !clientSecret) {
    throw new Error("Missing Zendesk OAuth configuration");
}

const oauthConfig: ModuleOptions = {
    client: {
        id: clientId,
        secret: clientSecret,

    },
    auth: {
        tokenHost: `https://${subdomain}.zendesk.com`,
        tokenPath: "/oauth/tokens",
    },
    options: {
        authorizationMethod: "body",
        bodyFormat: "json",
    },
    http: {
        timeout: 10_000,
    },
};

const oauth: ClientCredentials = new ClientCredentials(oauthConfig);

const tokenParams: ClientCredentialTokenConfig = {
    scope: clientScope,
    expires_in: 1800,
};

let accessToken: AccessToken | undefined;
let pendingRequest: Promise<string> | undefined;

function getTokenValue(token: AccessToken): string {
    const value: unknown = token.token.access_token;

    if (typeof value !== "string" || value.length === 0) {
        throw new Error("Zendesk returned an invalid access token");
    }

    return value;
}

export async function getAccessToken(): Promise<string> {
    if (accessToken && !accessToken.expired(60)) {
        return getTokenValue(accessToken);
    }

    pendingRequest ??= (async (): Promise<string> => {
        try {
            const token: AccessToken = await oauth.getToken(tokenParams);
            const value = getTokenValue(token);
            accessToken = token;
            return value;
        } finally {
            pendingRequest = undefined;
        }
    })();

    return pendingRequest;
}