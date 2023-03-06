import replyToUser from "../models/bot.js";
import ConversationEvent from "../models/Webhook.js";
import PassControlMetadata from "../models/PassControlMetadata.js";

const messageEvents = (req, res, next) => {
  const webhookEvent = new ConversationEvent(req);
  const metadata = new PassControlMetadata(webhookEvent);

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
  if (
    webhookEvent.isConversationMessage() ||
    webhookEvent.isConversationPostback()
  ) {
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
          replyToUser(webhookEvent, metadata);
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`);
        res.status(500).send({ error: 'Something failed!' })
      }
    } else if (
      webhookEvent.isAllowedChannel() &&
      webhookEvent.ifFormMessage(webhookEvent.contentType)
    ) {
      try {
        if (webhookEvent.textFallback) {
          webhookEvent.userMessage = "form response";
          replyToUser(webhookEvent, metadata);
        }
      } catch (err) {
        console.log(`Error in message handler ${err}`);
        res.status(500).send({ error: 'Something failed!' })
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
        replyToUser(webhookEvent, metadata);
        res.end();
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Something failed!' })
      }
      res.end();
    } else {
      res.end();
    }
  } else if (webhookEvent.isConversationRead()) {
    res.sendStatus(200).end();
    return;
  }
};

export default messageEvents;
