var SunshineConversationsClient = require('sunshine-conversations-client');

var defaultClient = SunshineConversationsClient.ApiClient.instance;
var basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.USERNAME;
basicAuth.password = process.env.PASSWORD;

function sendMessageUser(appId,conversationId, message){
    var apiInstance = new SunshineConversationsClient.MessagesApi();
    var messagePost = new SunshineConversationsClient.MessagePost();
    messagePost['author'] = {"type": "business", "avatarUrl": "https://www.gravatar.com/avatar/00000000000000000000000000000000.png?d=robohash&f=y","displayName": "CrazyBot"};
    messagePost['content'] = { "type":"text","text": message };
    //alternative way to send the messagePost
    //messagePost = {"author":{"type": "business" }, "content": { "type": "text", "text": "Hello again!" }};
    apiInstance.postMessage(appId, conversationId, messagePost).then(function(data) {
      //console.log('API called successfully. Returned data: ' + data);
    }, function(error) {
      console.error(error);
    });
    return;
  }
  
  function passControl(appId, conversationId, body) {
    var apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    var passControlBody = new SunshineConversationsClient.PassControlBody(); // PassControlBody | 
    passControlBody['switchboardIntegration'] = body;
    apiInstance.passControl(appId, conversationId, passControlBody).then(function(data) {
      //console.log('API called successfully. Returned data: ' + data);
    }, function(error) {
      console.error(error);
    });
    return;
  }

  function readUserMessage(userMessage) {
    switch (userMessage) {
      case 'hello':
      case 'hi':
      case 'hey':            
        sendMessageUser(appId, conversationId, "Hey there! You can send me 'agent','bot' .. and might reply to you 😆");
        break;
      case 'agent':
        passControl(appId, conversationId, "next");
        sendMessageUser(appId, conversationId, "Ok let me transfer you to a Zendesk agent.");
        break;
      case 'bot':
        sendMessageUser(appId, conversationId, "Ok but I am a bot!")
        break;
      default:
        sendMessageUser(appId, conversationId, "Sorry I didn't get that. Can you please try to say something else?");
      }
    }

// exports the variables and functions above so that other modules can use them
module.exports.sendMessageUser = sendMessageUser;
module.exports.passControl = passControl;
module.exports.readUserMessage = readUserMessage;