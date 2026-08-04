---
title: "Simulador de exámenes de certificación con un banco de preguntas original"
summary: "Prepararse una certificación te deja elegir entre diez preguntas oficiales de muestra y volcados de examen filtrados. Esto genera un banco original y ponderado por dominios a partir de las guías oficiales, y lo entrena con repetición espaciada."
stack: ["Python", "FastAPI", "SQLite", "Pydantic", "React 19", "TypeScript", "Vite", "Gemini API", "Anthropic API", "Ollama"]
date: "2026-07-09"
featured: true
order: 2
---

## Problema

Estoy preparando cinco certificaciones de cloud e IA a la vez: GCP Generative AI
Leader, Claude Certified Architect, AWS Cloud Practitioner (CLF-C02), AWS AI
Practitioner (AIF-C01) y GCP Associate Cloud Engineer. Todas chocan contra el
mismo muro. Los proveedores publican una guía de examen con dominios y sus pesos,
y como mucho diez preguntas de muestra. Todo lo demás que hay por ahí es un sitio
de volcados reciclando preguntas que están bajo NDA, equivocadas tantas veces
como acertadas, e inútiles para entender *por qué* una respuesta es correcta.

Más preguntas no arreglarían eso. Lo que yo quería era un banco que siguiera el
esquema oficial dominio a dominio, y una forma de averiguar qué dominio es el más
flojo antes de que lo averigüe el examen por mí.

Así que la herramienta genera un banco original anclado en el temario oficial, lo
pondera como está ponderado el examen real y lo entrena en condiciones de examen,
con repetición espaciada sobre todo lo que fallo.

## Arquitectura

El sistema separa con dureza la generación offline del servicio en tiempo de
ejecución. Nada llama a un LLM mientras corre un simulacro: el banco es un
artefacto de build producido por un pipeline que puede reejecutarse para
ampliarlo, y la aplicación que lo sirve es una web local sin ninguna dependencia
de red.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 428" role="img" aria-labelledby="d2-title d2-desc" preserveAspectRatio="xMidYMid meet">
  <title id="d2-title">Pipeline de generación offline y runtime local del simulador de exámenes</title>
  <desc id="d2-desc">En offline, las guías oficiales de examen, las preguntas públicas de muestra y los pesos por dominio alimentan un paso de generación que corre sobre Gemini, Claude o un modelo local Qwen3; su salida la revisa un juez LLM local y se traduce al inglés. En tiempo de ejecución, el banco SQLite resultante lo sirve FastAPI a una single-page app de React que ofrece práctica, exámenes cronometrados y repetición espaciada, sin ninguna llamada de red.</desc>
  <defs>
    <marker id="arw-cert" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="244" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · OFFLINE · SE GENERA UNA VEZ</text>
  <rect x="24" y="44" width="184" height="44" class="d-box" />
  <text x="116" y="65" class="d-label" text-anchor="middle">GUÍAS DE EXAMEN</text>
  <text x="116" y="80" class="d-sub" text-anchor="middle">5 temarios oficiales</text>
  <rect x="228" y="44" width="184" height="44" class="d-box" />
  <text x="320" y="65" class="d-label" text-anchor="middle">MUESTRAS DE ESTILO</text>
  <text x="320" y="80" class="d-sub" text-anchor="middle">preguntas públicas de ejemplo</text>
  <rect x="432" y="44" width="184" height="44" class="d-box" />
  <text x="524" y="65" class="d-label" text-anchor="middle">PESOS POR DOMINIO</text>
  <text x="524" y="80" class="d-sub" text-anchor="middle">23 dominios</text>
  <path d="M116 88 V 104" class="d-flow" marker-end="url(#arw-cert)" />
  <path d="M320 88 V 104" class="d-flow" marker-end="url(#arw-cert)" />
  <path d="M524 88 V 104" class="d-flow" marker-end="url(#arw-cert)" />

  <rect x="24" y="104" width="592" height="48" class="d-box" />
  <text x="320" y="126" class="d-label" text-anchor="middle">GENERACIÓN · GEMINI · CLAUDE · QWEN3 VÍA OLLAMA</text>
  <text x="320" y="142" class="d-sub" text-anchor="middle">reparto proporcional por dominio · validación pydantic · dedup por hash · reanudable</text>
  <path d="M320 152 V 164 H 152 V 176" class="d-flow" marker-end="url(#arw-cert)" />
  <path d="M320 152 V 164 H 488 V 176" class="d-flow" marker-end="url(#arw-cert)" />

  <rect x="24" y="176" width="256" height="48" class="d-box" />
  <text x="152" y="197" class="d-label" text-anchor="middle">JUEZ LLM · GPT-OSS:20B</text>
  <text x="152" y="213" class="d-sub" text-anchor="middle">983 ok · 19 leves · 50 marcadas</text>
  <rect x="360" y="176" width="256" height="48" class="d-box" />
  <text x="488" y="197" class="d-label" text-anchor="middle">TRADUCCIÓN · QWEN3:30B</text>
  <text x="488" y="213" class="d-sub" text-anchor="middle">1.012 preguntas → EN</text>

  <path d="M152 224 V 236 H 488 V 224" class="d-flow" />
  <path d="M320 236 V 268 H 16 V 344 H 22" class="d-flow d-dashed" marker-end="url(#arw-cert)" />
  <text x="332" y="272" class="d-sub">banco congelado en el build</text>

  <rect x="8" y="284" width="624" height="132" class="d-band" />
  <text x="20" y="304" class="d-band-label">B · RUNTIME · LOCALHOST, UN SOLO USUARIO</text>
  <rect x="24" y="320" width="184" height="48" class="d-box" />
  <text x="116" y="341" class="d-label" text-anchor="middle">SQLITE</text>
  <text x="116" y="357" class="d-sub" text-anchor="middle">1.062 preguntas</text>
  <path d="M208 344 H 236" class="d-flow" marker-end="url(#arw-cert)" />
  <rect x="240" y="320" width="184" height="48" class="d-box" />
  <text x="332" y="341" class="d-label" text-anchor="middle">FASTAPI</text>
  <text x="332" y="357" class="d-sub" text-anchor="middle">sqlite3 de stdlib · sin ORM</text>
  <path d="M424 344 H 452" class="d-flow" marker-end="url(#arw-cert)" />
  <rect x="456" y="320" width="160" height="48" class="d-box" />
  <text x="536" y="341" class="d-label" text-anchor="middle">SPA EN REACT 19</text>
  <text x="536" y="357" class="d-sub" text-anchor="middle">práctica · examen · SM-2</text>
  <text x="320" y="394" class="d-sub" text-anchor="middle">routers: certifications · questions · practice · exams · progress · review</text>
</svg>
<figcaption>fig. 1 · La generación corre como pipeline offline. El runtime nunca llama a un LLM.</figcaption>
</figure>

La generación lee el temario oficial de una certificación, reparte un número
objetivo de preguntas entre sus dominios en proporción a los pesos oficiales, e
inyecta el temario más una o dos preguntas públicas de muestra como anclaje de
estilo, nunca como contenido a reproducir. La salida se parsea a modelos de
Pydantic y se deduplica por hash de contenido, así que reejecutar el script
amplía el banco en lugar de duplicarlo. El proveedor es intercambiable entre
Gemini, Anthropic y un Qwen3 local a través de Ollama.

El control de calidad es una segunda pasada independiente. Un modelo juez local
responde cada pregunta *sin ver la respuesta marcada*, compara su propia elección
con la clave almacenada y señala errores factuales, ambigüedades y preguntas de
respuesta múltiple no declaradas. Nunca edita ni borra nada. Escribe un veredicto,
y las preguntas señaladas se desactivan en vez de eliminarse, de modo que el
rastro de auditoría sobrevive.

El servicio es deliberadamente aburrido: FastAPI sobre el `sqlite3` de la
biblioteca estándar, sin ORM, seis routers y una SPA de React 19 que cubre el
panel, el modo práctica (feedback inmediato, explicaciones por opción), el modo
examen cronometrado (muestreo proporcional por dominio, sin feedback hasta el
final, resultado contra el umbral real de aprobado) y una cola de repaso SM-2. En
modo «producción local» el mismo servidor sirve además el frontend compilado.

## Decisiones y compromisos

- Las preguntas se generan offline y nunca en tiempo de ejecución. La carga de
  preguntas es instantánea, un simulacro no cuesta nada en tokens ni en latencia,
  y la aplicación funciona con la red desenchufada. El coste es que el banco es
  un artefacto de build: ampliarlo o arreglar un dominio malo significa
  reejecutar un pipeline, no pulsar un botón.
- Solo preguntas originales, con el material oficial como anclaje y no como
  contenido. Las guías de examen aportan el temario y las muestras públicas
  aportan el registro, y ninguna de las dos se reproduce ni se muestra nunca. Eso
  costó bastante más prompt engineering y validación que raspar un volcado, a
  cambio de un banco limpio legal y éticamente.
- Un segundo LLM audita al primero. Generación y validación usan modelos
  distintos, y el juez responde de forma independiente antes de ver la clave, que
  es lo que hace informativo el desacuerdo. Añade una etapa de pipeline sobre todo
  el banco, y desactivó 50 preguntas (4,7%) que si no me habrían enseñado algo
  incorrecto.
- `sqlite3` en crudo, sin ORM, sin autenticación. Un usuario, una máquina, un
  fichero. A cambio escribo SQL a mano y no tengo herramientas de migración, lo
  cual es aceptable a este tamaño y sería lo primero en caer si esto llegara a
  ser multiusuario.
- El plan gratuito de Gemini se trata como restricción de diseño, no como
  obstáculo. La limitación de peticiones, el backoff exponencial respetando el
  `retryDelay` de la API, las ejecuciones reanudables y la deduplicación por hash
  existen porque la cuota diaria se agota a mitad de generación. Aquí no hay
  compromiso digno de mención: la restricción produjo un pipeline idempotente e
  interrumpible, que es lo que debería haber sido de todos modos.

## Métricas

Estas son propiedades del sistema tal y como está, medidas contra la base de
datos real. Aquí no hay un antes y un después. El número honesto sobre resultados
de estudio es que todavía no hay ninguno: `exam_attempts` está vacía, así que
nada en esta tabla afirma que la herramienta mejore los resultados del examen.

| Métrica | Valor |
| ------- | ----- |
| Preguntas en el banco | 1.062 en 5 certificaciones y 23 dominios |
| Por certificación | de 204 a 229 preguntas |
| Activas tras la revisión | 1.012 · 50 desactivadas por el juez |
| Veredictos del juez | 983 ok · 19 leves · 50 marcadas (`gpt-oss:20b`) |
| Modelos de generación usados | claude-sonnet-5 (378) · qwen3:30b (274) · claude-opus-4-8 (204) · gemini-2.5-flash (196) |
| Tipos de pregunta | 863 de respuesta única · 199 de respuesta múltiple |
| Reparto por dificultad | 691 media · 230 difícil · 141 fácil |
| Traducciones al inglés | 1.012 (`qwen3:30b-a3b`), originales en español intactos |
| Llamadas a LLM en runtime | 0 |
| Intentos de examen registrados | 0 (todavía sin datos de resultado) |

## Lecciones aprendidas

El anclaje le ganó al tamaño del modelo. Las preguntas que más se parecen al
examen real salieron de darle al modelo la sección concreta del temario y una
muestra para el registro, no de tirar de un modelo más grande. Un Qwen3 local con
buen anclaje produjo 274 preguntas utilizables, y los modelos caros no fueron
proporcionalmente mejores.

El juez se ganó el sueldo, y es también la parte de la que menos me fío. Cincuenta
preguntas señaladas son una tasa de error del 4,7% que se habría ido directa a mi
tiempo de estudio: vale cada token. Pero un único juez local es una sola opinión.
El TFM que construí alrededor de la [validación de LLM-as-a-judge](/es/projects/llm-energy-benchmark/)
necesitó tres capas de validación independientes antes de que sus puntuaciones
significaran algo, y este pipeline no tiene ninguna. Los veredictos son útiles
como filtro, no como verdad de referencia.

Los límites de peticiones produjeron un pipeline mejor del que habría salido de
una cuota generosa. Verme obligado a hacer la generación reanudable, idempotente
y deduplicada la convirtió en algo que puedo reejecutar contra cualquier
certificación en cualquier momento, que es como debería haberse escrito desde el
principio.

Nada de esto demuestra que funcione. El banco está construido, revisado, traducido
y servido, y la cola de repaso está vacía porque todavía no me he sentado a hacer
un simulacro completo. Escribir «0 intentos registrados» en un caso de estudio es
menos satisfactorio que una mejora de puntuación inventada, pero es la única
versión de esta sección que es verdad.

## Enlaces

- Sin repositorio público: esta es una herramienta de un solo usuario que corre en
  `localhost`, y parte del material de partida (guías de examen, muestras
  oficiales) no es mío para redistribuirlo.
- Relacionado: [Medir lo que las técnicas de prompting queman de verdad](/es/projects/llm-energy-benchmark/), la metodología de LLM-as-a-judge de la que este pipeline toma prestado.
