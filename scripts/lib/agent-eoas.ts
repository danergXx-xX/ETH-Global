/**
 * Deterministic agent EOA wallets - shared library.
 *
 * Cel (Sesja 37, Szymon P0-2 escalation): zastapienie precompile addresses
 * (0x...01-05) realnymi EOA per agent. Klucze prywatne sa DETERMINISTYCZNE
 * (recoverable z seeda), publiczne addresses commit-safe.
 *
 * Seed: keccak256(toBytes("aitc-${persona}-2026-v1"))
 *   - "aitc"   - project namespace (AI Treasury Council)
 *   - persona  - bull/bear/risk/tech/sentiment
 *   - "2026"   - rok (rotation marker)
 *   - "v1"     - schema version (na wypadek migracji)
 *
 * SECURITY:
 *   - Klucze prywatne NIGDY nie laduja w repo, env vars CI/CD, ani logach
 *   - Skrypty CLI uzywaja tej biblioteki TYLKO do address derivation (publiczne)
 *   - Backend (Railway) potrzebuje kluczy prywatnych - dostarczane jako env
 *     vars BACKEND_AGENT_<PERSONA>_PK; skrypt setup-backend-keys.sh (offline,
 *     uruchamiany przez Dana lokalnie) injektuje je z seeda do Railway secrets
 *
 * Recovery: kazdy z kluczem do tego pliku + znajomoscia seed pattern moze
 * odtworzyc wszystkie 5 kluczy. Patrz scripts/AGENT-EOAS.md.
 */

import { keccak256, toHex, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const PERSONAS = ["bull", "bear", "risk", "tech", "sentiment"] as const;
export type Persona = (typeof PERSONAS)[number];

const SEED_PREFIX = "aitc";
const SEED_YEAR = "2026";
const SEED_VERSION = "v1";

/**
 * Buduje deterministyczny seed string. Public input - bezpieczny do dokumentacji.
 */
export function buildSeed(persona: Persona): string {
  return `${SEED_PREFIX}-${persona}-${SEED_YEAR}-${SEED_VERSION}`;
}

/**
 * Wyprowadza deterministyczny private key z seeda.
 *
 * UWAGA SECURITY: rezultat to RAW PRIVATE KEY. NIGDY:
 *   - nie loguj (console.log, structlog)
 *   - nie commituj
 *   - nie zwracaj poza process scope (return tylko do privateKeyToAccount)
 *
 * Wynik to keccak256(utf8(seed)) -> 32 bajty -> valid secp256k1 priv key
 * (overwhelming probability < curve order n; sprawdzane wewnatrz viem).
 */
export function derivePrivateKey(persona: Persona): Hex {
  const seed = buildSeed(persona);
  return keccak256(toHex(seed));
}

/**
 * Wyprowadza publiczny address z deterministycznego seeda.
 * Bezpieczne do logowania, commitu, dokumentacji.
 */
export function deriveAddress(persona: Persona): Address {
  const pk = derivePrivateKey(persona);
  const account = privateKeyToAccount(pk);
  return account.address;
}

/**
 * Mapping wszystkich 5 person -> deterministic address.
 * Lazy + idempotent - raz policzone w runtime, cache w module scope.
 */
let _addressCache: Record<Persona, Address> | null = null;

export function getAllAgentAddresses(): Record<Persona, Address> {
  if (_addressCache) return _addressCache;
  const out = {} as Record<Persona, Address>;
  for (const p of PERSONAS) {
    out[p] = deriveAddress(p);
  }
  _addressCache = out;
  return out;
}

/**
 * Allow env var override (BACKEND_AGENT_<PERSONA>_ADDR) zeby Dan/Rio mogli
 * podstawic inny address (np. multisig zamiast EOA) bez przebudowy seeda.
 * Nieuzywane domyslnie; zapewnia escape hatch.
 */
export function getAgentAddress(persona: Persona): Address {
  const envKey = `BACKEND_AGENT_${persona.toUpperCase()}_ADDR`;
  const override = process.env[envKey];
  if (override && /^0x[0-9a-fA-F]{40}$/.test(override)) {
    return override as Address;
  }
  return deriveAddress(persona);
}
