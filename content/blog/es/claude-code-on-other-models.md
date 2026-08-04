---
title: "Conservar el arnés, cambiar el modelo"
description: "Lo que hace falta para ejecutar Claude Code contra NVIDIA NIM y modelos locales de Ollama cuando se agota la cuota de la suscripción, y por qué el modelo que mejor puntúa en los benchmarks no es el que funciona."
date: "2026-07-25"
tags: ["claude-code", "litellm", "local-llm", "tooling"]
---

Lo que merece la pena conservar de Claude Code no es el modelo. Es el arnés: el
bucle de herramientas, la edición de ficheros, los avisos de permisos, la forma
en que lee un repositorio antes de tocarlo. Así que cuando la cuota Pro se agota
a media tarde, la pregunta honesta no es «qué modelo está a la altura de
Claude», la pregunta real es **¿puedo quedarme con mi arnés favorito y
apuntarlo a otro sitio hasta que la cuota se reinicie?**

La respuesta es sí, en Windows, con un proxy en medio. Pero antes se cruzan dos
obstáculos, y conviene entender ambos antes de instalar nada, porque condicionan
todo el montaje.

## Los dos obstáculos

Lo primero: **Claude Code solo habla la Messages API de Anthropic.** NVIDIA NIM y
Ollama hablan el formato de OpenAI. Nada dentro de Claude Code traduce entre
ellos, así que algo tiene que ponerse en medio y reescribir peticiones y
respuestas sobre la marcha. [LiteLLM](https://github.com/BerriAI/litellm) es la
respuesta estándar: lo ejecutas como proxy local, apuntas `ANTHROPIC_BASE_URL`
ahí en lugar de a `api.anthropic.com`, y se encarga tanto de la traducción como
del enrutado de modelos.

Y algo importante: **una suscripción Pro no es una API key.** Esto es lo que
rompe el plan evidente. Claude Code se autentica contra tu cuenta de Anthropic
por OAuth, no con una clave que puedas entregarle al proxy. En el momento en que
defines `ANTHROPIC_BASE_URL`, Claude Code deja de hablar con Anthropic por
completo, así que no hay manera de montar una única cadena que consuma primero
la cuota de la suscripción y desborde después hacia NIM. Sencillamente, la cuota
no es alcanzable desde el proxy.

Lo que sí puedes montar son dos lanzadores: `claude` (el original, intacto, para
la suscripción) y un `claude-alt` aparte que arranca contra NIM con respaldos
locales. Cambias escribiendo un comando distinto, y ese paso manual no es una
limitación del montaje: es el único sitio donde puede vivir la frontera (y
además cumple con los términos de uso de Anthropic).

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 420" role="img" aria-labelledby="d-nim-title d-nim-desc" preserveAspectRatio="xMidYMid meet">
  <title id="d-nim-title">Dos lanzadores: la ruta de la suscripción y la ruta de respaldo con proxy</title>
  <desc id="d-nim-desc">El comando claude normal se autentica por OAuth directamente contra api.anthropic.com y consume la cuota Pro, sin proxy de por medio. Un segundo lanzador, claude-alt, define ANTHROPIC_BASE_URL apuntando a un proxy local de LiteLLM en el puerto 4000, que traduce entre los formatos de Anthropic y OpenAI y enruta hacia una cadena ordenada de respaldos: primero NVIDIA NIM, después un modelo local qwen3 en Ollama y, como último recurso, un modelo local gemma4 en Ollama.</desc>
  <defs>
    <marker id="arw-nim" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="104" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · RUTA DE SUSCRIPCIÓN — INTACTA</text>
  <rect x="24" y="44" width="200" height="48" class="d-box" />
  <text x="124" y="68" class="d-label" text-anchor="middle">CLAUDE CODE · claude</text>
  <text x="124" y="85" class="d-sub" text-anchor="middle">OAuth · plan Pro</text>
  <path d="M224 68 H 264" class="d-flow" marker-end="url(#arw-nim)" />
  <rect x="268" y="44" width="200" height="48" class="d-box" />
  <text x="368" y="68" class="d-label" text-anchor="middle">API.ANTHROPIC.COM</text>
  <text x="368" y="85" class="d-sub" text-anchor="middle">hasta agotar la cuota</text>
  <text x="484" y="63" class="d-sub">sin proxy,</text>
  <text x="484" y="78" class="d-sub">sin config</text>

  <rect x="8" y="120" width="624" height="292" class="d-band" />
  <text x="20" y="140" class="d-band-label">B · RUTA DE RESPALDO — claude-alt</text>
  <rect x="24" y="156" width="200" height="52" class="d-box" />
  <text x="124" y="180" class="d-label" text-anchor="middle">CLAUDE CODE · claude-alt</text>
  <text x="124" y="197" class="d-sub" text-anchor="middle">ANTHROPIC_BASE_URL → :4000</text>
  <path d="M224 182 H 264" class="d-flow" marker-end="url(#arw-nim)" />
  <rect x="268" y="156" width="200" height="52" class="d-box" />
  <text x="368" y="180" class="d-label" text-anchor="middle">PROXY LITELLM :4000</text>
  <text x="368" y="197" class="d-sub" text-anchor="middle">anthropic ⇄ openai</text>
  <text x="484" y="175" class="d-sub">reescribe el</text>
  <text x="484" y="190" class="d-sub">formato</text>

  <path d="M368 208 V 218 H 320 V 228" class="d-flow" marker-end="url(#arw-nim)" />

  <rect x="140" y="228" width="360" height="44" class="d-box" />
  <text x="320" y="248" class="d-label" text-anchor="middle">1 · NVIDIA NIM — nim-primary</text>
  <text x="320" y="264" class="d-sub" text-anchor="middle">remoto · endpoint compatible con OpenAI</text>
  <path d="M320 272 V 292" class="d-flow d-dashed" marker-end="url(#arw-nim)" />
  <text x="332" y="287" class="d-sub">429 · 402 · reintentos agotados</text>

  <rect x="140" y="292" width="360" height="44" class="d-box" />
  <text x="320" y="312" class="d-label" text-anchor="middle">2 · OLLAMA — qwen3:30b-a3b</text>
  <text x="320" y="328" class="d-sub" text-anchor="middle">local</text>
  <path d="M320 336 V 356" class="d-flow d-dashed" marker-end="url(#arw-nim)" />
  <text x="332" y="351" class="d-sub">mismo disparador</text>

  <rect x="140" y="356" width="360" height="44" class="d-box" />
  <text x="320" y="376" class="d-label" text-anchor="middle">3 · OLLAMA — gemma4:12b</text>
  <text x="320" y="392" class="d-sub" text-anchor="middle">local · último recurso</text>
</svg>
<figcaption>fig. 1 — Dos lanzadores. La ruta de la suscripción nunca se entera de que el proxy existe.</figcaption>
</figure>

## La configuración de enrutado

Todo el comportamiento de respaldo cabe en unas veinte líneas de YAML. El router
de LiteLLM reintenta el modelo primario `num_retries` veces y después recorre la
cadena en orden, que es exactamente el fallo que te importa: NVIDIA NIM
devolviendo un 429 o un 402 cuando se acaban los créditos.

```yaml
model_list:
  - model_name: nim-primary
    litellm_params:
      model: nvidia_nim/<etiqueta-exacta-de-la-model-card>
      api_key: os.environ/NVIDIA_NIM_API_KEY

  - model_name: qwen3-local
    litellm_params:
      model: ollama_chat/qwen3:30b-a3b
      api_base: http://localhost:11434

  - model_name: gemma4-local
    litellm_params:
      model: ollama_chat/gemma4:12b
      api_base: http://localhost:11434

litellm_settings:
  drop_params: true      # descarta en silencio los parámetros que el backend rechaza

router_settings:
  num_retries: 2
  fallbacks: [{"nim-primary": ["qwen3-local", "gemma4-local"]}]
```

Dos detalles que me costaron tiempo.
1. `drop_params: true` no es opcional. Claude Code envía parámetros específicos
de Anthropic que los backends con forma de OpenAI rechazan de plano, y sin esa
opción toda petición falla nada más llegar.
2. Las etiquetas de Ollama usan dos puntos (`qwen3:30b-a3b`), no los guiones que
supondrías por el nombre comercial del modelo; una etiqueta equivocada aparece
como un 404 confuso del router en lugar de un «modelo no encontrado».

El lanzador es una función de PowerShell en `$PROFILE` que arranca el proxy si el
puerto está libre y después ejecuta Claude Code contra él:

```powershell
function claude-alt {
    if (-not (Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue)) {
        Start-Process -WindowStyle Hidden -FilePath "litellm" `
            -ArgumentList '--config','C:\claude-proxy\litellm.config.yaml','--port','4000'
        Start-Sleep -Seconds 3
    }
    $env:ANTHROPIC_BASE_URL = "http://localhost:4000"
    $env:ANTHROPIC_AUTH_TOKEN = "sk-anything"   # el proxy no lo comprueba
    $env:ANTHROPIC_MODEL = "nim-primary"
    claude @args
}
```

## La puntuación del benchmark es la señal equivocada

Esta es la parte que me habría gustado saber desde el principio. Empecé con un
modelo de razonamiento de lo más alto de la clasificación en NVIDIA NIM (Deepseek
V4 Pro), y Claude Code fallaba constantemente con `input JSON failed to parse`.
Básicamente, el arnés no era capaz de leer las llamadas a herramientas que le
llegaban de vuelta. El modelo era, según cualquier benchmark de código, la
opción más potente del catálogo.

Resultó que eso daba igual. De lo que depende Claude Code no es de la
profundidad de razonamiento, sino de **que el modelo emita JSON de llamada a
herramientas limpio y bien formado, de forma consistente, a través de una capa
de traducción de formato.** Son habilidades distintas, y no están correlacionadas
como te gustaría. Un modelo que razona de maravilla en prosa y emite argumentos
de función ligeramente malformados no sirve de nada aquí; un modelo más flojo
con una salida estructurada disciplinada funciona bien.

Así que el criterio de selección se vuelve estrecho y práctico:

- Prefiere modelos construidos explícitamente para **function calling agéntico**
  antes que modelos bien situados en benchmarks generales de código.
- Prefiere modelos cuyo proveedor ya ofrezca soporte del formato de Anthropic:
  se han ejercitado contra exactamente este puente.
- Trata los modelos nativos del proveedor en una plataforma dada como la opción
  de menos sorpresas; suelen cruzar la capa de traducción sin rarezas.
- Verifica la etiqueta exacta del modelo en su propia model card antes de
  pegarla en la configuración. Los nombres del catálogo cambian, y aparecen
  avisos de obsolescencia en etiquetas que todavía resuelven.

El mismo orden aplica a los respaldos locales. Qwen3 en 30B es un trabajador
agéntico creíble sobre una GPU de estación de trabajo. Gemma es un buen modelo
que es notablemente más flojo en llamada a herramientas, y precisamente por eso
va el último de la cadena en vez del segundo. El orden de respaldo debería
seguir la fiabilidad de la salida estructurada, no la capacidad general.

## Dos trampas operativas

**El proxy sobrevive a tus cambios.** Como el lanzador solo arranca LiteLLM
cuando el puerto 4000 está cerrado, un proxy ya en marcha sigue sirviendo la
configuración antigua para siempre. Cambias el modelo en el YAML, relanzas
`claude-alt` y no cambia nada, lo cual parece un error de configuración y en
realidad es un problema de ciclo de vida de proceso. La solución es una función
de recarga que mate por puerto y no por nombre de proceso, para no llevarse por
delante otros Python ajenos:

```powershell
function Restart-LiteLLM {
    Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
    Start-Sleep -Seconds 1
    Start-Process -WindowStyle Hidden -FilePath "litellm" `
        -ArgumentList '--config','C:\claude-proxy\litellm.config.yaml','--port','4000'
}
```

Además, **ejecútalo visible mientras estés ajustando.** El modo oculto en segundo
plano está bien para el uso diario y está mal para la semana que pasas eligiendo
modelo. Arráncalo en una ventana real con `--detailed_debug` y podrás ver llegar
las llamadas a herramientas y comprobar si el JSON malformado viene del modelo o
de la traducción. Además convierte el «recargar» de nuevo en un Ctrl+C.

## ¿Merece la pena?

Para lo que es, sí. Pero con las expectativas bien puestas.

Esto no sustituye a Claude. Es una forma de seguir trabajando en un arnés que
conozco cuando la cuota se ha ido, en tareas que son sobre todo mecánicas:
renombrar cosas entre ficheros, escribir tests siguiendo un patrón existente,
rellenar boilerplate, leer código y responder preguntas sobre él. Para cualquier
cosa que requiera razonamiento sostenido de varios pasos sobre una base de
código desconocida, la caída es real y la notarás en unos pocos turnos.

El valor inesperado fue diagnóstico. Ver fallar a un buen modelo en la llamada a
herramientas dejó claro cuánto de la utilidad de Claude Code es el arnés más un
modelo entrenado específicamente para alimentarlo con salida estructurada bien
formada, y qué poco de eso aparece en el número del benchmark que todo el mundo
cita.
