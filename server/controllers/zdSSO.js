import pkg from "jsonwebtoken";
const { sign, decode, verify } = pkg;
import { v4 as uuidv4 } from "uuid";

// Multibrand - Using multiple JWT single sign-on URLs
// https://support.zendesk.com/hc/en-us/articles/4408886711066-Multibrand-Using-multiple-JWT-Single-Sign-on-URL-s-Professional-Add-on-and-Enterprise-

const brandURLs = {
  "z3nsuncoswitchboard.zendesk.com":
    "https://romain-sunco.eu.ngrok.io/zendesk/login?name=john&email=john@test.com&role=agent",
  "emeaz3nsuncoswitchboard.zendesk.com":
    "https://romain-sunco.eu.ngrok.io/zendesk/login?name=jojo&email=jojo@test.com&role=end-user",
  "z3nsuncoswitchboardapac.zendesk.com":
    "https://romain-sunco.eu.ngrok.io/zendesk/login?name=michel&email=michel@test.com&role=end-user",
  "amerz3nsuncoswitchboard.zendesk.com":
    "https://romain-sunco.eu.ngrok.io/zendesk/login?name=marc&email=marc@test.com&role=end-user",
};

export const zdJwt = (req, res) => {
  const returnTo = req.query.return_to;
  if (!returnTo) {
    res.send("No return_to query parameter found");
    return;
  }
  for (const [key, value] of Object.entries(brandURLs)) {
    if (returnTo.includes(key)) {
      res.redirect(value);
      return;
    }
  }

  res.send("No matching brand URL found");
};

export const zdLogin = (req, res) => {
  const shared_key = process.env.ZD_SSO_SECRET;
  const { name, email, role } = req.query;

  if (!name || !email) {
    res.send("No name or email query parameter found");
    return;
  }
  const payload = {
    iat: Math.floor(new Date().getTime() / 1000),
    jti: uuidv4(),
    name: name,
    email: email,
    role: role ?? "end-user",
  };
  if (req.get("x-forwarded-host")?.includes("romain-sunco.eu.ngrok.io"))
    return res.redirect(
      `https://z3nsuncoswitchboard.zendesk.com/access/jwt?jwt=${sign(
        payload,
        shared_key,
        {
          algorithm: "HS256",
        }
      )}`
    );
  if (req.headers.referer?.includes("http://localhost"))
    return res.json({
      token: `${sign(payload, shared_key, { algorithm: "HS256" })}`,
    });
  else res.send("Referer/forwarded not allowed");
};
