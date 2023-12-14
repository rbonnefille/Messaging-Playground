import fs from "fs";
import ConversationEvent from "../models/webhook.js";
import path from "path";

const serverDir = path.join(process.cwd());
const date = new Date().toISOString();

const writeToFile = (event, conversationLogs = true) => {
  let stream;
  if (!fs.existsSync(path.join(serverDir, "./logs"))) {
    fs.mkdirSync(path.join(serverDir, "./logs"));
  }
  if (conversationLogs) {
    if (!fs.existsSync(path.join(serverDir, "./logs/conversations.log"))) {
      fs.writeFileSync(path.join(serverDir, "./logs/conversations.log"), "");
    }
    stream = fs.createWriteStream(
      path.join(serverDir, "./logs/conversations.log"),
      {
        flags: "a",
      }
    );
  } else {
    if (!fs.existsSync(path.join(serverDir, "./logs/events.log"))) {
      fs.writeFileSync(path.join(serverDir, "./logs/events.log"), "");
    }
    stream = fs.createWriteStream(path.join(serverDir, "./logs/events.log"), {
      flags: "a",
    });
  }
  stream.write(event + "\n");
  stream.on("error", (err) => {
    console.log(`Error in read stream... ${err}`);
  });
  stream.end();
};

const logger = (req, res, next) => {
  let event;
  switch (req.method) {
    case "HEAD":
    case "GET":
      console.info(`${req.originalUrl} - ${req.method} - ${res.statusCode}`);
      return next();
    case "POST":
      if (req.originalUrl.includes("/zendesk")) {
        event = `${date} - ${req.originalUrl} - ${req.get("User-Agent")} - ${
          req.method
        } - ${res.statusCode}`;
        console.info(event);
        writeToFile(event, false);
        return next();
      }
      const webhookEvent = new ConversationEvent(req);
      if (
        webhookEvent.isConversationMessage() &&
        !webhookEvent.isBusinessMessage()
      ) {
        event = `${webhookEvent.eventCreatedAt} - UserId: ${webhookEvent.userId} - ConversationId: ${webhookEvent.conversationId} - Message: ${webhookEvent.userMessage} - Channel: ${webhookEvent.sourceType}`;
        console.info(event);
        writeToFile(event, true);
      }
      return next();
    default:
      return next();
  }
};

export default logger;
