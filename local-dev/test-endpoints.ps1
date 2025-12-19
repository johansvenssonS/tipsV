# Endpoint Tester for Backend
# Run this while your backend is running to test endpoints

$BASE_URL = "http://localhost:3001"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🧪 Testing Backend Endpoints" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Testing server health..." -ForegroundColor Yellow
Write-Host "GET $BASE_URL/" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -UseBasicParsing
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "2️⃣  Testing /kupong endpoint..." -ForegroundColor Yellow
Write-Host "GET $BASE_URL/kupong" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/kupong" -UseBasicParsing
    $content = $response.Content
    if ($content.Length -gt 200) {
        Write-Host ($content.Substring(0, 200) + "...") -ForegroundColor Green
    } else {
        Write-Host $content -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "3️⃣  Testing entries/list with test code..." -ForegroundColor Yellow
Write-Host "GET $BASE_URL/backend/entries/list?code=TESTCODE" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/backend/entries/list?code=TESTCODE" -UseBasicParsing
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Test complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
