import logger  from "../utils/logger.js";
import express from "express";
import conversationEvents from "../controllers/conversationEvents.js";
const router = express.Router();

router.use(logger);

router.post("/", conversationEvents)

router.head("/", (req, res) => {
    return res.sendStatus(200);
});

export default router;