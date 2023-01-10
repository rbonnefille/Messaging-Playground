import express from "express";
const router = express.Router();
import SunCoClient from "../utils/suncoApi.js";

router.get("/", async (req, res) => {
    const sunCo = new SunCoClient();
    const integrations = await sunCo.listIntegrations();
    res.json(integrations)
})

router.get("/sbintegrations", async (req, res) => {
    const sunCo = new SunCoClient();
    const switchboardIntegrations = await sunCo.listSwitchboardIntegrations();
    res.json(switchboardIntegrations)
})

export default router;