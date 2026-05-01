#!/bin/bash
# Pre-flight setup dla AI Treasury Council
# Uruchom RAZ na poczatku Phase 0 (Pia 1.05)
# Idempotent - mozna uruchomic ponownie

set -e

echo "==============================="
echo "AI Treasury Council - Setup"
echo "==============================="
echo ""

# 1. Check Node + Python + gh
echo "[1/8] Sprawdz wymagane tools..."
node --version || { echo "FAIL: Brak Node 20+. brew install node"; exit 1; }
python3 --version || { echo "FAIL: Brak Python 3.11+. brew install python@3.11"; exit 1; }
gh --version > /dev/null || { echo "FAIL: Brak gh CLI. brew install gh"; exit 1; }
echo "OK Node + Python + gh dostepne"
echo ""

# 2. Install pnpm
echo "[2/8] pnpm..."
if ! command -v pnpm &> /dev/null; then
  echo "Instaluje pnpm..."
  brew install pnpm
fi
echo "OK pnpm $(pnpm --version)"
echo ""

# 3. Install Foundry
echo "[3/8] Foundry..."
if ! command -v forge &> /dev/null; then
  echo "Instaluje Foundry..."
  curl -L https://foundry.paradigm.xyz | bash
  source ~/.zshenv 2>/dev/null || true
  $HOME/.foundry/bin/foundryup
fi
forge --version | head -1
echo ""

# 4. Install gitleaks + pre-commit
echo "[4/8] Security tools..."
if ! command -v gitleaks &> /dev/null; then
  brew install gitleaks
fi
if ! command -v pre-commit &> /dev/null; then
  brew install pre-commit
fi
echo "OK gitleaks + pre-commit"
echo ""

# 5. Setup pre-commit hooks
echo "[5/8] Pre-commit hooks..."
cd "$(dirname "$0")/.."
pre-commit install
echo "OK pre-commit hooks active"
echo ""

# 6. Create .env if missing
echo "[6/8] .env setup..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "WARN: .env utworzony z .env.example. WYPELNIJ secrets recznie:"
  echo "  - ANTHROPIC_API_KEY (z Anthropic Console)"
  echo "  - BASE_SEPOLIA_RPC_URL (z Alchemy free tier)"
  echo "  - DEPLOYER_PRIVATE_KEY (wygeneruj NOWY: cast wallet new)"
else
  echo "OK .env juz istnieje"
fi
echo ""

# 7. Foundry deps install
echo "[7/8] Foundry contracts deps..."
cd contracts
if [ ! -d "lib/openzeppelin-contracts" ]; then
  forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit
fi
if [ ! -d "lib/forge-std" ]; then
  forge install foundry-rs/forge-std --no-commit
fi
cd ..
echo "OK Foundry deps installed"
echo ""

# 8. GitHub repo settings (jesli mamy gh login)
echo "[8/8] GitHub repo settings..."
if gh auth status >/dev/null 2>&1; then
  REPO="danergXx-xX/ETH-Global"
  echo "Konfiguruje branch protection na main..."
  gh api "repos/$REPO/branches/main/protection" \
    --method PUT \
    --silent \
    --field allow_force_pushes=false \
    --field allow_deletions=false \
    --field required_status_checks=null \
    --field enforce_admins=false \
    --field required_pull_request_reviews=null \
    --field restrictions=null 2>/dev/null || echo "INFO: branch protection setup nie udal sie (moze branch nie istnieje jeszcze)"

  echo "Wlaczam secret scanning..."
  gh api "repos/$REPO" \
    --method PATCH \
    --silent \
    --field "security_and_analysis[secret_scanning][status]=enabled" 2>/dev/null || echo "INFO: secret scanning nie udal sie (wymaga public repo lub GitHub Advanced Security)"
fi
echo ""

echo "==============================="
echo "Setup zakonczony!"
echo "==============================="
echo ""
echo "Nastepne kroki:"
echo "  1. Wypelnij .env z secrets (NIGDY nie commit!)"
echo "  2. cd apps/api && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
echo "  3. cd apps/web && pnpm install (po Aiko scaffolduje Next.js)"
echo "  4. Otworz nowa sesje Claude Code w /Users/danergy/repos/ai-treasury-council/"
echo "  5. Uruchom /build-day-1"
