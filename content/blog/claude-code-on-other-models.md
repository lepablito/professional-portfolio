---
title: "Keeping the harness, swapping the model"
description: "What it takes to run Claude Code against NVIDIA NIM and local Ollama models when the subscription quota runs out and why the model that benchmarks best is not the one that works."
date: "2026-07-25"
tags: ["claude-code", "litellm", "local-llm", "tooling"]
---

The thing worth keeping in Claude Code is not the model. It is the harness: the
tool loop, the file editing, the permission prompts, the way it reads a repo
before touching it. So when the Pro quota runs out mid-afternoon, the honest
question is not "which model is as good as Claude", the real question is **can I keep my favourite
harness and point it somewhere else until the quota resets?**

The answer is yes, on Windows, with a proxy in the middle. But two things get in
the way first, and both are worth understanding before installing anything,
because they shape the entire setup.

## The two blockers

**Claude Code only speaks the Anthropic Messages API.** NVIDIA NIM and Ollama
both speak the OpenAI format. Nothing in Claude Code translates between them, so
something has to sit in the middle and rewrite requests and responses on the
wire. [LiteLLM](https://github.com/BerriAI/litellm) is the standard answer: run
it as a local proxy, point `ANTHROPIC_BASE_URL` at it instead of at
`api.anthropic.com`, and it handles both the translation and the model routing.

It is important to note that **a Pro subscription is not an API key.** This is the one that breaks the
obvious plan. Claude Code authenticates against your Anthropic account via
OAuth, not a key you can hand to the proxy. The moment you set
`ANTHROPIC_BASE_URL`, Claude Code stops talking to Anthropic entirely, so there
is no way to build a single chain that drains the subscription quota first and
then spills over to NIM. The quota is simply not reachable from the proxy.

What you can build is two launchers: `claude` (the OG, untouched for the subscription),
and a separate `claude-alt` that starts against NIM with local fallbacks. You
switch by typing a different command, and that manual step is not a limitation
of the setup, it is the only place the boundary can live (plus it also complies with Anthropic's terms of use).

<figure class="diagram" tabindex="0">
<svg viewBox="0 0 640 420" role="img" aria-labelledby="d-nim-title d-nim-desc" preserveAspectRatio="xMidYMid meet">
  <title id="d-nim-title">Two launchers: the subscription path and the proxied fallback path</title>
  <desc id="d-nim-desc">The normal claude command authenticates over OAuth straight to api.anthropic.com and consumes the Pro quota, with no proxy involved. A second launcher, claude-alt, sets ANTHROPIC_BASE_URL to a local LiteLLM proxy on port 4000, which translates between the Anthropic and OpenAI wire formats and routes to an ordered fallback chain: NVIDIA NIM first, then a local Ollama qwen3 model, then a local Ollama gemma4 model as a last resort.</desc>
  <defs>
    <marker id="arw-nim" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" class="d-head" />
    </marker>
  </defs>

  <rect x="8" y="8" width="624" height="104" class="d-band" />
  <text x="20" y="28" class="d-band-label">A · SUBSCRIPTION PATH — UNTOUCHED</text>
  <rect x="24" y="44" width="200" height="48" class="d-box" />
  <text x="124" y="68" class="d-label" text-anchor="middle">CLAUDE CODE · claude</text>
  <text x="124" y="85" class="d-sub" text-anchor="middle">OAuth · Pro plan</text>
  <path d="M224 68 H 264" class="d-flow" marker-end="url(#arw-nim)" />
  <rect x="268" y="44" width="200" height="48" class="d-box" />
  <text x="368" y="68" class="d-label" text-anchor="middle">API.ANTHROPIC.COM</text>
  <text x="368" y="85" class="d-sub" text-anchor="middle">until the quota runs out</text>
  <text x="484" y="63" class="d-sub">no proxy,</text>
  <text x="484" y="78" class="d-sub">no config</text>

  <rect x="8" y="120" width="624" height="292" class="d-band" />
  <text x="20" y="140" class="d-band-label">B · FALLBACK PATH — claude-alt</text>
  <rect x="24" y="156" width="200" height="52" class="d-box" />
  <text x="124" y="180" class="d-label" text-anchor="middle">CLAUDE CODE · claude-alt</text>
  <text x="124" y="197" class="d-sub" text-anchor="middle">ANTHROPIC_BASE_URL → :4000</text>
  <path d="M224 182 H 264" class="d-flow" marker-end="url(#arw-nim)" />
  <rect x="268" y="156" width="200" height="52" class="d-box" />
  <text x="368" y="180" class="d-label" text-anchor="middle">LITELLM PROXY :4000</text>
  <text x="368" y="197" class="d-sub" text-anchor="middle">anthropic ⇄ openai</text>
  <text x="484" y="175" class="d-sub">rewrites the</text>
  <text x="484" y="190" class="d-sub">wire format</text>

  <path d="M368 208 V 218 H 320 V 228" class="d-flow" marker-end="url(#arw-nim)" />

  <rect x="140" y="228" width="360" height="44" class="d-box" />
  <text x="320" y="248" class="d-label" text-anchor="middle">1 · NVIDIA NIM — nim-primary</text>
  <text x="320" y="264" class="d-sub" text-anchor="middle">remote · OpenAI-compatible endpoint</text>
  <path d="M320 272 V 292" class="d-flow d-dashed" marker-end="url(#arw-nim)" />
  <text x="332" y="287" class="d-sub">429 · 402 · retries exhausted</text>

  <rect x="140" y="292" width="360" height="44" class="d-box" />
  <text x="320" y="312" class="d-label" text-anchor="middle">2 · OLLAMA — qwen3:30b-a3b</text>
  <text x="320" y="328" class="d-sub" text-anchor="middle">local</text>
  <path d="M320 336 V 356" class="d-flow d-dashed" marker-end="url(#arw-nim)" />
  <text x="332" y="351" class="d-sub">same trigger</text>

  <rect x="140" y="356" width="360" height="44" class="d-box" />
  <text x="320" y="376" class="d-label" text-anchor="middle">3 · OLLAMA — gemma4:12b</text>
  <text x="320" y="392" class="d-sub" text-anchor="middle">local · last resort</text>
</svg>
<figcaption>fig. 1 — Two launchers. The subscription path never learns the proxy exists.</figcaption>
</figure>

## The routing config

The whole fallback behaviour lives in about twenty lines of YAML. LiteLLM's
router retries the primary model `num_retries` times and then walks the chain in
order, which maps exactly onto the failure you care about: Nvidia NIM returning a 429
or a 402 when the credits are gone.

```yaml
model_list:
  - model_name: nim-primary
    litellm_params:
      model: nvidia_nim/<exact-tag-from-the-model-card>
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
  drop_params: true      # silently discard params the backend rejects

router_settings:
  num_retries: 2
  fallbacks: [{"nim-primary": ["qwen3-local", "gemma4-local"]}]
```

Two details that cost me time. 
1. `drop_params: true` is not optional. Claude Code sends Anthropic-specific parameters that the OpenAI-shaped backends reject
outright, and without it every request fails on arrival.
2. Ollama tags use colons (`qwen3:30b-a3b`), not the hyphens you would guess from the model's
marketing name; a wrong tag surfaces as a confusing 404 from the router rather
than a "model not found".

The launcher is a PowerShell function in `$PROFILE` that starts the proxy if the
port is free and then runs Claude Code against it:

```powershell
function claude-alt {
    if (-not (Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue)) {
        Start-Process -WindowStyle Hidden -FilePath "litellm" `
            -ArgumentList '--config','C:\claude-proxy\litellm.config.yaml','--port','4000'
        Start-Sleep -Seconds 3
    }
    $env:ANTHROPIC_BASE_URL = "http://localhost:4000"
    $env:ANTHROPIC_AUTH_TOKEN = "sk-anything"   # the proxy does not check it
    $env:ANTHROPIC_MODEL = "nim-primary"
    claude @args
}
```

## The benchmark score is the wrong signal

This is the part I would have wanted to know first. I started with a
top-of-the-leaderboard reasoning model on Nvidia NIM (Deepseek V4 Pro), and Claude Code failed constantly
with `input JSON failed to parse`. Basically, the harness could not read the tool calls it
was getting back. The model was, by any coding benchmark, the strongest option
in the catalogue.

That turned out not to matter. What Claude Code depends on is not reasoning
depth but **the model emitting clean, well-formed tool-call JSON, consistently,
through a format translation layer.** Those are different skills, and they are
not correlated the way you would hope. A model that reasons beautifully in prose
and emits slightly malformed function arguments is useless here; a weaker model
with disciplined structured output works fine.

So the selection criterion becomes narrow and practical:

- Prefer models explicitly built for **agentic function calling** over models
  ranked highly on general coding benchmarks.
- Prefer models whose vendor already ships Anthropic-format support as they have
  been exercised against exactly this bridge.
- Treat vendor-native models on a given platform as the low-surprise option;
  they tend to cross the translation layer without oddities.
- Verify the exact model tag on its own model card before pasting it into the
  config. Catalogue names drift, and deprecation notices appear on tags that
  still resolve.

The same ordering applies to the local fallbacks. Qwen3 at 30B is a credible
agentic worker on a workstation GPU. Gemma is a fine model that is noticeably
weaker at tool calling, which is precisely why it sits last in the chain rather
than second. The fallback order should follow structured-output reliability,
not general capability.

## Two operational gotchas

**The proxy outlives your edits.** Because the launcher only starts LiteLLM when
port 4000 is closed, an already-running proxy keeps serving the old config
forever. You change the model in the YAML, relaunch `claude-alt`, and nothing
changes, which reads like a config error and is actually a process-lifetime
problem. The fix is a reload function that kills by port rather than by process
name, so it does not take down unrelated Python:

```powershell
function Restart-LiteLLM {
    Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
    Start-Sleep -Seconds 1
    Start-Process -WindowStyle Hidden -FilePath "litellm" `
        -ArgumentList '--config','C:\claude-proxy\litellm.config.yaml','--port','4000'
}
```

Also, **Run it visible while you are tuning.** Hidden background mode is right for
daily use and wrong for the week you spend picking a model. Start it in a real
window with `--detailed_debug` and you can watch the tool calls arrive and see
whether the malformed JSON is coming from the model or from the translation. It
also turns "reload" back into Ctrl+C.

## Is it worth it?

For what it is, yes. But with the expectations set correctly.

This is not a Claude replacement. It is a way to keep working in a harness I
know when the quota is gone, on tasks that are mostly mechanical: renaming
things across files, writing tests against an existing pattern, filling in
boilerplate, reading code and answering questions about it. For anything
requiring sustained multi-step reasoning over an unfamiliar codebase, the drop
is real and you will feel it within a few turns.

The unexpected value was diagnostic. Watching a good model fail at tool calling
made it obvious how much of Claude Code's usefulness is the harness plus a model
trained specifically to feed it well-formed structured output and how little
of that shows up in the benchmark number everyone quotes.
