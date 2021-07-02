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
            iconUrl: 'https://hips.hearstapps.com/del.h-cdn.co/assets/18/11/1520956952-chicken-tacos-horizontal.jpg',
            payload: 'TACOS'
        },
        {
            type: 'reply',
            text: 'Burritos',
            iconUrl: 'https://www.oldelpaso.co.uk/-/media/oep/uk/articles/how-to-make-a-burrito/what-is-a-burrito-featured-collection-one.png',
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
            mediaUrl: 'https://hips.hearstapps.com/del.h-cdn.co/assets/18/11/1520956952-chicken-tacos-horizontal.jpg',
            actions: [
                {
                    text: 'Select',
                    type: 'postback',
                    payload: 'TACOS'
                },
                {
                    text: 'More info',
                    type: 'link',
                    uri: 'https://en.wikipedia.org/wiki/Taco'
                }
            ]
        },
        {
            title: 'Burrito',
            description: 'Description',
            mediaUrl: 'https://www.oldelpaso.co.uk/-/media/oep/uk/articles/how-to-make-a-burrito/what-is-a-burrito-featured-collection-one.png',
            actions: [
                {
                    text: 'Select',
                    type: 'postback',
                    payload: 'BURRITOS'
                },
                {
                    text: 'More info',
                    type: 'link',
                    uri: 'https://en.wikipedia.org/wiki/Burrito'
                }
            ]
        }
    ]
};

async function sendActivity(appId, conversationId, activityType) {
  const apiInstance = new SunshineConversationsClient.ActivitiesApi();
  const activityPost = { "author": { "type": "business", "displayName": botName, "avatarUrl": avatarUrl }, "type": activityType };
  apiInstance.postActivity(appId, conversationId, activityPost).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
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
  }, function (error) {
    console.error(error);
  });
}

async function passControl(appId, conversationId, body) {
  const apiInstance = new  SunshineConversationsClient.SwitchboardActionsApi();
  const passControlBody = new SunshineConversationsClient.PassControlBody(); // PassControlBody | 
  passControlBody['switchboardIntegration'] = body;
  apiInstance.passControl(appId, conversationId, passControlBody).then(function (data) {
    console.log('API called successfully. Returned data: ' + data);
  }, function (error) {
    console.error(error);
  });
}

async function replyToUser(userMessage, appId, conversationId) {
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
      passControl(appId, conversationId, "zd-agentWorkspace");
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
//exports the variables and functions above so that other modules can use them
module.exports.sendMessage = sendMessage;
module.exports.passControl = passControl;
module.exports.replyToUser = replyToUser;