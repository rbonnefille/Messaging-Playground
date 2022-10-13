const Bot = require("../models/bot");
const { ConversationMessage } = require("../models/webhook");
const PassControlMetadata = require("../models/passControlMetadata");

const messageEvents = (req, res, next) => {
   
  const webhookMessage = new ConversationMessage(req);
  const metadata = new PassControlMetadata(webhookMessage);
  const bot = new Bot(webhookMessage.appId, webhookMessage.conversationId);

  if (!webhookMessage.isConversationMessage(webhookMessage.eventType)) {
    return next();
  }

  if (webhookMessage.sourceIntegrationId === "61a78b31aff78000eb72d579") {
    bot.replyToUser("passControl", metadata);
    res.end();
    return;
  }

  if (
    !webhookMessage.isAuthenticatedRequest(webhookMessage.webhookEventApiKey)
  ) {
    res.sendStatus(401).end();
    return;
  }

  if (webhookMessage.isBusinessMessage(webhookMessage.authorType)) {
    res.sendStatus(200).end();
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

  // const metadata = new PassControlMetadata(webhookMessage);
  // const bot = new Bot(webhookMessage.appId, webhookMessage.conversationId);

  if (
    webhookMessage.isTextMessage(webhookMessage.contentType) &&
    webhookMessage.isAllowedChannel(webhookMessage.sourceType)
  ) {
    try {
      if (webhookMessage.payload) {
        bot.replyToUser(webhookMessage.payload.toLowerCase().trim(), metadata);
      } else {
        bot.replyToUser(webhookMessage.userMessage.toLowerCase().trim(), metadata);
      }
    } catch (err) {
      console.log(`Error in message handler ${err}`);
      res.status(500).send(err.message);
    }
  }
  res.end();
  return;
}

module.exports = messageEvents;