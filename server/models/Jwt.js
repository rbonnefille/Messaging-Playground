import * as dotenv from 'dotenv';
dotenv.config();
import pkg from 'jsonwebtoken';
const { sign } = pkg;

const { USERNAME: keyUsername, PASSWORD: keyPassword } = process.env;

export default class Jwt {
    constructor(external_id, name, email, emailVerified, shouldExpire) {
        // expiry is a boolean value, if true then set expiry to 7 days, do not pass it
        this.external_id = external_id;
        this.name = name;
        this.email = email;
        this.email_verified = emailVerified;
        this.expiry_time_in_seconds = 604800; // 7 days in seconds
        this.defaultExpiry = 604800; // 7 days in seconds
        this.nowInSeconds = Math.floor(Date.now() / 1000);
        this.body = Object.assign({
            scope: 'user',
            external_id: this.external_id,
            ...(this.name && { name: this.name }),
            ...(this.email && { email: this.email }),
            ...(this.email_verified && { email_verified: this.email_verified }),
            iat: this.nowInSeconds,
            ...(shouldExpire && {
                exp: this.nowInSeconds + this.expiry_time_in_seconds,
            }),
        });
    }
    signJwt() {
        return sign(this.body, keyPassword, {
            header: {
                alg: 'HS256',
                typ: 'JWT',
                kid: keyUsername,
            },
        });
    }
}
