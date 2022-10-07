const logger = require("../utils/logger");
const express = require("express");
const createEvents = require("../controllers/createEvents");
const messageEvents = require("../controllers/messageEvents");
const readEvents = require("../controllers/readEvents");
const router = express.Router();

router.use(logger);

router.post("/", createEvents, messageEvents, readEvents)

module.exports = router;