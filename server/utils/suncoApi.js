import * as dotenv from 'dotenv'
dotenv.config()
import SunshineConversationsClient from "sunshine-conversations-client";

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
      messagePost.setContent({ type: "text", text: message , metadata: metadata});
    }
    try {
      return await apiInstance.postMessage(this.appId, conversationId, messagePost);
    } catch (error) {
      throw new Error(e.message);
    }
  }

  async postActivity(payload) {
    const { conversationId, author } = payload;
    const apiInstance = new SunshineConversationsClient.ActivitiesApi()
    const activityPost = {
      author: author,
      type: "typing:start",
    };
    try {
      return await apiInstance.postActivity(this.appId, conversationId, activityPost);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async listClients(payload){
    let userIdOrExternalId;
    Object.hasOwnProperty.call(payload, 'userId') ? userIdOrExternalId = payload.userId : userIdOrExternalId = payload;
    const apiInstance = new SunshineConversationsClient.ClientsApi();
    try {
      return await apiInstance.listClients(this.appId, userIdOrExternalId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async getUser(payload) {
    let userIdOrExternalId;
    Object.hasOwnProperty.call(payload, 'userId') ? userIdOrExternalId = payload.userId : userIdOrExternalId = payload;
    const apiInstance = new SunshineConversationsClient.UsersApi();
    try {
      return await apiInstance.getUser(this.appId, userIdOrExternalId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async updateUser(payload) {
    let userIdOrExternalId;
    Object.hasOwnProperty.call(payload, 'userId') ? userIdOrExternalId = payload.userId : userIdOrExternalId = payload;
    const apiInstance = new SunshineConversationsClient.UsersApi();
    const userUpdateBody = new SunshineConversationsClient.UserUpdateBody();
    userUpdateBody.metadata = {
      "botDialog": true
    };
    try {
      return await apiInstance.updateUser(this.appId, userIdOrExternalId, userUpdateBody);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async getConversation(payload) {
    const conversationId = payload.conversationId || payload;
    console.log(conversationId)
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    try {
      return await apiInstance.getConversation(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }
  

  async listMessages(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.MessagesApi();
    try {
      return await apiInstance.listMessages(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async updateConversation(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    const conversationUpdateBody = new SunshineConversationsClient.ConversationUpdateBody();
    conversationUpdateBody.displayName = new Date().toLocaleString('en-us',{day: '2-digit', month:'short', year:'numeric'});
    try {
      return await apiInstance.updateConversation(this.appId, conversationId, conversationUpdateBody);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
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
    try {
      return await apiInstance.listConversations(this.appId, filter);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async deleteConversation(conversationId) {
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    try {
      return await apiInstance.deleteConversation(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async listMessages(conversationId) {
    const apiInstance = new SunshineConversationsClient.MessagesApi();
    try {
      return await apiInstance.listMessages(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
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
    try {
      return await apiInstance.passControl(this.appId, conversationId, passControlBody);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async offerControl(payload) {
    const { conversationId, metadata } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const offerControlBody = new SunshineConversationsClient.OfferControlBody();
    if(metadata) {
      offerControlBody.metadata = metadata;
      console.log(offerControlBody.metadata);
    }
    try {
      return await apiInstance.offerControl(this.appId, conversationId, offerControlBody);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async releaseControl(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const offerControlBody = new SunshineConversationsClient.OfferControlBody();
    if(metadata) {
      offerControlBody.metadata = metadata;
      console.log(offerControlBody.metadata);
    }
    try {
      return await apiInstance.releaseControl(this.appId, conversationId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async listSwitchboards(){
    const apiInstance = new SunshineConversationsClient.SwitchboardsApi();
    try {
      return await apiInstance.listSwitchboards(this.appId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async listSwitchboardIntegrations(){
    const switchboardsPresent = await this.listSwitchboards();
    const switchboardId = switchboardsPresent.switchboards[0].id;
    const apiInstance = new SunshineConversationsClient.SwitchboardIntegrationsApi();
    try {
      return await apiInstance.listSwitchboardIntegrations(this.appId, switchboardId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }

  async listIntegrations(){
    const apiInstance = new SunshineConversationsClient.IntegrationsApi();
    try {
      return await apiInstance.listIntegrations(this.appId);
    } catch (e) {
      // catch error
      throw new Error(e.message)
    }
  }
}

export default SunCoClient