$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:4320'
$status = Invoke-RestMethod "$base/api/site-status" -TimeoutSec 5
if (!$status.readOnly -or $status.mode -ne 'profiles') { throw 'Web chưa bật chế độ chỉ xem hồ sơ.' }
$directory = Invoke-RestMethod "$base/api/profiles" -TimeoutSec 5
if ($directory.profiles.Count -lt 1) { throw 'Chưa đọc được danh sách đạo hữu.' }
$person = Invoke-RestMethod ("$base/api/profile?id=" + [Uri]::EscapeDataString($directory.profiles[0].id)) -TimeoutSec 5
if (!$person.profile.name) { throw 'Không mở được hồ sơ.' }
foreach ($route in @('/api/act','/api/retreat/start','/api/retreat/claim','/api/gift/claim','/api/dungeon/start')) {
 $blocked = $false
 try { Invoke-RestMethod ($base + $route) -Method Post -ContentType 'application/json' -Body '{"type":"cultivate"}' -TimeoutSec 5 | Out-Null }
 catch { if ([int]$_.Exception.Response.StatusCode -eq 403) { $blocked = $true } else { throw } }
 if (!$blocked) { throw "API chưa khóa: $route" }
}
$admin = @(Get-NetTCPConnection -LocalPort 4317 -State Listen -ErrorAction SilentlyContinue)
if (@($admin | Where-Object { $_.LocalAddress -notin @('127.0.0.1','::1') }).Count -gt 0) { throw 'Cổng quản trị LIVE không chỉ nghe trên loopback.' }
Write-Host "Sẵn sàng host hồ sơ: $($directory.total) đạo hữu; API chơi đã khóa; LIVE 4317 chỉ nghe nội bộ."
