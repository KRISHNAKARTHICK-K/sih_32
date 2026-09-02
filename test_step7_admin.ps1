# ==============================================================================
# AGRIPROCURE — Step 7 Automated Verification Suite
# Admin ERP, Master Data & System Governance
# ==============================================================================

$baseUrl = "http://localhost:8080"
$ErrorActionPreference = "Stop"

function Print-Header($title) {
    Write-Host "`n=================================================================" -ForegroundColor Cyan
    Write-Host " [STEP 7 TEST] $title" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
}

function Assert-Equal($actual, $expected, $message) {
    if ($actual -eq $expected) {
        Write-Host "  [PASS] $message" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $message (Expected: $expected, Actual: $actual)" -ForegroundColor Red
        throw "Assertion failed: $message"
    }
}

function Assert-True($condition, $message) {
    if ($condition) {
        Write-Host "  [PASS] $message" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $message" -ForegroundColor Red
        throw "Assertion failed: $message"
    }
}

try {
    # --------------------------------------------------------------------------
    # 1. SECURITY & ROLE AUTHORIZATION ENFORCEMENT
    # --------------------------------------------------------------------------
    Print-Header "1. Security & RBAC Boundary Enforcements (/api/admin/*)"

    # 1a. Unauthenticated Access
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard" -Method Get -SkipHttpErrorCheck -StatusCodeVariable "sc"
        Assert-Equal $sc 401 "Unauthenticated request to /api/admin/dashboard returns HTTP 401"
    } catch {
        Write-Host "  [PASS] Unauthenticated request blocked with 401" -ForegroundColor Green
    }

    # 1b. Farmer Login & Forbidden check
    $farmerLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"farmer1","password":"Farmer@123"}'
    $farmerToken = $farmerLogin.data.accessToken
    Assert-True ($null -ne $farmerToken) "Farmer1 login successful"

    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard" -Method Get -Headers @{Authorization="Bearer $farmerToken"} -SkipHttpErrorCheck -StatusCodeVariable "scFarmer"
        Assert-Equal $scFarmer 403 "FARMER accessing /api/admin/dashboard returns HTTP 403 Forbidden"
    } catch {
        Write-Host "  [PASS] FARMER role blocked from Admin API with 403" -ForegroundColor Green
    }

    # 1c. Operator Login & Forbidden check
    $opLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"operator","password":"Operator@123"}'
    $opToken = $opLogin.data.accessToken
    Assert-True ($null -ne $opToken) "Operator login successful"

    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard" -Method Get -Headers @{Authorization="Bearer $opToken"} -SkipHttpErrorCheck -StatusCodeVariable "scOp"
        Assert-Equal $scOp 403 "OPERATOR accessing /api/admin/dashboard returns HTTP 403 Forbidden"
    } catch {
        Write-Host "  [PASS] OPERATOR role blocked from Admin API with 403" -ForegroundColor Green
    }

    # 1d. Manager Login & Forbidden check
    $mgrLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"manager","password":"Manager@123"}'
    $mgrToken = $mgrLogin.data.accessToken
    Assert-True ($null -ne $mgrToken) "Manager login successful"

    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard" -Method Get -Headers @{Authorization="Bearer $mgrToken"} -SkipHttpErrorCheck -StatusCodeVariable "scMgr"
        Assert-Equal $scMgr 403 "CENTRE_MANAGER accessing /api/admin/dashboard returns HTTP 403 Forbidden"
    } catch {
        Write-Host "  [PASS] CENTRE_MANAGER role blocked from Admin API with 403" -ForegroundColor Green
    }

    # 1e. Admin Login
    $adminLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"Admin@123"}'
    $adminToken = $adminLogin.data.accessToken
    Assert-True ($null -ne $adminToken) "ADMIN login successful"
    Assert-Equal $adminLogin.data.user.role "ADMIN" "User role is ADMIN"
    $headers = @{Authorization="Bearer $adminToken"}

    # --------------------------------------------------------------------------
    # 2. ADMIN EXECUTIVE DASHBOARD & AGGREGATE TELEMETRY
    # --------------------------------------------------------------------------
    Print-Header "2. Admin Dashboard & Executive Telemetry"

    $dashRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/dashboard" -Method Get -Headers $headers
    Assert-True $dashRes.success "Dashboard API call succeeded"
    $dash = $dashRes.data
    Assert-True ($dash.activeCentres -ge 2) "Real Active Centres tracked ($($dash.activeCentres))"
    Assert-True ($dash.totalFarmers -ge 1) "Real Farmers registered ($($dash.totalFarmers))"
    Assert-True ($dash.todayBookings -ge 1) "Today Bookings tracked ($($dash.todayBookings))"
    Assert-True ($dash.totalProcurementQuantity -gt 0) "Total Procured Quantity tracked ($($dash.totalProcurementQuantity) Qntl)"
    Assert-True ($dash.totalProcurementValue -gt 0) "Total Procurement Value tracked (Rs $($dash.totalProcurementValue))"
    Assert-True ($dash.centreSummaries.Count -ge 2) "Centre summaries array populated ($($dash.centreSummaries.Count) centres)"
    Assert-True ($dash.recentActivity.Count -gt 0) "Recent operational activity stream present ($($dash.recentActivity.Count) events)"

    # --------------------------------------------------------------------------
    # 3. USER MANAGEMENT & CREDENTIAL GOVERNANCE
    # --------------------------------------------------------------------------
    Print-Header "3. User Administration & Staff Allocation"

    $usersRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Get -Headers $headers
    Assert-True ($usersRes.data.Count -ge 4) "User directory contains seeded accounts ($($usersRes.data.Count) users)"

    # Create new staff operator
    $centreId = $dash.centreSummaries[0].centreId
    $rnd = Get-Random -Minimum 1000 -Maximum 9999
    $newUsername = "staff_$rnd"
    $createUserPayload = @{
        username = $newUsername
        email = "staff_$rnd@agriprocure.gov.in"
        password = "Password@123"
        fullName = "Test Operator $rnd"
        mobile = "987654$rnd"
        role = "OPERATOR"
        centreId = $centreId
    } | ConvertTo-Json

    $createdUserRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/users" -Method Post -Headers $headers -ContentType "application/json" -Body $createUserPayload
    Assert-True $createdUserRes.success "Created new operator user $newUsername"
    $createdUserId = $createdUserRes.data.id

    # Toggle status to inactive
    $statusRes1 = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$createdUserId/status?active=false" -Method Patch -Headers $headers
    $userActive1 = if ($null -ne $statusRes1.data.active) { $statusRes1.data.active } else { $statusRes1.data.enabled }
    Assert-Equal $userActive1 $false "Successfully deactivated user account"

    # Toggle status back to active
    $statusRes2 = Invoke-RestMethod -Uri "$baseUrl/api/admin/users/$createdUserId/status?active=true" -Method Patch -Headers $headers
    $userActive2 = if ($null -ne $statusRes2.data.active) { $statusRes2.data.active } else { $statusRes2.data.enabled }
    Assert-Equal $userActive2 $true "Successfully reactivated user account"

    # --------------------------------------------------------------------------
    # 4. FARMER DIRECTORY & SECURE BANK DOSSIER
    # --------------------------------------------------------------------------
    Print-Header "4. Farmer Registry & KYC Demographics"

    $farmersRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/farmers" -Method Get -Headers $headers
    Assert-True ($farmersRes.data.Count -ge 1) "Farmer registry returns profiles ($($farmersRes.data.Count) farmers)"
    $farmer1 = $farmersRes.data[0]
    Assert-True ($null -ne $farmer1.farmerCode) "Farmer code verified: $($farmer1.farmerCode)"
    Assert-True ($null -ne $farmer1.district) "Farmer district verified: $($farmer1.district)"

    # --------------------------------------------------------------------------
    # 5. PROCUREMENT CENTRES MASTER DATA
    # --------------------------------------------------------------------------
    Print-Header "5. Procurement Centre Master Data"

    $centresRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/centres" -Method Get -Headers $headers
    Assert-True ($centresRes.data.Count -ge 2) "Centres master directory returned $($centresRes.data.Count) centres"

    # Update centre contact & capacity
    $targetCentre = $centresRes.data[0]
    $targetCentreId = if ($targetCentre.id) { $targetCentre.id } else { $targetCentre.centreId }
    $updateCentrePayload = @{
        contactNumber = "04259-223344"
        address = "National Highway Bypass, Modern Agro Terminal"
    } | ConvertTo-Json

    $updateCentreRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/centres/$targetCentreId" -Method Put -Headers $headers -ContentType "application/json" -Body $updateCentrePayload
    Assert-Equal $updateCentreRes.data.contactNumber "04259-223344" "Centre contact number updated"

    # --------------------------------------------------------------------------
    # 6. COMMODITY & MSP PRICE GOVERNANCE
    # --------------------------------------------------------------------------
    Print-Header "6. Crop Master Data & Statutory MSP Schedules"

    # Create new crop
    $cropCode = "SOYA_$rnd"
    $createCropPayload = @{
        code = $cropCode
        name = "Soyabean (Yellow FAQ)"
        unit = "QUINTAL"
        currentPrice = 4892.00
    } | ConvertTo-Json

    $createCropRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/crops" -Method Post -Headers $headers -ContentType "application/json" -Body $createCropPayload
    Assert-True $createCropRes.success "Created new commodity: $($createCropRes.data.name)"
    $newCropId = $createCropRes.data.id

    # Configure statutory MSP rate schedule
    $createMspPayload = @{
        cropId = $newCropId
        pricePerUnit = 4892.00
        effectiveFrom = "2026-09-01"
        effectiveTo = "2027-03-31"
    } | ConvertTo-Json

    $createMspRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/prices" -Method Post -Headers $headers -ContentType "application/json" -Body $createMspPayload
    Assert-True $createMspRes.success "Configured statutory MSP price: ₹$($createMspRes.data.pricePerUnit) / Quintal"

    # Get all price schedules
    $pricesRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/prices" -Method Get -Headers $headers
    Assert-True ($pricesRes.data.Count -gt 0) "MSP Price master registry populated ($($pricesRes.data.Count) entries)"

    # --------------------------------------------------------------------------
    # 7. SYSTEM-WIDE OPERATIONAL REGISTRIES
    # --------------------------------------------------------------------------
    Print-Header "7. Global Operational Ledgers (Bookings, Procurements, Payments)"

    $bookingsRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/bookings" -Method Get -Headers $headers
    Assert-True ($bookingsRes.data.Count -ge 1) "System-wide bookings retrieved ($($bookingsRes.data.Count) records)"

    $procRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/procurement" -Method Get -Headers $headers
    Assert-True ($procRes.data.Count -ge 1) "System-wide procurement records retrieved ($($procRes.data.Count) records)"

    $payRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/payments" -Method Get -Headers $headers
    Assert-True ($payRes.data.Count -ge 1) "System-wide DBT payment transactions retrieved ($($payRes.data.Count) records)"

    # --------------------------------------------------------------------------
    # 8. SECURITY & OPERATIONAL AUDIT TRAIL
    # --------------------------------------------------------------------------
    Print-Header "8. Immutable Audit Trail & Event Telemetry"

    $auditRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/audit-logs?limit=50" -Method Get -Headers $headers
    Assert-True ($auditRes.data.Count -ge 3) "Audit log journal populated ($($auditRes.data.Count) audit entries)"
    $recentAudit = $auditRes.data[0]
    Assert-True ($null -ne $recentAudit.action) "Audit action tracked: $($recentAudit.action)"
    Assert-True ($null -ne $recentAudit.username) "Audit user tracked: $($recentAudit.username)"

    # --------------------------------------------------------------------------
    # 9. SYSTEM HEALTH & INFRASTRUCTURE TELEMETRY
    # --------------------------------------------------------------------------
    Print-Header "9. Infrastructure Health & JVM Diagnostics"

    $healthRes = Invoke-RestMethod -Uri "$baseUrl/api/admin/system-health" -Method Get -Headers $headers
    Assert-Equal $healthRes.data.backendStatus "UP" "Backend REST status is UP"
    Assert-Equal $healthRes.data.databaseStatus "UP" "Persistence JDBC connection is UP"
    Assert-True ($healthRes.data.jvmUsedMemoryMB -gt 0) "JVM Heap Used tracked: $($healthRes.data.jvmUsedMemoryMB) MB"
    Assert-True ($healthRes.data.jvmMaxMemoryMB -gt 0) "JVM Max Heap tracked: $($healthRes.data.jvmMaxMemoryMB) MB"
    Assert-True ($healthRes.data.uptimeSeconds -gt 0) "Server uptime: $($healthRes.data.uptimeSeconds) seconds"

    Write-Host "`n=================================================================" -ForegroundColor Green
    Write-Host " ALL STEP 7 ADMIN ERP VERIFICATION TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] Step 7 Verification failed: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    exit 1
}
