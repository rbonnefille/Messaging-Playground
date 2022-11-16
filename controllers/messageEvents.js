const Bot = require("../models/bot");
const { ConversationMessage } = require("../models/webhook");
const PassControlMetadata = require("../models/passControlMetadata");

const messageEvents = (req, res, next) => {
  const webhookMessage = new ConversationMessage(req);
  const metadata = new PassControlMetadata(webhookMessage);
  const bot = new Bot(webhookMessage.appId, webhookMessage.conversationId);

  if (
    !webhookMessage.isAuthenticatedRequest(webhookMessage.webhookEventApiKey)
  ) {
    res.sendStatus(401).end();
    return;
  }

  if (
    !webhookMessage.isCurrentSwitchboardIntegration(
      webhookMessage.activeSwitchboardIntegrationId
    )
  ) {
    res.sendStatus(200).end();
    return;
  }

  switch (webhookMessage.eventType) {
    case "conversation:message":
      if (webhookMessage.isBusinessMessage(webhookMessage.authorType)) {
        res.sendStatus(200).end();
        return;
      }
      if (
        webhookMessage.isTextMessage(webhookMessage.contentType) &&
        webhookMessage.isAllowedChannel(webhookMessage.sourceType)
      ) {
        try {
          if (webhookMessage.userMessage) {
            bot.replyToUser(webhookMessage, metadata);
          }
        } catch (err) {
          console.log(`Error in message handler ${err}`);
          res.status(500).send(err.message);
        }
      }
      res.end();
      return;
    case "conversation:postback":
      if (webhookMessage.isAllowedChannel(webhookMessage.sourceType)) {
        try {
          if (webhookMessage.userMessage) {
            bot.replyToUser(webhookMessage, metadata);
          }
        } catch (err) {
          console.log(`Error in message handler ${err}`);
          res.status(500).send(err.message);
        }
      }
      res.end();
      return;
    default:
      return next();
  }
};

module.exports = messageEvents;
