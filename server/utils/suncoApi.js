import * as dotenv from 'dotenv'
dotenv.config()
import SunshineConversationsClient from "sunshine-conversations-client";

const timeout = ms => new Promise(res => setTimeout(res, ms))

class SunCoClient {
  constructor() {
    this.setApiClient();
    this.appId = process.env.APP_ID;
  }
  setApiClient() {
    const defaultClient = SunshineConversationsClient.ApiClient.instance;
    const bearerAuth = defaultClient.authentications["bearerAuth"];
    bearerAuth.accessToken = process.env.SUNCO_JWT;
    defaultClient.basePath = process.env.POD_BASE_URL || process.env.BASE_URL;
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
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async sendMessage(payload) {
    const { conversationId, author, message, image, metadata } = payload;
    await this.postActivity(payload);
    await timeout(300)
    const apiInstance = new SunshineConversationsClient.MessagesApi();
    const messagePost = new SunshineConversationsClient.MessagePost();
    messagePost.setAuthor(author);
    if (image) {
      messagePost.setContent({
        type: "image",
        mediaUrl: image,
        text: message,
      });
    } else {
      messagePost.setContent({ type: "text", text: message, metadata: metadata });
    }
    try {
      return await apiInstance.postMessage(this.appId, conversationId, messagePost);
    } catch (error) {
      this.handleError(error.response?.text);
    }
  }


  async listClients(payload) {
    const userIdOrExternalId = this.getUserIdOrExternalId(payload);
    const apiInstance = new SunshineConversationsClient.ClientsApi();
    try {
      return await apiInstance.listClients(this.appId, userIdOrExternalId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async getUser(payload) {
    const userIdOrExternalId = this.getUserIdOrExternalId(payload);
    const apiInstance = new SunshineConversationsClient.UsersApi();
    try {
      return await apiInstance.getUser(this.appId, userIdOrExternalId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async updateUser(payload) {
    const userIdOrExternalId = this.getUserIdOrExternalId(payload);
    const apiInstance = new SunshineConversationsClient.UsersApi();
    const userUpdateBody = new SunshineConversationsClient.UserUpdateBody();
    userUpdateBody.metadata = {
      "botDialog": true
    };
    try {
      return await apiInstance.updateUser(this.appId, userIdOrExternalId, userUpdateBody);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async getConversation(payload) {
    const conversationId = payload.conversationId || payload;
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    try {
      return await apiInstance.getConversation(this.appId, conversationId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async listMessages(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.MessagesApi();
    try {
      return await apiInstance.listMessages(this.appId, conversationId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async updateConversation(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    const conversationUpdateBody = new SunshineConversationsClient.ConversationUpdateBody();
    conversationUpdateBody.displayName = new Date().toLocaleString('en-us', { day: '2-digit', month: 'short', year: 'numeric' });
    try {
      return await apiInstance.updateConversation(this.appId, conversationId, conversationUpdateBody);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async listConversations(webhookData) {
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    const filter = new SunshineConversationsClient.ConversationListFilter();
    const userIdOrExternalId = this.getUserIdOrExternalId(webhookData);
    if (Object.keys(userIdOrExternalId).length === 24) {
      filter.setUserId(userIdOrExternalId);
    } else {
      filter.setUserExternalId(userIdOrExternalId);
    }
    try {
      return await apiInstance.listConversations(this.appId, filter);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async deleteConversation(conversationId) {
    const apiInstance = new SunshineConversationsClient.ConversationsApi();
    try {
      return await apiInstance.deleteConversation(this.appId, conversationId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async listMessages(conversationId) {
    const apiInstance = new SunshineConversationsClient.MessagesApi();
    try {
      return await apiInstance.listMessages(this.appId, conversationId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async passControl(payload, switchboardIntegration = process.env.NEXT_SWITCHBOARD_INTEGRATION) {
    const { conversationId, metadata } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const passControlBody = new SunshineConversationsClient.PassControlBody();
    passControlBody.switchboardIntegration = switchboardIntegration;
    console.log(switchboardIntegration)
    if (metadata) {
      passControlBody.metadata = metadata;
      console.log(passControlBody.metadata);
    }
    try {
      return await apiInstance.passControl(this.appId, conversationId, passControlBody);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async offerControl(payload) {
    const { conversationId, metadata } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const offerControlBody = new SunshineConversationsClient.OfferControlBody();
    if (metadata) {
      offerControlBody.metadata = metadata;
      console.log(offerControlBody.metadata);
    }
    try {
      return await apiInstance.offerControl(this.appId, conversationId, offerControlBody);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async releaseControl(payload) {
    const { conversationId } = payload;
    const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
    const offerControlBody = new SunshineConversationsClient.OfferControlBody();
    if (metadata) {
      offerControlBody.metadata = metadata;
      console.log(offerControlBody.metadata);
    }
    try {
      return await apiInstance.releaseControl(this.appId, conversationId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async listSwitchboards() {
    const apiInstance = new SunshineConversationsClient.SwitchboardsApi();
    try {
      return await apiInstance.listSwitchboards(this.appId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async listSwitchboardIntegrations() {
    const switchboardsPresent = await this.listSwitchboards();
    const switchboardId = switchboardsPresent.switchboards[0].id;
    const apiInstance = new SunshineConversationsClient.SwitchboardIntegrationsApi();
    try {
      return await apiInstance.listSwitchboardIntegrations(this.appId, switchboardId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  async listIntegrations() {
    const apiInstance = new SunshineConversationsClient.IntegrationsApi();
    try {
      return await apiInstance.listIntegrations(this.appId);
    } catch (error) {
      // catch error
      this.handleError(error)
    }
  }

  handleError(error) {
    throw new Error(`An error occurred while interacting with the Sunshine Conversations API: ${error}`);
  }

  getUserIdOrExternalId(payload) {
    if (payload.hasOwnProperty("userId")) {
      return payload.userId;
    } else if (payload.hasOwnProperty("externalId")) {
      return payload.externalId;
    }
    return payload;
  }
}

export default SunCoClient