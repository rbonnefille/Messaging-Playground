/* eslint-disable no-undef */
import Jwt from "../models/Jwt.js";

const returnToken = (req, res) => {
  if (
    req.get("origin") === process.env.AUTHORISED_ORIGIN ||
    "http://localhost"
  ) {
    if (Object.keys(req.body).length === 0) {
      res.status(400).send("Bad Request - Body needs to be provided");
      return;
    }
    const { external_id, name, email } = req.body;
    const jwt = new Jwt(external_id, name, email);
    const jwtToken = jwt.signJwt();
    const parts = jwtToken.split(".");
    console.log(
      `----------------------------------------Encoded JWT---------------------------------------- \n`
    );
    console.log(`JWT Token generated: ${jwtToken}`);
    console.log(
      `----------------------------------------Decoded JWT---------------------------------------- \n`
    );
    console.log(JSON.parse(`${Buffer.from(parts[1], "base64").toString()} \n`));
    res.json({ token: jwtToken });
  } else {
    res.status(403).send("Forbidden");
  }
};

export default returnToken;
