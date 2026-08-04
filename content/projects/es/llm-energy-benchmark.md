---
title: "Arquitectura multiagente para medir el consumo energético de LLMs según las técnicas de prompting y la longitud de contexto"
summary: "El prompt engineering optimiza la calidad de la respuesta e ignora la factura energética. Este arnés multiagente midió 2.700 inferencias de LLM para ponerle un número al compromiso."
stack: ["Python", "LangGraph", "Anthropic API", "Ollama", "CodeCarbon", "EcoLogits", "SQLite", GreenAI]
date: "2026-06-14"
repo: "https://github.com/lepablito/TFM_UOC_PabloMarcosParra"
featured: true
order: 1
---

## Problema

Todas las guías de prompt engineering optimizan la misma variable: la calidad de
la respuesta. Añade ejemplos, pide al modelo que piense paso a paso, dale más
contexto. Ninguna informa del otro lado del balance. La cadena de pensamiento
produce respuestas más largas y, con ellas, *inferencias* más largas, y la
inferencia es donde los LLMs gastan la mayor parte de su energía a escala.

La pregunta que este proyecto se propuso responder es lo bastante estrecha como
para ser medible: ¿cuánta energía extra cuesta una técnica de prompting, y la
calidad que compra lo justifica? Responder eso con honestidad implica medir
energía y calidad en las mismas ejecuciones, sobre modelos que no se parecen en
nada, desde un modelo de 3B en una GPU local hasta un endpoint API de frontera
cuyas tripas son invisibles.

Este fue mi Trabajo de Fin de Máster en Ciencia de Datos en la Universitat Oberta
de Catalunya (tutor: Josep-Anton Mir Tutusaus), defendido en junio de 2026.

## Arquitectura

El sistema es un arnés multiagente orquestado con LangGraph y dividido en tres
fases. Esa división sostiene todo el diseño: el no determinismo del LLM queda
confinado a una fase de preprocesado que se ejecuta una sola vez y escribe su
salida a disco, de modo que el bucle experimental reproduce prompts idénticos en
todas las repeticiones.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 552" role="img" aria-labelledby="d1-title d1-desc" preserveAspectRatio="xMidYMid meet">
  <title id="d1-title">Arquitectura en tres fases del arnés de medición energética</title>
  <desc id="d1-desc">El preprocesado genera prompts y rúbricas una sola vez con Claude Haiku y los almacena como artefactos. La fase de experimento en LangGraph despacha cada celda a las APIs remotas en paralelo y a los modelos locales de forma secuencial, mide ambos con EcoLogits y CodeCarbon, y puntúa cada respuesta con un juez ciego guiado por rúbrica (Claude Haiku, con un 13,3% de las ejecuciones repuntuadas por Claude Sonnet para validarlo) sobre SQLite. El posprocesado ejecuta ANOVA mixta y pruebas de Wilcoxon sobre las 2.700 ejecuciones almacenadas para producir las figuras y un informe de KPIs.</desc>
  <defs>
    <marker id="arw-tfm" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="120" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · PREPROCESADO · SE EJECUTA UNA VEZ</text>
  <rect x="24" y="44" width="188" height="30" class="d-box" />
  <text x="118" y="63" class="d-label" text-anchor="middle">ROUTER · HAIKU 4.5</text>
  <rect x="24" y="84" width="188" height="30" class="d-box" />
  <text x="118" y="103" class="d-label" text-anchor="middle">RÚBRICAS · HAIKU 4.5</text>
  <path d="M212 59 H 252" class="d-flow" marker-end="url(#arw-tfm)" />
  <path d="M212 99 H 252" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="256" y="44" width="200" height="70" class="d-box" />
  <text x="356" y="68" class="d-label" text-anchor="middle">ARTIFACTS/</text>
  <text x="356" y="85" class="d-sub" text-anchor="middle">12 variantes de prompt ×</text>
  <text x="356" y="100" class="d-sub" text-anchor="middle">15 instancias + rúbricas</text>
  <text x="472" y="75" class="d-sub">congelado en disco:</text>
  <text x="472" y="90" class="d-sub">en runtime es un lookup</text>

  <path d="M356 114 V 144" class="d-flow d-dashed" marker-end="url(#arw-tfm)" />

  <rect x="8" y="152" width="624" height="256" class="d-band" />
  <text x="20" y="172" class="d-band-label">B · EXPERIMENTO · LANGGRAPH</text>
  <rect x="236" y="188" width="168" height="30" class="d-box" />
  <text x="320" y="207" class="d-label" text-anchor="middle">DISPATCHER</text>
  <path d="M320 218 V 230 H 152 V 240" class="d-flow" marker-end="url(#arw-tfm)" />
  <path d="M320 218 V 230 H 488 V 240" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="24" y="240" width="256" height="48" class="d-box" />
  <text x="152" y="260" class="d-label" text-anchor="middle">FAN-OUT DE API · EN PARALELO</text>
  <text x="152" y="277" class="d-sub" text-anchor="middle">gemini-2.5-flash · gpt-5-mini</text>
  <rect x="360" y="240" width="256" height="48" class="d-box" />
  <text x="488" y="260" class="d-label" text-anchor="middle">COLA LOCAL · SECUENCIAL</text>
  <text x="488" y="277" class="d-sub" text-anchor="middle">llama-3.2-3b · mistral-7b · qwen-2.5-14b</text>
  <path d="M152 288 V 300" class="d-flow" marker-end="url(#arw-tfm)" />
  <path d="M488 288 V 300" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="24" y="300" width="592" height="30" class="d-box" />
  <text x="320" y="319" class="d-label" text-anchor="middle">TELEMETRÍA · ECOLOGITS (API) + CODECARBON (LOCAL)</text>
  <path d="M320 330 V 344" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="24" y="344" width="380" height="48" class="d-box" />
  <text x="214" y="365" class="d-label" text-anchor="middle">JUEZ · HAIKU 4.5</text>
  <text x="214" y="381" class="d-sub" text-anchor="middle">ciego a la técnica · puntuado por rúbrica</text>
  <path d="M404 368 H 428" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="432" y="344" width="184" height="48" class="d-box" />
  <text x="524" y="365" class="d-label" text-anchor="middle">VALIDACIÓN · SONNET 4.6</text>
  <text x="524" y="381" class="d-sub" text-anchor="middle">muestra 13,3% · ρ 0,948</text>

  <path d="M214 392 V 424" class="d-flow" marker-end="url(#arw-tfm)" />

  <rect x="8" y="432" width="624" height="112" class="d-band" />
  <text x="20" y="452" class="d-band-label">C · POSPROCESADO</text>
  <rect x="24" y="468" width="192" height="52" class="d-box" />
  <text x="120" y="492" class="d-label" text-anchor="middle">SQLITE</text>
  <text x="120" y="508" class="d-sub" text-anchor="middle">2.700 ejecuciones</text>
  <path d="M216 494 H 244" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="248" y="468" width="192" height="52" class="d-box" />
  <text x="344" y="492" class="d-label" text-anchor="middle">ANOVA MIXTA</text>
  <text x="344" y="508" class="d-sub" text-anchor="middle">wilcoxon · bonferroni</text>
  <path d="M440 494 H 468" class="d-flow" marker-end="url(#arw-tfm)" />
  <rect x="472" y="468" width="144" height="52" class="d-box" />
  <text x="544" y="492" class="d-label" text-anchor="middle">FIGURAS</text>
  <text x="544" y="508" class="d-sub" text-anchor="middle">+ informe de KPIs</text>
</svg>
<figcaption>fig. 1 · Arnés de tres fases. El no determinismo vive solo en la fase A.</figcaption>
</figure>

La rejilla experimental: tres tareas (resumen con XSum, generación de código con
HumanEval, razonamiento aritmético con GSM8K) × 5 instancias × 12 celdas (3
técnicas × 2 longitudes de contexto × 2 formatos sintácticos) × 5 modelos × 3
repeticiones = 2.700 inferencias evaluadas.

La medición hubo que dividirla por tipo de modelo, porque ninguna herramienta ve
las dos cosas. Los modelos locales corren a través de Ollama como proceso
externo, así que CodeCarbon se ejecuta en `tracking_mode='machine'` alrededor de
la llamada. Los modelos remotos son opacos, así que EcoLogits estima a partir del
recuento de tokens y de las características publicadas del modelo. Ambas medidas
no son intercambiables y nunca se comparan directamente: todos los modelos
estadísticos se ajustan por separado para API y para local.

El juez puntúa cada respuesta contra la rúbrica de su instancia, ciego a qué
técnica la produjo, con salida estructurada vía `tool_use`.

## Decisiones y compromisos

- El Router es un LLM en tiempo de preprocesado y una búsqueda en diccionario en
  tiempo de ejecución. Generar variantes de prompt sobre la marcha habría sido
  una demo de agentes más vistosa, pero entonces las tres repeticiones de cada
  celda habrían recibido tres prompts ligeramente distintos y la varianza no
  habría sido atribuible. El grafo en tiempo de ejecución es, por tanto, menos
  agéntico de lo que sugiere el diagrama de arquitectura, y es deliberado.
- Las rúbricas son semidinámicas: una estructura fija por tarea con huecos
  contextuales rellenados por un LLM. Rúbricas totalmente generadas puntuarían
  cada instancia en una escala distinta; unas totalmente estáticas puntuarían un
  resumen sin saber qué hechos importaban. Eso significa más piezas móviles que
  una única rúbrica global, a cambio de puntuaciones comparables entre celdas.
- El juez viene de una familia de modelos ausente del experimento. Anthropic
  juzga a OpenAI, a Google y a los modelos locales de pesos abiertos, así que
  ningún modelo puede preferir su propia salida, y un 13,3% de las ejecuciones se
  repuntuaron con un juez más potente para validar al barato. Funcionó, y salió
  caro: el metasistema acabó quemando más energía que todo lo que estaba midiendo.
- Sin enfriamientos térmicos entre ejecuciones; la temperatura de la GPU es una
  covariable en su lugar. Esperar a que la GPU volviera a su línea base entre
  inferencias habría añadido unas 13 horas a la ejecución. La temperatura hubo que
  modelarla en vez de controlarla, y el modelo le puso precio: +6,9% de energía
  por cada grado adicional, lo que convirtió un atajo operativo en un resultado.

## Métricas

Todas las cifras salen de la ejecución consolidada (`f3fb12ab-8bab-…`, 2.700
ejecuciones a lo largo de ~11 horas) y de los modelos estadísticos de la memoria,
capítulo 4.

| Métrica | Valor |
| ------- | ----- |
| Inferencias evaluadas | 2.700 · 100% juzgadas · 0 fallos no recuperados (182 reintentadas) |
| Energía: zero-shot vs CoT (API) | zero-shot consume el 33,5% de CoT |
| Energía: few-shot vs CoT (API) | few-shot consume el 31,4% de CoT |
| Energía: zero-shot vs CoT (local) | zero-shot consume el 50%; few-shot, el 64,6% |
| Tamaño del efecto, zero-shot vs CoT | *d* de Cohen = −0,485 (pequeño a medio), *p* < 1e−63 |
| Tamaño del efecto, zero-shot vs few-shot | *d* de Cohen = −0,071 (despreciable) |
| Calidad (juez, 0 a 100) | zero-shot 49,0 · few-shot 52,4 · CoT 53,1 |
| XML vs texto plano, contexto largo | −29,8% de energía |
| Dispersión entre modelos | gpt-5-mini ≈ 26% de gemini-2.5-flash para la misma celda |
| Temperatura de la GPU | +6,9% de energía por grado adicional |
| Acuerdo entre jueces (n = 359) | ρ de Spearman = 0,948 |
| Juez vs métrica objetiva | ρ = 0,868 (GSM8K) · 0,600 (HumanEval) · 0,467 (XSum) |
| Energía total contabilizada | 826,47 Wh · 143,16 g CO₂ |
| Parte del metasistema en ese total | 59,4% |

## Lecciones aprendidas

Few-shot es el valor por defecto honesto. Iguala a la cadena de pensamiento en
calidad para los modelos de API, donde la diferencia no es estadísticamente
significativa, y cuesta lo que cuesta zero-shot. La cadena de pensamiento compra
su calidad con un sobrecoste energético real y medible, y en los modelos locales
ese sobrecoste duplica el consumo. El consejo habitual de «añade razonamiento
paso a paso» no sale gratis, y ahora tiene un número al lado.

Medir costó más energía que lo medido. El juez y su pasada de validación
supusieron el 59,4% del consumo total. Es un resultado incómodo de publicar en
una tesis de Green AI, y contarlo es más útil que esconderlo: cualquier pipeline
de LLM-as-a-judge necesita su propio presupuesto de eficiencia, y el juez de
validación en particular merece una estrategia más barata.

Validar al juez es la mayor parte del trabajo. Tres capas independientes (acuerdo
entre jueces, correlación con métricas objetivas y una comprobación de sesgo por
verbosidad) pasaron todas salvo una: la kappa ponderada cuadrática para
`gsm8k.conciseness` se quedó en 0,187, muy por debajo del umbral de 0,4. Falló un
criterio de quince, y fingir lo contrario habría invalidado el resto. Resulta que
la concisión en respuestas aritméticas cortas es algo en lo que dos jueces
sencillamente no se ponen de acuerdo.

Qué haría distinto: cinco instancias por tarea son pocas para generalizar a nivel
de instancia, y entre diez y quince habrían sido mejores, escalando el coste
proporcionalmente. También añadiría TOON como tercer formato sintáctico. Si XML
ya recorta un 29,8% en contextos largos, una notación orientada a tokens es la
siguiente palanca evidente.

## Enlaces

- Código fuente, artefactos y datos: [github.com/lepablito/TFM_UOC_PabloMarcosParra](https://github.com/lepablito/TFM_UOC_PabloMarcosParra)
- Memoria completa (67 pp., PDF): [Arquitectura multiagente para la medición del impacto energético de las técnicas de prompting y la longitud de contexto en LLMs heterogéneos](/docs/tfm-pablo-marcos-parra.pdf)
