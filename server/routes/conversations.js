import logger from "../utils/logger.js";
import express from "express";
import conversationEvents from "../controllers/conversationEvents.js";
import SunCoClient from "../utils/suncoApi.js";
const router = express.Router();

router.use(logger);

router.head("/", (res) => {
  return res.sendStatus(200);
});

router.get("/:id", async (req, res) => {
  const conversationId = req.params.id;
  const sunCo = new SunCoClient();
  const conversation = await sunCo.getConversation(conversationId);
  res.json(conversation.conversation);
});

router.get("/:id/messages", async (req, res) => {
  const conversationId = req.params.id;
  const sunCo = new SunCoClient();
  const conversationMessages = await sunCo.listMessages(conversationId);
  res.json(conversationMessages);
});

router.post("/", conversationEvents);

export default router;
