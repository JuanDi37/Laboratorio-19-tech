// Verificador educativo BIP-340. No es una biblioteca auditada para producción.
// Solo trabaja con material público; no firma ni conserva claves privadas.
const P = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
export const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
export const G = {
  x: 0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
  y: 0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n
};
export const mod = (value, modulus = P) => ((value % modulus) + modulus) % modulus;
function pow(base, exponent) {
  let result = 1n;
  while (exponent > 0n) {
    if (exponent & 1n) result = mod(result * base);
    base = mod(base * base); exponent >>= 1n;
  }
  return result;
}
export function add(a, b) {
  if (!a) return b;
  if (!b) return a;
  if (a.x === b.x && a.y !== b.y) return null;
  if (a.x === b.x && a.y === 0n) return null;
  const slope = a.x === b.x ? mod(3n * a.x * a.x * pow(2n * a.y, P - 2n)) : mod((b.y - a.y) * pow(mod(b.x - a.x), P - 2n));
  const x = mod(slope * slope - a.x - b.x);
  return { x, y: mod(slope * (a.x - x) - a.y) };
}
export function multiply(scalar, point = G) {
  let result = null;
  while (scalar > 0n) {
    if (scalar & 1n) result = add(result, point);
    point = add(point, point); scalar >>= 1n;
  }
  return result;
}
function liftX(x) {
  if (x >= P) return null;
  const value = mod(x * x * x + 7n), y = pow(value, (P + 1n) / 4n);
  if (mod(y * y) !== value) return null;
  return {x, y: y & 1n ? P - y : y};
}
export const hex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
export function fromHex(value) {
  if (typeof value !== 'string' || value.length % 2 || !/^[0-9a-f]+$/i.test(value)) throw new Error('Hexadecimal inválido');
  return Uint8Array.from(value.match(/.{2}/g), byte => parseInt(byte, 16));
}
export const int = bytes => BigInt('0x' + hex(bytes));
export const bytes32 = value => fromHex(value.toString(16).padStart(64, '0'));
export const concat = (...arrays) => Uint8Array.from(arrays.flatMap(array => [...array]));
export async function sha256(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto requiere localhost o HTTPS');
  return new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes));
}
export async function taggedHash(tag, bytes) {
  const tagHash = await sha256(new TextEncoder().encode(tag));
  return sha256(concat(tagHash, tagHash, bytes));
}
export async function hashEvent(event) {
  const serialized = JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content]);
  return hex(await sha256(new TextEncoder().encode(serialized)));
}
export async function verifySchnorr(signature, message, publicKey) {
  try {
    if (!/^[0-9a-f]{128}$/i.test(signature) || !/^[0-9a-f]{64}$/i.test(publicKey) || !/^[0-9a-f]{64}$/i.test(message)) return false;
    const sig = fromHex(signature), pubkey = fromHex(publicKey), msg = fromHex(message);
    const r = int(sig.slice(0, 32)), s = int(sig.slice(32));
    const point = liftX(int(pubkey));
    if (!point || r >= P || s >= N) return false;
    const e = int(await taggedHash('BIP0340/challenge', concat(sig.slice(0, 32), pubkey, msg))) % N;
    const R = add(multiply(s), multiply(mod(-e, N), point));
    return R !== null && !(R.y & 1n) && R.x === r;
  } catch { return false; }
}
