require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// if (!ACCESS_SECRET || !REFRESH_SECRET) {
//     throw new Error('JWT_SECRET and JWT_REFRESH_SECRET are not configured');
// }
// if (ACCESS_SECRET === REFRESH_SECRET) {
//     throw new Error('The keys for ACCESS and REFRESH must be different');
// }

if (!ACCESS_SECRET) {
    throw new Error('JWT_SECRET is not configured');
}

const ISSUER = 'taskHub';
const AUDIENCE = 'taskHub-client';
const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';


function signAccessToken(user) {
    return jwt.sign(
        { sub: String(user.id)}, 
        ACCESS_SECRET,
        { 
            algorithm: "HS256",
            expiresIn: ACCESS_TTL, 
            issuer: ISSUER, 
            audience: AUDIENCE 
        }
    );
}

function signRefreshToken(user, jti) {
    return jwt.sign(
        { sub: String(user.id), jti },
        REFRESH_SECRET,
        { 
            algorithm: "HS256",
            expiresIn: REFRESH_TTL, 
            issuer: ISSUER, 
            audience: AUDIENCE 
        }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET, {
        algorithms: ["HS256"],
        issuer: ISSUER,
        audience: AUDIENCE,
    });
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    hashToken,
    ACCESS_TTL_MS: 15 * 60 * 1000,
    REFRESH_TTL_MS: 7 * 24 * 60 * 60 * 1000,
};