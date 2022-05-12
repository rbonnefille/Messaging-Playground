/* eslint-disable no-undef */
require('dotenv').config();
const jwt = require("jsonwebtoken");

const {
    WEBHOOK_CONVERSATIONS_SECRET: webhookConversationsSecret,
    BOT_SWITCHBOARD_INTEGRATION_ID: botSwitchboardIntegration,
    USERNAME: username,
    PASSWORD: password
  } = process.env;

function isAuthenticatedRequest(webhookEventApiKey) {
    return webhookEventApiKey === webhookConversationsSecret;
}

function isCurrentSwitchboardIntegration(activeSwitchboardIntegration) {
    return activeSwitchboardIntegration === botSwitchboardIntegration;
}

function isUserMessage(author) {
    return author === "user";
}

function isTextMessage(content) {
    return content === "text";
}

// Generate Messaging Token
function signJwtMessaging(external_id) {
    const expiry_time_in_seconds = 600
    const defaultExpiry = 300
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const expiry = parseInt(expiry_time_in_seconds, 10) || defaultExpiry
  
    const body = {
      scope: 'user',
    //   name: name,
    //   email,
      external_id,
      iat: nowInSeconds,
      exp: nowInSeconds + expiry,
    }
    return jwt.sign(body, password, {
      header: {
        alg: 'HS256',
        typ: 'JWT',
        kid: username,
      },
    })
  }

//Generating SunCo token
//  can add email, name later?
function signJwt(externalId) {
    const expiry_time_in_seconds = 600
    const defaultExpiry = 300
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const expiry = parseInt(expiry_time_in_seconds, 10) || defaultExpiry
  
    const body = {
      scope: 'user',
      userId: externalId,
      exp: nowInSeconds + expiry,
    }
    return jwt.sign(body, password, {
      header: {
        alg: 'HS256',
        typ: 'JWT',
        kid: username,
      },
    })
  }


module.exports = { isAuthenticatedRequest, isCurrentSwitchboardIntegration, isUserMessage, isTextMessage, signJwtMessaging, signJwt };