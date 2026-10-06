import axios, { type AxiosInstance } from 'axios';

const timeout = (ms: number) => new Promise((res) => setTimeout(res, ms));

const {
    BASE_URL: baseUrl,
    APP_ID: appId,
    SWITCHBOARD_ID: switchboardId,
    KEY_ID: keyId,
    KEY_SECRET: keySecret,
    BASE_URL: defaultBaseUrl,
    NEXT_SWITCHBOARD_INTEGRATION: nextSwitchboardIntegration,
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
    private readonly appUrl: string;
    private readonly api: AxiosInstance;

    constructor() {
        this.appId = appId;
        this.switchboardId = switchboardId;
        const appBaseUrl = (baseUrl || defaultBaseUrl || '').replace(
            /\/+$/,
            ''
        );
        this.appUrl = `${appBaseUrl}/v2/apps/${encodeURIComponent(this.appId ?? '')}`;
        this.api = axios.create({
            headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
        });
    }

    private apiError(error: unknown): string | number | undefined {
        if (!axios.isAxiosError(error)) return undefined;
        const data = error.response?.data as
            { errors?: Array<{ title?: string }> } | undefined;
        return data?.errors?.[0]?.title || error.response?.status;
    }

    getUserIdOrExternalId(payload: UserIdentifierPayload | string): any {
        if (typeof payload === 'string') {
            return payload;
        }
        if (Object.prototype.hasOwnProperty.call(payload, 'userId')) {
            return payload.userId;
        } else if (Object.prototype.hasOwnProperty.call(payload, 'externalId')) {
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
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}/activity`;
        try {
            const response = await this.api.post(url, {
                author,
                type: 'typing:start',
            });
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async sendMessage(payload: MessagePayload): Promise<any> {
        const { conversationId, author, message, image, metadata } = payload;
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}/messages`;
        await this.postActivity(payload);
        await timeout(300);
        try {
            const response = await this.api.post(url, {
                author,
                content: this.buildMessageContent(message, image, metadata),
            });
            return response.data;
        } catch (error) {
            if (!axios.isAxiosError(error)) return undefined;
            const data = error.response?.data;
            return typeof data === 'string'
                ? data
                : data === undefined
                    ? undefined
                    : JSON.stringify(data);
        }
    }

    async listClients(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const url = `${this.appUrl}/users/${encodeURIComponent(userIdOrExternalId)}/clients`;
        try {
            const response = await this.api.get(url, {
                params: { 'page[size]': 100 },
            });
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async listDevices(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const url = `${this.appUrl}/users/${encodeURIComponent(userIdOrExternalId)}/devices`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async getUser(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const url = `${this.appUrl}/users/${encodeURIComponent(userIdOrExternalId)}`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async getUserByEmailIdentity(payload: { email: string }): Promise<any> {
        const { email: userEmail } = payload;
        const url = `${this.appUrl}/users`;
        try {
            const response = await this.api.get(url, {
                params: { 'filter[identities.email]': userEmail },
            });
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async listParticipants(conversationId: string): Promise<any> {
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId)}/participants`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async updateUser(payload: UserIdentifierPayload | string): Promise<any> {
        const userIdOrExternalId = this.getUserIdOrExternalId(payload);
        const url = `${this.appUrl}/users/${encodeURIComponent(userIdOrExternalId)}`;
        try {
            const response = await this.api.patch(url, {
                metadata: { botDialog: true },
            });
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async getConversation(payload: ConversationPayload | string): Promise<any> {
        const conversationId =
            typeof payload === 'string' ? payload : payload.conversationId;
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async listMessages(payload: ConversationPayload | string): Promise<any> {
        const conversationId =
            typeof payload === 'string' ? payload : payload.conversationId;
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}/messages`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async updateConversation(
        payload: ConversationPayload | string
    ): Promise<any> {
        const conversationId =
            typeof payload === 'string' ? payload : payload.conversationId;
        const displayName = new Date().toLocaleString('en-us', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}`;
        try {
            const response = await this.api.patch(url, { displayName });
            return response.data;
        } catch (error) {
            return this.apiError(error);
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
        const url = `${this.appUrl}/conversations`;
        try {
            const conversations: any[] = [];
            const seenCursors = new Set<string>();
            let afterCursor: string | undefined;
            let page: any;

            do {
                const response = await this.api.get(url, {
                    params: {
                        [`filter[${filter}]`]: userIdOrExternalId,
                        'page[size]': 100,
                        ...(afterCursor ? { 'page[after]': afterCursor } : {}),
                    },
                });
                page = response.data;
                conversations.push(...page.conversations);

                if (page.meta?.hasMore && !page.meta.afterCursor) {
                    throw new Error('Missing conversation pagination cursor');
                }
                afterCursor = page.meta?.hasMore
                    ? page.meta.afterCursor
                    : undefined;
                if (afterCursor) {
                    if (seenCursors.has(afterCursor)) {
                        throw new Error(
                            'Repeated conversation pagination cursor'
                        );
                    }
                    seenCursors.add(afterCursor);
                }
            } while (afterCursor);

            return { ...page, conversations };
        } catch (error) {
            return (
                this.apiError(error) ||
                (error instanceof Error ? error.message : undefined)
            );
        }
    }

    async deleteConversation(conversationId: string): Promise<any> {
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId)}`;
        try {
            const response = await this.api.delete(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async passControl(
        payload: ConversationPayload,
        switchboardIntegration: string | undefined = nextSwitchboardIntegration
    ): Promise<any> {
        const { conversationId, metadata } = payload;
        const passControlBody = { switchboardIntegration, metadata };
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}/passControl`;
        if (metadata) {
            console.log(
                `Switchboard metadata sent ${JSON.stringify(passControlBody, null, 2)}`
            );
        }
        try {
            const response = await this.api.post(
                url,
                passControlBody,
            );
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async offerControl(payload: ConversationPayload): Promise<any> {
        const { conversationId, metadata } = payload;
        const offerControlBody = metadata ? { metadata } : {};
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}/offerControl`;
        if (metadata) {
            console.log(metadata);
        }
        try {
            const response = await this.api.post(url, offerControlBody);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async releaseControl(payload: ConversationPayload): Promise<any> {
        const { conversationId, metadata } = payload;
        const body = metadata ? { metadata } : {};
        const url = `${this.appUrl}/conversations/${encodeURIComponent(conversationId ?? '')}/releaseControl`;

        if (metadata) {
            console.log({ metadata });
        }

        try {
            const response = await this.api.post(url, body);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async listSwitchboards(): Promise<any> {
        const url = `${this.appUrl}/switchboards`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async listSwitchboardIntegrations(): Promise<any> {
        const url = `${this.appUrl}/switchboards/${encodeURIComponent(this.switchboardId ?? '')}/switchboardIntegrations`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async updateSwitchboard(
        enabled = true,
        defaultSwitchboardIntegrationId?: string
    ): Promise<any> {
        const switchboardUpdateBody: {
            enabled: boolean;
            defaultSwitchboardIntegrationId?: string;
        } = { enabled: Boolean(enabled) };
        if (defaultSwitchboardIntegrationId) {
            switchboardUpdateBody.defaultSwitchboardIntegrationId =
                defaultSwitchboardIntegrationId;
        }
        const url = `${this.appUrl}/switchboards/${encodeURIComponent(this.switchboardId ?? '')}`;
        try {
            const response = await this.api.patch(url, switchboardUpdateBody);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async updateSwitchboardIntegration(
        payload: SwitchboardIntegrationUpdatePayload
    ): Promise<any> {
        const {
            switchboardIntegrationId,
            nextSwitchboardIntegrationId,
            deliverStandbyEvents,
            messageHistoryCount,
        } = payload;
        const switchboardIntegrationUpdateBody = {
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
        const url = `${this.appUrl}/switchboards/${encodeURIComponent(this.switchboardId ?? '')}/switchboardIntegrations/${encodeURIComponent(switchboardIntegrationId)}`;
        try {
            const response = await this.api.patch(
                url,
                switchboardIntegrationUpdateBody
            );
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async createSwitchboardIntegration(
        integrationName: string,
        integrationId: string,
        deliverStandbyEvents: boolean,
        nextSwitchboardIntegrationId: string,
        messageHistoryCount = 10
    ): Promise<any> {
        const switchboardIntegrationCreateBody = {
            name: integrationName,
            integrationId,
            deliverStandbyEvents,
            nextSwitchboardIntegrationId,
            messageHistoryCount,
        };
        const url = `${this.appUrl}/switchboards/${encodeURIComponent(this.switchboardId ?? '')}/switchboardIntegrations`;
        try {
            const response = await this.api.post(
                url,
                switchboardIntegrationCreateBody
            );
            return response.data;
        } catch (error) {
            const title = this.apiError(error);
            console.log(title);
            return { error: title };
        }
    }

    async listIntegrations(): Promise<any> {
        const url = `${this.appUrl}/integrations`;
        try {
            const response = await this.api.get(url);
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async updateIntegration(
        integrationId: string,
        bodyParams: Record<string, unknown>
    ): Promise<any> {
        const url = `${this.appUrl}/integrations/${encodeURIComponent(integrationId)}`;
        try {
            const response = await this.api.patch(url, bodyParams);
            return response.data;
        } catch (error) {
            return this.apiError(error) || error;
        }
    }

    async listIntegrationsPerChannelResponder(): Promise<any> {
        const url = `${this.appUrl}/integrations`;
        try {
            const response = await this.api.get(url, {
                params: { 'page[size]': 100 },
            });
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async uploadAttachment(
        source: unknown,
        conversationId: string
    ): Promise<any> {
        const url = `${this.appUrl}/attachments`;
        try {
            const response = await this.api.postForm(
                url,
                { source },
                {
                    params: {
                        access: 'public',
                        for: 'message',
                        conversationId,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return this.apiError(error);
        }
    }

    async createConversation(
        bodyParams: Record<string, unknown>
    ): Promise<string | number | undefined> {
        const { userId, displayName, description, iconUrl, metadata } =
            bodyParams;
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
            activeSwitchboardIntegrationId: process.env.BOT_SWITCHBOARD_INTEGRATION_ID,
        };
        const url = `${this.appUrl}/conversations`;
        try {
            const response = await this.api.post(url, body);
            return response.data.conversation.id;
        } catch (error) {
            return this.apiError(error);
        }
    }
}
export default SunCoClient;
