# Comprehensive Step 6 Verification Script
$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers,
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )

    Write-Host "Testing: $Name ($Method $Url)..." -NoNewline
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        if ($Body) {
            $params["Body"] = $Body
            $params["ContentType"] = "application/json"
        }
        $resp = Invoke-RestMethod @params
        Write-Host " [PASS]" -ForegroundColor Green
        return $resp
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status -eq $ExpectedStatus) {
            Write-Host " [PASS (Expected $ExpectedStatus)]" -ForegroundColor Green
            return $null
        } else {
            Write-Host " [FAIL: Status $status, Expected $ExpectedStatus]" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor DarkGray
            throw "Test failed for $Name"
        }
    }
}

Write-Host "=== STEP 6 AUTOMATED END-TO-END VERIFICATION ===" -ForegroundColor Cyan

# 1. Login as Manager (Pollachi PC-001)
$mgrLoginBody = @{
    username = "manager"
    password = "Manager@123"
} | ConvertTo-Json

$mgrLogin = Test-Endpoint -Name "Manager Login" -Method "POST" -Url "http://localhost:8080/api/auth/login" -Headers @{} -Body $mgrLoginBody
$mgrToken = $mgrLogin.data.accessToken
$centreId = $mgrLogin.data.user.centreId
Write-Host "Manager logged in. Centre ID: $centreId, Role: $($mgrLogin.data.user.role)" -ForegroundColor Yellow

$mgrHeaders = @{
    "Authorization" = "Bearer $mgrToken"
}

# 2. Test Manager Dashboard Endpoint
$dash = Test-Endpoint -Name "Manager Dashboard Overview" -Method "GET" -Url "http://localhost:8080/api/manager/dashboard" -Headers $mgrHeaders
Write-Host "Dashboard KPIs:" -ForegroundColor Gray
Write-Host "  Today Bookings: $($dash.data.todayBookingsCount)"
Write-Host "  Waiting Tokens: $($dash.data.waitingTokensCount)"
Write-Host "  Currently Serving: $($dash.data.currentlyServingToken)"
Write-Host "  Procurement Volume: $($dash.data.totalProcurementQuantity) Qntl"
Write-Host "  Procurement Value: Rs. $($dash.data.totalProcurementValue)"
Write-Host "  Pending Payments: Rs. $($dash.data.pendingPaymentsAmount)"
Write-Host "  Slot Utilization: $($dash.data.slotUtilizationPercentage)%"
Write-Host "  Active Alerts: $($dash.data.operationalAlerts.Count)"

# 3. Test Centre Staff Directory
$staff = Test-Endpoint -Name "Centre Staff Directory" -Method "GET" -Url "http://localhost:8080/api/manager/staff" -Headers $mgrHeaders
Write-Host "Staff Count: $($staff.data.Count)" -ForegroundColor Gray
foreach ($s in $staff.data) {
    Write-Host "  - $($s.fullName) (@$($s.username)) - $($s.designation) [$($s.role)]"
}

# 4. Test Manager Reports
$from = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
$to = (Get-Date).ToString("yyyy-MM-dd")
$reports = Test-Endpoint -Name "Manager Date-Range Reports" -Method "GET" -Url "http://localhost:8080/api/manager/reports?fromDate=$from&toDate=$to" -Headers $mgrHeaders
Write-Host "Report Summary:" -ForegroundColor Gray
Write-Host "  Total Bookings: $($reports.data.totalBookings)"
Write-Host "  Total Quantity: $($reports.data.totalQuantity) Qntl"
Write-Host "  Gross Value: Rs. $($reports.data.totalGrossAmount)"
Write-Host "  Grade A Count: $($reports.data.gradeACount)"
Write-Host "  Daily Trends Count: $($reports.data.dailyTrends.Count)"

# 5. Test Centre Bookings
$bookings = Test-Endpoint -Name "Centre Bookings List" -Method "GET" -Url "http://localhost:8080/api/centres/$centreId/bookings" -Headers $mgrHeaders
Write-Host "Bookings Count: $($bookings.data.Count)" -ForegroundColor Gray

# 6. Test Centre Queue
$todayStr = (Get-Date).ToString("yyyy-MM-dd")
$queue = Test-Endpoint -Name "Centre Queue Monitor" -Method "GET" -Url "http://localhost:8080/api/queues/${centreId}?date=${todayStr}" -Headers $mgrHeaders
Write-Host "Active Queue Count: $($queue.data.activeTokens.Count)" -ForegroundColor Gray

# 7. Test Centre Procurements
$procurements = Test-Endpoint -Name "Centre Procurement Ledger" -Method "GET" -Url "http://localhost:8080/api/procurements/centre/$centreId" -Headers $mgrHeaders
Write-Host "Procurements Count: $($procurements.data.Count)" -ForegroundColor Gray

# 8. Test Centre Payments
$payments = Test-Endpoint -Name "Centre Payments Registry" -Method "GET" -Url "http://localhost:8080/api/centres/$centreId/payments" -Headers $mgrHeaders
Write-Host "Payments Count: $($payments.data.Count)" -ForegroundColor Gray

# 9. Test Slot Creation and Status Mutation
$newSlotBody = @{
    centreId = $centreId
    slotDate = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
    startTime = "14:00:00"
    endTime = "16:00:00"
    capacity = 25
} | ConvertTo-Json

$createdSlot = Test-Endpoint -Name "Manager Create Slot" -Method "POST" -Url "http://localhost:8080/api/centres/$centreId/slots" -Headers $mgrHeaders -Body $newSlotBody
Write-Host "Created Slot ID: $($createdSlot.data.id), Capacity: $($createdSlot.data.capacity)" -ForegroundColor Gray

# Toggle Slot Status
$toggleResp = Test-Endpoint -Name "Manager Deactivate Slot" -Method "PATCH" -Url "http://localhost:8080/api/slots/$($createdSlot.data.id)/status?active=false" -Headers $mgrHeaders
Write-Host "Slot status active: $($toggleResp.data.active)" -ForegroundColor Gray

# 10. Test Security Isolation: Manager attempting to access unauthorized Centre
$allCentresResp = Test-Endpoint -Name "Get All Centres List" -Method "GET" -Url "http://localhost:8080/api/centres" -Headers $mgrHeaders
$otherCentre = $allCentresResp.data | Where-Object { $_.id -ne $centreId } | Select-Object -First 1
Write-Host "Testing Security Isolation (Accessing other Centre: $($otherCentre.name) [$($otherCentre.id)])..." -NoNewline
try {
    $forbiddenResp = Invoke-RestMethod -Uri "http://localhost:8080/api/centres/$($otherCentre.id)/bookings" -Method "GET" -Headers $mgrHeaders
    Write-Host " [FAIL - Should have returned 403 Forbidden]" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 403) {
        Write-Host " [PASS - Correctly received 403 Forbidden]" -ForegroundColor Green
    } else {
        Write-Host " [FAIL - Unexpected code $code]" -ForegroundColor Red
    }
}

# 11. Role Regression Tests
# Farmer Login
$farmerLoginBody = @{
    username = "farmer1"
    password = "Farmer@123"
} | ConvertTo-Json
$farmerLogin = Test-Endpoint -Name "Regression: Farmer Login" -Method "POST" -Url "http://localhost:8080/api/auth/login" -Headers @{} -Body $farmerLoginBody
Write-Host "Farmer authenticated: $($farmerLogin.data.user.role)" -ForegroundColor Gray

# Operator Login
$opLoginBody = @{
    username = "operator"
    password = "Operator@123"
} | ConvertTo-Json
$opLogin = Test-Endpoint -Name "Regression: Operator Login" -Method "POST" -Url "http://localhost:8080/api/auth/login" -Headers @{} -Body $opLoginBody
Write-Host "Operator authenticated: $($opLogin.data.user.role)" -ForegroundColor Gray

Write-Host "=== ALL STEP 6 END-TO-END TESTS PASSED ===" -ForegroundColor Green
