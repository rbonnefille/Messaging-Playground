import fs from "fs";
import ConversationEvent from "../models/webhook.js";


const logger = (req, res, next) => {
  if (req.method === "HEAD"){
    console.info(`${req.originalUrl} - ${req.method} - ${res.statusCode}`);
    return next();
  }
  const webhookEvent = new ConversationEvent(req);
  if (webhookEvent.isConversationMessage() && !webhookEvent.isBusinessMessage()) {
    
    console.log(`${webhookEvent.eventCreatedAt} - UserId: ${webhookEvent.userId} - ConversationId: ${webhookEvent.conversationId} - Message: ${webhookEvent.userMessage} - Channel: ${webhookEvent.sourceType}`);
    var stream = fs.createWriteStream(
      "/Users/rbonnefille/Documents/Testing/SmoochLibs/NodeJSLib/suncoBot/server/logs/logs.log",
      { flags: "a" }
    );
    // stream.write(JSON.stringify(req.body, null, 2) + ",\n");
    stream.write(
      `${webhookEvent.eventCreatedAt} - UserId: ${webhookEvent.userId} - ConversationId: ${webhookEvent.conversationId} - Message: ${webhookEvent.userMessage} - Channel: ${webhookEvent.sourceType}\n`
    );
    stream.on("error", (err) => {
      console.log(`Error in read stream... ${err}`);
    });
    stream.end();
  }
  next();
};

export default logger;