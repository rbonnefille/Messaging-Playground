/* eslint-disable no-undef */
import * as dotenv from 'dotenv'
dotenv.config()
import pkg from 'jsonwebtoken';
const { sign } = pkg;

  class Jwt {
    constructor(external_id, name, email) {
      this.external_id = external_id;
      this.name = name;
      this.email = email;
      this.expiry_time_in_seconds = 86400;
      this.defaultExpiry = 86400;
      this.nowInSeconds = Math.floor(Date.now() / 1000);
      this.expiry = parseInt(this.expiry_time_in_seconds, 10) || this.defaultExpiry;
      this.body = Object.assign({
        scope: 'user',
        external_id: this.external_id,
        name: this.name,
        email: this.email,
        email_verified: true,
        iat: this.nowInSeconds,
        // exp: this.nowInSeconds + this.expiry,
      });
    }
    signJwt() {
      return sign(this.body, process.env.PASSWORD, {
        header: {
          alg: 'HS256',
          typ: 'JWT',
          kid: process.env.USERNAME,
        },
      })
    }
  }

const returnToken = (req, res) => {
    if (req.get('origin') === process.env.AUTHORISED_ORIGIN || 'http://localhost:3000') {
      const { external_id, name, email } = req.body;
      const jwt = new Jwt(external_id, name, email);
      const jwtToken = jwt.signJwt();
      const parts = jwtToken.split('.');
      console.log(`----------------------------------------Encoded JWT---------------------------------------- \n`);
      console.log(`JWT Token generated: ${jwtToken}`);
      console.log(`----------------------------------------Decoded JWT---------------------------------------- \n`);
      console.log(`${Buffer.from(parts[1], 'base64').toString()} \n`);
      res.json({ token: jwtToken });
    } else {
      res.status(403).send('Forbidden');
    }
  }

export default returnToken;