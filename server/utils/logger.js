import fs from "fs";
import ConversationEvent from "../models/webhook.js";

const writeToFile = (webhookEvent) => {
  var stream = fs.createWriteStream(
    "/Users/rbonnefille/Documents/Testing/SmoochLibs/NodeJSLib/suncoBot/server/logs/logs.log",
    { flags: "a" },
  );
  stream.write(
    `${webhookEvent.eventCreatedAt} - UserId: ${webhookEvent.userId} - ConversationId: ${webhookEvent.conversationId} - Message: ${webhookEvent.userMessage} - Channel: ${webhookEvent.sourceType}\n`,
  );
  stream.on("error", (err) => {
    console.log(`Error in read stream... ${err}`);
  });
  stream.end();
};

const logger = (req, res, next) => {
  switch (req.method) {
    case "HEAD":
    case "GET":
      console.info(`${req.originalUrl} - ${req.method} - ${res.statusCode}`);
      return next();
    case "POST":
      const webhookEvent = new ConversationEvent(req);
      if (
        webhookEvent.isConversationMessage() &&
        !webhookEvent.isBusinessMessage()
      ) {
        console.info(
          `${webhookEvent.eventCreatedAt} - UserId: ${webhookEvent.userId} - ConversationId: ${webhookEvent.conversationId} - Message: ${webhookEvent.userMessage} - Channel: ${webhookEvent.sourceType}`,
        );
        writeToFile(webhookEvent);
      }
      return next();
    default:
      return next();
  }
};

export default logger;
