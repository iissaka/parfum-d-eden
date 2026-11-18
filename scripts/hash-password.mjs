// Génère un hash de mot de passe pour ADMIN_PASSWORD_HASH.
// Usage : npm run hash-password -- "mot-de-passe-de-12-caracteres-minimum"
// Le format doit rester identique à src/lib/auth/password.ts.
import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2];

if (!password || password.length < 12) {
  console.error('Usage : npm run hash-password -- "mot-de-passe-de-12-caracteres-minimum"');
  process.exit(1);
}

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

const salt = randomBytes(16);
const hash = scryptSync(password, salt, KEYLEN, { N, r: R, p: P });

console.log(['scrypt', N, R, P, salt.toString('base64url'), hash.toString('base64url')].join(':'));
