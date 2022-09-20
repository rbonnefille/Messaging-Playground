/* eslint-disable no-undef */
const SunshineConversationsClient = require('sunshine-conversations-client');
require('dotenv').config();

const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];

basicAuth.username = process.env.USERNAME;
basicAuth.password = process.env.PASSWORD;


async function sendActivity(appId, conversationId, activityType, botName, avatarUrl) {
  const apiInstance = new SunshineConversationsClient.ActivitiesApi();
  const activityPost = { "author": { "type": "business", "displayName": botName, "avatarUrl": avatarUrl }, "type": activityType };
  apiInstance.postActivity(appId, conversationId, activityPost).then(function (data) {
    console.log(`postActivity API called successfully for ConversationId: ${conversationId}`);

  }, function (error) {
    console.error(error);
  });
}

async function sendMessage(appId, conversationId, message, actions, botName, avatarUrl) {
  const apiInstance = new SunshineConversationsClient.MessagesApi();
  const messagePost = new SunshineConversationsClient.MessagePost();
  messagePost.setAuthor({ type: "business", "avatarUrl": avatarUrl, "displayName": botName });
  switch (actions) {
    case "default":
      messagePost.setContent({ type: "text", text: message });
      break;
    case "flow":
      messagePost.setContent({
        type: "text",
        text: message,
        actions: [
          { text: "Agent", type: "reply", payload: "agent" },
          { text: "Bot", type: "reply", payload: "bot" },
          { text: "Hi", type: "reply", payload: "hi" },
          { text: "Help", type: "reply", payload: "help" },
          { text: "Carousel", type: "reply", payload: "carousel" },
          { text: "Compound Message", type: "reply", payload: "compound message" },
          { text: "File Message", type: "reply", payload: "file message" },
          { text: "Form Message", type: "reply", payload: "form message" },
          { text: "Location Request", type: "reply", payload: "location request" },
        ],
      });
      break;
    default:
      console.log(`Error while sending the message`);
      break;
  }

  //alternative way to send the messagePost
  //messagePost = {"author":{"type": "business" }, "content": { "type": "text", "text": "Hello again!" }};
  // or data.author = { type: 'business' }; data.content = { type: 'form', fields: [
  await apiInstance.postMessage(appId, conversationId, messagePost).then(function (data) {
    // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    console.log(`postMessage API called successfully for ConversationId: ${conversationId}`);
  }, function (error) {
    console.error(error);
  });
}

async function passControl(appId, conversationId, nextSwitchboardIntegration, switchBoardMetadata) {
  const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
  const passControlBody = new SunshineConversationsClient.PassControlBody(); // PassControlBody | 
  passControlBody[`switchboardIntegration`] = nextSwitchboardIntegration;
  passControlBody.metadata = {
    "dataCapture.systemField.requester.name": switchBoardMetadata.givenName,
    "dataCapture.systemField.requester.email": switchBoardMetadata.email,
    "dataCapture.ticketField.360023540498": switchBoardMetadata.externalId,
    "dataCapture.systemField.tags": "switchBoardMetadata," + switchBoardMetadata.eventSource,
    "dataCapture.ticketField.360023540658": switchBoardMetadata.eventSource,
    "dataCapture.ticketField.1900005043913": switchBoardMetadata.conversation
  };

  console.log(passControlBody.metadata)

  await apiInstance.passControl(appId, conversationId, passControlBody).then(function (data) {
    console.log(`passControl API called successfully for ConversationId: ${conversationId}`);
  }, function (error) {
    console.error(error);
  });
}


module.exports = {
  sendActivity,
  sendMessage,
  passControl
};