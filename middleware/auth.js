/* eslint-disable no-undef */
require('dotenv').config();
const jwt = require("jsonwebtoken");

const {
    USERNAME: username,
    PASSWORD: password
  } = process.env;


//Generating SunCo token
function signJwt(external_id, name, email) {
    const expiry_time_in_seconds = 600
    const defaultExpiry = 300
    const nowInSeconds = Math.floor(Date.now() / 1000)
    const expiry = parseInt(expiry_time_in_seconds, 10) || defaultExpiry
  
    const body = {
      scope: 'user',
      external_id: external_id,
      name: name,
      email: email,
      iat: nowInSeconds,
      exp: nowInSeconds + expiry,
    }
    return jwt.sign(body, password, {
      header: {
        alg: 'HS256',
        typ: 'JWT',
        kid: username,
      },
    })
  }

function returnToken(req, res) {
    external_id = req.body.external_id;
    requesterName = req.body.name;
    requesterEmail = req.body.email;
    jwtToken = signJwt(external_id, requesterName, requesterEmail);
    console.log(`JWT Token generated: ${jwtToken}`);
    res.json({ token: jwtToken });
  }

module.exports = { signJwt, returnToken };
