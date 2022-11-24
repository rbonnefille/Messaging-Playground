const express = require("express");
const router = express.Router();
const { SunCoClient } = require("../utils/suncoApi");

router.get("/", async (req, res) => {
    const sunCo = new SunCoClient();
    const integrations = await sunCo.listWebhooks();
    res.json(integrations)
})

router.get("/sbintegrations", async (req, res) => {
    const sunCo = new SunCoClient();
    const switchboardIntegrations = await sunCo.listSwitchboardIntegrations();
    res.json(switchboardIntegrations)
})

module.exports = router;