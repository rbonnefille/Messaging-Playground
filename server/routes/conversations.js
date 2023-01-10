import logger  from "../utils/logger.js";
import express from "express";
import conversationEvents from "../controllers/conversationEvents.js";
const router = express.Router();

router.use(logger);

router.head("/", (res) => {
    return res.sendStatus(200);
});

router.post("/", conversationEvents)

export default router;