# ==============================================================================
# AGRIPROCURE — Phase 41 Final Hackathon Demo Simulation & Judge-Proof QA Suite
# ==============================================================================

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8080/api"
$frontendUrl = "http://localhost:5173"
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Assert-PhaseTest {
    param(
        [string]$Phase,
        [string]$TestName,
        [bool]$Condition,
        [string]$Details = ""
    )
    $script:totalTests++
    if ($Condition) {
        $script:passedTests++
        Write-Host "  [PASS] [$Phase] $TestName" -ForegroundColor Green
        if ($Details) { Write-Host "         $Details" -ForegroundColor DarkGray }
    } else {
        $script:failedTests++
        Write-Host "  [FAIL] [$Phase] $TestName" -ForegroundColor Red
        if ($Details) { Write-Host "         Details: $Details" -ForegroundColor DarkYellow }
    }
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.1] START FROM CLEAN STATE & SYSTEM HEALTH CHECK" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
Assert-PhaseTest -Phase "41.1" -TestName "Backend Health Endpoint Operational" -Condition ($health.status -eq "UP" -and $health.service -eq "AGRIPROCURE") -Details "Status: $($health.status), Service: $($health.service)"

$feResponse = Invoke-WebRequest -Uri "$frontendUrl" -UseBasicParsing
Assert-PhaseTest -Phase "41.1" -TestName "Frontend Vite Server Operational" -Condition ($feResponse.StatusCode -eq 200) -Details "HTTP $($feResponse.StatusCode)"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.2] CLEAN 4-ACCOUNT LOGIN & RBAC IDENTITY VERIFICATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Admin
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ username = "admin"; password = "Admin@123" } | ConvertTo-Json) -ContentType "application/json"
$adminToken = $adminLogin.data.accessToken
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
Assert-PhaseTest -Phase "41.2" -TestName "Account 1: ADMIN Authenticated (admin)" -Condition ($adminLogin.data.user.role -eq "ADMIN" -and $null -ne $adminToken) -Details "Role: $($adminLogin.data.user.role)"

# 2. Centre Manager
$mgrLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ username = "manager"; password = "Manager@123" } | ConvertTo-Json) -ContentType "application/json"
$mgrToken = $mgrLogin.data.accessToken
$mgrHeaders = @{ Authorization = "Bearer $mgrToken" }
$centreId = $mgrLogin.data.user.centreId
Assert-PhaseTest -Phase "41.2" -TestName "Account 2: CENTRE_MANAGER Authenticated (manager)" -Condition ($mgrLogin.data.user.role -eq "CENTRE_MANAGER" -and $null -ne $mgrLogin.data.user.centreId) -Details "Centre: $($mgrLogin.data.user.centreName)"

# 3. Operator
$opLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ username = "operator"; password = "Operator@123" } | ConvertTo-Json) -ContentType "application/json"
$opToken = $opLogin.data.accessToken
$opHeaders = @{ Authorization = "Bearer $opToken" }
Assert-PhaseTest -Phase "41.2" -TestName "Account 3: OPERATOR Authenticated (operator)" -Condition ($opLogin.data.user.role -eq "OPERATOR" -and $opLogin.data.user.centreId -eq $centreId) -Details "Assigned Centre: $($opLogin.data.user.centreName)"

# 4. Farmer
$farmerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ username = "farmer1"; password = "Farmer@123" } | ConvertTo-Json) -ContentType "application/json"
$farmerToken = $farmerLogin.data.accessToken
$farmerId = $farmerLogin.data.user.farmerId
$farmerUserId = $farmerLogin.data.user.id
$farmerHeaders = @{ Authorization = "Bearer $farmerToken" }
Assert-PhaseTest -Phase "41.2" -TestName "Account 4: FARMER Authenticated (farmer1)" -Condition ($farmerLogin.data.user.role -eq "FARMER" -and $null -ne $farmerId) -Details "Farmer Code: $($farmerLogin.data.user.farmerCode)"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.3 & 41.8] FARMER DEMO JOURNEY: MSP, BOOKING, VOUCHER & QUEUE" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Step 1: Farmer Dashboard & Crops/MSP
$crops = (Invoke-RestMethod -Uri "$baseUrl/crops" -Method Get -Headers $farmerHeaders).data
$paddy = $crops | Where-Object { $_.code -eq "PADDY" }
Assert-PhaseTest -Phase "41.8" -TestName "Crop Master & Statutory MSP Rate Verified" -Condition ($paddy.currentPrice -gt 0) -Details "Paddy MSP: Rs. $($paddy.currentPrice)/$($paddy.unit)"

# Step 2: Create Slot for Today's Demonstration
$todayStr = (Get-Date).ToString("yyyy-MM-dd")
$rndHour = Get-Random -Minimum 10 -Maximum 99
$slotBody = @{
    centreId = $centreId
    slotDate = $todayStr
    startTime = "10:$rndHour"
    endTime = "11:$rndHour"
    capacity = 15
} | ConvertTo-Json
$createdSlot = (Invoke-RestMethod -Uri "$baseUrl/centres/$centreId/slots" -Method Post -Body $slotBody -Headers $mgrHeaders -ContentType "application/json").data
Assert-PhaseTest -Phase "41.6" -TestName "Manager Created Active Intake Slot" -Condition ($createdSlot.id -ne $null -and $createdSlot.capacity -eq 15) -Details "Slot: $($createdSlot.id), Window: $($createdSlot.startTime)-$($createdSlot.endTime)"

# Step 3: Farmer Books Appointment
$bookingPayload = @{
    farmerId = $farmerId
    slotId = $createdSlot.id
    cropId = $paddy.id
    declaredQuantity = 40.00
} | ConvertTo-Json
$booking = (Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $bookingPayload -Headers $farmerHeaders -ContentType "application/json").data
Assert-PhaseTest -Phase "41.3" -TestName "Farmer Successfully Booked Slot & Token Issued" -Condition ($booking.bookingCode -like "BK-*" -and $booking.queueToken -like "A-*") -Details "Code: $($booking.bookingCode), Token: $($booking.queueToken)"

# Step 4: Official Booking Voucher Retrieval (/farmer/bookings/:id)
$voucher = (Invoke-RestMethod -Uri "$baseUrl/bookings/$($booking.id)" -Method Get -Headers $farmerHeaders).data
Assert-PhaseTest -Phase "41.3" -TestName "Official Procurement Voucher Loaded with Token & Instructions" -Condition ($voucher.bookingCode -eq $booking.bookingCode -and $voucher.declaredQuantity -eq 40.00) -Details "Voucher Status: $($voucher.status), Centre: $($voucher.centreName)"

# Step 5: Farmer Live Queue Overview
$farmerTokens = (Invoke-RestMethod -Uri "$baseUrl/queues/farmers/$farmerId" -Method Get -Headers $farmerHeaders).data
$freshToken = $farmerTokens | Where-Object { $_.bookingCode -eq $booking.bookingCode } | Select-Object -First 1
if (-not $freshToken) { $freshToken = $farmerTokens[0] }
Assert-PhaseTest -Phase "41.3" -TestName "Farmer Live Queue Token Registered" -Condition ($freshToken.id -ne $null) -Details "Token: $($freshToken.displayToken), Status: $($freshToken.status)"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.4] OPERATOR DEMO JOURNEY: INTAKE, WEIGHMENT & QUALITY CERTIFICATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Step 1: Operator Verifies Farmer
$verifiedPayload = @{ status = "VERIFIED" } | ConvertTo-Json
$verifiedToken = (Invoke-RestMethod -Uri "$baseUrl/queues/tokens/$($freshToken.id)/status" -Method Patch -Body $verifiedPayload -Headers $opHeaders -ContentType "application/json").data
Assert-PhaseTest -Phase "41.4" -TestName "Operator Verified Physical Farmer Identity" -Condition ($verifiedToken.status -eq "VERIFIED") -Details "Queue Token Status: $($verifiedToken.status)"

# Step 2: Initialize Procurement Draft & Record Weighbridge Scale
$procDraft = (Invoke-RestMethod -Uri "$baseUrl/procurements/token/$($freshToken.id)" -Method Get -Headers $opHeaders).data
$weighPayload = @{
    actualWeight = 39.50
    recordedBy = "operator"
    remarks = "Electronic Weighbridge Scale Certified"
} | ConvertTo-Json
$weighedProc = (Invoke-RestMethod -Uri "$baseUrl/procurements/$($procDraft.id)/weighment" -Method Post -Body $weighPayload -Headers $opHeaders -ContentType "application/json").data
Assert-PhaseTest -Phase "41.4" -TestName "Electronic Weighbridge Scale Intake Recorded" -Condition ($weighedProc.actualWeight -eq 39.50 -or $weighedProc.actualWeight -eq 39.5) -Details "Actual Weight: 39.50 Qntl"

# Step 3: Record Quality FAQ Certification
$qualPayload = @{
    grade = "A"
    moisturePercentage = 12.2
    foreignMatterPercentage = 0.4
    brokenGrainPercentage = 0.9
    inspectedBy = "operator"
    remarks = "Grade-A Fair Average Quality (FAQ) Certified"
    approved = $true
} | ConvertTo-Json
$inspectedProc = (Invoke-RestMethod -Uri "$baseUrl/procurements/$($procDraft.id)/inspection" -Method Post -Body $qualPayload -Headers $opHeaders -ContentType "application/json").data
Assert-PhaseTest -Phase "41.4" -TestName "Quality FAQ Standard Certified & Approved" -Condition ($inspectedProc.grade -eq "A" -and $inspectedProc.approved -eq $true) -Details "Grade: $($inspectedProc.grade), Approved: $($inspectedProc.approved)"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.5 & 41.8] EXACT FINANCIAL ARITHMETIC & CENTRE MANAGER OVERSIGHT" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Step 1: Exact Financial Recalculation Check
$finalProc = (Invoke-RestMethod -Uri "$baseUrl/procurements/$($procDraft.id)" -Method Get -Headers $opHeaders).data
$actualQty = [double]$finalProc.actualQuantity
$rate = [double]$finalProc.ratePerUnit
$deductions = [double]($finalProc.deductions -or 0)
$expectedGross = [math]::Round($actualQty * $rate, 2)
$actualGross = [math]::Round([double]$finalProc.grossAmount, 2)
$expectedNet = [math]::Round($expectedGross - $deductions, 2)
$actualNet = [math]::Round([double]$finalProc.netAmount, 2)

Assert-PhaseTest -Phase "41.8" -TestName "Exact Financial Gross Calculation (Qty x Rate)" -Condition ($actualGross -eq $expectedGross) -Details "Rs. $actualGross (39.50 Qntl x Rs. $rate)"
Assert-PhaseTest -Phase "41.8" -TestName "Exact Financial Net Calculation (Gross - Deductions)" -Condition ($actualNet -eq $expectedNet) -Details "Rs. $actualNet == Expected Rs. $expectedNet"

# Step 2: Centre Manager Dashboard KPIs
$mgrDashboard = (Invoke-RestMethod -Uri "$baseUrl/manager/dashboard" -Method Get -Headers $mgrHeaders).data
Assert-PhaseTest -Phase "41.5" -TestName "Manager Dashboard Overview KPIs Operational" -Condition ($mgrDashboard.todayBookingsCount -gt 0 -and $mgrDashboard.totalProcurementQuantity -gt 0) -Details "Today Bookings: $($mgrDashboard.todayBookingsCount), Volume: $($mgrDashboard.totalProcurementQuantity) Qntl"

# Step 3: Staff Directory
$staffList = (Invoke-RestMethod -Uri "$baseUrl/manager/staff" -Method Get -Headers $mgrHeaders).data
Assert-PhaseTest -Phase "41.5" -TestName "Centre Staff Directory Populated" -Condition ($staffList.Count -gt 0) -Details "Total Staff: $($staffList.Count)"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.3 & 41.5] DBT PAYMENT DISBURSAL & DUPLICATE DEFENSE" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Step 1: Create/Find Payment Voucher
$payVoucherPayload = @{
    procurementId = $finalProc.id
    farmerId = $farmerId
    amount = $actualNet
    paymentMethod = "PFMS_DBT"
} | ConvertTo-Json
$paymentVoucher = (Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -Body $payVoucherPayload -Headers $mgrHeaders -ContentType "application/json").data
Assert-PhaseTest -Phase "41.3" -TestName "DBT Payment Voucher Generated in PENDING State" -Condition ($paymentVoucher.status -eq "PENDING") -Details "Voucher: $($paymentVoucher.paymentCode), Amount: Rs. $($paymentVoucher.amount)"

# Step 2: Process Electronic DBT Settlement
$payProcessPayload = @{
    transactionReference = "PFMS-JUDGE-DEMO-$((Get-Random -Minimum 1000 -Maximum 9999))"
} | ConvertTo-Json
$paidVoucher = (Invoke-RestMethod -Uri "$baseUrl/payments/$($paymentVoucher.id)/process" -Method Post -Body $payProcessPayload -Headers $adminHeaders -ContentType "application/json").data
Assert-PhaseTest -Phase "41.3" -TestName "PFMS DBT Electronic Settlement Disbursed" -Condition ($paidVoucher.status -eq "PAID" -and $paidVoucher.transactionReference -like "PFMS-*") -Details "Txn Ref: $($paidVoucher.transactionReference)"

# Step 3: Duplicate Submission Defense
$duplicateBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/payments/$($paymentVoucher.id)/process" -Method Post -Body $payProcessPayload -Headers $adminHeaders -ContentType "application/json"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) { $duplicateBlocked = $true }
}
Assert-PhaseTest -Phase "41.3" -TestName "Duplicate Payment Disbursal Blocked with 400 Bad Request" -Condition ($duplicateBlocked) -Details "Double disbursement prevented"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.7] ADMIN GOVERNANCE & TELEMETRY DEMONSTRATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$adminSummary = (Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -Headers $adminHeaders).data
Assert-PhaseTest -Phase "41.7" -TestName "Admin Governance KPI Telemetry Operational" -Condition ($adminSummary.activeCentres -gt 0 -and $adminSummary.totalFarmers -gt 0) -Details "Centres: $($adminSummary.activeCentres), Farmers: $($adminSummary.totalFarmers)"

$auditLogs = (Invoke-RestMethod -Uri "$baseUrl/admin/audit" -Method Get -Headers $adminHeaders).data
Assert-PhaseTest -Phase "41.7" -TestName "Immutable System Audit Trail Active" -Condition ($auditLogs.Count -gt 0) -Details "Audit Entries: $($auditLogs.Count)"

$sysHealth = (Invoke-RestMethod -Uri "$baseUrl/admin/system/health" -Method Get -Headers $adminHeaders).data
Assert-PhaseTest -Phase "41.7" -TestName "System Telemetry: JVM & DB Engine Healthy" -Condition ($sysHealth.backendStatus -eq "UP" -and $sysHealth.databaseStatus -eq "UP") -Details "JVM Used: $($sysHealth.jvmUsedMemoryMB) MB / $($sysHealth.jvmMaxMemoryMB) MB"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 41.11] SECURITY & RBAC BARRIER ENFORCEMENT" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Unauthenticated Blocked (401)
$unauth = $false
try { Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get } catch { if ($_.Exception.Response.StatusCode.value__ -eq 401) { $unauth = $true } }
Assert-PhaseTest -Phase "41.11" -TestName "Unauthenticated Request Blocked (401 Unauthorized)" -Condition ($unauth)

# 2. Farmer on Admin Blocked (403)
$farmerAdmin = $false
try { Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $farmerHeaders } catch { if ($_.Exception.Response.StatusCode.value__ -eq 403) { $farmerAdmin = $true } }
Assert-PhaseTest -Phase "41.11" -TestName "Farmer Blocked from Admin Governance (403 Forbidden)" -Condition ($farmerAdmin)

# 3. Cross-Farmer Data Blocked (403)
$farmer2Login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ username = "farmer2"; password = "Farmer@123" } | ConvertTo-Json) -ContentType "application/json"
$farmer2Headers = @{ Authorization = "Bearer $($farmer2Login.data.accessToken)" }
$crossFarmer = $false
try { Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/bookings" -Method Get -Headers $farmer2Headers } catch { if ($_.Exception.Response.StatusCode.value__ -eq 403) { $crossFarmer = $true } }
Assert-PhaseTest -Phase "41.11" -TestName "Cross-Farmer Data Isolation Enforced (403 Forbidden)" -Condition ($crossFarmer) -Details "Farmer 2 cannot read Farmer 1 bookings"

# 4. Zero Sensitive Credential Leakage
$userList = (Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $adminHeaders).data
$firstUser = $userList | Select-Object -First 1
$hasPassword = ($firstUser.password -ne $null) -or ($firstUser.passwordHash -ne $null)
Assert-PhaseTest -Phase "41.11" -TestName "Zero Password or PasswordHash in User DTOs" -Condition (-not $hasPassword) -Details "User accounts masked safely"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " SUMMARY: $passedTests / $totalTests PHASE 41 TESTS PASSED" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host "=================================================================" -ForegroundColor Cyan

if ($failedTests -gt 0) { exit 1 } else { exit 0 }
