import logger  from "../utils/logger.js";
import express from "express";
import createEvents from "../controllers/createEvents.js";
import messageEvents from "../controllers/messageEvents.js";
import readEvents from "../controllers/readEvents.js";
const router = express.Router();

router.use(logger);

router.post("/", createEvents, messageEvents, readEvents)

router.head("/", (req, res) => {
    return res.sendStatus(200);
});

export default router;