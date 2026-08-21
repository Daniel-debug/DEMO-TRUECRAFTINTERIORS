$ErrorActionPreference = 'Stop'

$siteRoot = Split-Path -Parent $PSScriptRoot
$previewPort = 4173
$previewUrl = "http://127.0.0.1:$previewPort/es/"
$serverProcess = $null

try {
  $serverProcess = Start-Process -FilePath 'python' `
    -ArgumentList '-m', 'http.server', $previewPort, '--bind', '127.0.0.1' `
    -WorkingDirectory $siteRoot `
    -WindowStyle Hidden `
    -PassThru

  Start-Sleep -Milliseconds 900

  if ($serverProcess.HasExited) {
    throw "No se pudo iniciar la vista local. Revisa que Python esté instalado."
  }

  $response = Invoke-WebRequest -Uri $previewUrl -UseBasicParsing -TimeoutSec 5
  if ($response.StatusCode -ne 200) {
    throw "La página local no respondió correctamente."
  }

  Start-Process $previewUrl

  Write-Host ''
  Write-Host 'True Craft Interiors se abrió correctamente.' -ForegroundColor Green
  Write-Host "Dirección: $previewUrl"
  Write-Host ''
  Write-Host 'Mantén esta ventana abierta mientras revisas el sitio.'
  [void](Read-Host 'Presiona Enter cuando quieras cerrar la vista local')
}
catch {
  Write-Host ''
  Write-Host $_.Exception.Message -ForegroundColor Red
  [void](Read-Host 'Presiona Enter para cerrar')
}
finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id
  }
}
