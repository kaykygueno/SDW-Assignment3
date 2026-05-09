$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3000'
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$u1Email = "attendee+$ts.a@test.com"
$u2Email = "attendee+$ts.b@test.com"
$pwd = 'Pass123!'

# Pick an event with available seats
$events = Invoke-RestMethod -Uri "$base/api/events?all=true" -Method Get
$target = $events | Where-Object { ([int]$_.capacity - [int]$_.booked_count) -ge 2 } | Select-Object -First 1
if (-not $target) { $target = $events | Where-Object { ([int]$_.capacity - [int]$_.booked_count) -ge 1 } | Select-Object -First 1 }
if (-not $target) { throw 'No event with available seats found for booking tests.' }
$eventId = [int]$target.id

# Register two attendees
$null = Invoke-WebRequest -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body (@{ name = 'Checklist User One'; email = $u1Email; password = $pwd } | ConvertTo-Json)
$null = Invoke-WebRequest -Uri "$base/api/auth/register" -Method Post -ContentType 'application/json' -Body (@{ name = 'Checklist User Two'; email = $u2Email; password = $pwd } | ConvertTo-Json)

# Login user 1 and book
$ws1 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$null = Invoke-WebRequest -Uri "$base/api/auth/login" -Method Post -WebSession $ws1 -ContentType 'application/json' -Body (@{ email = $u1Email; password = $pwd } | ConvertTo-Json)
$book1 = Invoke-WebRequest -Uri "$base/api/bookings" -Method Post -WebSession $ws1 -ContentType 'application/json' -Body (@{ event_id = $eventId } | ConvertTo-Json)
$book1Json = $book1.Content | ConvertFrom-Json
$my1 = Invoke-RestMethod -Uri "$base/api/bookings" -Method Get -WebSession $ws1

# Login user 2 and book
$ws2 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$null = Invoke-WebRequest -Uri "$base/api/auth/login" -Method Post -WebSession $ws2 -ContentType 'application/json' -Body (@{ email = $u2Email; password = $pwd } | ConvertTo-Json)
$book2 = Invoke-WebRequest -Uri "$base/api/bookings" -Method Post -WebSession $ws2 -ContentType 'application/json' -Body (@{ event_id = $eventId } | ConvertTo-Json)
$book2Json = $book2.Content | ConvertFrom-Json
$my2 = Invoke-RestMethod -Uri "$base/api/bookings" -Method Get -WebSession $ws2

# DB verification for created booking IDs
$nodeScript = @"
const mysql=require('mysql2/promise');
const fs=require('fs');
const path=require('path');
const env=Object.fromEntries(
  fs.readFileSync(path.resolve('.env.local'),'utf8')
    .split(/\r?\n/)
    .filter(l=>l && !l.startsWith('#'))
    .map(l=>l.split('=').map(s=>s.trim()))
);
(async()=>{
  const c=await mysql.createConnection({host:env.DB_HOST,user:env.DB_USER,password:env.DB_PASSWORD,database:env.DB_NAME});
  const [rows]=await c.execute('SELECT id,user_id,event_id,booking_date FROM bookings WHERE id IN (?,?) ORDER BY id',[Number(process.argv[2]),Number(process.argv[3])]);
  console.log(JSON.stringify(rows));
  await c.end();
})();
"@

$nodeFile = 'scripts/.tmp-check-db.js'
Set-Content -Path $nodeFile -Value $nodeScript -Encoding UTF8
$dbJson = node $nodeFile $book1Json.booking_id $book2Json.booking_id
Remove-Item $nodeFile -Force
$dbRows = $dbJson | ConvertFrom-Json

# Visibility checks
$u1BookingIds = @($my1 | ForEach-Object { $_.booking_id })
$u2BookingIds = @($my2 | ForEach-Object { $_.booking_id })

$result = [pscustomobject]@{
  event_id = $eventId
  booking1 = @{ status = $book1.StatusCode; message = $book1Json.message; booking_id = $book1Json.booking_id; email = $u1Email }
  booking2 = @{ status = $book2.StatusCode; message = $book2Json.message; booking_id = $book2Json.booking_id; email = $u2Email }
  db_rows = $dbRows
  visibility = @{
    user1_has_own = ($u1BookingIds -contains $book1Json.booking_id)
    user1_sees_user2 = ($u1BookingIds -contains $book2Json.booking_id)
    user2_has_own = ($u2BookingIds -contains $book2Json.booking_id)
    user2_sees_user1 = ($u2BookingIds -contains $book1Json.booking_id)
    user1_total_bookings = $u1BookingIds.Count
    user2_total_bookings = $u2BookingIds.Count
  }
}

$result | ConvertTo-Json -Depth 6
