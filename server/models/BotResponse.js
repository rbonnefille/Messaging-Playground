import * as dotenv from 'dotenv';
dotenv.config();

const { BOT_NAME: botName, BOT_AVATAR_URL: botAvatarUrl } = process.env;
const defaultAvatarUrl =
    'https://media.smooch.io/apps/6062e4fb75a38000d2988959/UmpgnbGvXG7vxipmVYt-iZ59/acme.png';
const defaultBotName = 'Bugs Bunny';

export default class BotResponse {
    constructor(conversationId) {
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

    setMessage(message) {
        this.message = message;
        return this;
    }

    setImage(imageUrl) {
        this.image = imageUrl;
        return this;
    }

    setMetadata(metadata) {
        this.metadata = metadata;
        return this;
    }

    toPayload() {
        return {
            conversationId: this.conversationId,
            author: this.author,
            message: this.message,
            image: this.image,
            metadata: this.metadata,
        };
    }
}
