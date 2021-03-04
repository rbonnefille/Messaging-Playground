var SunshineConversationsClient = require('sunshine-conversations-client');

var defaultClient = SunshineConversationsClient.ApiClient.instance;
var basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.USERNAME;
basicAuth.password = process.env.PASSWORD;

function sendMessageUser(appId,conversationId, message){
    var apiInstance = new SunshineConversationsClient.MessagesApi();
    var messagePost = new SunshineConversationsClient.MessagePost();
    messagePost['author'] = {"type": "business"};
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

// exports the variables and functions above so that other modules can use them
module.exports.sendMessageUser = sendMessageUser;
module.exports.passControl = passControl;