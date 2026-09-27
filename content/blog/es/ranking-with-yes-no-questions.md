---
title: "Un pasaje, una pregunta de sí o no"
description: "Enfrenté dos modelos de decisión, Jev y Laya, al reranker LLM de mi wiki de D&D. Jev, leyendo los pasajes enteros, encontró la fuente correcta en las 36 preguntas. Laya sin afinar lo hizo peor que no reordenar nada."
date: "2026-09-27"
tags: ["rag", "reranking", "llm-local", "ollama"]
draft: true
---

El [post anterior](/es/blog/rag-wiki-dnd/) terminaba con un diagnóstico: el
Oráculo de mi wiki de D&D encuentra el material correcto, lo que no siempre
hace es ponerlo delante. Sus tres vías de búsqueda traen la fuente correcta en
algún punto de los ~27 candidatos todas las veces, pero esa fuente solo cae
entre los 8 que llegan al modelo el 83% de las veces. Un reranker (el mismo
`qwen2.5:14b` que responde en el chat, leyendo una anotación corta de cada
candidato en vez de su texto) lo sube al 93%.

Ese reranker es un modelo generativo haciendo el trabajo de un clasificador:
lee una lista numerada y devuelve números. Así que quería saber si un modelo
pensado para ese tipo de decisión lo haría mejor, y probé dos:

- **Jev**, de TypeSafe, un modelo alojado de los que ellos llaman "System
  One". Le das un estado y unas preguntas tipadas, y te devuelve la respuesta
  a cada una con su probabilidad. Lo llamo a través de OpenRouter
  (`~typesafe/jev-latest`, que apuntaba a `jev-1.13`).
- **Laya**, de Convai, que juega a lo mismo con pesos abiertos: un encoder de
  322M de parámetros, checkpoint multilingüe, corriendo en mi propia GPU.

Los dos tienen un tipo de pregunta de sí o no, Noul, que devuelve la
probabilidad del "sí". Así que en vez de pedirle a un modelo que ordene 27
cosas de golpe, le haces a cada pasaje la misma pregunta y ordenas por la
respuesta.

## Los mismos candidatos para todos

Para que la comparación signifique algo, todas las variantes tienen que elegir
exactamente entre los mismos candidatos, y no quería reescribir la
recuperación para un experimento. Así que el harness llama al `rag.search()`
de producción y, solo mientras dura esa llamada, cambia el reranker por un
espía que se guarda la lista que le llega y devuelve el orden de RRF. Con eso
queda capturado lo que el reranker ve en producción: 26,9 candidatos por
pregunta de media.

Cada gate le hace a cada candidato dos preguntas Noul, `is_relevant` y
`contains_answer_evidence`, lo puntúa con la media de las dos y manda los 8
mejores al modelo, la misma k que usa el reranker. Probé cada modelo con dos
entradas: el texto completo del chunk (hasta 1200 palabras) y la anotación de
~38 palabras que lee el reranker. Cada llamada va a una caché en disco en
cuanto vuelve, así que relanzar sale gratis y si algo falla a mitad no se
pierde nada.

El banco de evaluación es el del post anterior más las seis preguntas de
"arco" que se añadieron después (las que tienen la respuesta repartida entre
varias sesiones), 36 en total. Antes de mirar ningún gate comprobé los
controles. Sobre las 30 preguntas originales, RRF a secas da recall@8 0,833 y
MRR 0,707, exactamente los números de la otra vez. El reranker da el mismo
0,933 de recall, con un MRR algo más bajo (0,737 frente a 0,757). Y los
candidatos contienen la fuente correcta en las 36 preguntas, así que a partir
de aquí cualquier fallo es un fallo de ordenar.

## Resultados

| Variante | recall@8 | MRR | por pasaje (p50) | por pregunta (p50) | coste, 36 preguntas |
|---|---:|---:|---:|---:|---:|
| RRF, sin reranker | 0,83 | 0,73 | n/a | n/a | 0 $ |
| Reranker actual (qwen2.5:14b) | 0,94 | 0,77 | 61 ms | 1,6 s | 0 $ |
| Jev · texto completo | **1,00** | **0,97** | 268 ms | 7,5 s | 0,062 $ |
| Jev · anotación | 0,92 | 0,78 | 262 ms | 7,3 s | 0,020 $ |
| Laya zero-shot · texto completo | 0,61 | 0,39 | 29 ms | 0,9 s | 0 $ |
| Laya zero-shot · anotación | 0,72 | 0,49 | 28 ms | 0,8 s | 0 $ |

recall@8 es la fracción de preguntas con al menos un pasaje de una fuente
esperada entre los 8, y MRR es la media de 1/puesto del primero de esos
pasajes. El reranker hace una sola llamada por pregunta para todos los
candidatos, así que su tiempo por pasaje es esa llamada dividida entre el
número de candidatos.

Con el texto completo, Jev mete un pasaje correcto entre los 8 en todas las
preguntas, y casi siempre en primer lugar. Las paráfrasis eran la familia que
más dolía la otra vez (preguntas escritas sin ninguno de los nombres propios
de la sesión), y pasan de 0,58 con RRF y 0,83 con el reranker a 12 de 12. Las
preguntas de arco son el único sitio donde no sale ganando: de las sesiones
que espera una pregunta de arco, los 8 de Jev cubren el 0,77, frente al 0,80
del reranker y el 0,81 de RRF a secas.

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 304" role="img" aria-labelledby="d-gate-title-es d-gate-desc-es" preserveAspectRatio="xMidYMid meet">
  <title id="d-gate-title-es">De los 8 pasajes que llegan al modelo, cuántos vienen de una fuente esperada, por variante</title>
  <desc id="d-gate-desc-es">RRF sin reranker (referencia): 2,7 de 8 pasajes de una fuente esperada, recall@8 0,83. Reranker actual (qwen2,5:14b): 2,6 de 8 pasajes de una fuente esperada, recall@8 0,94, 61 ms por pasaje (p50). Jev · texto: 2,8 de 8 pasajes de una fuente esperada, recall@8 1,00, 268 ms por pasaje (p50). Jev · anotación: 2,3 de 8 pasajes de una fuente esperada, recall@8 0,92, 262 ms por pasaje (p50). Laya zero-shot · texto: 1,5 de 8 pasajes de una fuente esperada, recall@8 0,61, 29 ms por pasaje (p50). Laya zero-shot · anotación: 1,8 de 8 pasajes de una fuente esperada, recall@8 0,72, 28 ms por pasaje (p50).</desc>
  <rect x="224" y="10" width="10" height="10" style="fill:var(--accent)" />
  <text x="240" y="19" class="d-sub">de una fuente esperada</text>
  <rect x="384" y="10" width="10" height="10" style="fill:var(--line)" />
  <text x="400" y="19" class="d-sub">resto hasta 8</text>
  <line x1="224.0" y1="44" x2="224.0" y2="296" style="stroke:var(--grid);stroke-width:1" />
  <text x="224.0" y="40" class="d-sub" text-anchor="middle">0</text>
  <line x1="368.0" y1="44" x2="368.0" y2="296" style="stroke:var(--grid);stroke-width:1" />
  <text x="368.0" y="40" class="d-sub" text-anchor="middle">4</text>
  <line x1="512.0" y1="44" x2="512.0" y2="296" style="stroke:var(--grid);stroke-width:1" />
  <text x="512.0" y="40" class="d-sub" text-anchor="middle">8</text>
  <g><title>RRF sin reranker (referencia): 2,69 de 8 pasajes de una fuente esperada (media de 36 preguntas). recall@8 0,83 · sin coste de selección.</title>
    <text x="212" y="69" class="d-label" text-anchor="end">RRF sin reranker (referencia)</text>
    <text x="212" y="82" class="d-sub" text-anchor="end">recall@8 0,83 · sin coste de selección</text>
    <rect x="224.0" y="60.0" width="96.0" height="14" style="fill:var(--accent)" />
    <rect x="322.0" y="60.0" width="190.0" height="14" style="fill:var(--line)" />
    <text x="522" y="71" class="d-label">2,7 / 8</text>
  </g>
  <g><title>Reranker actual (qwen2,5:14b): 2,64 de 8 pasajes de una fuente esperada (media de 36 preguntas). recall@8 0,94 · 61 ms/pasaje · p50.</title>
    <text x="212" y="109" class="d-label" text-anchor="end">Reranker actual (qwen2.5:14b)</text>
    <text x="212" y="122" class="d-sub" text-anchor="end">recall@8 0,94 · 61 ms/pasaje · p50</text>
    <rect x="224.0" y="100.0" width="94.0" height="14" style="fill:var(--accent)" />
    <rect x="320.0" y="100.0" width="192.0" height="14" style="fill:var(--line)" />
    <text x="522" y="111" class="d-label">2,6 / 8</text>
  </g>
  <g><title>Jev · texto: 2,81 de 8 pasajes de una fuente esperada (media de 36 preguntas). recall@8 1,00 · 268 ms/pasaje · p50.</title>
    <text x="212" y="149" class="d-label" text-anchor="end">Jev · texto</text>
    <text x="212" y="162" class="d-sub" text-anchor="end">recall@8 1,00 · 268 ms/pasaje · p50</text>
    <rect x="224.0" y="140.0" width="100.0" height="14" style="fill:var(--accent)" />
    <rect x="326.0" y="140.0" width="186.0" height="14" style="fill:var(--line)" />
    <text x="522" y="151" class="d-label">2,8 / 8</text>
  </g>
  <g><title>Jev · anotación: 2,28 de 8 pasajes de una fuente esperada (media de 36 preguntas). recall@8 0,92 · 262 ms/pasaje · p50.</title>
    <text x="212" y="189" class="d-label" text-anchor="end">Jev · anotación</text>
    <text x="212" y="202" class="d-sub" text-anchor="end">recall@8 0,92 · 262 ms/pasaje · p50</text>
    <rect x="224.0" y="180.0" width="81.0" height="14" style="fill:var(--accent)" />
    <rect x="307.0" y="180.0" width="205.0" height="14" style="fill:var(--line)" />
    <text x="522" y="191" class="d-label">2,3 / 8</text>
  </g>
  <g><title>Laya zero-shot · texto: 1,53 de 8 pasajes de una fuente esperada (media de 36 preguntas). recall@8 0,61 · 29 ms/pasaje · p50.</title>
    <text x="212" y="229" class="d-label" text-anchor="end">Laya zero-shot · texto</text>
    <text x="212" y="242" class="d-sub" text-anchor="end">recall@8 0,61 · 29 ms/pasaje · p50</text>
    <rect x="224.0" y="220.0" width="54.0" height="14" style="fill:var(--accent)" />
    <rect x="280.0" y="220.0" width="232.0" height="14" style="fill:var(--line)" />
    <text x="522" y="231" class="d-label">1,5 / 8</text>
  </g>
  <g><title>Laya zero-shot · anotación: 1,78 de 8 pasajes de una fuente esperada (media de 36 preguntas). recall@8 0,72 · 28 ms/pasaje · p50.</title>
    <text x="212" y="269" class="d-label" text-anchor="end">Laya zero-shot · anotación</text>
    <text x="212" y="282" class="d-sub" text-anchor="end">recall@8 0,72 · 28 ms/pasaje · p50</text>
    <rect x="224.0" y="260.0" width="63.0" height="14" style="fill:var(--accent)" />
    <rect x="289.0" y="260.0" width="223.0" height="14" style="fill:var(--line)" />
    <text x="522" y="271" class="d-label">1,8 / 8</text>
  </g>
</svg>
<figcaption>fig. 1 — De los 8 pasajes que llegan al modelo, cuántos vienen de una sesión o documento esperado (media de 36 preguntas). Verdad-terreno por fuente, no por pasaje.</figcaption>
</figure>

La figura cuenta cuántos de los 8 vienen de una fuente esperada, y en esa
cuenta Jev, el reranker y RRF a secas están casi empatados, entre 2,6 y 2,8.
Lo que aporta Jev es que uno de esos pasajes está siempre y casi siempre el
primero, que es lo que recogen el recall y el MRR.

## Con la anotación, al revés

Esto no lo vi venir. En el post anterior el truco del reranker era no
enseñarle nunca el texto crudo: con el texto, el recall caía a 0,73, por
debajo de no reordenar, y con la anotación subía a 0,93. Con Jev pasa lo
contrario. El texto completo da 1,00, la anotación da 0,92 y las paráfrasis
vuelven a 0,83.

Mi hipótesis, que no he comprobado, es que depende de lo que se le pide a cada
modelo. El reranker compara 27 candidatos dentro de un solo prompt, así que le
vienen bien descripciones cortas que pueda poner una al lado de otra, y 27
sesiones enteras son sobre todo ruido para él. Jev lee un pasaje cada vez con
un contexto de 32k, así que para Jev el texto completo es información, y la
anotación tira justo el detalle del que depende una pregunta parafraseada.

## Laya sin afinar es peor que no hacer nada

Laya en zero-shot elige peor que el orden de RRF que se supone que tiene que
mejorar: 0,61 de recall con el texto completo y 0,72 con anotaciones, frente
al 0,83 de RRF. En paráfrasis acierta 4 de 12. Sus puntuaciones se reparten
bien (0,02 en el p10, 0,92 en el p90), pero las altas caen demasiadas veces en
pasajes que no son.

Cuadra con la propia documentación de Laya, que dice que los checkpoints base
puntúan cerca del azar en zero-shot y que el salto viene de afinar con
decisiones de tu propio dominio. Con 29 ms por pasaje, en local y gratis,
sigue siendo tentador, así que afinarlo es el siguiente experimento. El script
de preparación está escrito pero no lo he lanzado. Primero hacen falta pasajes
etiquetados a mano, y el reparto entre train y test tiene que ser por
pregunta: los ~27 candidatos de una pregunta comparten su consulta, y
repartirlos colaría preguntas de test en el entrenamiento.

## Lo que cuesta Jev

En dinero, muy poco. Las 36 preguntas con texto completo costaron 0,062 $,
unos 1,5M tokens de entrada a 0,042 $ el millón, y el `usage.cost` que
devuelve OpenRouter coincidía con esa estimación. Sale a unos 0,0017 $ por
pregunta.

Con la latencia es otra historia. Jev necesita una llamada por pasaje, unos
270 ms cada una, y mi harness las lanza una detrás de otra, así que se van a
7,5 s por pregunta frente a 1,6 s del reranker. Casi todo ese tiempo es red, y
nada impide lanzar las 27 llamadas en paralelo, pero no lo he medido y no voy
a inventarme un número. El reranker, por su parte, solo es "gratis" porque
reutiliza el modelo de 14B que ya está cargado para el chat, y mientras tanto
la GPU la tiene ocupada igual.

## Como gate estricto

El top 8 mantiene la comparación con el reranker en igualdad. Pero con una
probabilidad por pasaje también puedes poner un umbral y dejar pasar solo lo
que lo supera, cosa que la lista ordenada del reranker no te da. Con una
puntuación de 0,5 o más (con un tope de 8), Jev con el texto completo deja
pasar 4 pasajes por pregunta de media y aun así no pierde ni una pregunta: el
recall se queda en 1,00. Con anotaciones es mucho más estricto, 1,3 pasajes de
media y 10 preguntas que se quedan sin ninguno. Laya tampoco separa aquí, y
con el texto completo deja pasar casi todo (6,6 de 8).

Para el Oráculo es el número más útil de todo el experimento: la mitad de
contexto sin perder la fuente correcta. Si las respuestas mejoran con 4
pasajes en vez de 8 no lo puedo decir, porque el experimento solo mide lo que
llega al modelo.

## Letra pequeña

La verdad-terreno es por fuente. Un pasaje cuenta como acierto si su sesión o
documento está entre los esperados, aunque ese chunk en concreto hable de
otra cosa. Por eso no me apoyo en la precisión: todas las variantes quedan
entre 0,19 y 0,35, y en las preguntas literales, cuya verdad-terreno es
"sesiones donde aparece el nombre", ese número sale inflado. El harness
exporta todos los candidatos a un CSV para etiquetarlos a mano, y con eso se
puede recalcular la precisión sin volver a llamar a ninguna API.

36 preguntas son pocas. Una pregunta son casi 3 puntos de recall global, y 8
dentro de una familia de 12, así que el 1,00 de Jev son cero fallos en una
muestra pequeña.

Las dos preguntas Noul resultaron ser casi la misma. En Jev, `is_relevant` y
`contains_answer_evidence` tienen una correlación de 0,95, así que la segunda
aporta poco. Quitarla tampoco ahorraría mucho, porque lo que pesa en cada
llamada es el texto del pasaje, y una llamada con un pasaje de una línea ya
cuesta unos 450 tokens.

Dos cosas más pequeñas. En 3 preguntas el reranker nombró menos de 8 pasajes
y el código rellenó el resto con el orden de RRF; en producción pasa lo mismo,
así que lo medí tal cual. Y es una sola ejecución. Todo está cacheado y es
reproducible, pero no la repetí para ver la varianza.

## Con qué me quedo

La otra vez lo difícil resultó ser elegir qué ocho candidatos enseñarle al
modelo, y la respuesta entonces fue un LLM leyendo resúmenes cortos de todos a
la vez. Esta vez el mejor resultado ha salido de un modelo que no escribe nada
y lee los pasajes de uno en uno, y que solo lo hace así de bien cuando le das
el texto completo. En este banco supera al reranker en recall y MRR y pierde
un poco en cobertura de arco. Además es bastante más lento, y cuesta algo
menos de dos décimas de céntimo por pregunta. Lo siguiente es medir Jev con
llamadas en paralelo para ver cuánto queda de esos 7,5 s, y afinar Laya para
ver si un modelo local de 322M puede alcanzarlo.
