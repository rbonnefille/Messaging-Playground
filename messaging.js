const SunshineConversationsClient = require('sunshine-conversations-client');
const defaultClient = SunshineConversationsClient.ApiClient.instance;
const basicAuth = defaultClient.authentications['basicAuth'];
const avatarUrl = "https://www.gravatar.com/avatar/00000000000000000000000000000000.png?d=robohash&f=y";
const botName = "CrazyBot";
basicAuth.username = process.env.USERNAME;
basicAuth.password = process.env.PASSWORD;


const replyPayload = {
    type: 'text',
    text: 'Which do you prefer?',
    actions: [
        {
            type: 'reply',
            text: 'Tacos',
            iconUrl: 'http://imgur.com/taco.png',
            payload: 'TACOS'
        },
        {
            type: 'reply',
            text: 'Burritos',
            iconUrl: 'http://imgur.com/burrito.png',
            payload: 'BURRITOS'
        }
    ]
};
const carouselPayload = {
    type: 'carousel',
    items: [
        {
            title: 'Tacos',
            description: 'Description',
            mediaUrl: 'http://example.org/image.jpg',
            actions: [
                {
                    text: 'Select',
                    type: 'postback',
                    payload: 'TACOS'
                },
                {
                    text: 'More info',
                    type: 'link',
                    uri: 'http://example.org'
                }
            ]
        },
        {
            title: 'Ramen',
            description: 'Description',
            mediaUrl: 'http://example.org/image.jpg',
            actions: [
                {
                    text: 'Select',
                    type: 'postback',
                    payload: 'RAMEN'
                },
                {
                    text: 'More info',
                    type: 'link',
                    uri: 'http://example.org'
                }
            ]
        }
    ]
};

async function sendMessageUser(appId, conversationId, message, actions) {
  const apiInstance = new MessagesApi();
  const messagePost = new MessagePost();
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
  }, function (error) {
    console.error(error);
  });
}

async function passControl(appId, conversationId, body) {
  const apiInstance = new SwitchboardActionsApi();
  const passControlBody = new PassControlBody(); // PassControlBody | 
  passControlBody['switchboardIntegration'] = body;
  apiInstance.passControl(appId, conversationId, passControlBody).then(function (data) {
  }, function (error) {
    console.error(error);
  });
}

async function readUserMessage(userMessage, appId, conversationId) {
  switch (userMessage) {
    case 'hello':
    case 'hi':
    case 'hey':
    case 'help':
      //sendMessageUser(appId, conversationId, "Hey there! You can send me 'agent','bot' .. and might reply to you 😆");
      sendMessageUser(appId, conversationId, "Hey there! You can ask me the following and might reply 😆", "flow" );
      break;
    case 'agent':
      sendMessageUser(appId, conversationId, "Ok let me transfer you to a Zendesk agent.", null);
      passControl(appId, conversationId, "zd-agentWorkspace");
      break;
    case 'bot':
      sendMessageUser(appId, conversationId, "Yes it's me, I'm only a bot!", "flow");
      break;
    case 'carousel':
      sendMessageUser(appId, conversationId, null , "carousel");
      break;
    case 'reply':
      sendMessageUser(appId, conversationId, null , "quickReply");
      break;
    default:
      sendMessageUser(appId, conversationId, "Sorry I didn't get that. Can you please try to say something else?", "flow");
      break;
  }
}
//exports the variables and functions above so that other modules can use them
module.exports.sendMessageUser = sendMessageUser;
module.exports.passControl = passControl;
module.exports.readUserMessage = readUserMessage;