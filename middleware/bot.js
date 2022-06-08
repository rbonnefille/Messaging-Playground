/* eslint-disable no-undef */
const SunshineConversationsClient = require('sunshine-conversations-client');
const { sendActivity, sendMessage, passControl } = require('./suncoActions');
require('dotenv').config();

class Bot {
  constructor() {
    this.replyToUser = this.replyToUser.bind(this);
  }

 replyToUser(userMessage, appId, conversationId, switchBoardMetadata) {
    switch (userMessage) {
      case 'hello':
      case 'hi':
      case 'hey':
      case 'help':
        // setTimeout(sendMessage, 2000, appId, conversationId, "Hey there! You can ask me the following and might reply 😆", "flow" );
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "Hey there! You can ask me the following and might reply 😆", "flow");
        break;
      case 'agent':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "Ok let me transfer you to a Zendesk agent.", "default");
        passControl(appId, conversationId, "zd-agentWorkspace", switchBoardMetadata);
        break;
      case 'bot':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "Yes it's me, I'm only a bot!", "flow");
        break;
      case 'carousel':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "%((template:mexican_carousel))%" , "default");
        break;
      case 'tacos':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "🌮 are so yummy!!!" , "default");
        break;
      case 'burritos':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "🌯 are so yummy too!!!" , "default");
        break;
      case 'compound message':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "%((template: smooch_tmpl_family_basket))%" , "default");
        break;
      case 'file message':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "%((template: smooch_tmpl_warranty))%" , "default");
        break;
      case 'form message':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "%((template: smooch_tmpl_lead_capture))%" , "default");
        break;
      case 'location request':
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "%((template: smooch_tmpl_request_location))%" , "default");
        break;
      default:
        sendActivity(appId, conversationId, "typing:start");
        setTimeout(sendMessage, 2000, appId, conversationId, "Sorry I didn't get that. Can you please try to say something else?", "flow");
        break;
    }
  }
}

  module.exports = Bot;