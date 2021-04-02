# Basic implementation of the SunCo Web Messenger by using NPM and a Bot with Switchboard

My app is deployed on my heroku account.

In order to add the integration ID, you can setup a config var by using the dashboard like shown here: https://devcenter.heroku.com/articles/config-vars#using-the-heroku-dashboard

You will need to name that var as:
- `INTEGRATION_ID` and provide your SunCo integration id as VALUE

- `USERNAME` and provide your SunCo username API KEY as VALUE

- `PASSWORD` and provide your SunCo password API KEY as VALUE

- `WEBHOOK_CONVERSATIONS_SECRET` and provide you webhook secret which is receiving conversation via the trigger `conversation:message`

- `WEBHOOK_SWITCHBOARD_SECRET` and provide you webhook secret which is receiving conversation via the Switchboard action triggers: 

    `switchboard:passControl:failure`,
    `switchboard:acceptControl`,
    `switchboard:acceptControl:failure`,
    `switchboard:offerControl`,
    `switchboard:offerControl:failure`,
    `switchboard:passControl`

- `ZD_SWITCHBOARD_ID` and provide your the Switchboard integration id for Zendesk

- `BOT_SWITCHBOARD_ID` and provide your the Switchboard integration id for your Bot

- `SDK_VERSION` and provide the SunCo Web SDK version you want to target
