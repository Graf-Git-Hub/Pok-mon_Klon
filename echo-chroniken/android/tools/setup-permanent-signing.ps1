# Echo-Chroniken: generate ONE permanent Android signing key on your own Windows PC
# and upload it to PRIVATE GitHub Actions secrets. Never commit the private key.
# Requires JDK keytool and GitHub CLI (gh auth login).
$ErrorActionPreference = 'Stop'
$repo = 'Graf-Git-Hub/Pok-mon_Klon'
$alias = 'echochroniken'
if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
  throw 'keytool fehlt. Bitte Java JDK 17 installieren.'
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw 'GitHub CLI fehlt. Einmalig GitHub CLI installieren und mit gh auth login anmelden.'
}
& gh auth status
if ($LASTEXITCODE -ne 0) { throw 'Bitte zuerst gh auth login ausfuehren.' }

$signDir = Join-Path $env:APPDATA 'EchoChroniken\Signing'
New-Item -ItemType Directory -Force -Path $signDir | Out-Null
$keyPath = Join-Path $signDir 'echochroniken-stable.p12'
$protectedPass = Join-Path $signDir 'password.dpapi'
if ((Test-Path $keyPath) -xor (Test-Path $protectedPass)) {
  throw 'Unvollstaendiger alter Signierschluessel! Nicht neu erzeugen: sonst verlieren Updates ihre Signatur.'
}
if ((Test-Path $keyPath) -and (Test-Path $protectedPass)) {
  $secure = (Get-Content -Raw -Path $protectedPass).Trim() | ConvertTo-SecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
  Write-Host 'Bestehender Signierschluessel gefunden; er wird WIEDERVERWENDET.'
} else {
  $bytes = New-Object byte[] 48
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  $password = [Convert]::ToBase64String($bytes)
  $env:ECHO_LOCAL_SIGNING_PASS = $password
  & keytool -genkeypair -noprompt -alias $alias -keyalg RSA -keysize 3072 -sigalg SHA256withRSA -validity 10000 -storetype PKCS12 -keystore $keyPath -storepass:env ECHO_LOCAL_SIGNING_PASS -keypass:env ECHO_LOCAL_SIGNING_PASS -dname 'CN=Echo-Chroniken, O=Personal Android Game, C=DE'
  if ($LASTEXITCODE -ne 0 -or !(Test-Path $keyPath)) { throw 'Keystore konnte nicht erzeugt werden.' }
  (ConvertTo-SecureString -String $password -AsPlainText -Force | ConvertFrom-SecureString) | Set-Content -NoNewline -Path $protectedPass
  Remove-Item Env:ECHO_LOCAL_SIGNING_PASS
  Write-Host 'Dauerhafter Schluessel lokal erstellt, Passwort durch Windows DPAPI geschuetzt.'
}
try {
  # Use stdin, not command arguments or logs, when uploading sensitive values.
  $encodedKey = [Convert]::ToBase64String([IO.File]::ReadAllBytes($keyPath))
  $encodedKey | & gh secret set ECHO_KEYSTORE_B64 --repo $repo
  if ($LASTEXITCODE -ne 0) { throw 'Keystore konnte nicht als GitHub Secret hinterlegt werden.' }
  $password | & gh secret set ECHO_SIGNING_PASSWORD --repo $repo
  if ($LASTEXITCODE -ne 0) { throw 'Passwort-Secret fehlgeschlagen.' }
  $alias | & gh secret set ECHO_SIGNING_ALIAS --repo $repo
  if ($LASTEXITCODE -ne 0) { throw 'Alias-Secret fehlgeschlagen.' }
  Write-Host 'Drei verschluesselte GitHub Actions Secrets sind eingerichtet.'
  Write-Host 'WICHTIG: Diesen Ordner sicher und privat sichern, nicht nur auf dem PC lassen:'
  Write-Host $signDir
  Write-Host 'Keinen spaeteren Schluesselwechsel und keine Aenderung der App-ID vornehmen!'
} finally {
  $password=$null
  $encodedKey=$null
  if (Test-Path Env:ECHO_LOCAL_SIGNING_PASS) { Remove-Item Env:ECHO_LOCAL_SIGNING_PASS }
}
