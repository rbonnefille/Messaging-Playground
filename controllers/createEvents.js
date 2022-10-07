const { ConversationCreate } = require("../models/webhook");
const Bot = require("../models/bot");
const PassControlMetadata = require("../models/passControlMetadata");

function createEvents(req, res, next) {
  if (req.body.events[0]?.type !== "conversation:create") {
    return next();
  }
    
  const webhookCreate = new ConversationCreate(req);
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