const Bot = require("../models/bot");
const { ConversationMessage } = require("../models/webhook");
const PassControlMetadata = require("../models/passControlMetadata");

function messageEvents(req, res, next) {
  if (req.body.events[0]?.type !== "conversation:message") {
    return next();
  }

  const webhookMessage = new ConversationMessage(req);

  if (
    !webhookMessage.isAuthenticatedRequest(webhookMessage.webhookEventApiKey)
  ) {
    res.sendStatus(401);
    return;
  }

  if (webhookMessage.isBusinessMessage(webhookMessage.authorType)) {
    res.sendStatus(200);
    res.end();
    return;
  }

  if (
    !webhookMessage.isCurrentSwitchboardIntegration(
      webhookMessage.activeSwitchboardIntegrationId
    )
  ) {
    res.sendStatus(200);
    res.end();
    return;
  }

  const metadata = new PassControlMetadata(webhookMessage);
  const bot = new Bot(webhookMessage.appId, webhookMessage.conversationId);

  if (
    webhookMessage.isTextMessage(webhookMessage.contentType) &&
    webhookMessage.isAllowedChannel(webhookMessage.sourceType)
  ) {
    try {
      if (webhookMessage.payload) {
        bot.replyToUser(webhookMessage.payload.toLowerCase(), metadata);
      } else {
        bot.replyToUser(webhookMessage.userMessage.toLowerCase(), metadata);
      }
    } catch (err) {
      console.log(`Error in message handler ${err}`);
      res.status(500).send(err.message);
    }
  }
  res.end();
}

module.exports = messageEvents;