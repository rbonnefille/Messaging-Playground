import Bot from "../models/bot.js";
import ConversationEvent from "../models/webhook.js";
import PassControlMetadata from "../models/passControlMetadata.js";

const messageEvents = (req, res, next) => {
  const webhookEvent = new ConversationEvent(req);
  const metadata = new PassControlMetadata(webhookEvent);
  const bot = new Bot(webhookEvent.appId, webhookEvent.conversationId);

  if (!webhookEvent.isAuthenticatedRequest(webhookEvent.webhookEventApiKey)) {
    res.sendStatus(401).end();
    return;
  }

  if (
    !webhookEvent.isCurrentSwitchboardIntegration(
      webhookEvent.activeSwitchboardIntegrationId
    )
  ) {
    res.sendStatus(200).end();
    return;
  }
  //Handle events
  if (webhookEvent.isConversationMessage()) {
    if (webhookEvent.isBusinessMessage(webhookEvent.authorType)) {
      res.sendStatus(200).end();
      return;
    }
    if (
      webhookEvent.isTextMessage(webhookEvent.contentType) &&
      webhookEvent.isAllowedChannel()
    ) {
      try {
        if (webhookEvent.userMessage) {
          bot.replyToUser(webhookEvent, metadata);
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`);
        res.status(500).send(err.message);
      }
    } else if (
      webhookEvent.isAllowedChannel() &&
      webhookEvent.ifFormMessage(webhookEvent.contentType)
    ) {
      try {
        if (webhookEvent.textFallback) {
          webhookEvent.userMessage = "form response";
          bot.replyToUser(webhookEvent, metadata);
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`);
        res.status(500).send(err.message);
      }
    }
    res.end();
  } else if (webhookEvent.isConversationCreate()) {
    if (
      webhookEvent.isCreationReasonStartConversation(
        webhookEvent.creationReason
      ) &&
      webhookEvent.isAllowedChannel()
    ) {
      try {
        webhookEvent.userMessage = "start";
        bot.replyToUser(webhookEvent, metadata);
        res.end();
      } catch (error) {
        console.log(error);
        res.status(500).send(err.message);
      }
      res.end();
    } else {
      res.end();
    }
  }
};

export default messageEvents;