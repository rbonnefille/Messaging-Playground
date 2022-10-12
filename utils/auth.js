/* eslint-disable no-undef */
require('dotenv').config();
const jwt = require("jsonwebtoken");

  class Jwt {
    constructor(external_id, name, email) {
      this.external_id = external_id;
      this.name = name;
      this.email = email;
      this.expiry_time_in_seconds = 3600
      this.defaultExpiry = 3600
      this.nowInSeconds = Math.floor(Date.now() / 1000)
      this.expiry = parseInt(this.expiry_time_in_seconds, 10) || this.defaultExpiry
      this.body = {
        scope: 'user',
        external_id: this.external_id,
        name: this.name,
        email: this.email,
        iat: this.nowInSeconds,
        exp: this.nowInSeconds + this.expiry,
      }
    }
    signJwt() {
      return jwt.sign(this.body, process.env.PASSWORD, {
        header: {
          alg: 'HS256',
          typ: 'JWT',
          kid: process.env.USERNAME,
        },
      })
    }
  }

exports.returnToken = (req, res) => {
    if (req.get('origin') === 'https://romain.ngrok.io') {
      const jwt = new Jwt(req.body.external_id, req.body.name, req.body.email);
      jwtToken = jwt.signJwt();
      console.log(`JWT Token generated: ${jwtToken}`);
      res.json({ token: jwtToken });
    } else {
      res.status(403).send('Forbidden');
    }
  }