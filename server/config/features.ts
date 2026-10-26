import './env.js';

const hasEnv = (...names: string[]) =>
    names.every(name => Boolean(process.env[name]?.trim()));

export const hasSuncoCredentials = hasEnv(
    'APP_ID',
    'KEY_ID',
    'KEY_SECRET'
);

export const features = {
    sms: hasEnv(
        'SUNCO_TWILIO_INTEGRATION_ID',
    ) && hasSuncoCredentials,
    zendeskApis: hasEnv(
        'ZENDESK_SUBDOMAIN',
        'ZENDESK_OAUTH_CLIENT_ID',
        'ZENDESK_OAUTH_CLIENT_SECRET',
        'ZENDESK_OAUTH_CLIENT_SCOPE'
    ),
    suncoBot: hasEnv(
        'CONVERSATION_INTEGRATION_SHARED_SECRET',
        'BOT_SWITCHBOARD_INTEGRATION_ID',
        'NEXT_SWITCHBOARD_INTEGRATION',
        'BOT_SWITCHBOARD_INTEGRATION_NAME',
    ) && hasSuncoCredentials,
    zendeskSSOJwt: hasEnv(
        'ZENDESK_SUBDOMAIN',
        "ZD_SSO_SECRET",
        'NGROK_SUBDOMAIN',
        'ZD_SUPPORT_SDK_JWT_SECRET'
    )
};