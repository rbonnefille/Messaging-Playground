import express from "express";
const router = express.Router();
import SunCoClient from "../utils/suncoApi.js";

router.get("/", async (_, res) => {
  const sunCo = new SunCoClient();
  const integrations = await sunCo.listIntegrations();
  res.json(integrations);
});

router.get("/sbintegrations", async (_, res) => {
  const sunCo = new SunCoClient();
  const switchboardIntegrations = await sunCo.listSwitchboardIntegrations();
  res.json(switchboardIntegrations);
});

router.get("/switchboards", async (_, res) => {
  const sunCo = new SunCoClient();
  const switchboards = await sunCo.listSwitchboards();
  res.json(switchboards);
});

export default router;
