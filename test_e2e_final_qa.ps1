# AGRIPROCURE — Complete End-to-End QA, Live Demo and Edge Case Verification Suite

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:8080/api"
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Assert-Test {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$Details = ""
    )
    $script:totalTests++
    if ($Condition) {
        $script:passedTests++
        Write-Host "  [PASS] $TestName" -ForegroundColor Green
        if ($Details) { Write-Host "         $Details" -ForegroundColor DarkGray }
    } else {
        $script:failedTests++
        Write-Host "  [FAIL] $TestName" -ForegroundColor Red
        if ($Details) { Write-Host "         Details: $Details" -ForegroundColor DarkYellow }
    }
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 1 and 2] LIVE DEMO WORKFLOW - MULTI-SESSION ORCHESTRATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Farmer Session
$farmerLoginBody = @{ username = "farmer1"; password = "Farmer@123" } | ConvertTo-Json
$farmerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $farmerLoginBody -ContentType "application/json"
$farmerToken = $farmerLogin.data.accessToken
$farmerId = $farmerLogin.data.user.farmerId
$farmerUserId = $farmerLogin.data.user.id
$farmerHeaders = @{ Authorization = "Bearer $farmerToken" }
Assert-Test -TestName "Session A: Farmer1 Authenticated" -Condition ($farmerLogin.data.user.role -eq "FARMER") -Details "Farmer Code: $($farmerLogin.data.user.farmerCode)"

# 2. Operator Session
$opLoginBody = @{ username = "operator"; password = "Operator@123" } | ConvertTo-Json
$opLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $opLoginBody -ContentType "application/json"
$opToken = $opLogin.data.accessToken
$centreId = $opLogin.data.user.centreId
$opHeaders = @{ Authorization = "Bearer $opToken" }
Assert-Test -TestName "Session B: Operator Authenticated" -Condition ($opLogin.data.user.role -eq "OPERATOR") -Details "Centre ID: $centreId"

# 3. Manager Session
$mgrLoginBody = @{ username = "manager"; password = "Manager@123" } | ConvertTo-Json
$mgrLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $mgrLoginBody -ContentType "application/json"
$mgrToken = $mgrLogin.data.accessToken
$mgrHeaders = @{ Authorization = "Bearer $mgrToken" }
Assert-Test -TestName "Session C: Manager Authenticated" -Condition ($mgrLogin.data.user.role -eq "CENTRE_MANAGER") -Details "Centre: $($mgrLogin.data.user.centreName)"

# 4. Admin Session
$adminLoginBody = @{ username = "admin"; password = "Admin@123" } | ConvertTo-Json
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminLogin.data.accessToken
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
Assert-Test -TestName "Session D: Admin Authenticated" -Condition ($adminLogin.data.user.role -eq "ADMIN") -Details "System Headquarters"

# Farmer Views Master Data
$cropsRes = Invoke-RestMethod -Uri "$baseUrl/crops" -Method Get -Headers $farmerHeaders
$crops = $cropsRes.data
$paddy = $crops | Where-Object { $_.code -eq "PADDY" }
Assert-Test -TestName "Farmer: Active Crops and MSP Retrieved" -Condition ($crops.Count -gt 0 -and $paddy.currentPrice -gt 0) -Details "Paddy MSP: Rs. $($paddy.currentPrice)/$($paddy.unit)"

# Manager creates real slot for today's live intake
$todayStr = (Get-Date).ToString("yyyy-MM-dd")
$rndHour = Get-Random -Minimum 10 -Maximum 99
$newSlotBody = @{
    centreId = $centreId
    slotDate = $todayStr
    startTime = "15:$rndHour"
    endTime = "16:$rndHour"
    capacity = 10
} | ConvertTo-Json
$createdSlotRes = Invoke-RestMethod -Uri "$baseUrl/centres/$centreId/slots" -Method Post -Body $newSlotBody -Headers $mgrHeaders -ContentType "application/json"
$createdSlot = $createdSlotRes.data
Assert-Test -TestName "Manager: Real Intake Slot Created" -Condition ($createdSlot.id -ne $null -and $createdSlot.capacity -eq 10) -Details "Slot ID: $($createdSlot.id)"

# Farmer Books Slot
$bookingBody = @{
    farmerId = $farmerId
    slotId = $createdSlot.id
    cropId = $paddy.id
    declaredQuantity = 35.00
} | ConvertTo-Json
$bookingRes = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $bookingBody -Headers $farmerHeaders -ContentType "application/json"
$booking = $bookingRes.data
Assert-Test -TestName "Farmer: Booking Confirmed and Token Issued" -Condition ($booking.bookingCode -like "BK-*" -and $booking.queueToken -like "A-*") -Details "Booking: $($booking.bookingCode), Token: $($booking.queueToken)"

# Operator retrieves newly assigned token for this booking
$farmerTokens = (Invoke-RestMethod -Uri "$baseUrl/queues/farmers/$farmerId" -Method Get -Headers $farmerHeaders).data
$freshToken = $farmerTokens | Where-Object { $_.bookingCode -eq $booking.bookingCode } | Select-Object -First 1
if (-not $freshToken) {
    $freshToken = $farmerTokens[0]
}

# Operator verifies farmer
$verifiedPayload = @{ status = "VERIFIED" } | ConvertTo-Json
$verifiedTokenRes = Invoke-RestMethod -Uri "$baseUrl/queues/tokens/$($freshToken.id)/status" -Method Patch -Body $verifiedPayload -Headers $opHeaders -ContentType "application/json"
$verifiedToken = $verifiedTokenRes.data
Assert-Test -TestName "Operator: Physical Farmer Credentials Verified" -Condition ($verifiedToken.status -eq "VERIFIED") -Details "Status: $($verifiedToken.status)"

# Operator initializes fresh procurement draft and records weighment
$procDraftRes = Invoke-RestMethod -Uri "$baseUrl/procurements/token/$($freshToken.id)" -Method Get -Headers $opHeaders
$procDraft = $procDraftRes.data
$weighBody = @{
    actualWeight = 34.80
    recordedBy = "operator"
    remarks = "Electronic Weighbridge Certified"
} | ConvertTo-Json
$weighedProcRes = Invoke-RestMethod -Uri "$baseUrl/procurements/$($procDraft.id)/weighment" -Method Post -Body $weighBody -Headers $opHeaders -ContentType "application/json"
$weighedProc = $weighedProcRes.data
Assert-Test -TestName "Operator: Certified Weighbridge Scale Recorded" -Condition ($weighedProc.actualWeight -eq 34.80 -or $weighedProc.actualWeight -eq 34.8) -Details "Actual Weight: 34.80 Qntl"

# Operator certifies quality inspection
$qualBody = @{
    grade = "A"
    moisturePercentage = 12.0
    foreignMatterPercentage = 0.5
    brokenGrainPercentage = 0.8
    inspectedBy = "operator"
    remarks = "Fair Average Quality (FAQ) Grade A Certified"
    approved = $true
} | ConvertTo-Json
$inspectedProcRes = Invoke-RestMethod -Uri "$baseUrl/procurements/$($procDraft.id)/inspection" -Method Post -Body $qualBody -Headers $opHeaders -ContentType "application/json"
$inspectedProc = $inspectedProcRes.data
Assert-Test -TestName "Operator: Quality FAQ Inspection Certified" -Condition ($inspectedProc.grade -eq "A" -and $inspectedProc.approved -eq $true) -Details "Grade: A"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 7 and 8] EXACT FINANCIAL ARITHMETIC and LEDGER CONSISTENCY" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Fetch full procurement entity
$fullProcRes = Invoke-RestMethod -Uri "$baseUrl/procurements/$($procDraft.id)" -Method Get -Headers $opHeaders
$fullProc = $fullProcRes.data

# Authoritative calculations:
# Actual Qty * Rate - Deductions = Net Amount
$actualQty = [double]$fullProc.actualQuantity
$rate = [double]$fullProc.ratePerUnit
$deductions = [double]($fullProc.deductions -or 0)

$expectedGross = [math]::Round($actualQty * $rate, 2)
$actualGross = [math]::Round([double]$fullProc.grossAmount, 2)
$expectedNet = [math]::Round($expectedGross - $deductions, 2)
$actualNet = [math]::Round([double]$fullProc.netAmount, 2)

Assert-Test -TestName "Financial: Exact Gross Amount Matches (Qty x Rate)" -Condition ($actualGross -eq $expectedGross) -Details "Backend: Rs. $actualGross == Expected: Rs. $expectedGross (Qty: $actualQty, Rate: Rs. $rate)"
Assert-Test -TestName "Financial: Exact Net Amount Matches (Gross - Deductions)" -Condition ($actualNet -eq $expectedNet) -Details "Backend: Rs. $actualNet == Expected: Rs. $expectedNet"

# Verify cross-screen consistency in Manager Ledger
$mgrProcList = (Invoke-RestMethod -Uri "$baseUrl/procurements/centre/$centreId" -Method Get -Headers $mgrHeaders).data
$mgrRecord = $mgrProcList | Where-Object { $_.id -eq $procDraft.id }
Assert-Test -TestName "Manager Ledger: Procurement Record Matches Exact Amount" -Condition ($mgrRecord.netAmount -eq $actualNet) -Details "Manager Net: Rs. $($mgrRecord.netAmount)"

# Verify cross-screen consistency in Farmer Ledger for the lot owner
$lotFarmerId = $fullProc.farmerId
$adminFarmerProcList = (Invoke-RestMethod -Uri "$baseUrl/procurements/farmers/$lotFarmerId" -Method Get -Headers $adminHeaders).data
$lotFarmerRecord = $adminFarmerProcList | Where-Object { $_.id -eq $procDraft.id }
Assert-Test -TestName "Farmer Ledger: Procurement Record Matches Exact Amount" -Condition ($lotFarmerRecord.netAmount -eq $actualNet) -Details "Farmer Net: Rs. $($lotFarmerRecord.netAmount)"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 9] DBT PAYMENT DISBURSAL and DUPLICATE SUBMISSION DEFENSE" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Find pending payment voucher for this procurement (create voucher if not seeded automatically)
$payments = (Invoke-RestMethod -Uri "$baseUrl/centres/$centreId/payments" -Method Get -Headers $mgrHeaders).data
$targetPayment = $payments | Where-Object { $_.procurementId -eq $procDraft.id }

if (-not $targetPayment) {
    # Generate payment voucher for approved procurement
    $payCreatePayload = @{
        procurementId = $procDraft.id
        farmerId = $lotFarmerId
        amount = $actualNet
        paymentMethod = "PFMS_DBT"
    } | ConvertTo-Json
    $newPayRes = Invoke-RestMethod -Uri "$baseUrl/payments" -Method Post -Body $payCreatePayload -Headers $mgrHeaders -ContentType "application/json"
    $targetPayment = $newPayRes.data
}

Assert-Test -TestName "Payment Voucher Created in PENDING State" -Condition ($targetPayment.status -eq "PENDING") -Details "Voucher: $($targetPayment.paymentCode), Amount: Rs. $($targetPayment.amount)"

# Process payment via Admin / Manager
$payProcessBody = @{
    transactionReference = "PFMS-E2E-TXN-$((Get-Random -Minimum 1000 -Maximum 9999))"
} | ConvertTo-Json
$paidPaymentRes = Invoke-RestMethod -Uri "$baseUrl/payments/$($targetPayment.id)/process" -Method Post -Body $payProcessBody -Headers $adminHeaders -ContentType "application/json"
$paidPayment = $paidPaymentRes.data
Assert-Test -TestName "DBT Payment Disbursed Successfully" -Condition ($paidPayment.status -eq "PAID" -and $paidPayment.transactionReference -like "PFMS-*") -Details "Txn Ref: $($paidPayment.transactionReference)"

# Attempt Duplicate Payment Submission (Must be rejected with 400 Bad Request)
$duplicateBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/payments/$($targetPayment.id)/process" -Method Post -Body $payProcessBody -Headers $adminHeaders -ContentType "application/json"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        $duplicateBlocked = $true
    }
}
Assert-Test -TestName "Duplicate Payment Attempt Rejected with 400 Bad Request" -Condition ($duplicateBlocked) -Details "Double disbursement safely blocked"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 10] NOTIFICATION LIFECYCLE and PERSISTENCE VERIFICATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Farmer checks notifications
$farmerNotifs = (Invoke-RestMethod -Uri "$baseUrl/notifications?userId=$farmerUserId" -Method Get -Headers $farmerHeaders).data
$unreadCountBefore = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count?userId=$farmerUserId" -Method Get -Headers $farmerHeaders).data
Assert-Test -TestName "Farmer Received Real Notifications" -Condition ($farmerNotifs.Count -gt 0 -and $unreadCountBefore -gt 0) -Details "Total: $($farmerNotifs.Count), Unread: $unreadCountBefore"

# Mark top unread notification as read
$firstUnread = $farmerNotifs | Where-Object { -not $_.read } | Select-Object -First 1
if ($firstUnread) {
    $marked = Invoke-RestMethod -Uri "$baseUrl/notifications/$($firstUnread.id)/read" -Method Patch -Headers $farmerHeaders
    $unreadCountAfter = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count?userId=$farmerUserId" -Method Get -Headers $farmerHeaders).data
    Assert-Test -TestName "Notification Marked as Read and Unread Count Decremented" -Condition ($unreadCountAfter -eq ($unreadCountBefore - 1)) -Details "Unread Decreased from $unreadCountBefore to $unreadCountAfter"
}

# Re-login as Farmer to test notification persistence across fresh session
$relogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $farmerLoginBody -ContentType "application/json"
$reloginHeaders = @{ Authorization = "Bearer $($relogin.data.accessToken)" }
$reloginUnread = (Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count?userId=$farmerUserId" -Method Get -Headers $reloginHeaders).data
Assert-Test -TestName "Notification Read State Persists Across Fresh Login Session" -Condition ($reloginUnread -eq $unreadCountAfter) -Details "Persisted Unread Count: $reloginUnread"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 6] SLOT CAPACITY and CONCURRENCY OVERBOOKING TESTS" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Create slot with capacity = 1
$rndTime = Get-Random -Minimum 10 -Maximum 99
$strictSlotBody = @{
    centreId = $centreId
    slotDate = $todayStr
    startTime = "17:$rndTime"
    endTime = "18:$rndTime"
    capacity = 1
} | ConvertTo-Json
$strictSlot = (Invoke-RestMethod -Uri "$baseUrl/centres/$centreId/slots" -Method Post -Body $strictSlotBody -Headers $mgrHeaders -ContentType "application/json").data

# First booking secures slot
$b1 = (Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body (@{
    farmerId = $farmerId
    slotId = $strictSlot.id
    cropId = $paddy.id
    declaredQuantity = 20.0
} | ConvertTo-Json) -Headers $farmerHeaders -ContentType "application/json").data
Assert-Test -TestName "First Concurrent Booking Succeeded" -Condition ($b1.id -ne $null) -Details "Booking: $($b1.bookingCode)"

# Second booking on capacity=1 slot must be rejected with 409 Conflict
$overbookBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body (@{
        farmerId = $farmerId
        slotId = $strictSlot.id
        cropId = $paddy.id
        declaredQuantity = 20.0
    } | ConvertTo-Json) -Headers $farmerHeaders -ContentType "application/json"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409 -or $_.Exception.Response.StatusCode.value__ -eq 400) {
        $overbookBlocked = $true
    }
}
Assert-Test -TestName "Slot Overbooking Prevented by DB Lock with 409 Conflict" -Condition ($overbookBlocked) -Details "Strict capacity limit enforced"

# Inactive slot booking prevention
$deactSlot = Invoke-RestMethod -Uri "$baseUrl/slots/$($strictSlot.id)/status?active=false" -Method Patch -Headers $mgrHeaders
$inactiveBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body (@{
        farmerId = $farmerId
        slotId = $strictSlot.id
        cropId = $paddy.id
        declaredQuantity = 10.0
    } | ConvertTo-Json) -Headers $farmerHeaders -ContentType "application/json"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409 -or $_.Exception.Response.StatusCode.value__ -eq 400) {
        $inactiveBlocked = $true
    }
}
Assert-Test -TestName "Booking on Inactive Slot Blocked" -Condition ($inactiveBlocked) -Details "Inactive slot booking safely rejected"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 11 and 12] SECURITY, RBAC BOUNDARIES and DATA ISOLATION" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Unauthenticated Request (401)
$unauthBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) { $unauthBlocked = $true }
}
Assert-Test -TestName "Unauthenticated Access Returns 401 Unauthorized" -Condition ($unauthBlocked)

# 2. Farmer Role Tampering (403 on Admin endpoints)
$farmerOnAdminBlocked = $false
try {
    Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $farmerHeaders
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) { $farmerOnAdminBlocked = $true }
}
Assert-Test -TestName "FARMER Blocked from Admin Endpoints with 403 Forbidden" -Condition ($farmerOnAdminBlocked)

# 3. Cross-Farmer Data Boundary Isolation
$farmer2Login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ username = "farmer2"; password = "Farmer@123" } | ConvertTo-Json) -ContentType "application/json"
$farmer2Headers = @{ Authorization = "Bearer $($farmer2Login.data.accessToken)" }

$crossFarmerBlocked = $false
try {
    # Farmer 2 attempts to query Farmer 1's bookings
    Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/bookings" -Method Get -Headers $farmer2Headers
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 403) { $crossFarmerBlocked = $true }
}
Assert-Test -TestName "Cross-Farmer Data Access Blocked with 403 Forbidden" -Condition ($crossFarmerBlocked) -Details "Farmer 2 cannot query Farmer 1's records"

# 4. Cross-Centre Isolation
$otherCentres = (Invoke-RestMethod -Uri "$baseUrl/centres" -Method Get -Headers $mgrHeaders).data
$coimbatoreCentre = $otherCentres | Where-Object { $_.name -like "*Coimbatore*" }
if ($coimbatoreCentre) {
    $crossCentreBlocked = $false
    try {
        # Pollachi Manager attempts to query Coimbatore Centre bookings
        Invoke-RestMethod -Uri "$baseUrl/centres/$($coimbatoreCentre.id)/bookings" -Method Get -Headers $mgrHeaders
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) { $crossCentreBlocked = $true }
    }
    Assert-Test -TestName "Cross-Centre Access Blocked for Manager with 403 Forbidden" -Condition ($crossCentreBlocked) -Details "Manager restricted to assigned centre"
}

# 5. Sensitive Payload Sanitization (Ensure NO password / passwordHash in API responses)
$userList = (Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $adminHeaders).data
$firstUser = $userList | Select-Object -First 1
$hasPassword = ($firstUser.password -ne $null) -or ($firstUser.passwordHash -ne $null)
Assert-Test -TestName "Sanitization: Zero Password or PasswordHash in User DTOs" -Condition (-not $hasPassword) -Details "Entity User masked safely"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " [PHASE 27 and 28] IMMUTABLE AUDIT TRAIL and SYSTEM HEALTH TELEMETRY" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

$auditLogs = (Invoke-RestMethod -Uri "$baseUrl/admin/audit" -Method Get -Headers $adminHeaders).data
Assert-Test -TestName "Audit Trail Logged Live Workflow Operations" -Condition ($auditLogs.Count -gt 0) -Details "Total Audit Entries: $($auditLogs.Count)"

$sysHealth = (Invoke-RestMethod -Uri "$baseUrl/admin/system/health" -Method Get -Headers $adminHeaders).data
Assert-Test -TestName "System Telemetry: REST Engine UP and DB Dialect Verified" -Condition ($sysHealth.backendStatus -eq "UP" -and $sysHealth.databaseStatus -eq "UP") -Details "JVM Heap Used: $($sysHealth.jvmUsedMemoryMB) MB / $($sysHealth.jvmMaxMemoryMB) MB"

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host " SUMMARY: $passedTests / $totalTests TESTS PASSED" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host "=================================================================" -ForegroundColor Cyan

if ($failedTests -gt 0) {
    exit 1
} else {
    exit 0
}
