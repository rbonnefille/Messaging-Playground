const fs = require("fs");
const logger = (req, res, next) => {
  const authorType = req.body.events[0]?.payload?.message?.author?.type || {};
  if (authorType === "user") {
    const conversationId = req.body.events[0].payload.conversation.id;
    const createdAt = req.body.events[0]?.createdAt;
    const userId = req.body.events[0].payload?.message?.author?.userId;
    const message = req.body.events[0]?.payload?.message?.content?.text;
    const channel = req.body.events[0]?.payload?.message?.source?.type;
    console.log(`${createdAt} - UserId: ${userId} - ConversationId: ${conversationId} - Message: ${message} - Channel: ${channel}`);
    var stream = fs.createWriteStream(
      "/Users/rbonnefille/Documents/Testing/SmoochLibs/NodeJSLib/suncoBot/logs/logs.log",
      { flags: "a" }
    );
    // stream.write(JSON.stringify(req.body, null, 2) + ",\n");
    stream.write(
      `${createdAt} - UserId: ${userId} - ConversationId: ${conversationId} - Message: ${message} - Channel: ${channel}\n`
    );
    stream.on("error", (err) => {
      console.log(`Error in read stream... ${err}`);
    });
    stream.end();
  }
  next();
};

module.exports = logger;
