const logger = require("../utils/logger");

const readEvents = (req, res, next) => {
  const eventType = req.body.events[0].type;
  const conversationId = req.body.events[0].payload.conversation.id;
  const userExternalId = req.body.events[0].payload.activity?.author?.user?.externalId;
  const userId = req.body.events[0].payload?.activity?.author?.userId
  
  if (eventType === "conversation:read") {
    console.log(`Message in conversation ${conversationId} was read by ${userExternalId || userId}`);
    res.end();
  } else {
    return next();
  }
}

module.exports = readEvents;