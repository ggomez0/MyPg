$ErrorActionPreference = "Stop"

Write-Host "=== Running Unit & Logic Tests ===" -ForegroundColor Cyan
pnpm --filter "@mypg/api" test

Write-Host "=== Verifying Build Integrity ===" -ForegroundColor Cyan
pnpm --filter "@mypg/api" build
pnpm --filter "@mypg/dashboard" build

Write-Host "=== All Tests Passed Successfully ===" -ForegroundColor Green
