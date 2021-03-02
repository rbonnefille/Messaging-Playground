const express = require('express')
const bodyParser = require('body-parser');
var SunshineConversationsClient = require('sunshine-conversations-client');
const app = express()
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');  
const payloads = {};

var defaultClient = SunshineConversationsClient.ApiClient.instance;
var basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = process.env.USERNAME;
basicAuth.password = process.env.PASSWORD;
const integrationId = process.env.INTEGRATION_ID;

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

express()
        .use(bodyParser.json())
        .post('/:id', (req, res) => {
            if (!payloads[req.params.id]) {
                payloads[req.params.id] = [];
            }
            //payloads[req.params.id].push(req.body);
            //console.log(req.body.events[0].payload.message.content.text);
            //var conversationId = req.body.events[0].payload.conversation.id;
            var conversationId = req.body.events;
            console.log(conversationId);
            var appId = req.body.app.id;
            console.log(appId);
            // var userMessage = req.body.events[0].payload.message.content.text.toLowerCase();

            // switch (userMessage) {
            //   case 'hello':
            //   case 'hi':
            //   case 'hey':            
            //     sendMessageUser(appId, conversationId, "Hey there! You can send me 'agent','bot' .. and might reply to you 😆");
            //     break;
            //   case 'agent':
            //     passControl(appId, conversationId, "next");
            //     sendMessageUser(appId, conversationId, "Ok let me transfer you to a Zendesk agent.");
            //     break;
            //   case 'bot':
            //     sendMessageUser(appId, conversationId, "Ok but I am a bot!")
            //     break;
            //}
            res.end();
        })
        .get("/web-messenger", function(req, res) {   
          res.render("webSdk.ejs", {integrationId: integrationId}); 
        })
        .get('/:id', (req, res) => {
          if (payloads[req.params.id]) {
              res.send(payloads[req.params.id].reverse());
              return;
          }
          res.send('No events sent recently to POST https://sunco-switchboard.herokuapp.com/' + req.params.id);
      })
        .listen(process.env.PORT || 7777);