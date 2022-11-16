require("dotenv").config();
const SunshineConversationsClient = require('sunshine-conversations-client');

const timeout = ms => new Promise(res => setTimeout(res, ms))

class SunCoClient {
  constructor() {
    const defaultClient = SunshineConversationsClient.ApiClient.instance;
    const bearerAuth = defaultClient.authentications["bearerAuth"];
    bearerAuth.accessToken = process.env.SUNCO_JWT;
    defaultClient.basePath = process.env.POD_BASE_URL;
    this.appId = process.env.APP_ID;
  }

  async sendMessage(payload) {
    const { conversationId, author, message, image, metadata } = payload;
    await this.postActivity(payload);
    await timeout(1500)
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
    let response;
    try {
      response = await apiInstance.postMessage(this.appId, conversationId, messagePost);
    } catch (error) {
      throw new Error(e.message);
    }
    return response;
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
    let response;
    try {
      response = await apiInstance.postActivity(this.appId, conversationId, activityPost);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
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
    let response;
    try {
      response = await apiInstance.passControl(this.appId, conversationId, passControlBody);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async offerControl(payload) {
    const { conversationId, metadata } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const offerControlBody = new SunshineConversationsClient.OfferControlBody();
    if(metadata) {
      offerControlBody.metadata = metadata;
      console.log(offerControlBody.metadata);
    }
    let response;
    try {
      response = await apiInstance.offerControl(this.appId, conversationId, offerControlBody);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async releaseControl(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const offerControlBody = new SunshineConversationsClient.OfferControlBody();
    if(metadata) {
      offerControlBody.metadata = metadata;
      console.log(offerControlBody.metadata);
    }
    let response;
    try {
      response = await apiInstance.releaseControl(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
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