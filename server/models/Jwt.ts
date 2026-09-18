import pkg from 'jsonwebtoken';
const { sign } = pkg;

const { USERNAME: keyUsername, PASSWORD: keyPassword } = process.env;

interface JwtBody {
    scope: string;
    external_id: string | undefined;
    name?: string;
    email?: string;
    email_verified?: boolean;
    iat: number;
    exp: number;
}

export default class Jwt {
    external_id: string | undefined;
    name: string | undefined;
    email: string | undefined;
    email_verified: boolean | undefined;
    expiry_time_in_seconds: number;
    defaultExpiry: number;
    nowInSeconds: number;
    expiry: number;
    body: JwtBody;

    constructor(
        external_id: string | undefined,
        name: string | undefined,
        email: string | undefined,
        emailVerified: boolean | undefined
    ) {
        this.external_id = external_id;
        this.name = name;
        this.email = email;
        this.email_verified = emailVerified;
        this.expiry_time_in_seconds = 604800; // 7 days in seconds
        this.defaultExpiry = 604800; // 7 days in seconds
        this.nowInSeconds = Math.floor(Date.now() / 1000);
        this.expiry = this.expiry_time_in_seconds || this.defaultExpiry;
        this.body = {
            scope: 'user',
            external_id: this.external_id,
            ...(this.name && { name: this.name }),
            ...(this.email && { email: this.email }),
            ...(this.email_verified && { email_verified: this.email_verified }),
            iat: this.nowInSeconds,
            exp: this.nowInSeconds + this.expiry,
        };
    }
    signJwt(): string {
        return sign(this.body, keyPassword as string, {
            header: {
                alg: 'HS256',
                typ: 'JWT',
                kid: keyUsername,
            },
        });
    }
}
