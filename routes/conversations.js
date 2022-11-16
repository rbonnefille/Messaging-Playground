const logger = require("../utils/logger");
const express = require("express");
const createEvents = require("../controllers/createEvents");
const messageEvents = require("../controllers/messageEvents");
const readEvents = require("../controllers/readEvents");
const router = express.Router();

router.use(logger);

router.post("/", createEvents, messageEvents, readEvents)

router.head("/", (req, res) => {
    return res.sendStatus(200);
});

module.exports = router;