import type { Request, Response, NextFunction } from 'express';
import replyToUser from '../models/bot.js';
import ConversationEvent from '../models/webhook.js';
import PassControlMetadata from '../models/passControlMetadata.js';

const messageEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const webhookEvent = new ConversationEvent(req);
    const {
        webhookEventApiKey,
        activeSwitchboardIntegrationId,
        textFallback,
    } = webhookEvent;
    const metadata = new PassControlMetadata(webhookEvent);

    if (!webhookEvent.isAuthenticatedRequest(webhookEventApiKey)) {
        res.sendStatus(401).end();
        return;
    }

    if (
        !webhookEvent.isCurrentSwitchboardIntegration(
            activeSwitchboardIntegrationId
        )
    ) {
        res.sendStatus(200).end();
        return;
    }
    //Handle events
    if (
        webhookEvent.isConversationMessage() ||
        webhookEvent.isConversationPostback()
    ) {
        if (webhookEvent.isBusinessMessage()) {
            res.sendStatus(200).end();
            return;
        }

        if (
            webhookEvent.isTextMessage() &&
            webhookEvent.isAllowedChannel()
        ) {
            try {
                if (webhookEvent.userMessage) {
                    replyToUser(webhookEvent, metadata);
                }
            } catch (err) {
                console.log(`Error in message handler ${err}`);
                res.status(500).send({ error: 'Something failed!' });
            }
        } else if (
            webhookEvent.isAllowedChannel() &&
            webhookEvent.ifFormMessage()
        ) {
            try {
                if (textFallback) {
                    webhookEvent.userMessage = 'form response';
                    replyToUser(webhookEvent, metadata);
                }
            } catch (err) {
                console.log(`Error in message handler ${err}`);
                res.status(500).send({ error: 'Something failed!' });
            }
        } else if (
            webhookEvent.isAllowedChannel() &&
            webhookEvent.isAttachmentMessage()
        ) {
            try {
                webhookEvent.userMessage = 'attachment';
                replyToUser(webhookEvent, metadata);
            } catch (err) {
                console.log(`Error in message handler ${err}`);
                res.status(500).send({ error: 'Something failed!' });
            }
        }
        res.end();
    } else if (webhookEvent.isConversationCreate()) {
        if (
            webhookEvent.isCreationReasonStartConversation() &&
            webhookEvent.isAllowedChannel()
        ) {
            try {
                webhookEvent.userMessage = 'start';
                replyToUser(webhookEvent, metadata);
                res.end();
            } catch (error) {
                console.log(error);
                res.status(500).send({ error: 'Something failed!' });
            }
            res.end();
        } else if (
            webhookEvent.isConversationCreate() &&
            webhookEvent.conversationType === 'sdkGroup'
        ) {
            webhookEvent.userMessage = 'sdkgroup';
            replyToUser(webhookEvent, metadata);
            res.end();
        } else {
            res.end();
        }
    } else if (webhookEvent.isConversationRead()) {
        res.sendStatus(200).end();
        return;
    } else {
        res.sendStatus(200).end();
    }
};

export default messageEvents;
