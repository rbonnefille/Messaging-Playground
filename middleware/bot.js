/* eslint-disable no-undef */
const SunshineConversationsClient = require('sunshine-conversations-client');
const utils = require('./utils');
const suncoActions = require('./suncoActions');
require('dotenv').config();

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];


const {
  USERNAME: username,
  PASSWORD: password
} = process.env;

basicAuth.username = username;
basicAuth.password = password;


async function replyToUser(userMessage, appId, conversationId, switchBoardMetadata) {
    switch (userMessage) {
      case 'hello':
      case 'hi':
      case 'hey':
      case 'help':
        // setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, "Hey there! You can ask me the following and might reply 😆", "flow" );
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, "Hey there! You can ask me the following and might reply 😆", "flow");
        break;
      case 'agent':
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, "Ok let me transfer you to a Zendesk agent.", null);
        suncoActions.passControl(appId, conversationId, "zd-agentWorkspace", switchBoardMetadata);
        break;
      case 'bot':
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, "Yes it's me, I'm only a bot!", "flow");
        break;
      case 'carousel':
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, null , "carousel");
        break;
      case 'reply':
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, null , "quickReply");
        break;
      case 'tacos':
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, "🌮 are so yummy!!!" , "tacos");
        break;
      case 'burritos':
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, "🌯 are so yummy too!!!" , "burritos");
        break;
      default:
        suncoActions.sendActivity(appId, conversationId, "typing:start");
        setTimeout(suncoActions.sendMessage, 2000, appId, conversationId, "Sorry I didn't get that. Can you please try to say something else?", "flow");
        break;
    }
  }

  module.exports = { replyToUser };