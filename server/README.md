# Basic implementation of a dummy "Bot" by using the SunCo APIs

# Necessary variables for the project

### Env

> Obtain these values from `https://<subdomain>.zendesk.com/admin/apps-integrations/apis/conversations-api`

- `KEY_ID=`
- `KEY_SECRET=`
- `APP_ID=`

> Obtain these values from `https://<subdomain>.zendesk.com/admin/apps-integrations/integrations/conversations-integrations`

- `SUNCO_CUSTOM_INTEGRATION_KEY=`
- `WEBHOOK_X_API_KEY=`

> Obtain these values from `https://<subdomain>.zendesk.com/sc/apps/<app_id>/v2/switchboards`

- `BOT_SWITCHBOARD_INTEGRATION_ID=`
- `NEXT_SWITCHBOARD_INTEGRATION=zd-agentWorkspace`
- `BOT_SWITCHBOARD_INTEGRATION_NAME=NodeJSBot`
- `SWITCHBOARD_ID=`

> Obtain these values from `https://thecatapi.com/`

- `CAT_API_KEY=`
- `CAT_API_URL=https://api.thecatapi.com/v1/images/`

> Provide your own values

- `BOT_AVATAR_URL=`
- `BOT_NAME=Bugs Bunny`
- `BASE_URL=https://api.smooch.io/v2/apps`
- `POD_BASE_URL=https://<subdomain>.zendesk.com/sc`
- `AUTHORISED_ORIGIN=`
- `AUTHORISED_ORIGIN_HC=`

> Optional. Only if you want to send proactive SMS or WhatsApp messages through SunCo Notifications API.

- `SUNCO_TWILIO_INTEGRATION_ID=`
- `SUNCO_WHATSAPP_INTEGRATION_ID=`

> Follow instructions here: https://developer.zendesk.com/documentation/classic-web-widget-sdks/support-sdk/working-with-the-support-sdk/building-a-dedicated-jwt-endpoint-for-the-support-sdk/

- `ZD_SUPPORT_SDK_JWT_SECRET=`

> App port configuration

- `PORT=3000`

## Bot predefined messages

In `server/constants/botMessages.ts` you can define the messages that the bot will use to interact with users. This allows you to centralize and manage all bot messages in one place, making it easier to update and maintain the bot's responses. Some are templates that needs to be created through the SunCo API: https://docs.smooch.io/rest/v1/#create-template
