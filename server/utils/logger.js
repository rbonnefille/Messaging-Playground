import ConversationEvent from "../models/Webhook.js";
import winston from "winston";
import path from "path";

const serverDir = path.join(process.cwd());

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(serverDir, "./logs/events.log"),
      level: "info",
    }),
  ],
});

const loggerMiddleware = (req, res, next) => {
  let event;
  switch (req.method) {
    case "HEAD":
    case "GET":
      logger.info(`${req.originalUrl} - ${req.method} - ${res.statusCode}`);
      return next();
    case "POST":
      if (req.originalUrl.includes("/zendesk")) {
        event = `${req.originalUrl} - ${req.get("User-Agent")} - ${
          req.method
        } - ${res.statusCode} - Body: ${JSON.stringify(req.body)}`;
        logger.info(event);
        return next();
      }
      const webhookEvent = new ConversationEvent(req);
      if (
        webhookEvent.isConversationMessage() &&
        !webhookEvent.isBusinessMessage()
      ) {
        event = `UserId: ${webhookEvent.userId} - ConversationId: ${webhookEvent.conversationId} - Message: ${webhookEvent.userMessage} - Channel: ${webhookEvent.sourceType}`;
        logger.info(event);
      }
      return next();
    default:
      return next();
  }
};

export default loggerMiddleware;
