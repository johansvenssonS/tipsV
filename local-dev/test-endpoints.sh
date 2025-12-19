#!/bin/bash
# Simple endpoint tester for local backend

echo "======================================"
echo "🧪 Testing Backend Endpoints"
echo "======================================"
echo ""

BASE_URL="http://localhost:3001"

echo "1️⃣  Testing server health..."
echo "GET $BASE_URL/"
curl -s "$BASE_URL/" && echo "" || echo "❌ Failed"
echo ""

echo "2️⃣  Testing /kupong endpoint..."
echo "GET $BASE_URL/kupong"
curl -s "$BASE_URL/kupong" | head -c 200 && echo "..." || echo "❌ Failed"
echo ""
echo ""

echo "3️⃣  Testing entries/list with test code..."
echo "GET $BASE_URL/backend/entries/list?code=TESTCODE"
curl -s "$BASE_URL/backend/entries/list?code=TESTCODE" && echo "" || echo "❌ Failed"
echo ""

echo "======================================"
echo "✅ Test complete!"
echo "======================================"
