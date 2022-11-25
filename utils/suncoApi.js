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

  async listClients(payload){
    let userIdOrExternalId;
    Object.hasOwnProperty.call(payload, 'userId') ? userIdOrExternalId = payload.userId : userIdOrExternalId = payload;
    const apiInstance = new SunshineConversationsClient.ClientsApi();
    let response;
    try {
      response = await apiInstance.listClients(this.appId, userIdOrExternalId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async getUser(payload) {
    let userIdOrExternalId;
    Object.hasOwnProperty.call(payload, 'userId') ? userIdOrExternalId = payload.userId : userIdOrExternalId = payload;
    const apiInstance = new SunshineConversationsClient.UsersApi();
    let response;
    try {
      response = await apiInstance.getUser(this.appId, userIdOrExternalId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async updateUser(payload) {
    let userIdOrExternalId;
    Object.hasOwnProperty.call(payload, 'userId') ? userIdOrExternalId = payload.userId : userIdOrExternalId = payload;
    const apiInstance = new SunshineConversationsClient.UsersApi();
    const userUpdateBody = new SunshineConversationsClient.UserUpdateBody();
    userUpdateBody.metadata = {
      "botDialog": true
    };
    let response;
    try {
      response = await apiInstance.updateUser(this.appId, userIdOrExternalId, userUpdateBody);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async getConversation(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    let response;
    try {
      response = await apiInstance.getConversation(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async updateConversation(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    const conversationUpdateBody = new SunshineConversationsClient.ConversationUpdateBody();
    conversationUpdateBody.displayName = new Date().toLocaleString('en-us',{day: '2-digit', month:'short', year:'numeric'});
    let response;
    try {
      response = await apiInstance.updateConversation(this.appId, conversationId, conversationUpdateBody);
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
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    const filter = new SunshineConversationsClient.ConversationListFilter();
    if (Object.hasOwnProperty.call(webhookData, 'userId')) {
      filter.setUserId(webhookData.userId);
    } else if (Object.keys(webhookData).length === 24) {
        filter.setUserId(webhookData);
    } else {
      filter.setUserExternalId(webhookData);
    }
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

  async listSwitchboards(){
    const apiInstance = new SunshineConversationsClient.SwitchboardsApi();
    let response;
    try {
      response = await apiInstance.listSwitchboards(this.appId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }


  async listSwitchboardIntegrations(){
    const switchboardsPresent = await this.listSwitchboards();
    const switchboardId = switchboardsPresent.switchboards[0].id;
    const apiInstance = new SunshineConversationsClient.SwitchboardIntegrationsApi();
    let response;
    try {
      response = await apiInstance.listSwitchboardIntegrations(this.appId, switchboardId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
    return response;
  }

  async listWebhooks(){
    const apiInstance = new SunshineConversationsClient.IntegrationsApi();
    let response;
    try {
      response = await apiInstance.listIntegrations(this.appId);
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