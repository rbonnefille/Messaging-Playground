/* eslint-disable no-undef */
const SunshineConversationsClient = require('sunshine-conversations-client');
const utils = require('./utils');
require('dotenv').config();

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];
const avatarUrl = "https://www.gravatar.com/avatar/00000000000000000000000000000000.png?d=robohash&f=y";
const botName = "CrazyBot";
const replyPayload = require('./payloads/replyPayload.json');
const carouselPayload = require('./payloads/carouselPayload.json');

basicAuth.username = process.env.USERNAME;
basicAuth.password = process.env.PASSWORD;

const {
  APP_ID: appId,
} = process.env;


async function sendActivity(appId, conversationId, activityType) {
  const apiInstance = new SunshineConversationsClient.ActivitiesApi();
  const activityPost = { "author": { "type": "business", "displayName": botName, "avatarUrl": avatarUrl }, "type": activityType };
  apiInstance.postActivity(appId, conversationId, activityPost).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
    console.log(`ConversationId: ${conversationId}`)
  }, function(error) {
    console.error(error);
  });
}

async function sendMessage(appId, conversationId, message, actions) {
  const apiInstance = new SunshineConversationsClient.MessagesApi();
  const messagePost = new SunshineConversationsClient.MessagePost();
  messagePost.setAuthor({ type: "business" ,"avatarUrl": avatarUrl, "displayName": botName});
  switch (actions) {
    case "carousel":
      messagePost.setContent(carouselPayload);
      break;
    case "quickReply":
      messagePost.setContent(replyPayload);
      break;
    case "flow":
      messagePost.setContent({ type: "text", text: message, actions: [ { text: "Agent", type: "reply", payload: "agent" }, { text: "Bot", type: "reply", payload: "bot" }, { text: "Hi", type: "reply", payload: "hi" }, { text: "Help", type: "reply", payload: "help" } ] });
      break;
    case "tacos":
      messagePost.setContent({type: "text", text: message});
      break;
    case "burritos":
      messagePost.setContent({type: "text", text: message});
      break;
    case null:
      messagePost.setContent({ "type": "text", "text": message });
      break;
    default:
        console.log(`Error while sending the message`);
      break;
  }
  //alternative way to send the messagePost
  //messagePost = {"author":{"type": "business" }, "content": { "type": "text", "text": "Hello again!" }};
  // or data.author = { type: 'business' }; data.content = { type: 'form', fields: [
  await apiInstance.postMessage(appId, conversationId, messagePost).then(function (data) {
    console.log('API called successfully. Returned data: ' + data);
    console.log(`ConversationId: ${conversationId}`)
  }, function (error) {
    console.error(error);
  });
}

async function passControl(appId, conversationId, body, switchBoardMetadata) {
  const apiInstance = new  SunshineConversationsClient.SwitchboardActionsApi();
  const passControlBody = new SunshineConversationsClient.PassControlBody(); // PassControlBody | 
  passControlBody[`switchboardIntegration`] = body;
  passControlBody.metadata = {
    "dataCapture.systemField.requester.name": switchBoardMetadata.givenName,
    "dataCapture.systemField.requester.email": switchBoardMetadata.email,
    "dataCapture.ticketField.360023540498": switchBoardMetadata.externalId,
    "dataCapture.systemField.tags": "switchBoardMetadata",
    "dataCapture.ticketField.360023540658": switchBoardMetadata.eventSource,
    "dataCapture.ticketField.1900005043913": switchBoardMetadata.conversation
  };

  console.log(passControlBody.metadata)

  apiInstance.passControl(appId, conversationId, passControlBody).then(function (data) {
    console.log('API called successfully. Returned data: ' + data);
    console.log(`ConversationId: ${conversationId}`)
  }, function (error) {
    console.error(error);
  });
}

async function replyToUser(userMessage, appId, conversationId, switchBoardMetadata) {
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
      setTimeout(sendMessage, 2000, appId, conversationId, "Ok let me transfer you to a Zendesk agent.", null);
      passControl(appId, conversationId, "zd-agentWorkspace", switchBoardMetadata);
      break;
    case 'bot':
      sendActivity(appId, conversationId, "typing:start");
      setTimeout(sendMessage, 2000, appId, conversationId, "Yes it's me, I'm only a bot!", "flow");
      break;
    case 'carousel':
      sendActivity(appId, conversationId, "typing:start");
      setTimeout(sendMessage, 2000, appId, conversationId, null , "carousel");
      break;
    case 'reply':
      sendActivity(appId, conversationId, "typing:start");
      setTimeout(sendMessage, 2000, appId, conversationId, null , "quickReply");
      break;
    case 'tacos':
      sendActivity(appId, conversationId, "typing:start");
      setTimeout(sendMessage, 2000, appId, conversationId, "🌮 are so yummy!!!" , "tacos");
      break;
    case 'burritos':
      sendActivity(appId, conversationId, "typing:start");
      setTimeout(sendMessage, 2000, appId, conversationId, "🌯 are so yummy too!!!" , "burritos");
      break;
    default:
      sendActivity(appId, conversationId, "typing:start");
      setTimeout(sendMessage, 2000, appId, conversationId, "Sorry I didn't get that. Can you please try to say something else?", "flow");
      break;
  }
}

async function webhookHandler(req, res) {

  const webhookEventApiKey = req.headers["x-api-key"];

  if (!utils.isAuthenticatedRequest(webhookEventApiKey)) {
      res.sendStatus(401);
  }

  const { events: [ messageEvent ] } = req.body;
  const {
      payload: {
          conversation,
          message: { author, content, source },
      },
  } = messageEvent || {};

  const conversationId = conversation.id;
  const activeSwitchboardIntegration = conversation.activeSwitchboardIntegration.id;
  const userMessage = content?.text?.toLowerCase();
  const switchBoardMetadata = {
      givenName: author.user?.profile?.givenName,
      email: author.user?.profile?.email,
      externalId: author.user?.externalId,
      eventSource: source.type,
      conversation: conversationId
  };
  
  if (!utils.isCurrentSwitchboardIntegration(activeSwitchboardIntegration)) {
      res.end();
  }

  if (utils.isUserMessage(author.type) && utils.isTextMessage(content.type)) {
      try {
          replyToUser(
              userMessage,
              appId,
              conversationId,
              switchBoardMetadata
          );
      } catch (err) {
          console.log("Error in message handler", err);
          res.status(500).send(err.message);
      }
  }
  res.end();
}

//exports the variables and functions above so that other modules can use them
module.exports.sendMessage = sendMessage;
module.exports.passControl = passControl;
module.exports.replyToUser = replyToUser;
module.exports.webhookHandler = webhookHandler;