$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$domain = 'https://truecraftinteriorschicago.com'
$services = @(
  @{ en='drywall-installation'; es='instalacion-drywall'; enName='Drywall Installation'; esName='Instalación de Drywall'; enLead='Professional drywall hanging for new construction, remodels, basements and custom interior features.'; esLead='Instalación profesional de drywall para construcción nueva, remodelaciones, sótanos y detalles interiores.'; enBody='We glue and screw panels, keep joints tight for better finishing and work with trusted materials from USG, CertainTeed and Gold Bond. Our crew can also address soundproofing needs and custom drywall details.'; esBody='Pegamos y atornillamos los paneles, mantenemos juntas ajustadas para un mejor acabado y trabajamos con materiales de USG, CertainTeed y Gold Bond. También atendemos necesidades de aislamiento acústico y detalles personalizados.'},
  @{ en='drywall-taping-finishing'; es='acabado-drywall'; enName='Drywall Taping & Finishing'; esName='Cinta y Acabado de Drywall'; enLead='Clean taping and Level 1–5 finishing for residential, commercial and remodeling work.'; esLead='Cinta limpia y acabados Nivel 1–5 para trabajos residenciales, comerciales y remodelaciones.'; enBody='We combine automatic taping tools with careful hand finishing for tight joints, corners and consistent surfaces. Products may include TapeTech, USG, ProForm and Trim-Tex according to project needs.'; esBody='Combinamos herramientas automáticas con acabado manual cuidadoso para juntas, esquinas y superficies uniformes. Utilizamos productos como TapeTech, USG, ProForm y Trim-Tex según el proyecto.'},
  @{ en='drywall-repair'; es='reparacion-drywall'; enName='Drywall Repair'; esName='Reparación de Drywall'; enLead='Repairs for holes, cracks, water damage, skim coating and openings left by plumbing or electrical work.'; esLead='Reparamos agujeros, grietas, daños por agua y aberturas causadas por trabajos de plomería o electricidad.'; enBody='We prepare damaged areas, patch the surface and blend the finish so it is ready for paint. Clear photos can help us begin a free estimate before an in-person visit is needed.'; esBody='Preparamos el área dañada, colocamos el parche y uniformamos el acabado para dejarlo listo para pintura. Fotos claras pueden ayudarnos a iniciar el estimado antes de una visita.'},
  @{ en='interior-framing'; es='framing-interior'; enName='Interior Framing'; esName='Framing Interior'; enLead='Interior framing and carpentry for basements, partition walls, soffits, bulkheads and remodeling.'; esLead='Framing interior y carpintería para sótanos, muros divisorios, soffits, bulkheads y remodelaciones.'; enBody='A coordinated framing-to-drywall workflow helps keep walls, ceilings and custom features ready for the next trade. Small-scale structural remodeling is reviewed according to project scope.'; esBody='Un proceso coordinado de framing a drywall ayuda a preparar muros, plafones y detalles personalizados para la siguiente etapa. Revisamos remodelaciones estructurales pequeñas según el alcance.'},
  @{ en='painting'; es='pintura'; enName='Interior Painting'; esName='Pintura Interior'; enLead='Surface preparation and interior painting that completes a smooth drywall finish.'; esLead='Preparación de superficies y pintura interior para completar un acabado liso de drywall.'; enBody='Our painting work focuses on careful preparation and a clean final appearance. Combining drywall repair, finishing and paint with one crew simplifies scheduling and responsibility.'; esBody='Nuestro trabajo de pintura se enfoca en una preparación cuidadosa y una apariencia final limpia. Combinar reparación, acabado y pintura con un equipo simplifica el calendario.'},
  @{ en='frp-installation'; es='instalacion-frp'; enName='FRP Installation'; esName='Instalación de FRP'; enLead='Moisture-resistant FRP wall panels and trim for commercial and sanitary environments.'; esLead='Paneles y molduras FRP resistentes a la humedad para ambientes comerciales y sanitarios.'; enBody='We prepare the substrate, install fiberglass reinforced plastic panels and complete the required trim. FRP is commonly selected where walls need a durable, washable surface.'; esBody='Preparamos la superficie, instalamos paneles de plástico reforzado con fibra de vidrio y colocamos las molduras necesarias. FRP se utiliza donde se requiere una superficie durable y lavable.'}
)

function PageHtml($lang,$title,$description,$path,$altPath,$heading,$lead,$body,$cards) {
  $isEs = $lang -eq 'es'
  $homeUrl = if($isEs){'/es/'}else{'/'}
  $quoteUrl = if($isEs){'/es/cotizacion/'}else{'/#contacto'}
  $servicesUrl = if($isEs){'/es/#servicios'}else{'/#servicios'}
  $schemaType = if($path -in @('/es/','/services/','/es/servicios/','/service-areas/','/es/areas-de-servicio/')){'WebPage'}else{'Service'}
  $schemaJson = if($schemaType -eq 'Service') {
    "{`"@context`":`"https://schema.org`",`"@type`":`"Service`",`"name`":`"$heading`",`"provider`":{`"@type`":`"HomeAndConstructionBusiness`",`"name`":`"True Craft Interiors`",`"telephone`":`"+1-708-983-8587`",`"url`":`"$domain/`"},`"areaServed`":[`"Chicagoland`",`"Chicago South Suburbs`",`"Hammond, Indiana`",`"Crown Point, Indiana`",`"Valparaiso, Indiana`"]}"
  } else {
    "{`"@context`":`"https://schema.org`",`"@type`":`"WebPage`",`"name`":`"$heading`",`"url`":`"$domain$path`",`"inLanguage`":`"$(if($isEs){'es-US'}else{'en-US'})`",`"about`":{`"@type`":`"HomeAndConstructionBusiness`",`"name`":`"True Craft Interiors`",`"url`":`"$domain/`"}}"
  }
  $servicesLabel = if($isEs){'Servicios'}else{'Services'}
  $areasLabel = if($isEs){'Áreas de servicio'}else{'Service Areas'}
  $quote = if($isEs){'Cotización gratis'}else{'Free Quote'}
  $aboutHeading = if($isEs){'Trabajo limpio, comunicación clara'}else{'Clean work, clear communication'}
  $about = if($isEs){'True Craft Interiors sirve Chicagoland, los suburbios del sur y áreas seleccionadas del noroeste de Indiana. Negocio familiar desde 2010, con más de 25 años de experiencia práctica, equipo bilingüe, seguro completo y garantía de 1 año en mano de obra.'}else{'True Craft Interiors serves Chicagoland, the south suburbs and select Northwest Indiana areas. Family-rooted since 2010, with 25+ years of practical experience, a bilingual crew, full insurance and a 1-year workmanship warranty.'}
  $process = if($isEs){'<li>Envíanos los detalles y hasta 3 fotos.</li><li>Recibe un estimado gratis normalmente en 1–2 días hábiles.</li><li>Para proyectos grandes, coordinamos una visita.</li>'}else{'<li>Send project details and up to 3 photos.</li><li>Receive a free estimate, normally within 1–2 business days.</li><li>For larger projects, we arrange an in-person visit.</li>'}
  $langLink = if($isEs){"<a href='$altPath' hreflang='en-US'>English</a>"}else{"<a href='$altPath' hreflang='es-US'>Español</a>"}
  $cardsHtml = ($cards | ForEach-Object { "<article class='card'><h3>$($_.name)</h3><p>$($_.text)</p><a href='$($_.url)'>$servicesLabel →</a></article>" }) -join "`n"
  return @"
<!doctype html><html lang="$lang"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>$title</title><meta name="description" content="$description"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="$domain$path"><link rel="alternate" hreflang="$(if($isEs){'es-US'}else{'en-US'})" href="$domain$path"><link rel="alternate" hreflang="$(if($isEs){'en-US'}else{'es-US'})" href="$domain$altPath"><link rel="alternate" hreflang="x-default" href="$domain$(if($isEs){$altPath}else{$path})"><link rel="icon" type="image/png" href="/assets/logo.png"><link rel="shortcut icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/assets/logo.png"><meta name="theme-color" content="#121212"><meta property="og:type" content="website"><meta property="og:title" content="$title"><meta property="og:description" content="$description"><meta property="og:url" content="$domain$path"><meta property="og:image" content="$domain/assets/logo.png"><link rel="stylesheet" href="/assets/css/seo-pages.css"><link rel="stylesheet" href="/assets/css/mobile-fixes.css"><script type="application/ld+json">$schemaJson</script></head><body><header class="site-header"><div class="wrap nav"><a class="brand" href="$homeUrl"><img src="/assets/logo.png" alt="True Craft Interiors logo"><span>TRUE CRAFT INTERIORS</span></a><nav class="nav-links"><a href="$servicesUrl">$servicesLabel</a><a href="$(if($isEs){'/es/areas-de-servicio/'}else{'/service-areas/'})">$areasLabel</a>$langLink<a class="button" href="$quoteUrl">$quote</a></nav></div></header><main><section class="hero"><div class="wrap"><div class="crumbs"><a href="$homeUrl">True Craft Interiors</a> / $heading</div><span class="eyebrow">Chicagoland · Northwest Indiana</span><h1>$heading</h1><p>$lead</p><div class="actions"><a class="button" href="$quoteUrl">$quote</a><a class="button alt" href="tel:17089838587">(708) 983-8587</a></div></div></section><section class="section"><div class="wrap two"><div><h2>$aboutHeading</h2><p>$body</p><p>$about</p></div><aside class="card"><h2>$(if($isEs){'Cómo comenzar'}else{'How to start'})</h2><ol class="list">$process</ol></aside></div></section>$(if($cardsHtml){"<section class='section facts' id='servicios'><div class='wrap'><h2>$servicesLabel</h2><div class='grid'>$cardsHtml</div></div></section>"})</main><section class="contact" id="contacto"><div class="wrap"><h2>$(if($isEs){'Cuéntanos sobre tu proyecto'}else{'Tell us about your project'})</h2><p><a href="$quoteUrl">$quote</a> · <a href="tel:17089838587">(708) 983-8587</a> · <a href="mailto:truecraftinteriors1@gmail.com">truecraftinteriors1@gmail.com</a></p></div></section><footer class="footer"><div class="wrap footer-row"><span>© 2026 True Craft Interiors</span><span>$(if($isEs){'7:00 AM–7:00 PM · Inglés y español'}else{'7:00 AM–7:00 PM · English & Spanish'})</span></div></footer></body></html>
"@
}

$enCards = $services | ForEach-Object { @{name=$_.enName;text=$_.enLead;url="/$($_.en)/"} }
$esCards = $services | ForEach-Object { @{name=$_.esName;text=$_.esLead;url="/es/$($_.es)/"} }

foreach($s in $services){
  $enPath="/$($s.en)/"; $esPath="/es/$($s.es)/"
  $enDir=Join-Path $root $s.en; $esDir=Join-Path $root "es/$($s.es)"
  New-Item -ItemType Directory -Force -Path $enDir,$esDir | Out-Null
  [IO.File]::WriteAllText((Join-Path $enDir 'index.html'),(PageHtml 'en' "$($s.enName) in Chicagoland | True Craft Interiors" "$($s.enLead) Free estimates from True Craft Interiors." $enPath $esPath $s.enName $s.enLead $s.enBody @()),[Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText((Join-Path $esDir 'index.html'),(PageHtml 'es' "$($s.esName) en Chicagoland | True Craft Interiors" "$($s.esLead) Estimados gratis con True Craft Interiors." $esPath $enPath $s.esName $s.esLead $s.esBody @()),[Text.UTF8Encoding]::new($false))
}

$servicesDir=Join-Path $root 'services'; $esServicesDir=Join-Path $root 'es/services-temp'; New-Item -ItemType Directory -Force -Path $servicesDir | Out-Null
[IO.File]::WriteAllText((Join-Path $servicesDir 'index.html'),(PageHtml 'en' 'Drywall & Interior Services | True Craft Interiors' 'Explore drywall installation, finishing, repair, framing, painting and FRP services for homes and businesses across Chicagoland and Northwest Indiana.' '/services/' '/es/servicios/' 'Drywall & Interior Services' 'One dependable bilingual crew for residential, commercial and remodeling projects.' 'Choose a service below for details. Free estimates are normally prepared within 1–2 business days.' $enCards),[Text.UTF8Encoding]::new($false))
$esServicesDir=Join-Path $root 'es/servicios'; New-Item -ItemType Directory -Force -Path $esServicesDir | Out-Null
[IO.File]::WriteAllText((Join-Path $esServicesDir 'index.html'),(PageHtml 'es' 'Servicios de Drywall e Interiores | True Craft Interiors' 'Servicios de instalación, acabado y reparación de drywall, framing, pintura y FRP para hogares y negocios en Chicagoland y el noroeste de Indiana.' '/es/servicios/' '/services/' 'Servicios de Drywall e Interiores' 'Un equipo bilingüe para proyectos residenciales, comerciales y remodelaciones.' 'Selecciona un servicio para conocer los detalles. Los estimados gratis normalmente se preparan en 1–2 días hábiles.' $esCards),[Text.UTF8Encoding]::new($false))

$areaEn=Join-Path $root 'service-areas'; $areaEs=Join-Path $root 'es/areas-de-servicio'; New-Item -ItemType Directory -Force -Path $areaEn,$areaEs | Out-Null
[IO.File]::WriteAllText((Join-Path $areaEn 'index.html'),(PageHtml 'en' 'Drywall Service Areas | Chicagoland & Northwest Indiana' 'True Craft Interiors provides drywall and interior services across Chicagoland, the Chicago south suburbs, Hammond, Crown Point and Valparaiso.' '/service-areas/' '/es/areas-de-servicio/' 'Drywall Service Areas' 'Serving Chicagoland, the south suburbs and select Northwest Indiana communities.' 'Our stated service area includes Chicagoland, the Chicago south suburbs, Hammond, Crown Point and Valparaiso. Contact us with your project location so we can confirm availability.' @()),[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $areaEs 'index.html'),(PageHtml 'es' 'Áreas de Servicio de Drywall | Chicagoland e Indiana' 'True Craft Interiors ofrece servicios de drywall e interiores en Chicagoland, los suburbios del sur, Hammond, Crown Point y Valparaiso.' '/es/areas-de-servicio/' '/service-areas/' 'Áreas de Servicio de Drywall' 'Servimos Chicagoland, los suburbios del sur y comunidades seleccionadas del noroeste de Indiana.' 'Nuestra área incluye Chicagoland, los suburbios del sur de Chicago, Hammond, Crown Point y Valparaiso. Contáctanos con la ubicación del proyecto para confirmar disponibilidad.' @()),[Text.UTF8Encoding]::new($false))

# ---------------------------------------------------------------------------
# Diccionario español
# Lee I18N.es desde assets/js/translations.js. Es la MISMA fuente que usa el
# navegador, asi que el HTML generado y la traduccion en vivo nunca se separan.
# ---------------------------------------------------------------------------
function Get-SpanishDictionary($translationsPath) {
  $js = [IO.File]::ReadAllText($translationsPath)
  $block = [regex]::Match($js, "(?s)\bes:\s*\{(.*?)\}\s*\};")
  if(-not $block.Success){ throw "generate-seo-pages: no se pudo leer el diccionario 'es' de $translationsPath" }
  $dict = @{}
  foreach($entry in [regex]::Matches($block.Groups[1].Value, "'([^']+)'\s*:\s*'([^']*)'")){
    $dict[$entry.Groups[1].Value] = $entry.Groups[2].Value
  }
  if($dict.Count -lt 120){ throw "generate-seo-pages: diccionario 'es' incompleto ($($dict.Count) claves). Revisa translations.js" }
  return $dict
}

# ---------------------------------------------------------------------------
# Escribe el texto español dentro del HTML.
# Los atributos data-i18n NO se eliminan: el conmutador de idioma sigue igual.
# El objetivo es que un rastreador que no ejecuta JavaScript lea /es/ en español.
# ---------------------------------------------------------------------------
function Write-SpanishFallbacks($html, $dict) {
  # 1. texto interno de cada elemento con data-i18n
  $rxText = [regex]'(?s)(?<open><(?<tag>\w+)[^>]*?\bdata-i18n="(?<key>[^"]+)"[^>]*?>)(?<inner>.*?)(?<close></\k<tag>>)'
  $found = $rxText.Matches($html)
  $applied = 0
  for($i = $found.Count - 1; $i -ge 0; $i--){
    $key = $found[$i].Groups['key'].Value
    if(-not $dict.ContainsKey($key)){ Write-Warning "data-i18n sin clave en el diccionario es: $key"; continue }
    $inner = $found[$i].Groups['inner']
    $html = $html.Substring(0, $inner.Index) + $dict[$key] + $html.Substring($inner.Index + $inner.Length)
    $applied++
  }

  # 2. atributo placeholder de cada elemento con data-i18n-placeholder
  $rxPlaceholderTag = [regex]'(?s)<[^>]*?\bdata-i18n-placeholder="(?<key>[^"]+)"[^>]*?>'
  $rxPlaceholderAttr = [regex]'placeholder="[^"]*"'
  $found = $rxPlaceholderTag.Matches($html)
  for($i = $found.Count - 1; $i -ge 0; $i--){
    $key = $found[$i].Groups['key'].Value
    if(-not $dict.ContainsKey($key)){ Write-Warning "data-i18n-placeholder sin clave: $key"; continue }
    $tag = $rxPlaceholderAttr.Replace($found[$i].Value, ('placeholder="' + $dict[$key] + '"'), 1)
    $html = $html.Substring(0, $found[$i].Index) + $tag + $html.Substring($found[$i].Index + $found[$i].Length)
    $applied++
  }

  Write-Host "  es/index.html: $applied textos traducidos desde el diccionario"
  return $html
}

# ---------------------------------------------------------------------------
# Cadenas que el traductor en vivo nunca toca: aria-label, alt, title,
# captions de la galeria y los valores por defecto de la tarjeta de reseña.
# Si alguna deja de encontrarse es que index.html cambio: el script avisa.
# ---------------------------------------------------------------------------
$spanishAttributeOverrides = @(
  @{ from = 'aria-label="Open image: room framing and insulation preparation before drywall"'; to = 'aria-label="Abrir imagen: preparación de framing y aislamiento antes de drywall"' }
  @{ from = 'data-gallery-caption="Framing &amp; Insulation"'; to = 'data-gallery-caption="Framing &amp; Aislamiento"' }
  @{ from = 'aria-label="Open image: room with drywall installation in progress"'; to = 'aria-label="Abrir imagen: habitación con instalación de drywall en proceso"' }
  @{ from = 'data-gallery-caption="Drywall Installation"'; to = 'data-gallery-caption="Instalación de Drywall"' }
  @{ from = 'aria-label="Open image: finished ceiling and interior finish details"'; to = 'aria-label="Abrir imagen: techo terminado y detalles de acabado interior"' }
  @{ from = 'data-gallery-caption="Finish Details"'; to = 'data-gallery-caption="Detalles de Acabado"' }
  @{ from = 'aria-label="Open image: room boarded with drywall during installation"'; to = 'aria-label="Abrir imagen: habitación con drywall instalado durante el proceso"' }
  @{ from = 'data-gallery-caption="Boarded Room"'; to = 'data-gallery-caption="Habitación con Drywall"' }
  @{ from = 'aria-label="Open image: ceiling taping and drywall finishing in progress"'; to = 'aria-label="Abrir imagen: cinta y acabado de techo en proceso"' }
  @{ from = 'data-gallery-caption="Ceiling Taping"'; to = 'data-gallery-caption="Cinta en Techo"' }
  @{ from = 'aria-label="Open image: commercial drywall finishing with exposed ceiling"'; to = 'aria-label="Abrir imagen: acabado de drywall comercial con techo expuesto"' }
  @{ from = 'data-gallery-caption="Commercial Drywall"'; to = 'data-gallery-caption="Drywall Comercial"' }
  @{ from = 'aria-label="Open review project image"'; to = 'aria-label="Abrir foto del proyecto de la reseña"' }
  @{ from = 'alt="Project review photo: drywall installation in a room with wood flooring"'; to = 'alt="Foto de proyecto: instalación de drywall en habitación con piso de madera"' }
  @{ from = '<span id="tName">J.R. &middot; South Suburbs</span>'; to = '<span id="tName">J.R. &middot; Suburbios del Sur</span>' }
  @{ from = '<div class="t-job" id="tJob">Room drywall installation</div>'; to = '<div class="t-job" id="tJob">Instalación de drywall en habitación</div>' }
  @{ from = '<p id="tQuote">&quot;The crew left the area clean every day, explained the timeline clearly, and the drywall finish was ready for paint without issues.&quot;</p>'; to = '<p id="tQuote">&quot;El equipo dejó el área limpia todos los días, explicó el calendario con claridad y el acabado de drywall quedó listo para pintar sin problemas.&quot;</p>' }
  @{ from = '<div class="who" id="tWho">Homeowner</div>'; to = '<div class="who" id="tWho">Propietario</div>' }
  @{ from = 'aria-label="Review 1"'; to = 'aria-label="Reseña 1"' }
  @{ from = 'aria-label="Review 2"'; to = 'aria-label="Reseña 2"' }
  @{ from = 'aria-label="Review 3"'; to = 'aria-label="Reseña 3"' }
  @{ from = 'aria-label="Previous image"'; to = 'aria-label="Imagen anterior"' }
  @{ from = 'aria-label="Next image"'; to = 'aria-label="Imagen siguiente"' }
  @{ from = '<div class="il-caption" id="ilCaption">Project photo</div>'; to = '<div class="il-caption" id="ilCaption">Foto del proyecto</div>' }
  @{ from = 'alt="Expanded project review image"'; to = 'alt="Imagen ampliada del proyecto"' }
  @{ from = 'aria-label="Close image"'; to = 'aria-label="Cerrar imagen"' }
  @{ from = 'aria-label="Close menu"'; to = 'aria-label="Cerrar menú"' }
  @{ from = 'aria-label="Open menu"'; to = 'aria-label="Abrir menú"' }
  @{ from = 'aria-label="Close video"'; to = 'aria-label="Cerrar video"' }
  @{ from = 'aria-label="Dismiss"'; to = 'aria-label="Cerrar"' }
  @{ from = 'title="True Craft Interiors service area map"'; to = 'title="Mapa del área de servicio de True Craft Interiors"' }
)

$esHome=Join-Path $root 'es'; New-Item -ItemType Directory -Force -Path $esHome | Out-Null
$spanishHome = [IO.File]::ReadAllText((Join-Path $root 'index.html'))
$spanishHome = $spanishHome.Replace('<html lang="en">','<html lang="es">')
$spanishHome = [regex]::Replace($spanishHome,'<title>.*?</title>','<title>Contratista de Drywall en Chicagoland | True Craft Interiors</title>',1)
$spanishHome = [regex]::Replace($spanishHome,'<meta name="description"\s+content="[^"]*">','<meta name="description" content="Contratista bilingüe de drywall, acabado, reparación, framing, pintura y FRP para hogares y negocios en Chicagoland y el noroeste de Indiana.">',1)
$spanishHome = $spanishHome.Replace('<link rel="canonical" href="https://truecraftinteriorschicago.com/">','<link rel="canonical" href="https://truecraftinteriorschicago.com/es/">')
$spanishHome = $spanishHome.Replace('<meta property="og:locale" content="en_US">','<meta property="og:locale" content="es_US">')
$spanishHome = $spanishHome.Replace('<meta property="og:locale:alternate" content="es_US">','<meta property="og:locale:alternate" content="en_US">')
$spanishHome = [regex]::Replace($spanishHome,'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="Contratista de Drywall en Chicagoland | True Craft Interiors">',1)
$spanishHome = [regex]::Replace($spanishHome,'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="Instalación, acabado y reparación de drywall, framing, pintura y FRP en Chicagoland y áreas seleccionadas del noroeste de Indiana.">',1)
$spanishHome = $spanishHome.Replace('<meta property="og:url" content="https://truecraftinteriorschicago.com/">','<meta property="og:url" content="https://truecraftinteriorschicago.com/es/">')
$esDictionary = Get-SpanishDictionary (Join-Path $root 'assets/js/translations.js')
$spanishHome = Write-SpanishFallbacks $spanishHome $esDictionary
$missingOverrides = 0
foreach($override in $spanishAttributeOverrides){
  if(-not $spanishHome.Contains($override.from)){
    Write-Warning "cadena no encontrada en index.html, revisar: $($override.from)"
    $missingOverrides++
    continue
  }
  $spanishHome = $spanishHome.Replace($override.from, $override.to)
}
Write-Host "  es/index.html: $($spanishAttributeOverrides.Count - $missingOverrides)/$($spanishAttributeOverrides.Count) cadenas de atributos traducidas"
if($spanishHome -match 'data-i18n="[^"]+">\s*(Services|About|Gallery|Reviews|Contact|Free Quote)\s*<'){
  Write-Warning "es/index.html quedo con texto en ingles en el HTML. Revisa el diccionario."
}
[IO.File]::WriteAllText((Join-Path $esHome 'index.html'),$spanishHome,[Text.UTF8Encoding]::new($false))
