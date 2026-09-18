import axios from 'axios';
import SunshineConversationsClient from 'sunshine-conversations-client';

const timeout = (ms: number) => new Promise((res) => setTimeout(res, ms));

const {
    POD_BASE_URL: podBaseUrl,
    APP_ID: appId,
    SWITCHBOARD_ID: switchboardId,
    SUNCO_JWT: suncoJwt,
    SUNCO_CUSTOM_INTEGRATION_SECRET: suncoCustomIntegrationSecret,
    BASE_URL: defaultBaseUrl,
    NEXT_SWITCHBOARD_INTEGRATION: nextSwitchboardIntegration,
    ULTIMATE_SWITCHBOARD_INTEGRATION: ultimateSwitchboardIntegration,
} = process.env;

interface UserIdentifierPayload {
    userId?: string;
    externalId?: string;
}

interface MessagePayload {
    conversationId?: string;
    author?: unknown;
    message?: string;
    image?: string;
    metadata?: Record<string, unknown>;
}

interface ConversationPayload {
    conversationId?: string;
    metadata?: Record<string, unknown>;
}

interface SwitchboardIntegrationUpdatePayload {
    switchboardIntegrationId: string;
    nextSwitchboardIntegrationId?: string;
    deliverStandbyEvents?: boolean;
    messageHistoryCount?: number;
}

class SunCoClient {
    appId: string | undefined;
    switchboardId: string | undefined;

    constructor() {
        this.setApiClient();
        this.appId = appId;
        this.switchboardId = switchboardId;
    }
    setApiClient(): void {
        const defaultClient = SunshineConversationsClient.ApiClient.instance;
        const bearerAuth = defaultClient.authentications['bearerAuth'];
        bearerAuth.accessToken = suncoJwt;
        defaultClient.basePath = podBaseUrl || defaultBaseUrl;
    }

    getUserIdOrExternalId(payload: UserIdentifierPayload | string): any {
        if (typeof payload === 'string') {
            return payload;
        }
        if (payload.hasOwnProperty('userId')) {
            return payload.userId;
        } else if (payload.hasOwnProperty('externalId')) {
            return payload.externalId;
        }
        return payload;
    }

    buildMessageContent(
        message: string | undefined,
        image: string | undefined,
        metadata: Record<string, unknown> | undefined
    ): Record<string, unknown> {
        if (image) {
            return {
                type: 'image',
                mediaUrl: image,
                text: message,
            };
        }
        return {
            type: 'text',
            text: message,
            metadata,
        };
    }

    async postActivity(payload: MessagePayload): Promise<any> {
        const { conversationId, author } = payload;
        const apiInstance = new SunshineConversationsClient.ActivitiesApi();
        const activityPost = new SunshineConversationsClient.ActivityPost();
        activityPost.author = author;
        activityPost.type = 'typing:start';
        try {
            return await apiInstance.postActivity(
                this.appId,
                conversationId,
                activityPost
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async sendMessage(payload: MessagePayload): Promise<any> {
        const { conversationId, author, message, image, metadata } = payload;
        await this.postActivity(payload);
        await timeout(300);
        const apiInstance = new SunshineConversationsClient.MessagesApi();
        const messagePost = new SunshineConversationsClient.MessagePost();
        messagePost.author = author;
        messagePost.content = this.buildMessageContent(
            message,
            image,
            metadata
        );
        try {
            return await apiInstance.postMessage(
                this.appId,
                conversationId,
                messagePost
            );
        } catch (error) {
            return error.response?.text;
        }
    }

    async listClients(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const apiInstance = new SunshineConversationsClient.ClientsApi();
        const opts = {
            page: new SunshineConversationsClient.Page(),
        };
        opts.page.size = 100;
        try {
            return await apiInstance.listClients(
                this.appId,
                userIdOrExternalId,
                opts
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async listDevices(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const apiInstance = new SunshineConversationsClient.DevicesApi();
        try {
            return await apiInstance.listDevices(
                this.appId,
                userIdOrExternalId
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async getUser(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const url = `${podBaseUrl}/v2/apps/${this.appId}/users/${userIdOrExternalId}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${suncoJwt}`,
                },
            });
            return response.data;
        } catch (error) {
            return (
                error.response?.data?.errors?.[0]?.title ||
                error.response?.status
            );
        }
    }

    async getUserByEmailIdentity(payload: { email: string }): Promise<any> {
        const { email: userEmail } = payload;
        const url = `${podBaseUrl}/v2/apps/${this.appId}/users?filter[identities.email]=${userEmail}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${suncoJwt}`,
                },
            });
            return response.data;
        } catch (error) {
            return (
                error.response?.data?.errors?.[0]?.title ||
                error.response?.status
            );
        }
    }

    async listParticipants(conversationId: string): Promise<any> {
        const apiInstance = new SunshineConversationsClient.ParticipantsApi();
        try {
            return await apiInstance.listParticipants(
                this.appId,
                conversationId
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async updateUser(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const apiInstance = new SunshineConversationsClient.UsersApi();
        const userUpdateBody = new SunshineConversationsClient.UserUpdateBody();
        userUpdateBody.metadata = {
            botDialog: true,
        };
        try {
            return await apiInstance.updateUser(
                this.appId,
                userIdOrExternalId,
                userUpdateBody
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async getConversation(payload: ConversationPayload | string): Promise<any> {
        const conversationId = (payload as any).conversationId || payload;
        const apiInstance = new SunshineConversationsClient.ConversationsApi();
        try {
            return await apiInstance.getConversation(
                this.appId,
                conversationId
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async listMessages(payload: ConversationPayload | string): Promise<any> {
        const conversationId =
            typeof payload === 'string' ? undefined : payload.conversationId;
        const apiInstance = new SunshineConversationsClient.MessagesApi();
        try {
            return await apiInstance.listMessages(this.appId, conversationId);
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async updateConversation(
        payload: ConversationPayload | string
    ): Promise<any> {
        const conversationId =
            typeof payload === 'string' ? undefined : payload.conversationId;
        const apiInstance = new SunshineConversationsClient.ConversationsApi();
        const conversationUpdateBody =
            new SunshineConversationsClient.ConversationUpdateBody();
        conversationUpdateBody.displayName = new Date().toLocaleString(
            'en-us',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }
        );
        try {
            return await apiInstance.updateConversation(
                this.appId,
                conversationId,
                conversationUpdateBody
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async listConversations(
        webhookData: UserIdentifierPayload | string
    ): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(webhookData);
        const filter =
            Object.keys(userIdOrExternalId as any).length === 24
                ? `userId`
                : `userExternalId`;
        const url = `${podBaseUrl}/v2/apps/${this.appId}/conversations?filter[${filter}]=${userIdOrExternalId}&page[size]=100`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${suncoJwt}`,
                },
            });
            return response.data;
        } catch (error) {
            return (
                error.response?.data?.errors?.[0]?.title ||
                error.response?.status
            );
        }
    }

    async deleteConversation(conversationId: string): Promise<any> {
        const apiInstance = new SunshineConversationsClient.ConversationsApi();
        try {
            return await apiInstance.deleteConversation(
                this.appId,
                conversationId
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async passControl(
        payload: ConversationPayload,
        switchboardIntegration: string | undefined = nextSwitchboardIntegration
    ): Promise<any> {
        const defaultClient = SunshineConversationsClient.ApiClient.instance;
        const basicAuth = defaultClient.authentications['basicAuth'];
        basicAuth.username = suncoCustomIntegrationSecret;
        basicAuth.password = suncoCustomIntegrationSecret;
        const { conversationId, metadata } = payload;
        const apiInstance =
            new SunshineConversationsClient.SwitchboardActionsApi();
        const passControlBody =
            new SunshineConversationsClient.PassControlBody();
        passControlBody.switchboardIntegration = switchboardIntegration;
        if (metadata) {
            passControlBody.metadata = metadata;
            console.log(
                `Switchboard metadata sent ${JSON.stringify(passControlBody, null, 2)}`
            );
        }
        try {
            return await apiInstance.passControl(
                this.appId,
                conversationId,
                passControlBody
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async offerControl(payload: ConversationPayload): Promise<any> {
        const { conversationId, metadata } = payload;
        const apiInstance =
            new SunshineConversationsClient.SwitchboardActionsApi();
        const offerControlBody =
            new SunshineConversationsClient.OfferControlBody();
        if (metadata) {
            offerControlBody.metadata = metadata;
            console.log(offerControlBody.metadata);
        }
        try {
            return await apiInstance.offerControl(
                this.appId,
                conversationId,
                offerControlBody
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async releaseControl(payload: ConversationPayload): Promise<any> {
        const { conversationId, metadata } = payload;
        const url = `${podBaseUrl}/v2/apps/${this.appId}/conversations/${conversationId}/releaseControl`;
        const body = metadata ? { metadata } : {};

        if (metadata) {
            console.log({ metadata });
        }

        try {
            const response = await axios.post(url, body, {
                headers: {
                    Authorization: `Bearer ${suncoJwt}`,
                },
            });
            return response.data;
        } catch (error) {
            return (
                error.response?.data?.errors?.[0]?.title ||
                error.response?.status
            );
        }
    }

    async listSwitchboards(): Promise<any> {
        const apiInstance = new SunshineConversationsClient.SwitchboardsApi();
        try {
            return await apiInstance.listSwitchboards(this.appId);
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async listSwitchboardIntegrations(): Promise<any> {
        const apiInstance =
            new SunshineConversationsClient.SwitchboardIntegrationsApi();
        try {
            return await apiInstance.listSwitchboardIntegrations(
                this.appId,
                this.switchboardId
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async updateSwitchboard(
        enabled = true,
        defaultSwitchboardIntegrationId?: string
    ): Promise<any> {
        const apiInstance = new SunshineConversationsClient.SwitchboardsApi();
        let switchboardUpdateBody =
            new SunshineConversationsClient.SwitchboardUpdateBody();

        switchboardUpdateBody.enabled = Boolean(enabled);

        if (defaultSwitchboardIntegrationId) {
            switchboardUpdateBody.defaultSwitchboardIntegrationId =
                defaultSwitchboardIntegrationId;
        }
        try {
            return await apiInstance.updateSwitchboard(
                this.appId,
                this.switchboardId,
                switchboardUpdateBody
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async updateSwitchboardIntegration(
        payload: SwitchboardIntegrationUpdatePayload
    ): Promise<any> {
        let {
            switchboardIntegrationId,
            nextSwitchboardIntegrationId,
            deliverStandbyEvents,
            messageHistoryCount,
        } = payload;
        const apiInstance =
            new SunshineConversationsClient.SwitchboardIntegrationsApi();
        let switchboardIntegrationUpdateBody = {
            nextSwitchboardIntegrationId:
                nextSwitchboardIntegrationId === undefined
                    ? undefined
                    : nextSwitchboardIntegrationId,
            ...(deliverStandbyEvents !== undefined && {
                deliverStandbyEvents: Boolean(deliverStandbyEvents),
            }),
            messageHistoryCount:
                messageHistoryCount == 0
                    ? null
                    : parseInt(messageHistoryCount as unknown as string, 10),
        };
        try {
            return await apiInstance.updateSwitchboardIntegration(
                this.appId,
                this.switchboardId,
                switchboardIntegrationId,
                switchboardIntegrationUpdateBody
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async createSwitchboardIntegration(
        integrationName: string,
        integrationId: string,
        deliverStandbyEvents: boolean,
        nextSwitchboardIntegrationId: string,
        messageHistoryCount = 10
    ): Promise<any> {
        const apiInstance =
            new SunshineConversationsClient.SwitchboardIntegrationsApi();
        let switchboardIntegrationCreateBody =
            new SunshineConversationsClient.SwitchboardIntegrationCreateBody();
        switchboardIntegrationCreateBody.name = integrationName;
        switchboardIntegrationCreateBody.integrationId = integrationId;
        switchboardIntegrationCreateBody.deliverStandbyEvents =
            deliverStandbyEvents;
        switchboardIntegrationCreateBody.nextSwitchboardIntegrationId =
            nextSwitchboardIntegrationId;
        switchboardIntegrationCreateBody.messageHistoryCount =
            messageHistoryCount;
        try {
            return await apiInstance.createSwitchboardIntegration(
                this.appId,
                this.switchboardId,
                switchboardIntegrationCreateBody
            );
        } catch (error) {
            console.log(error.body?.errors[0]?.title);
            return { error: error.body?.errors[0]?.title };
        }
    }

    async listIntegrations(): Promise<any> {
        const apiInstance = new SunshineConversationsClient.IntegrationsApi();
        try {
            return await apiInstance.listIntegrations(this.appId);
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async updateIntegration(
        integrationId: string,
        bodyParams: Record<string, unknown>
    ): Promise<any> {
        const apiInstance = new SunshineConversationsClient.IntegrationsApi();
        try {
            return await apiInstance.updateIntegration(
                this.appId,
                integrationId,
                bodyParams
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error;
        }
    }

    async listIntegrationsPerChannelResponder(): Promise<any> {
        const listIntegrations = await axios.get(
            `${podBaseUrl}/v2/apps/${appId}/integrations?page[size]=100`,
            {
                headers: {
                    Authorization: `Bearer ${suncoJwt}`,
                },
            }
        );
        try {
            return await listIntegrations.data;
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async uploadAttachment(
        source: unknown,
        conversationId: string
    ): Promise<any> {
        const apiInstance = new SunshineConversationsClient.AttachmentsApi();
        const access = 'public';
        const opts = {
            _for: 'message',
            conversationId: conversationId,
        };
        try {
            return await apiInstance.uploadAttachment(
                this.appId,
                access,
                source,
                opts
            );
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }

    async createConversation(bodyParams: Record<string, unknown>): Promise<JSON> {
        const { userId, displayName, description, iconUrl, metadata } = bodyParams;
        const url = `${podBaseUrl}/v2/apps/${this.appId}/conversations`;
        const body = {
            type: 'personal',
            participants: [
                {
                    userId: userId,
                    subscribeSDKClient: false,
                },
            ],
            displayName: displayName,
            description: description,
            iconUrl: iconUrl,
            metadata: metadata,
            activeSwitchboardIntegrationId: "695d16e34e6b695b790a7832",
        };
        try {
            const response = await axios.post(url, body, {
                headers: {
                    Authorization: `Bearer ${suncoJwt}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.conversation.id;
        } catch (error) {
            return error.body?.errors[0]?.title || error.status;
        }
    }
}
export default SunCoClient;
