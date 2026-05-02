#!/bin/bash
# Smoke test po deploy - sprawdza czy frontend i backend zyja
# Uzycie: ./tests/smoke/post-deploy.sh [FRONTEND_URL] [BACKEND_URL]

FRONTEND_URL="${1:-http://localhost:3000}"
BACKEND_URL="${2:-http://localhost:8000}"

PASS=0
FAIL=0
TOTAL=0

check() {
  local name="$1"
  local result="$2"
  TOTAL=$((TOTAL + 1))
  if [ "$result" -eq 0 ]; then
    PASS=$((PASS + 1))
    echo "  PASS  $name"
  else
    FAIL=$((FAIL + 1))
    echo "  FAIL  $name"
  fi
}

echo "=== SMOKE TEST ==="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""

# 1. Frontend reachable
if curl -sf "$FRONTEND_URL" -o /dev/null 2>/dev/null; then
  check "Frontend reachable" 0
else
  check "Frontend reachable" 1
fi

# 2. Frontend returns HTML
if curl -sf "$FRONTEND_URL" 2>/dev/null | grep -q "AI Treasury Council"; then
  check "Frontend returns valid HTML" 0
else
  check "Frontend returns valid HTML" 1
fi

# 3. Backend health
if curl -sf "$BACKEND_URL/health" 2>/dev/null | grep -q '"status":"ok"'; then
  check "Backend /health returns ok" 0
else
  check "Backend /health returns ok" 1
fi

# 4. Backend debate endpoint
DEBATE_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/debate" \
  -H "Content-Type: application/json" \
  -d '{"text":"Smoke test proposal"}' 2>/dev/null)

if echo "$DEBATE_RESPONSE" | grep -q '"decisions"'; then
  check "POST /api/debate returns decisions" 0
else
  check "POST /api/debate returns decisions" 1
fi

if echo "$DEBATE_RESPONSE" | grep -q '"consensus"'; then
  check "POST /api/debate returns consensus" 0
else
  check "POST /api/debate returns consensus" 1
fi

if echo "$DEBATE_RESPONSE" | grep -q '"vote_id"'; then
  check "POST /api/debate returns vote_id" 0
else
  check "POST /api/debate returns vote_id" 1
fi

# 5. Backend rejects invalid input
INVALID_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/debate" \
  -H "Content-Type: application/json" \
  -d '{"text":""}' 2>/dev/null)

if [ "$INVALID_CODE" = "422" ]; then
  check "POST /api/debate rejects empty text (422)" 0
else
  check "POST /api/debate rejects empty text (422)" 1
fi

# 6. Backend returns request-id header
HEADERS=$(curl -s -D - -o /dev/null -X POST "$BACKEND_URL/api/debate" \
  -H "Content-Type: application/json" \
  -d '{"text":"Header check"}' 2>/dev/null)

if echo "$HEADERS" | grep -qi "x-request-id"; then
  check "Response includes x-request-id header" 0
else
  check "Response includes x-request-id header" 1
fi

echo ""
echo "=== RESULTS ==="
echo "$PASS/$TOTAL passed, $FAIL failed"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "VERDICT: FAIL"
  exit 1
else
  echo "VERDICT: PASS"
  exit 0
fi
