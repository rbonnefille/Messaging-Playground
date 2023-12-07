import express from "express";
import zdEvents from "../controllers/zdEvents.js";
import { zdLogin, zdJwt } from "../controllers/zdSSO.js";
const router = express.Router();

router.head("/", (_, res) => {
  return res.sendStatus(200).end();
});

router.get("/webhooks", zdEvents);

// Zendesk SSO Routes
router.get("/jwt", zdJwt);
router.get("/login", zdLogin);
router.get("/logout", (_, res) => {
  res.redirect("https://z3nsuncoswitchboard.zendesk.com/agent");
});

export default router;
