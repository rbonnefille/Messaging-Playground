var SunshineConversationsClient = require('sunshine-conversations-client');
var defaultClient = SunshineConversationsClient.ApiClient.instance;
var basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.USERNAME;
basicAuth.password = process.env.PASSWORD;

async function sendMessageUser(appId, conversationId, message, actions) {
  var apiInstance = new SunshineConversationsClient.MessagesApi();
  var messagePost = new SunshineConversationsClient.MessagePost();
  messagePost.setAuthor({ type: "business" ,"avatarUrl": "https://www.gravatar.com/avatar/00000000000000000000000000000000.png?d=robohash&f=y", "displayName": "CrazyBot"});
  if (!actions) {
    messagePost.setContent({ "type": "text", "text": message });
  } else {
    messagePost.setContent({
      type: "text",
      text: message,
      actions: [
        {
            text: "Agent",
            type: "reply",
            payload: "agent"
        },
        {
            text: "Bot",
            type: "reply",
            payload: "bot"
  
        },
        {
            text: "Hi",
            type: "reply",
            payload: "hi"
  
        },
        {
            text: "Help",
            type: "reply",
            payload: "help"
  
        }
      ]
    });
  }
    //alternative way to send the messagePost
  //messagePost = {"author":{"type": "business" }, "content": { "type": "text", "text": "Hello again!" }};
  await apiInstance.postMessage(appId, conversationId, messagePost).then(function (data) {
    //console.log('API called successfully. Returned data: ' + data);
  }, function (error) {
    console.error(error);
  });
}

async function passControl(appId, conversationId, body) {
  var apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
  var passControlBody = new SunshineConversationsClient.PassControlBody(); // PassControlBody | 
  passControlBody['switchboardIntegration'] = body;
  apiInstance.passControl(appId, conversationId, passControlBody).then(function (data) {
    //console.log('API called successfully. Returned data: ' + data);
  }, function (error) {
    console.error(error);
  });
}

async function acceptControl(appId, conversationId) {
  var apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
  var acceptControlBody = new SunshineConversationsClient.AcceptControlBody(); // AcceptControlBody | 
  apiInstance.acceptControl(appId, conversationId, acceptControlBody).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
  }, function(error) {
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
      sendMessageUser(appId, conversationId, "Hey there! You can ask me the following and might reply 😆", "actionsNeeded" );
      break;
    case 'agent':
      passControl(appId, conversationId, "next");
      sendMessageUser(appId, conversationId, "Ok let me transfer you to a Zendesk agent.", null);
      break;
    case 'bot':
      sendMessageUser(appId, conversationId, "Yes it's me, I'm only a bot!", null)
      break;
    default:
      sendMessageUser(appId, conversationId, "Sorry I didn't get that. Can you please try to say something else?", null);
  }
}
// exports the variables and functions above so that other modules can use them
module.exports.sendMessageUser = sendMessageUser;
module.exports.passControl = passControl;
module.exports.acceptControl = acceptControl;
module.exports.readUserMessage = readUserMessage;