/**
 * Persona system prompts - shared library.
 *
 * Cel (Sesja 37, Szymon P0-1 escalation): real ai.system_prompt_hash =
 * keccak256(actualSystemPrompt) zamiast keccak256(label).
 *
 * Approach: SSOT to apps/api/agents/personas.py (Python). Replikacja w TS
 * = drift risk. Zamiast tego: shells out do scripts/dump-persona-prompts.py
 * ktore wypisuje 5 promptow jako JSON. TS parsuje + hashuje.
 *
 * Wymaga: python3 + apps/api/agents/personas.py importable. Skrypt dump robi
 * direct import-as-file wiec zero deps poza stdlib (NIE wymaga anthropic SDK).
 */

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { keccak256, stringToHex, type Hex } from "viem";

const REPO_ROOT = resolve(__dirname, "..", "..");
const DUMP_SCRIPT = resolve(REPO_ROOT, "scripts", "dump-persona-prompts.py");

export type PersonaId =
  | "bull"
  | "bear"
  | "risk"
  | "tech"
  | "sentiment"
  | "adversarial";

export type PersonaPromptMap = Record<PersonaId, string>;

let _promptCache: PersonaPromptMap | null = null;

/**
 * Pobiera 5 (+1 stretch) system promptow jako mapping persona_id -> prompt.
 * Cache per process - dump uruchomiony raz.
 */
export function loadPersonaPrompts(): PersonaPromptMap {
  if (_promptCache) return _promptCache;
  const stdout = execFileSync("python3", [DUMP_SCRIPT], {
    encoding: "utf-8",
    maxBuffer: 1024 * 1024,
  });
  const parsed = JSON.parse(stdout) as PersonaPromptMap;
  for (const id of [
    "bull",
    "bear",
    "risk",
    "tech",
    "sentiment",
  ] as PersonaId[]) {
    if (typeof parsed[id] !== "string" || parsed[id].length === 0) {
      throw new Error(
        `dump-persona-prompts.py returned empty/missing prompt dla persona '${id}'`,
      );
    }
  }
  _promptCache = parsed;
  return parsed;
}

/**
 * Hash jednej persony: keccak256(utf8 bytes systemPrompt). Pelne 32 bajty
 * (0x + 64 hex). NIE truncatujemy - smell test wymaga zeby juror mogl
 * zreplikowac dokladnie ten hash z personas.py.
 */
export function hashPersonaPrompt(persona: PersonaId): Hex {
  const prompts = loadPersonaPrompts();
  const prompt = prompts[persona];
  if (!prompt) {
    throw new Error(`Unknown persona: ${persona}`);
  }
  return keccak256(stringToHex(prompt));
}

/**
 * Wszystkie 5 hashy (production agents). Adversarial pomijamy bo Phase 3 stretch.
 */
export function getAllPromptHashes(): Record<
  Exclude<PersonaId, "adversarial">,
  Hex
> {
  return {
    bull: hashPersonaPrompt("bull"),
    bear: hashPersonaPrompt("bear"),
    risk: hashPersonaPrompt("risk"),
    tech: hashPersonaPrompt("tech"),
    sentiment: hashPersonaPrompt("sentiment"),
  };
}
