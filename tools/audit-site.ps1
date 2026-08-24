$ErrorActionPreference = 'Stop'

$siteRoot = Split-Path -Parent $PSScriptRoot
$domain = 'https://truecraftinteriorschicago.com'
$issues = [System.Collections.Generic.List[string]]::new()
$htmlFiles = @(Get-ChildItem -Path $siteRoot -Recurse -Filter *.html -File | Where-Object { $_.FullName -notlike '*\.git\*' })

function Relative-WebPath([string]$fullPath) {
  return '/' + $fullPath.Substring($siteRoot.Length).TrimStart('\').Replace('\', '/')
}

function Route-ForFile([IO.FileInfo]$file) {
  $relative = Relative-WebPath $file.FullName
  if ($relative -eq '/index.html') { return '/' }
  if ($relative.EndsWith('/index.html')) { return $relative.Substring(0, $relative.Length - 'index.html'.Length) }
  return $relative
}

foreach ($file in $htmlFiles) {
  $relative = Relative-WebPath $file.FullName
  $route = Route-ForFile $file
  $html = [IO.File]::ReadAllText($file.FullName)

  if (([regex]::Matches($html, '<title>.*?</title>', 'Singleline')).Count -ne 1) {
    $issues.Add("$relative must contain exactly one title")
  }
  if (([regex]::Matches($html, '<html[^>]+lang=["''][^"'']+["'']', 'IgnoreCase')).Count -ne 1) {
    $issues.Add("$relative must declare one document language")
  }
  if ($route -ne '/404.html') {
    if (-not [regex]::IsMatch($html, '<meta name=["'']description["'']', 'IgnoreCase')) {
      $issues.Add("$relative is missing a meta description")
    }
    if (-not [regex]::IsMatch($html, '<link rel=["'']canonical["'']', 'IgnoreCase')) {
      $issues.Add("$relative is missing a canonical URL")
    }
  }
  if (-not [regex]::IsMatch($html, 'rel=["''](?:icon|shortcut icon)["'']', 'IgnoreCase')) {
    $issues.Add("$relative is missing a browser icon")
  }

  $ids = @([regex]::Matches($html, '\sid=["'']([^"'']+)["'']', 'IgnoreCase') | ForEach-Object { $_.Groups[1].Value })
  foreach ($duplicate in @($ids | Group-Object | Where-Object Count -gt 1)) {
    $issues.Add("$relative contains duplicate id '$($duplicate.Name)'")
  }

  $references = @([regex]::Matches($html, '(?:href|src|action)=["'']([^"'']+)["'']', 'IgnoreCase') | ForEach-Object { $_.Groups[1].Value })
  foreach ($reference in $references) {
    if ($reference -match '^(https?:|mailto:|tel:|sms:|#|data:|javascript:)') { continue }
    $clean = ($reference -split '[?#]')[0]
    if ([string]::IsNullOrWhiteSpace($clean)) { continue }
    if ($clean -match '^/api/') { continue }
    if ($clean.StartsWith('/')) {
      $target = Join-Path $siteRoot $clean.TrimStart('/').Replace('/', '\')
    } else {
      $target = Join-Path $file.DirectoryName $clean.Replace('/', '\')
    }
    if ($clean.EndsWith('/')) { $target = Join-Path $target 'index.html' }
    if (-not (Test-Path -LiteralPath $target)) {
      $issues.Add("$relative references missing file '$reference'")
    }
  }
}

$expectedAssets = @(
  'assets/logo.png',
  'favicon.ico',
  'assets/css/main.css',
  'assets/css/seo-pages.css',
  'assets/css/mobile-fixes.css',
  'assets/js/translations.js',
  'assets/js/main.js',
  'assets/js/quote-form.js',
  'functions/api/contact.js',
  'worker.js',
  'wrangler.toml',
  '.assetsignore',
  'assets/reviews/review-wall-prep.png',
  'assets/reviews/review-commercial-hall.png',
  'assets/reviews/review-bathroom-durock.png'
)
foreach ($asset in $expectedAssets) {
  $assetPath = Join-Path $siteRoot $asset
  if (-not (Test-Path -LiteralPath $assetPath)) { $issues.Add("Missing required asset '/$($asset.Replace('\','/'))'") }
  elseif ((Get-Item -LiteralPath $assetPath).Length -eq 0) { $issues.Add("Asset '/$($asset.Replace('\','/'))' is empty") }
}

$sitemapPath = Join-Path $siteRoot 'sitemap.xml'
if (-not (Test-Path -LiteralPath $sitemapPath)) {
  $issues.Add('Missing sitemap.xml')
} else {
  [xml]$sitemap = Get-Content -LiteralPath $sitemapPath
  $namespace = [Xml.XmlNamespaceManager]::new($sitemap.NameTable)
  $namespace.AddNamespace('s', 'http://www.sitemaps.org/schemas/sitemap/0.9')
  $listedRoutes = @($sitemap.SelectNodes('//s:loc', $namespace) | ForEach-Object { $_.InnerText.Replace($domain, '') } | Sort-Object -Unique)
  $actualRoutes = @($htmlFiles | Where-Object Name -eq 'index.html' | ForEach-Object { Route-ForFile $_ } | Sort-Object -Unique)
  foreach ($route in @($actualRoutes | Where-Object { $_ -notin $listedRoutes })) { $issues.Add("Sitemap is missing route '$route'") }
  foreach ($route in @($listedRoutes | Where-Object { $_ -notin $actualRoutes })) { $issues.Add("Sitemap contains nonexistent route '$route'") }
}

$englishHome = [IO.File]::ReadAllText((Join-Path $siteRoot 'index.html'))
$spanishHome = [IO.File]::ReadAllText((Join-Path $siteRoot 'es\index.html'))
$requiredHomeMarkers = @('class="hero-c"', 'id="servicios"', 'id="galeria"', 'id="testimonios"', 'id="contacto"', 'id="quoteForm"')
foreach ($marker in $requiredHomeMarkers) {
  if (-not $englishHome.Contains($marker)) { $issues.Add("English homepage is missing '$marker'") }
  if (-not $spanishHome.Contains($marker)) { $issues.Add("Spanish homepage is missing '$marker'") }
}
if (-not $spanishHome.Contains('<html lang="es">')) { $issues.Add('Spanish homepage language is not set to es') }
if (-not $spanishHome.Contains('https://truecraftinteriorschicago.com/es/')) { $issues.Add('Spanish homepage metadata is not current') }
foreach ($homePage in @(@{ Name = 'English'; Html = $englishHome }, @{ Name = 'Spanish'; Html = $spanishHome })) {
  if ($homePage.Html.Contains('<style')) { $issues.Add("$($homePage.Name) homepage still contains inline CSS") }
  foreach ($asset in @('/assets/css/main.css', '/assets/js/translations.js', '/assets/js/main.js')) {
    if (-not $homePage.Html.Contains($asset)) { $issues.Add("$($homePage.Name) homepage does not load '$asset'") }
  }
}
$quotePage = [IO.File]::ReadAllText((Join-Path $siteRoot 'es\cotizacion\index.html'))
if (-not $quotePage.Contains('/assets/js/quote-form.js')) { $issues.Add('Spanish quote page does not load the shared form JavaScript') }
if ([regex]::IsMatch($quotePage, '<script>')) { $issues.Add('Spanish quote page still contains inline JavaScript') }
if (Test-Path -LiteralPath (Join-Path $siteRoot 'es\services-temp')) { $issues.Add('Obsolete es/services-temp directory still exists') }

if ($issues.Count) {
  Write-Host "SITE AUDIT FAILED: $($issues.Count) issue(s)" -ForegroundColor Red
  $issues | Sort-Object -Unique | ForEach-Object { Write-Host " - $_" }
  exit 1
}

$routeCount = @($htmlFiles | Where-Object Name -eq 'index.html').Count
Write-Host "SITE AUDIT PASSED: $routeCount routes, $($htmlFiles.Count) HTML files, required assets and sitemap verified." -ForegroundColor Green
