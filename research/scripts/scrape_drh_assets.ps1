param(
  [string[]]$StartUrls = @(
    'https://www.dracihlidka.cz/',
    'https://www.dracihlidka.cz/pravidla',
    'https://www.dracihlidka.cz/o-projektu',
    'https://www.dracihlidka.cz/ke-stazeni'
  ),
  [string]$OutDir = 'research/drh_assets/raw',
  [string]$MetaDir = 'research/drh_assets/meta'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

New-Item -ItemType Directory -Force -Path $OutDir, $MetaDir | Out-Null

$baseHosts = @('www.dracihlidka.cz','dracihlidka.cz')
$assetExt = @('.png','.jpg','.jpeg','.webp','.gif','.svg','.ico','.woff','.woff2','.ttf','.otf','.eot','.css')
$headers = @{
  'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  'Accept' = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

function Is-AllowedHost([Uri]$u) {
  return $baseHosts -contains $u.Host.ToLowerInvariant()
}

function Normalize-Url([string]$raw, [Uri]$base) {
  if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
  $raw = $raw.Trim('"',"'",' ')
  if ($raw.StartsWith('data:') -or $raw.StartsWith('mailto:') -or $raw.StartsWith('javascript:')) { return $null }
  try {
    if ([Uri]::IsWellFormedUriString($raw, [UriKind]::Absolute)) {
      $u = [Uri]$raw
    } else {
      $u = [Uri]::new($base, $raw)
    }
    if (-not (Is-AllowedHost $u)) { return $null }
    $builder = [UriBuilder]::new($u)
    $builder.Fragment = ''
    return $builder.Uri.AbsoluteUri
  } catch {
    return $null
  }
}

function Safe-FileNameFromUrl([string]$url) {
  $u = [Uri]$url
  $path = $u.AbsolutePath.Trim('/')
  if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index' }
  $path = $path -replace '[\\/:*?"<>|]','_'
  $q = $u.Query.TrimStart('?')
  if ($q) {
    $q = ($q -replace '[\\/:*?"<>|&=]','_')
    $path = "$path`__$q"
  }
  return $path
}

function Save-Text([string]$content, [string]$path) {
  $dir = Split-Path -Parent $path
  if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [IO.File]::WriteAllText($path, $content, [Text.Encoding]::UTF8)
}

$downloaded = [System.Collections.Generic.HashSet[string]]::new()
$cssQueue = [System.Collections.Generic.Queue[string]]::new()
$manifest = @()

foreach ($start in $StartUrls) {
  try {
    $res = Invoke-WebRequest -Uri $start -TimeoutSec 30 -Headers $headers
    $html = $res.Content
    $safe = Safe-FileNameFromUrl $start
    $htmlPath = Join-Path $OutDir ("page_" + $safe + '.html')
    Save-Text -content $html -path $htmlPath
    $manifest += [pscustomobject]@{ type='page'; source=$start; file=$htmlPath }

    $baseUri = [Uri]$start
    $refs = @()
    $refs += [regex]::Matches($html, '(?i)(?:src|href)\s*=\s*["'']?([^"'' >#]+)') | ForEach-Object { $_.Groups[1].Value }
    $refs += [regex]::Matches($html, '(?i)url\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value }

    foreach ($r in $refs) {
      $abs = Normalize-Url -raw $r -base $baseUri
      if (-not $abs) { continue }
      $u = [Uri]$abs
      $ext = [IO.Path]::GetExtension($u.AbsolutePath).ToLowerInvariant()
      if ($ext -eq '.css') {
        if (-not $downloaded.Contains($abs)) {
          $cssQueue.Enqueue($abs)
          $downloaded.Add($abs) | Out-Null
        }
      } elseif ($assetExt -contains $ext) {
        if (-not $downloaded.Contains($abs)) {
          $downloaded.Add($abs) | Out-Null
          try {
            $assetFile = Safe-FileNameFromUrl $abs
            $outPath = Join-Path $OutDir ("asset_" + $assetFile)
            Invoke-WebRequest -Uri $abs -OutFile $outPath -TimeoutSec 30 -Headers $headers
            $manifest += [pscustomobject]@{ type='asset'; source=$abs; file=$outPath }
          } catch {}
        }
      }
    }
  } catch {}
}

while ($cssQueue.Count -gt 0) {
  $cssUrl = $cssQueue.Dequeue()
  try {
    $res = Invoke-WebRequest -Uri $cssUrl -TimeoutSec 30 -Headers $headers
    $css = $res.Content
    $cssFile = Safe-FileNameFromUrl $cssUrl
    $cssPath = Join-Path $OutDir ("css_" + $cssFile)
    Save-Text -content $css -path $cssPath
    $manifest += [pscustomobject]@{ type='css'; source=$cssUrl; file=$cssPath }

    $baseUri = [Uri]$cssUrl
    $refs = [regex]::Matches($css, '(?i)url\(([^)]+)\)') | ForEach-Object { $_.Groups[1].Value }
    foreach ($r in $refs) {
      $abs = Normalize-Url -raw $r -base $baseUri
      if (-not $abs) { continue }
      if ($downloaded.Contains($abs)) { continue }
      $u = [Uri]$abs
      $ext = [IO.Path]::GetExtension($u.AbsolutePath).ToLowerInvariant()
      if ($ext -eq '.css') {
        $cssQueue.Enqueue($abs)
        $downloaded.Add($abs) | Out-Null
      } elseif ($assetExt -contains $ext) {
        $downloaded.Add($abs) | Out-Null
        try {
          $assetFile = Safe-FileNameFromUrl $abs
          $outPath = Join-Path $OutDir ("asset_" + $assetFile)
          Invoke-WebRequest -Uri $abs -OutFile $outPath -TimeoutSec 30 -Headers $headers
          $manifest += [pscustomobject]@{ type='asset'; source=$abs; file=$outPath }
        } catch {}
      }
    }
  } catch {}
}

$manifestPath = Join-Path $MetaDir 'manifest.json'
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath -Encoding UTF8

$summary = [pscustomobject]@{
  pages = @($manifest | Where-Object {$_.type -eq 'page'}).Count
  css = @($manifest | Where-Object {$_.type -eq 'css'}).Count
  assets = @($manifest | Where-Object {$_.type -eq 'asset'}).Count
  manifest = $manifestPath
}
$summary | ConvertTo-Json -Depth 3
