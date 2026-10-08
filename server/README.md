# Basic implementation of a dummy "Bot" by using the SunCo APIs

# Necessary variables for the project

### Env

> Obtain these values from `https://<subdomain>.zendesk.com/admin/apps-integrations/apis/conversations-api`

- `KEY_ID=`
- `KEY_SECRET=`
- `APP_ID=`

<img width="1194" height="733" alt="image" src="https://github.com/user-attachments/assets/a6a40f29-e15d-4ebf-bbdc-6cd9705264a8" />

> Obtain these values from `https://<subdomain>.zendesk.com/admin/apps-integrations/integrations/conversations-integrations`

- `CONVERSATION_INTEGRATION_SHARED_SECRET=`

<img width="767" height="639" alt="image" src="https://github.com/user-attachments/assets/1114317e-ece6-4778-b9a5-cf3c19d1542b" />

> Obtain these values from the API via `https://<subdomain>.zendesk.com/sc/apps/<app_id>/v2/switchboards`
> Then [create a Switchboard integration](https://developer.zendesk.com/api-reference/conversations/#tag/Switchboard-Integrations/operation/CreateSwitchboardIntegration) pointing to the webhook created above. Once created, you will be able to populate the value `BOT_SWITCHBOARD_INTEGRATION_ID` below.

```JSON
{
  "name": "dummyBot",
  "integrationId: "<CONVERSATION_INTEGRATION_ID>", // replace with `CONVERSATION_INTEGRATION_ID`
  "deliverStandbyEvents": false,
}
```

- `BOT_SWITCHBOARD_INTEGRATION_ID=`
- `NEXT_SWITCHBOARD_INTEGRATION=zd-agentWorkspace`
- `BOT_SWITCHBOARD_INTEGRATION_NAME=dummyBot`
- `SWITCHBOARD_ID=`

> Obtain these values from `https://thecatapi.com/`

- `CAT_API_KEY=`
- `CAT_API_URL=https://api.thecatapi.com/v1/images/`

> Provide your own values

- `BOT_AVATAR_URL=`
- `BOT_NAME=Bugs Bunny`
- `ZENDESK_SUBDOMAIN=`

> _Optional_. Only if you want to send proactive SMS or WhatsApp messages through SunCo Notifications API.

- `SUNCO_WEB_WIDGET_INTEGRATION_ID=` // Create a SunCo Web Widget integration to get it: https://developer.zendesk.com/api-reference/conversations/#tag/Integrations/operation/CreateIntegration
- `SUNCO_TWILIO_INTEGRATION_ID=` // Create a SunCo Twilio integration to get it: https://developer.zendesk.com/api-reference/conversations/#tag/Integrations/operation/CreateIntegration
- `SUNCO_WHATSAPP_INTEGRATION_ID=` // Add Whatsapp as a channel via the Admin center and retrieve it's integration id via: https://developer.zendesk.com/api-reference/conversations/#tag/Integrations/operation/ListIntegrations

> _Optional_. Follow instructions here: https://developer.zendesk.com/documentation/classic-web-widget-sdks/support-sdk/working-with-the-support-sdk/building-a-dedicated-jwt-endpoint-for-the-support-sdk/

- `ZD_SUPPORT_SDK_JWT_SECRET=`

> Optional. Only if you want to sign JWTs for the Zendesk SSO: https://support.zendesk.com/hc/en-us/articles/4408845838874-Enabling-JWT-single-sign-on

- `ZD_SSO_SECRET=`

> App port configuration

- `PORT=3000`

## Bot predefined messages

In `server/constants/botMessages.ts` you can define the messages that the bot will use to interact with users. This allows you to centralize and manage all bot messages in one place, making it easier to update and maintain the bot's responses. Some are templates that needs to be created through the SunCo API: https://docs.smooch.io/rest/v1/#create-template
