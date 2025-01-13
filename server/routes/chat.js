import * as dotenv from "dotenv";
dotenv.config();
import pkg from "jsonwebtoken";
const { sign, decode } = pkg;
import express from "express";
import { v4 as uuidv4 } from "uuid";
const router = express.Router();

const { CHAT_SHARED_SECRET: chatSharedSecret, CHAT_JWK_ID: chatJwkId } =
  process.env;

router.get("/", async (req, res) => {
  // TODO: validate token and verify JWK: https://developer.zendesk.com/documentation/help_center/help-center-api/secured-requests/#making-third-party-api-requests-with-help-center-jwts
  // const { token, name } = req.body;
  // const {
  //   payload: { email, external_id },
  // } = decode(token, { complete: true });
  // console.log(name, email, external_id);

  const payload = {
    name: "Romain Chat",
    email: "romdb+zendeskchat2@protonmail.com",
    external_id: uuidv4(),
  };

  // const payload = {
  //   name: name,
  //   email: email,
  //   external_id: external_id ?? uuidv4(),
  // };
  console.log(payload);
  const jwt = sign(payload, chatSharedSecret);
  console.log(jwt);
  res.json({ token: jwt });
});

export default router;
