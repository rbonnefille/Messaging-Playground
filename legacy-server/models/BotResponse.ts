import * as dotenv from 'dotenv';
dotenv.config();

const {
    BOT_NAME: botName,
    BOT_AVATAR_URL: botAvatarUrl,
    DEFAULT_BOT_AVATAR_URL: defaultAvatarUrl,
} = process.env;

const defaultBotName = 'Bugs Bunny';

interface BotAuthor {
    type: 'business';
    subtypes: string[];
    displayName: string;
    avatarUrl: string | undefined;
}

export interface BotResponsePayload {
    conversationId: string | undefined;
    author: BotAuthor;
    message: string | undefined;
    image: string | undefined;
    metadata: Record<string, unknown> | undefined;
}

export default class BotResponse {
    conversationId: string | undefined;
    author: BotAuthor;
    message: string | undefined;
    image: string | undefined;
    metadata: Record<string, unknown> | undefined;

    constructor(conversationId: string | undefined) {
        this.conversationId = conversationId;
        this.author = {
            type: 'business',
            subtypes: ['AI'],
            displayName: botName || defaultBotName,
            avatarUrl: botAvatarUrl || defaultAvatarUrl,
        };
        this.message = undefined;
        this.image = undefined;
        this.metadata = undefined;
    }

    setMessage(message: string): this {
        this.message = message;
        return this;
    }

    setImage(imageUrl: string): this {
        this.image = imageUrl;
        return this;
    }

    setMetadata(metadata: Record<string, unknown>): this {
        this.metadata = metadata;
        return this;
    }

    toPayload(): BotResponsePayload {
        return {
            conversationId: this.conversationId,
            author: this.author,
            message: this.message,
            image: this.image,
            metadata: this.metadata,
        };
    }
}
