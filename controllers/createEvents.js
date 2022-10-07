const { ConversationCreate } = require("../models/webhook");
const Bot = require("../models/bot");
const PassControlMetadata = require("../models/passControlMetadata");

function createEvents(req, res, next) {

  const webhookCreate = new ConversationCreate(req);

  if (!webhookCreate.isConversationCreate(webhookCreate.webhookEventType)) {
    return next();
  }

  const bot = new Bot(webhookCreate.appId, webhookCreate.conversationId);
  const metadata = new PassControlMetadata(webhookCreate);

  if (
    !webhookCreate.isAuthenticatedRequest(webhookCreate.webhookEventApiKey)
  ) {
    res.sendStatus(401);
    return;
  }

  if (webhookCreate.isCreationReasonStartConversation(
      webhookCreate.creationReason
    ) &&
    webhookCreate.isAllowedChannel(webhookCreate.sourceType)
  ) {
    try {
      bot.replyToUser("start", metadata);
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

module.exports = createEvents;