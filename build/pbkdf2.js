"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pbkdf2Sha512 = exports.pbkdf2Sha512Noble = exports.pbkdf2Sha512Crypto = exports.pbkdf2Sha512Subtle = exports.getSubtle = exports.getCryptoModule = void 0;
const utils_1 = require("@cosmjs/utils");
const pbkdf2_1 = require("@noble/hashes/pbkdf2");
const sha512_1 = require("@noble/hashes/sha512");
const crypto = __importStar(require("crypto"));
/**
 * Returns the Node.js crypto module when available and `undefined`
 * otherwise.
 *
 * Detects an unimplemented fallback module from Webpack 5 and returns
 * `undefined` in that case.
 */
async function getCryptoModule() {
    return crypto;
}
exports.getCryptoModule = getCryptoModule;
async function getSubtle() {
    // From Node.js 15 onwards, webcrypto is available in globalThis.
    // In version 15 and 16 this was stored under the webcrypto key.
    // With Node.js 17 it was moved to the same locations where browsers
    // make it available.
    // Loading `require("crypto")` here seems unnecessary since it only
    // causes issues with bundlers and does not increase compatibility.
    var _a, _b, _c;
    // Browsers and Node.js 17+
    let subtle = (_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _a === void 0 ? void 0 : _a.subtle;
    // Node.js 15+
    if (!subtle)
        subtle = (_c = (_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _b === void 0 ? void 0 : _b.webcrypto) === null || _c === void 0 ? void 0 : _c.subtle;
    return subtle;
}
exports.getSubtle = getSubtle;
async function pbkdf2Sha512Subtle(
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
subtle, secret, salt, iterations, keylen) {
    (0, utils_1.assert)(subtle, "Argument subtle is falsy");
    (0, utils_1.assert)(typeof subtle === "object", "Argument subtle is not of type object");
    (0, utils_1.assert)(typeof subtle.importKey === "function", "subtle.importKey is not a function");
    (0, utils_1.assert)(typeof subtle.deriveBits === "function", "subtle.deriveBits is not a function");
    return subtle.importKey("raw", secret, { name: "PBKDF2" }, false, ["deriveBits"]).then((key) => subtle
        .deriveBits({
        name: "PBKDF2",
        salt: salt,
        iterations: iterations,
        hash: { name: "SHA-512" },
    }, key, keylen * 8)
        .then((buffer) => new Uint8Array(buffer)));
}
exports.pbkdf2Sha512Subtle = pbkdf2Sha512Subtle;
async function pbkdf2Sha512Crypto(
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
crypto, secret, salt, iterations, keylen) {
    (0, utils_1.assert)(crypto, "Argument crypto is falsy");
    (0, utils_1.assert)(typeof crypto === "object", "Argument crypto is not of type object");
    (0, utils_1.assert)(typeof crypto.pbkdf2 === "function", "crypto.pbkdf2 is not a function");
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(secret, salt, iterations, keylen, "sha512", (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(Uint8Array.from(result));
            }
        });
    });
}
exports.pbkdf2Sha512Crypto = pbkdf2Sha512Crypto;
async function pbkdf2Sha512Noble(secret, salt, iterations, keylen) {
    return (0, pbkdf2_1.pbkdf2Async)(sha512_1.sha512, secret, salt, { c: iterations, dkLen: keylen });
}
exports.pbkdf2Sha512Noble = pbkdf2Sha512Noble;
/**
 * A pbkdf2 implementation for BIP39. This is not exported at package level and thus a private API.
 */
async function pbkdf2Sha512(secret, salt, iterations, keylen) {
    const subtle = await getSubtle();
    if (subtle) {
        return pbkdf2Sha512Subtle(subtle, secret, salt, iterations, keylen);
    }
    else {
        const crypto = await getCryptoModule();
        if (crypto) {
            return pbkdf2Sha512Crypto(crypto, secret, salt, iterations, keylen);
        }
        else {
            return pbkdf2Sha512Noble(secret, salt, iterations, keylen);
        }
    }
}
exports.pbkdf2Sha512 = pbkdf2Sha512;
//# sourceMappingURL=pbkdf2.js.map