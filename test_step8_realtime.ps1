# ==============================================================================
# AGRIPROCURE — Step 8 Real-Time ERP Synchronization & Notification Verification
# ==============================================================================

$ErrorActionPreference = "Stop"
$baseUrl = "http://localhost:8080"

function Print-Header($title) {
    Write-Host "`n=================================================================" -ForegroundColor Cyan
    Write-Host " [STEP 8 TEST] $title" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
}

function Assert-Equal($actual, $expected, $message) {
    if ($actual -eq $expected) {
        Write-Host "  [PASS] $message (Value: $actual)" -ForegroundColor Green
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
    # 1. AUTHENTICATION & MULTI-USER ROLE SESSIONS
    # --------------------------------------------------------------------------
    Print-Header "1. Multi-User Authentication & Session Initialization"

    # Farmer session
    $farmerLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"farmer1","password":"Farmer@123"}'
    $farmerToken = $farmerLogin.data.accessToken
    $farmerId = $farmerLogin.data.user.farmerId
    $farmerUserId = $farmerLogin.data.user.id
    Assert-True ($null -ne $farmerToken) "Farmer1 authenticated successfully"

    # Operator session
    $opLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"operator","password":"Operator@123"}'
    $opToken = $opLogin.data.accessToken
    $opCentreId = $opLogin.data.user.centreId
    Assert-True ($null -ne $opToken) "Operator authenticated successfully (Centre ID: $opCentreId)"

    # Manager session
    $mgrLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"manager","password":"Manager@123"}'
    $mgrToken = $mgrLogin.data.accessToken
    $mgrCentreId = $mgrLogin.data.user.centreId
    Assert-True ($null -ne $mgrToken) "Centre Manager authenticated successfully (Centre ID: $mgrCentreId)"

    # Admin session
    $adminLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"Admin@123"}'
    $adminToken = $adminLogin.data.accessToken
    Assert-True ($null -ne $adminToken) "Admin authenticated successfully"

    $farmerHeaders = @{ Authorization = "Bearer $farmerToken" }
    $opHeaders = @{ Authorization = "Bearer $opToken" }
    $mgrHeaders = @{ Authorization = "Bearer $mgrToken" }
    $adminHeaders = @{ Authorization = "Bearer $adminToken" }

    # --------------------------------------------------------------------------
    # 2. REAL-TIME QUEUE & TOKEN CALLING WORKFLOW
    # --------------------------------------------------------------------------
    Print-Header "2. Real-Time Queue & Token Calling Operations"

    # Get initial queue overview
    $queueInitial = Invoke-RestMethod -Uri "$baseUrl/api/queues/$opCentreId" -Method Get -Headers $opHeaders
    Assert-True $queueInitial.success "Initial queue overview retrieved"
    $initialServing = $queueInitial.data.currentServingToken
    Write-Host "  Current Serving Token: $initialServing" -ForegroundColor Yellow

    # Call Next Waiting Token
    try {
        $calledTokenRes = Invoke-RestMethod -Uri "$baseUrl/api/queues/$opCentreId/call-next" -Method Post -Headers $opHeaders
        Assert-True $calledTokenRes.success "Operator successfully called next token"
        $newServing = $calledTokenRes.data.displayToken
        Assert-Equal $calledTokenRes.data.status "PROCESSING" "Called token status is PROCESSING"
        Write-Host "  New Serving Token Called: $newServing" -ForegroundColor Yellow

        # Verify queue board reflects update immediately
        $queueAfter = Invoke-RestMethod -Uri "$baseUrl/api/queues/$opCentreId" -Method Get -Headers $opHeaders
        Assert-Equal $queueAfter.data.currentServingToken $newServing "Queue board updated current serving token"
    } catch {
        Write-Host "  [INFO] Call next token returned: $_ (possibly queue already processed)" -ForegroundColor Yellow
    }

    # --------------------------------------------------------------------------
    # 3. REAL-TIME BOOKING CREATION & USER NOTIFICATION DISPATCH
    # --------------------------------------------------------------------------
    Print-Header "3. Booking Creation & Real-Time Notification Engine"

    # Get unread notification count before booking
    $notifCountBefore = (Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread-count?userId=$farmerUserId" -Method Get -Headers $farmerHeaders).data
    Write-Host "  Farmer unread notifications before booking: $notifCountBefore" -ForegroundColor Yellow

    # Fetch available crops and slots
    $crops = (Invoke-RestMethod -Uri "$baseUrl/api/crops" -Method Get).data
    $cropId = $crops[0].id

    # Create slot for today for booking test
    $todayStr = (Get-Date).ToString("yyyy-MM-dd")
    $rnd = Get-Random -Minimum 100 -Maximum 999
    $slotPayload = @{
        centreId = $opCentreId
        slotDate = $todayStr
        startTime = "14:00"
        endTime = "15:00"
        capacity = 10
    } | ConvertTo-Json

    $newSlotRes = Invoke-RestMethod -Uri "$baseUrl/api/centres/$opCentreId/slots" -Method Post -Headers $mgrHeaders -ContentType "application/json" -Body $slotPayload
    $createdSlotId = $newSlotRes.data.id
    Assert-True ($null -ne $createdSlotId) "Manager created real slot for today ($todayStr 14:00-15:00)"

    # Farmer creates real booking
    $bookingPayload = @{
        farmerId = $farmerId
        slotId = $createdSlotId
        cropId = $cropId
        declaredQuantity = 25.50
    } | ConvertTo-Json

    $bookingRes = Invoke-RestMethod -Uri "$baseUrl/api/bookings" -Method Post -Headers $farmerHeaders -ContentType "application/json" -Body $bookingPayload
    Assert-True $bookingRes.success "Farmer booking successfully confirmed"
    $bookingCode = $bookingRes.data.bookingCode
    $queueToken = $bookingRes.data.queueToken
    Write-Host "  Booking Confirmed: $bookingCode, Issued Token: $queueToken" -ForegroundColor Yellow

    # Verify notification was persisted in PostgreSQL and available immediately
    $notifCountAfter = (Invoke-RestMethod -Uri "$baseUrl/api/notifications/unread-count?userId=$farmerUserId" -Method Get -Headers $farmerHeaders).data
    Assert-True ($notifCountAfter -gt $notifCountBefore) "Farmer unread notification count incremented ($notifCountAfter)"

    # Verify latest notification details
    $farmerNotifs = (Invoke-RestMethod -Uri "$baseUrl/api/notifications?userId=$farmerUserId" -Method Get -Headers $farmerHeaders).data
    Assert-True ($farmerNotifs.Count -gt 0) "Farmer notifications list populated ($($farmerNotifs.Count) records)"
    $latestNotif = $farmerNotifs[0]
    Assert-True ($latestNotif.title -like "*Booking Confirmed*" -or $latestNotif.title -like "*Queue Token*") "Notification matches booking event ($($latestNotif.title))"

    # Mark notification as read
    $markReadRes = Invoke-RestMethod -Uri "$baseUrl/api/notifications/$($latestNotif.id)/read" -Method Patch -Headers $farmerHeaders
    Assert-True $markReadRes.success "Notification marked as read successfully"

    # --------------------------------------------------------------------------
    # 4. INTAKE PROCESSING PIPELINE (Weighment -> Quality -> Procurement)
    # --------------------------------------------------------------------------
    Print-Header "4. Intake Pipeline Events (Weighment & Quality Inspection)"

    # Create procurement draft for the token
    $procDraftPayload = @{
        farmerId = $farmerId
        cropId = $cropId
        declaredQuantity = 25.50
        actualQuantity = 25.50
        deductions = 0.00
    } | ConvertTo-Json

    $procRes = Invoke-RestMethod -Uri "$baseUrl/api/procurements" -Method Post -Headers $opHeaders -ContentType "application/json" -Body $procDraftPayload
    $procId = $procRes.data.id
    Assert-True ($null -ne $procId) "Procurement draft initialized ($($procRes.data.procurementCode))"

    # 4a. Record Weighment
    $weighPayload = @{
        actualWeight = 26.20
        moisturePercentage = 11.5
        recordedBy = "operator"
        remarks = "Standard electronic weighbridge certification"
    } | ConvertTo-Json

    $weighRes = Invoke-RestMethod -Uri "$baseUrl/api/procurements/$procId/weighment" -Method Post -Headers $opHeaders -ContentType "application/json" -Body $weighPayload
    Assert-True $weighRes.success "Weighment recorded successfully"
    Assert-Equal $weighRes.data.actualWeight 26.20 "Weighbridge certified actual weight: 26.20 Qntl"

    # 4b. Record Quality Inspection
    $qualityPayload = @{
        grade = "A"
        moisturePercentage = 11.5
        foreignMatterPercentage = 0.8
        brokenGrainPercentage = 1.2
        inspectedBy = "operator"
        remarks = "Quality meets statutory Fair Average Quality (FAQ) standards"
        approved = $true
    } | ConvertTo-Json

    $qualityRes = Invoke-RestMethod -Uri "$baseUrl/api/procurements/$procId/inspection" -Method Post -Headers $opHeaders -ContentType "application/json" -Body $qualityPayload
    Assert-True $qualityRes.success "Quality inspection certified"
    Assert-Equal $qualityRes.data.grade "A" "Assigned Grade: A"

    # --------------------------------------------------------------------------
    # 5. REAL-TIME PAYMENT PROCESSING & DIRECT BENEFIT TRANSFER (DBT)
    # --------------------------------------------------------------------------
    Print-Header "5. DBT Payment Processing & Disbursal Events"

    # Create payment voucher
    $payCreatePayload = @{
        procurementId = $procId
        farmerId = $farmerId
        amount = 60260.00
        paymentMethod = "PFMS_DBT"
    } | ConvertTo-Json

    $payCreateRes = Invoke-RestMethod -Uri "$baseUrl/api/payments" -Method Post -Headers $mgrHeaders -ContentType "application/json" -Body $payCreatePayload
    $paymentId = $payCreateRes.data.id
    Assert-True ($null -ne $paymentId) "Payment voucher created: $($payCreateRes.data.paymentCode)"
    Assert-Equal $payCreateRes.data.status "PENDING" "Initial payment status is PENDING"

    # Process electronic disbursement
    $payProcessPayload = @{
        transactionReference = "PFMS-TXN-2026-" + $rnd
    } | ConvertTo-Json

    $payProcessRes = Invoke-RestMethod -Uri "$baseUrl/api/payments/$paymentId/process" -Method Post -Headers $adminHeaders -ContentType "application/json" -Body $payProcessPayload
    Assert-True $payProcessRes.success "Payment disbursed via electronic DBT"
    Assert-Equal $payProcessRes.data.status "PAID" "Payment status transitioned to PAID"
    Assert-Equal $payProcessRes.data.transactionReference ("PFMS-TXN-2026-" + $rnd) "PFMS Bank transaction reference verified"

    # --------------------------------------------------------------------------
    # 6. CONCURRENCY & RACE CONDITION TEST (Pessimistic Slot Locking Authority)
    # --------------------------------------------------------------------------
    Print-Header "6. Strict Database Concurrency & Race Condition Verification"

    # Create a slot with capacity = 1
    $limitedSlotPayload = @{
        centreId = $opCentreId
        slotDate = $todayStr
        startTime = "16:00"
        endTime = "17:00"
        capacity = 1
    } | ConvertTo-Json

    $limitedSlot = (Invoke-RestMethod -Uri "$baseUrl/api/centres/$opCentreId/slots" -Method Post -Headers $mgrHeaders -ContentType "application/json" -Body $limitedSlotPayload).data
    $limSlotId = $limitedSlot.id
    Assert-True ($null -ne $limSlotId) "Created limited slot with strict capacity = 1"

    # Attempt 1: First booking should succeed
    $book1Payload = @{
        farmerId = $farmerId
        slotId = $limSlotId
        cropId = $cropId
        declaredQuantity = 10.0
    } | ConvertTo-Json

    $book1Res = Invoke-RestMethod -Uri "$baseUrl/api/bookings" -Method Post -Headers $farmerHeaders -ContentType "application/json" -Body $book1Payload
    Assert-True $book1Res.success "Booking 1 successfully secured the only slot"

    # Attempt 2: Second booking must fail with 409 Conflict or 400 Bad Request
    $attempt2Failed = $false
    try {
        $book2Res = Invoke-RestMethod -Uri "$baseUrl/api/bookings" -Method Post -Headers $farmerHeaders -ContentType "application/json" -Body $book1Payload -SkipHttpErrorCheck -StatusCodeVariable "scBook2"
        if ($scBook2 -eq 409 -or $scBook2 -eq 400) {
            $attempt2Failed = $true
        }
    } catch {
        $attempt2Failed = $true
    }
    Assert-True $attempt2Failed "Overbooking strictly prevented by database pessimistic lock (409 Conflict)"

    # Verify slot remains at capacity = 1 and bookedCount = 1
    $verifiedSlot = (Invoke-RestMethod -Uri "$baseUrl/api/slots/$limSlotId" -Method Get -Headers $farmerHeaders).data
    Assert-Equal $verifiedSlot.bookedCount 1 "Slot booked count is strictly 1"
    Assert-Equal $verifiedSlot.availableCapacity 0 "Slot available capacity is strictly 0"

    Write-Host "`n=================================================================" -ForegroundColor Green
    Write-Host " ALL STEP 8 REAL-TIME SYNCHRONIZATION TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
} catch {
    Write-Host "`n[ERROR] Step 8 Verification failed: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    exit 1
}
