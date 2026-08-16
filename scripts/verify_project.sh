#!/usr/bin/env bash
# One-shot local verification for the House Price Prediction project.
# Run this from the repo root: bash scripts/verify_project.sh
#
# It checks, in order:
#   1) backend deps install + pytest passes
#   2) backend server actually boots and /health + /predict respond correctly
#   3) frontend deps install + `npm run build` succeeds
#
# Prints a clear PASS/FAIL summary at the end. If anything fails, copy the
# full terminal output back so it can be fixed.

set -uo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PASS=0
FAIL=0
declare -a RESULTS

check() {
  local name="$1"
  local status="$2"
  if [ "$status" -eq 0 ]; then
    RESULTS+=("✅ PASS - $name")
    PASS=$((PASS + 1))
  else
    RESULTS+=("❌ FAIL - $name")
    FAIL=$((FAIL + 1))
  fi
}

echo "=============================================="
echo " 1) Backend: install deps + run pytest"
echo "=============================================="
cd "$ROOT_DIR/backend"
python3 -m venv .venv_verify >/tmp/verify_venv.log 2>&1
# shellcheck disable=SC1091
source .venv_verify/bin/activate
pip install -q -r requirements.txt >/tmp/verify_pip.log 2>&1
check "pip install -r backend/requirements.txt" $?

pytest -q >/tmp/verify_pytest.log 2>&1
PYTEST_STATUS=$?
cat /tmp/verify_pytest.log
check "pytest (backend/tests/)" $PYTEST_STATUS

echo ""
echo "=============================================="
echo " 2) Backend: boot the real server + hit the API"
echo "=============================================="
if [ ! -f models/house_price.pkl ]; then
  echo "models/house_price.pkl missing — copy it from notebooks/ first."
  check "models/house_price.pkl present" 1
else
  check "models/house_price.pkl present" 0
  [ -f .env ] || cp .env.example .env
  uvicorn app.main:app --port 8123 >/tmp/verify_uvicorn.log 2>&1 &
  UVICORN_PID=$!
  sleep 3

  HEALTH=$(curl -s -o /tmp/verify_health.json -w "%{http_code}" http://localhost:8123/health)
  if [ "$HEALTH" = "200" ] && grep -q '"status":"ok"' /tmp/verify_health.json 2>/dev/null; then
    check "GET /health returns 200 + status ok" 0
  else
    echo "--- /health response ($HEALTH) ---"; cat /tmp/verify_health.json 2>/dev/null
    check "GET /health returns 200 + status ok" 1
  fi

  PREDICT=$(curl -s -o /tmp/verify_predict.json -w "%{http_code}" -X POST http://localhost:8123/predict \
    -H "Content-Type: application/json" \
    -d '{"location":"Wakad","carpet_area_sqft":950,"floor_num":3,"bathroom":2,"balcony":1,"furnishing":"Semi-Furnished","transaction":"Resale","ownership":"Freehold","facing":"East"}')
  if [ "$PREDICT" = "200" ] && grep -q "predicted_price" /tmp/verify_predict.json 2>/dev/null; then
    echo "Sample prediction response:"; cat /tmp/verify_predict.json; echo ""
    check "POST /predict returns a predicted_price" 0
  else
    echo "--- /predict response ($PREDICT) ---"; cat /tmp/verify_predict.json 2>/dev/null
    check "POST /predict returns a predicted_price" 1
  fi

  kill "$UVICORN_PID" >/dev/null 2>&1
fi

deactivate
rm -rf "$ROOT_DIR/backend/.venv_verify"

echo ""
echo "=============================================="
echo " 3) Frontend: install deps + production build"
echo "=============================================="
cd "$ROOT_DIR/frontend"
[ -f .env ] || cp .env.example .env
npm install >/tmp/verify_npm_install.log 2>&1
check "npm install" $?

npm run build >/tmp/verify_npm_build.log 2>&1
BUILD_STATUS=$?
tail -20 /tmp/verify_npm_build.log
check "npm run build" $BUILD_STATUS

echo ""
echo "=============================================="
echo " SUMMARY"
echo "=============================================="
for r in "${RESULTS[@]}"; do echo "$r"; done
echo ""
echo "Passed: $PASS | Failed: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Something failed — copy this whole terminal output and send it back so it can be fixed."
  exit 1
else
  echo ""
  echo "Everything passed. You're ready to: cd frontend && npm run dev  (and backend: uvicorn app.main:app --reload)"
  echo "Take your two README screenshots now (home page + result page after a prediction)."
fi
