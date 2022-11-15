require("dotenv").config();
const SunshineConversationsClient = require('sunshine-conversations-client');

const baseUrl = "https://api.smooch.io/v2/apps/";
const podBaseUrl = "https://z3nsuncoswitchboard.zendesk.com/sc";

const timeout = ms => new Promise(res => setTimeout(res, ms))

class SunCoClient {
  constructor() {
    const defaultClient = SunshineConversationsClient.ApiClient.instance;
    const bearerAuth = defaultClient.authentications["bearerAuth"];
    bearerAuth.accessToken = process.env.SUNCO_JWT;
    defaultClient.basePath = podBaseUrl;
    this.appId = process.env.APP_ID;
  }

  async sendMessage(payload) {
    const { conversationId, author, message, image, metadata } = payload;
    await this.postActivity(payload);
    await timeout(1000)
    const apiInstance = new SunshineConversationsClient.MessagesApi();
    const messagePost = new SunshineConversationsClient.MessagePost();
    messagePost.setAuthor(author);
    if(image){
      messagePost.setContent({
          type: "image",
          mediaUrl: image,
          text: message,
      });
    } else {
      messagePost.setContent({ type: "text", text: message });
    }
    apiInstance.postMessage(this.appId, conversationId, messagePost).then(
      (data) => {
        console.log("API called successfully. Returned data: " + data);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  async postActivity(payload) {
    const { conversationId, author } = payload;
    const apiInstance = new SunshineConversationsClient.ActivitiesApi()
    const activityPost = {
      author: {
      type: author.type,
      displayName: author.botName,
      avatarUrl: author.avatarUrl,
      },
      type: "typing:start",
    };
    apiInstance.postActivity(this.appId, conversationId, activityPost).then((data) => {
      console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    }, (error) => {
      console.error(error);
    });
  }

  async passControl(payload) {
    const { conversationId, metadata } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const passControlBody = new SunshineConversationsClient.PassControlBody();
    passControlBody.switchboardIntegration = process.env.NEXT_SWITCHBOARD_INTEGRATION;
    if(metadata) {
      passControlBody.metadata = metadata;
      console.log(passControlBody.metadata);
    }
    apiInstance.passControl(this.appId, conversationId, passControlBody).then((data) => {
      console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    }, (error) => {
      console.error(error);
    });
  }

  async listConversations(webhookData) {
    const { userId } = webhookData;
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    const filter = new SunshineConversationsClient.ConversationListFilter();
    filter.setUserId(userId);
    let response;
    try {
      response = await apiInstance.listConversations(this.appId, filter);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async deleteConversation(conversationId) {
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    let response;
    try {
      response = await apiInstance.deleteConversation(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }
}

module.exports = {
  SunCoClient
};