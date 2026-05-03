/**
 * Council Rules content as structured data (NOT raw markdown).
 *
 * Per Mateusz audit: rendering arbitrary markdown to HTML invites XSS
 * (raw HTML injection, javascript: URLs, etc.). We model the content as
 * typed sections and render with plain React text nodes - zero raw HTML
 * insertion anywhere in the render path.
 *
 * If/when DAO admins need to edit rules, the data layer (RulesEditor
 * existing component) handles JSON validation.
 */

export interface RuleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export const COUNCIL_RULES_VERSION = "v0.1 (Wave 1)";

export const COUNCIL_RULES: RuleSection[] = [
  {
    heading: "1. Decision authority",
    paragraphs: [
      "The AI council debates treasury proposals, but it does not execute on its own. Five agents (Bull, Bear, Risk, Tech, Sentiment) cast advisory votes that humans review before any on-chain action.",
    ],
  },
  {
    heading: "2. Hard limits",
    paragraphs: ["Agents must never propose actions that violate these limits:"],
    bullets: [
      "Maximum single transfer: 10% of treasury balance",
      "Blocked protocols and assets specified by DAO admins are off-limits",
      "Multisig threshold (5 of 7) is required for every execution",
      "Required quorum on agent votes is 4 of 5 for FOR consensus",
    ],
  },
  {
    heading: "3. Timelock and reversibility",
    paragraphs: [
      "Approved proposals queue for 48 hours before execution. During this window any signer can cancel. Council Rules can also override and re-debate.",
    ],
  },
  {
    heading: "4. Source attribution",
    paragraphs: [
      "Every agent claim must cite the data source it relies on - CoinGecko, DefiLlama, RSS feeds, or on-chain reads. Unsourced claims are rejected at debate time.",
    ],
  },
  {
    heading: "5. Audit and transparency",
    paragraphs: [
      "Full debate transcripts are archived to 0G Storage with content hash. Anyone can verify. Agent reputation is tracked on the AgentReputation contract on Base Sepolia.",
    ],
  },
  {
    heading: "6. Your role as a council participant",
    paragraphs: [
      "By proceeding, you agree to read agent debates with care, vote in line with these rules, and flag any agent behaviour that appears to violate the limits above.",
    ],
  },
];
