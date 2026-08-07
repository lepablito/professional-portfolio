---
title: "Recuperar no es el problema. Ordenar sí."
description: "Cómo funciona la recuperación del Oráculo de mi wiki de D&D: tres vías de búsqueda que se fusionan por rango, un reranker que solo mejora las cosas si nunca ve el texto crudo, y los huecos que sobran para lo que no cupo."
date: "2026-08-07"
tags: ["rag", "llm-local", "ollama", "chromadb", "reranking"]
---

Tengo una campaña de D&D con más de cien sesiones de notas. Suficientes para que
nadie en la mesa recuerde qué pasó con un personaje secundario que apareció en
la sesión 23 y volvió, cambiado, en la 91. El Oráculo es un chat que responde
preguntas en lenguaje natural sobre esa campaña, del tipo "¿qué pasó con el
archiduque?", usando **solo** el material de las notas, y citando de dónde
sale cada afirmación. Esto es RAG en el sentido estricto: no hay nada que el
modelo sepa de memoria sobre esta campaña, porque no existe fuera de estos
archivos.

Lo interesante no es que haya un LLM local respondiendo. Es que la mitad del
sistema, la que decide **qué le enseñas** al modelo antes de que responda, es
donde se juega si la respuesta es correcta o inventada, y esa mitad resultó
mucho menos obvia de lo que parece en un tutorial de RAG en tres pasos.

## Trocear por sesión, no por palabras

Antes de recuperar nada hay que decidir qué es una unidad recuperable. El
troceo ingenuo (cortar cada N palabras) rompe entradas por la mitad: el
nombre de un dios en un chunk, su descripción en el siguiente, y una consulta
que encuentra uno sin encontrar el otro.

El objetivo aquí es que **una sesión sea un chunk**. Un detector de cabeceras
(`## Sesión 12 — ...`, `**Sesion 7**`, variantes con y sin acentos) parte el
documento en bloques de sesión antes de tocar nada más. Solo si un bloque no
cabe en el tope (`SESSION_MAX_WORDS = 1200`) se subdivide, y ahí también se
respetan las cabeceras Markdown internas: se agrupan secciones consecutivas
hasta el tope sin partir ninguna, y solo lo que por sí solo no cabe se
ventanea a ciegas con solape (`OVERLAP_WORDS = 120`, ~10% del tope).

Una mención de pasada, como "…ya lo vimos en la sesión 5…", no cuenta como
cabecera de sesión a propósito: si contara, cada referencia cruzada inflaría el número
de sesiones detectadas con fantasmas.

## Recuperación híbrida: tres vías, no una

Con el corpus troceado, la pregunta obvia es cómo buscar en él. La respuesta
aquí es no elegir: se lanzan tres búsquedas independientes y se fusionan sus
resultados.

- **Semántica**: embeddings (`bge-m3`) contra ChromaDB, distancia coseno.
  Entiende paráfrasis: *"¿quién murió?"* encuentra *"cayó en combate"*. Se
  pierde con los nombres propios inventados de una campaña (*Norkiel*,
  *Galerna*) que el modelo de embeddings jamás ha visto y proyecta a
  cualquier sitio del espacio vectorial.
- **Por palabra clave**: BM25 sobre SQLite FTS5. Clava *"Norkiel"* de forma
  literal, pero no generaliza: *"¿quién murió?"* no encuentra *"cayó"*.
- **Por entidad**: si la pregunta nombra una entidad ya extraída al Compendio
  (por su nombre o por un alias), se buscan literalmente el resto de sesiones
  donde aparece. Esta vía existe porque, medido sobre el corpus real,
  preguntar por alguien que sale en seis sesiones solo devolvía fragmentos de
  dos o tres con las otras dos vías: la cobertura subió del 70% al 91%.

Ninguna de las tres es prescindible por separado, y la tercera tiene una
contrapartida conocida: para una entidad que aparece por toda la campaña (un
personaje jugador, o un alias muy común) trae candidatas de tantas sesiones
que puede desplazar a la que importaba. Es un compromiso que se midió y se
aceptó, no un efecto secundario que se pasó por alto.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 500" role="img" aria-labelledby="d-rag-title d-rag-desc" preserveAspectRatio="xMidYMid meet">
  <title id="d-rag-title">Tres vías de recuperación fusionadas por rango, reordenadas por un reranker</title>
  <desc id="d-rag-desc">Una pregunta se busca en paralelo por tres vías: semántica con bge-m3 y ChromaDB, por palabra clave con BM25 sobre SQLite FTS5, y por entidad contra los alias del Compendio. Los tres rankings se fusionan por posición con Reciprocal Rank Fusion, no por puntuación. De los candidatos fusionados, un reranker basado en qwen2.5:14b reordena leyendo solo la anotación de una o dos frases de cada fragmento, nunca su texto crudo, y se queda con los ocho mejores. Si a algún candidato le falta anotación, o el modelo falla, el reranker se apaga y se devuelve el orden de la fusión intacto. Los candidatos que no entran en los ocho aportan hasta dieciséis resúmenes de una línea, agrupados por sesión, que se añaden al contexto del prompt en un bloque aparte.</desc>
  <defs>
    <marker id="arw-rag" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="116" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · TRES VÍAS EN PARALELO</text>
  <rect x="24" y="44" width="184" height="60" class="d-box" />
  <text x="116" y="66" class="d-label" text-anchor="middle">SEMÁNTICA</text>
  <text x="116" y="82" class="d-sub" text-anchor="middle">bge-m3 + ChromaDB</text>
  <text x="116" y="96" class="d-sub" text-anchor="middle">distancia coseno</text>

  <rect x="228" y="44" width="184" height="60" class="d-box" />
  <text x="320" y="66" class="d-label" text-anchor="middle">TEXTO</text>
  <text x="320" y="82" class="d-sub" text-anchor="middle">BM25</text>
  <text x="320" y="96" class="d-sub" text-anchor="middle">SQLite FTS5</text>

  <rect x="432" y="44" width="184" height="60" class="d-box" />
  <text x="524" y="66" class="d-label" text-anchor="middle">ENTIDAD</text>
  <text x="524" y="82" class="d-sub" text-anchor="middle">alias del Compendio</text>
  <text x="524" y="96" class="d-sub" text-anchor="middle">nombrados en la pregunta</text>

  <path d="M116 104 V 130 H 320 V 150" class="d-flow" />
  <path d="M320 104 V 150" class="d-flow" marker-end="url(#arw-rag)" />
  <path d="M524 104 V 130 H 320 V 150" class="d-flow" />

  <rect x="8" y="134" width="624" height="72" class="d-band" />
  <text x="20" y="150" class="d-band-label">B · FUSIÓN POR RANGO</text>
  <rect x="140" y="164" width="360" height="34" class="d-box" />
  <text x="320" y="186" class="d-label" text-anchor="middle">RRF — score = Σ 1 / (60 + puesto)</text>
  <path d="M320 206 V 226" class="d-flow" marker-end="url(#arw-rag)" />

  <rect x="8" y="216" width="624" height="90" class="d-band" />
  <text x="20" y="232" class="d-band-label">C · ORDENAR</text>
  <rect x="140" y="246" width="360" height="50" class="d-box" />
  <text x="320" y="266" class="d-label" text-anchor="middle">RERANKER · qwen2.5:14b</text>
  <text x="320" y="283" class="d-sub" text-anchor="middle">lee la anotación, nunca el texto crudo</text>
  <path d="M500 271 H 560" class="d-flow d-dashed" />
  <text x="566" y="266" class="d-sub">sin anotación /</text>
  <text x="566" y="280" class="d-sub">Ollama caído →</text>
  <text x="566" y="294" class="d-sub">orden RRF intacto</text>

  <path d="M230 296 V 316 H 190 V 336" class="d-flow" marker-end="url(#arw-rag)" />
  <path d="M410 296 V 316 H 450 V 336" class="d-flow" marker-end="url(#arw-rag)" />

  <rect x="8" y="330" width="624" height="80" class="d-band" />
  <text x="20" y="346" class="d-band-label">D · CONTEXTO FINAL DEL PROMPT</text>
  <rect x="24" y="360" width="270" height="40" class="d-box" />
  <text x="159" y="384" class="d-label" text-anchor="middle">8 FRAGMENTOS COMPLETOS</text>
  <rect x="346" y="360" width="270" height="40" class="d-box" />
  <text x="481" y="384" class="d-label" text-anchor="middle">≤16 RESÚMENES DE UNA LÍNEA</text>

  <path d="M159 400 V 416 H 320 V 432" class="d-flow" />
  <path d="M481 400 V 416 H 320 V 432" class="d-flow" marker-end="url(#arw-rag)" />

  <rect x="8" y="424" width="624" height="68" class="d-band" />
  <text x="20" y="440" class="d-band-label">E · RESPUESTA</text>
  <rect x="140" y="450" width="360" height="34" class="d-box" />
  <text x="320" y="472" class="d-label" text-anchor="middle">CHAT · respuesta con cita obligatoria por afirmación</text>
</svg>
<figcaption>fig. 1 — Recuperar trae los candidatos; ordenar decide cuáles llegan al modelo.</figcaption>
</figure>

## Fusionar por puesto, no por puntuación

Las tres vías no son comparables entre sí: la semántica da una similitud
coseno entre 0 y 1, BM25 devuelve una puntuación sin escala fija. Sumarlas
directamente sería mezclar unidades distintas. La fusión usa
**Reciprocal Rank Fusion**, que descarta la puntuación y se queda solo con la
posición de cada resultado en su lista:

```
score(chunk) = Σ  1 / (RRF_K + puesto_en_esa_lista)      RRF_K = 60
             vías
```

Un chunk que aparece en dos listas suma dos veces y sube por encima del
primero de cada lista por separado, que es justo el comportamiento que se
quiere: confianza cruzada entre vías. Cada vía pide más resultados de los que
hacen falta al final (`max(k*2, k+5)`) para darle a la fusión profundidad con
la que trabajar, y si el índice de texto está vacío (corpus recién creado,
sin reingestar), `BM25` simplemente devuelve `[]` y todo degrada con
naturalidad a búsqueda solo vectorial, sin rama especial que lo gestione.

Aquí es donde cambié de opinión sobre qué decide RRF. Al principio pensaba en
la fusión como el paso que produce el resultado final. No lo es: fusiona
hasta 40 candidatos (en la práctica salen unos 27) y de ahí en adelante
manda otra cosa.

## Lo que falla no es recuperar, es ordenar

Medido sobre un banco de 30 preguntas: la **unión** de las tres vías contiene
la fuente correcta en las 30. El top-8 que sale directamente de la fusión RRF
solo acierta en 25. La conclusión no es intuitiva si vienes de pensar en RAG
como "busca y listo": el problema no era encontrar el fragmento correcto,
era que no siempre quedaba entre los primeros ocho.

La solución es una única llamada extra al mismo LLM que ya sirve el chat
(`qwen2.5:14b`), pidiéndole que reordene los ~27 candidatos y devuelva los 8
mejores. El detalle que no es cosmético: al modelo no se le enseña el texto
de cada fragmento, se le enseña su **anotación**: una descripción de una o
dos frases generada durante la ingesta y cacheada, no calculada al vuelo.
Medido: con el texto crudo, el recall global *cae* a 0.73, peor que no
rerankear nada. Con la anotación, sube a 0.93. Texto y anotación juntos dan
0.87, todavía peor que la anotación sola. Enseñarle al reranker más
información no lo hace mejor si esa información extra es ruido para la
tarea de ordenar.

Por eso el reranker se apaga solo, sin configuración, en cuanto algún
candidato no tiene anotación cacheada, o si Ollama no responde, o si el JSON
de salida no parsea: en cualquiera de esos casos devuelve el orden de RRF sin
tocarlo. Nunca lanza una excepción que tumbe la búsqueda, y nunca devuelve
menos fragmentos de los que se pidieron.

Usa el mismo modelo que ya sirve las respuestas del chat, y esto tampoco es
casualidad ni ahorro cosmético: Ollama mantiene residente el último modelo
usado. Con el mismo modelo, rerankear cuesta 1,4 s; con uno distinto, hay
descarga y recarga entre el reranker y la generación, y el coste por
pregunta sube a unos 6 s.

## Los huecos que sobran: resúmenes de lo que no cupo

Ocho fragmentos completos alcanzan para la mayoría de preguntas, pero no para
todas. Hay preguntas que ninguna sesión responde sola (*"¿qué papel ha ido
jugando tal personaje a lo largo de la campaña?"* puede necesitar siete), y
ahí el fallo medido tampoco era recuperar: la unión de candidatos cubría el
0.88 de las sesiones relevantes de ese arco narrativo, pero los ocho elegidos
por el reranker solo el 0.67. El problema era que no cabían.

La solución reutiliza lo que ya existe: detrás de los 8 fragmentos completos
van hasta 16 resúmenes de una línea (la misma anotación que usa el
reranker) de los candidatos que se quedaron fuera. Una sesión completa son
~1200 palabras; su anotación, ~38. Caben dieciséis resúmenes por el precio de
media sesión de más, sin volver a llamar al LLM y sin latencia añadida
porque la anotación ya estaba cacheada.

Dos reglas de diseño ahí que no son obvias hasta que las rompes una vez:

- **Un hueco por sesión, no por chunk.** Una sesión larga se trocea en varios
  fragmentos; gastar dos huecos en dos mitades de la misma sesión deja fuera
  una sesión entera que sí aportaba algo nuevo.
- **Los resúmenes van en un bloque aparte y etiquetado**, nunca mezclados con
  el material completo. El modelo necesita poder distinguir "esto lo tengo
  entero, cítalo con confianza" de "esto es un titular, no un fragmento
  citable con detalle".

## Dos afinamientos silenciosos

Dos piezas pequeñas que no aparecen en ningún diagrama pero que decidieron si
el sistema funcionaba en uso real y no solo en el banco de pruebas:

**La cita es una instrucción dura, no una sugerencia.** El prompt exige poner,
detrás de cada afirmación, la etiqueta exacta del fragmento del que sale
(`Sesión 119`, `Ficha: Katerina_Emberdusk`, `Mundo: GODS`). Con una redacción
blanda ("cita cuando sea posible"), 12 de 36 respuestas del banco no citaban
ninguna fuente pese a ser correctas; endurecer la instrucción las bajó a 3.
Un matiz que costó descubrir: si el ejemplo dentro de la propia instrucción
incluye un número de sesión concreto, el modelo lo copia literalmente en
respuestas que no vienen de esa sesión. El formato se describe sin dar nunca
un número de ejemplo.

**El historial también alimenta la búsqueda, no solo al modelo.** Cuando una
pregunta no se sostiene sola, como *"¿y qué pasó después?"*, buscar con esa
frase tal cual no encuentra nada útil. Una heurística determinista, sin llamada a
ningún LLM, detecta preguntas de este tipo (empiezan por *y / pero / entonces
/ luego*, o son cortas y no nombran a nadie) y le antepone el último turno
del usuario **solo para la búsqueda**; la pregunta que de verdad se responde
sigue siendo la original. Es deliberadamente conservadora: un nombre propio
en la pregunta manda por encima de todo, porque *"¿y qué hizo Baika?"* ya
trae su propio tema y expandirla ensuciaría la búsqueda en vez de ayudarla.

## Lo que me llevo de esto

Si tuviera que resumir el sistema en una frase sería: recuperar bien es
necesario pero no es donde vive la dificultad. Las tres vías de búsqueda, la
fusión por rango, el troceo por sesión: todo eso junto ya deja la fuente
correcta en el conjunto de candidatos el 100% de las veces. Lo que se llevó
el trabajo de verdad fue decidir, de ese conjunto ya correcto, qué ocho
cosas le enseñas al modelo y en qué orden, y qué haces con las que se
quedan fuera en vez de tirarlas. Ninguna de esas decisiones aparece en la
descripción de una frase de "RAG": embeddings, base vectorial, LLM. Todas
aparecieron midiendo qué fallaba en preguntas reales sobre una campaña real.
