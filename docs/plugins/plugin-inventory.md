---
summary: "Generated inventory of NodoAssist plugins shipped in core, published externally, or kept source-only"
read_when:
  - You are deciding whether a plugin ships in the core npm package or installs separately
  - You are updating bundled plugin package metadata or release automation
  - You need the canonical internal vs external plugin list
title: "Plugin inventory"
---

# Plugin inventory

This page is generated from `extensions/*/package.json`, `nodoassist.plugin.json`,
and the root npm package `files` exclusions. Regenerate it with:

```bash
pnpm plugins:inventory:gen
```

## Definitions

- **Core npm package:** built into the `nodoassist` npm package and available without a separate plugin install.
- **Official external package:** NodoAssist-maintained plugin omitted from the core npm package, kept in this official inventory, and installed on demand through ClawHub and/or npm.
- **Source checkout only:** repo-local plugin omitted from published npm artifacts and not advertised as an installable package.

Source checkouts are different from npm installs: after `pnpm install`, bundled
plugins load from `extensions/<id>` so local edits and package-local workspace
dependencies are available.

## Install a plugin

Use the install route in each entry to decide whether install is needed. Plugins
that say `included in NodoAssist` are already present in the core package.
Official external packages need one install, then a Gateway restart.

For example, Discord is an official external package:

```bash
nodoassist plugins install @nodoassist/discord
nodoassist gateway restart
nodoassist plugins inspect discord --runtime --json
```

During the launch cutover, ordinary bare package specs still install from npm.
Use `clawhub:@nodoassist/discord` or `npm:@nodoassist/discord` when you need an
explicit source. After install, follow the plugin's setup doc, such as
[Discord](/channels/discord), to add credentials and channel config. See
[Manage plugins](/plugins/manage-plugins) for update, uninstall, and publishing
commands.

Each entry lists the package, distribution route, and description.

## Core npm package

61 plugins

- **[admin-http-rpc](/plugins/reference/admin-http-rpc)** (`@nodoassist/admin-http-rpc`) - included in NodoAssist. NodoAssist admin HTTP RPC endpoint.

- **[alibaba](/plugins/reference/alibaba)** (`@nodoassist/alibaba-provider`) - included in NodoAssist. Adds video generation provider support.

- **[anthropic](/plugins/reference/anthropic)** (`@nodoassist/anthropic-provider`) - included in NodoAssist. Adds Anthropic model provider support to NodoAssist.

- **[azure-speech](/plugins/reference/azure-speech)** (`@nodoassist/azure-speech`) - included in NodoAssist. Azure AI Speech text-to-speech (MP3, native Ogg/Opus voice notes, PCM telephony).

- **[bonjour](/plugins/reference/bonjour)** (`@nodoassist/bonjour`) - included in NodoAssist. Advertise the local NodoAssist gateway over Bonjour/mDNS.

- **[browser](/plugins/reference/browser)** (`@nodoassist/browser-plugin`) - included in NodoAssist. Adds agent-callable tools.

- **[byteplus](/plugins/reference/byteplus)** (`@nodoassist/byteplus-provider`) - included in NodoAssist. Adds BytePlus, BytePlus Plan model provider support to NodoAssist.

- **[canvas](/plugins/reference/canvas)** (`@nodoassist/canvas-plugin`) - included in NodoAssist. Experimental Canvas control and A2UI rendering surfaces for paired nodes.

- **[clawrouter](/plugins/reference/clawrouter)** (`@nodoassist/clawrouter`) - included in NodoAssist. Adds ClawRouter model provider support to NodoAssist.

- **[codex-supervisor](/plugins/reference/codex-supervisor)** (`@nodoassist/codex-supervisor`) - included in NodoAssist. Supervise Codex app-server sessions from NodoAssist.

- **[cohere](/plugins/reference/cohere)** (`@nodoassist/cohere-provider`) - included in NodoAssist; npm; ClawHub: `clawhub:@nodoassist/cohere-provider`. NodoAssist Cohere provider plugin.

- **[comfy](/plugins/reference/comfy)** (`@nodoassist/comfy-provider`) - included in NodoAssist. Adds ComfyUI model provider support to NodoAssist.

- **[copilot-proxy](/plugins/reference/copilot-proxy)** (`@nodoassist/copilot-proxy`) - included in NodoAssist. Adds Copilot Proxy model provider support to NodoAssist.

- **[deepgram](/plugins/reference/deepgram)** (`@nodoassist/deepgram-provider`) - included in NodoAssist. Adds media understanding provider support. Adds realtime transcription provider support.

- **[document-extract](/plugins/reference/document-extract)** (`@nodoassist/document-extract-plugin`) - included in NodoAssist. Extract text and fallback page images from local document attachments.

- **[duckduckgo](/plugins/reference/duckduckgo)** (`@nodoassist/duckduckgo-plugin`) - included in NodoAssist. Adds web search provider support.

- **[elevenlabs](/plugins/reference/elevenlabs)** (`@nodoassist/elevenlabs-speech`) - included in NodoAssist. Adds media understanding provider support. Adds realtime transcription provider support. Adds text-to-speech provider support.

- **[fal](/plugins/reference/fal)** (`@nodoassist/fal-provider`) - included in NodoAssist. Adds fal model provider support to NodoAssist.

- **[file-transfer](/plugins/reference/file-transfer)** (`@nodoassist/file-transfer`) - included in NodoAssist. Fetch, list, and write files on paired nodes via dedicated node commands. Bypasses bash stdout truncation by using base64 over node.invoke for binaries up to 16 MB.

- **[github-copilot](/plugins/reference/github-copilot)** (`@nodoassist/github-copilot-provider`) - included in NodoAssist. Adds GitHub Copilot model provider support to NodoAssist.

- **[google](/plugins/reference/google)** (`@nodoassist/google-plugin`) - included in NodoAssist. Adds Google, Google Gemini CLI, Google Vertex model provider support to NodoAssist.

- **[huggingface](/plugins/reference/huggingface)** (`@nodoassist/huggingface-provider`) - included in NodoAssist. Adds Hugging Face model provider support to NodoAssist.

- **[imessage](/plugins/reference/imessage)** (`@nodoassist/imessage`) - included in NodoAssist. Adds the iMessage channel surface for sending and receiving NodoAssist messages.

- **[litellm](/plugins/reference/litellm)** (`@nodoassist/litellm-provider`) - included in NodoAssist. Adds LiteLLM model provider support to NodoAssist.

- **[llm-task](/plugins/reference/llm-task)** (`@nodoassist/llm-task`) - included in NodoAssist. Generic JSON-only LLM tool for structured tasks callable from workflows.

- **[lmstudio](/plugins/reference/lmstudio)** (`@nodoassist/lmstudio-provider`) - included in NodoAssist. Adds LM Studio model provider support to NodoAssist.

- **[logbook](/plugins/reference/logbook)** (`@nodoassist/logbook`) - included in NodoAssist. Automatic work journal: captures periodic screen snapshots from a paired node and turns them into a reviewable timeline of your day.

- **[memory-core](/plugins/reference/memory-core)** (`@nodoassist/memory-core`) - included in NodoAssist. Adds agent-callable tools.

- **[memory-wiki](/plugins/reference/memory-wiki)** (`@nodoassist/memory-wiki`) - included in NodoAssist. Persistent wiki compiler and Obsidian-friendly knowledge vault for NodoAssist.

- **[microsoft](/plugins/reference/microsoft)** (`@nodoassist/microsoft-speech`) - included in NodoAssist. Adds text-to-speech provider support.

- **[microsoft-foundry](/plugins/reference/microsoft-foundry)** (`@nodoassist/microsoft-foundry`) - included in NodoAssist. Adds Microsoft Foundry model provider support to NodoAssist.

- **[migrate-claude](/plugins/reference/migrate-claude)** (`@nodoassist/migrate-claude`) - included in NodoAssist. Imports Claude Code and Claude Desktop instructions, MCP servers, skills, and safe configuration into NodoAssist.

- **[migrate-hermes](/plugins/reference/migrate-hermes)** (`@nodoassist/migrate-hermes`) - included in NodoAssist. Imports Hermes configuration, memories, skills, and supported credentials into NodoAssist.

- **[minimax](/plugins/reference/minimax)** (`@nodoassist/minimax-provider`) - included in NodoAssist. Adds MiniMax, MiniMax Portal model provider support to NodoAssist.

- **[mistral](/plugins/reference/mistral)** (`@nodoassist/mistral-provider`) - included in NodoAssist. Adds Mistral model provider support to NodoAssist.

- **[novita](/plugins/reference/novita)** (`@nodoassist/novita-provider`) - included in NodoAssist. Adds Novita, Novita AI, Novitaai model provider support to NodoAssist.

- **[nvidia](/plugins/reference/nvidia)** (`@nodoassist/nvidia-provider`) - included in NodoAssist. Adds NVIDIA model provider support to NodoAssist.

- **[oc-path](/plugins/reference/oc-path)** (`@nodoassist/oc-path`) - included in NodoAssist. Adds the nodoassist path CLI for oc:// workspace file addressing.

- **[ollama](/plugins/reference/ollama)** (`@nodoassist/ollama-provider`) - included in NodoAssist. Adds Ollama, Ollama Cloud model provider support to NodoAssist.

- **[open-prose](/plugins/reference/open-prose)** (`@nodoassist/open-prose`) - included in NodoAssist. OpenProse VM skill pack with a /prose slash command.

- **[openai](/plugins/reference/openai)** (`@nodoassist/openai-provider`) - included in NodoAssist. Adds OpenAI model provider support to NodoAssist.

- **[opencode](/plugins/reference/opencode)** (`@nodoassist/opencode-provider`) - included in NodoAssist. Adds OpenCode model provider support to NodoAssist.

- **[opencode-go](/plugins/reference/opencode-go)** (`@nodoassist/opencode-go-provider`) - included in NodoAssist. Adds OpenCode Go model provider support to NodoAssist.

- **[openrouter](/plugins/reference/openrouter)** (`@nodoassist/openrouter-provider`) - included in NodoAssist. Adds OpenRouter model provider support to NodoAssist.

- **[policy](/plugins/reference/policy)** (`@nodoassist/policy`) - included in NodoAssist. Adds policy-backed doctor checks for workspace conformance.

- **[runway](/plugins/reference/runway)** (`@nodoassist/runway-provider`) - included in NodoAssist. Adds video generation provider support.

- **[senseaudio](/plugins/reference/senseaudio)** (`@nodoassist/senseaudio-provider`) - included in NodoAssist. Adds media understanding provider support.

- **[sglang](/plugins/reference/sglang)** (`@nodoassist/sglang-provider`) - included in NodoAssist. Adds SGLang model provider support to NodoAssist.

- **[synthetic](/plugins/reference/synthetic)** (`@nodoassist/synthetic-provider`) - included in NodoAssist. Adds Synthetic model provider support to NodoAssist.

- **[telegram](/plugins/reference/telegram)** (`@nodoassist/telegram`) - included in NodoAssist. Adds the Telegram channel surface for sending and receiving NodoAssist messages.

- **[together](/plugins/reference/together)** (`@nodoassist/together-provider`) - included in NodoAssist. Adds Together model provider support to NodoAssist.

- **[tts-local-cli](/plugins/reference/tts-local-cli)** (`@nodoassist/tts-local-cli`) - included in NodoAssist. Adds text-to-speech provider support.

- **[vllm](/plugins/reference/vllm)** (`@nodoassist/vllm-provider`) - included in NodoAssist. Adds vLLM model provider support to NodoAssist.

- **[volcengine](/plugins/reference/volcengine)** (`@nodoassist/volcengine-provider`) - included in NodoAssist. Adds Volcengine, Volcengine Plan model provider support to NodoAssist.

- **[voyage](/plugins/reference/voyage)** (`@nodoassist/voyage-provider`) - included in NodoAssist. Adds memory embedding provider support.

- **[vydra](/plugins/reference/vydra)** (`@nodoassist/vydra-provider`) - included in NodoAssist. Adds Vydra model provider support to NodoAssist.

- **[web-readability](/plugins/reference/web-readability)** (`@nodoassist/web-readability-plugin`) - included in NodoAssist. Extract readable article content from local HTML web fetch responses.

- **[webhooks](/plugins/reference/webhooks)** (`@nodoassist/webhooks`) - included in NodoAssist. Authenticated inbound webhooks that bind external automation to NodoAssist TaskFlows.

- **[workboard](/plugins/reference/workboard)** (`@nodoassist/workboard`) - included in NodoAssist. Dashboard workboard for agent-owned issues and sessions.

- **[xai](/plugins/reference/xai)** (`@nodoassist/xai-plugin`) - included in NodoAssist. Adds xAI model provider support to NodoAssist.

- **[xiaomi](/plugins/reference/xiaomi)** (`@nodoassist/xiaomi-provider`) - included in NodoAssist. Adds Xiaomi, Xiaomi Token Plan model provider support to NodoAssist.

## Official external packages

70 plugins

- **[acpx](/plugins/reference/acpx)** (`@nodoassist/acpx`) - npm; ClawHub. NodoAssist ACP runtime backend with plugin-owned session and transport management.

- **[amazon-bedrock](/plugins/reference/amazon-bedrock)** (`@nodoassist/amazon-bedrock-provider`) - npm; ClawHub. NodoAssist Amazon Bedrock provider plugin with model discovery, embeddings, and guardrail support.

- **[amazon-bedrock-mantle](/plugins/reference/amazon-bedrock-mantle)** (`@nodoassist/amazon-bedrock-mantle-provider`) - npm; ClawHub. NodoAssist Amazon Bedrock Mantle provider plugin for OpenAI-compatible model routing.

- **[anthropic-vertex](/plugins/reference/anthropic-vertex)** (`@nodoassist/anthropic-vertex-provider`) - npm; ClawHub. NodoAssist Anthropic Vertex provider plugin for Claude models on Google Vertex AI.

- **[arcee](/plugins/reference/arcee)** (`@nodoassist/arcee-provider`) - npm; ClawHub: `clawhub:@nodoassist/arcee-provider`. Adds Arcee model provider support to NodoAssist.

- **[brave](/plugins/reference/brave)** (`@nodoassist/brave-plugin`) - npm; ClawHub. NodoAssist Brave Search provider plugin for web search.

- **[cerebras](/plugins/reference/cerebras)** (`@nodoassist/cerebras-provider`) - npm; ClawHub: `clawhub:@nodoassist/cerebras-provider`. Adds Cerebras model provider support to NodoAssist.

- **[chutes](/plugins/reference/chutes)** (`@nodoassist/chutes-provider`) - npm; ClawHub: `clawhub:@nodoassist/chutes-provider`. Adds Chutes model provider support to NodoAssist.

- **[clickclack](/plugins/reference/clickclack)** (`@nodoassist/clickclack`) - npm; ClawHub: `clawhub:@nodoassist/clickclack`. Adds the Clickclack channel surface for sending and receiving NodoAssist messages.

- **[cloudflare-ai-gateway](/plugins/reference/cloudflare-ai-gateway)** (`@nodoassist/cloudflare-ai-gateway-provider`) - npm; ClawHub: `clawhub:@nodoassist/cloudflare-ai-gateway-provider`. Adds Cloudflare AI Gateway model provider support to NodoAssist.

- **[codex](/plugins/reference/codex)** (`@nodoassist/codex`) - npm; ClawHub. NodoAssist Codex app-server harness and model provider plugin with a Codex-managed GPT catalog.

- **[copilot](/plugins/reference/copilot)** (`@nodoassist/copilot`) - npm; ClawHub: `clawhub:@nodoassist/copilot`. Registers the GitHub Copilot agent runtime.

- **[deepinfra](/plugins/reference/deepinfra)** (`@nodoassist/deepinfra-provider`) - npm; ClawHub: `clawhub:@nodoassist/deepinfra-provider`. Adds DeepInfra model provider support to NodoAssist.

- **[deepseek](/plugins/reference/deepseek)** (`@nodoassist/deepseek-provider`) - npm; ClawHub: `clawhub:@nodoassist/deepseek-provider`. Adds DeepSeek model provider support to NodoAssist.

- **[diagnostics-otel](/plugins/reference/diagnostics-otel)** (`@nodoassist/diagnostics-otel`) - npm; ClawHub: `clawhub:@nodoassist/diagnostics-otel`. NodoAssist diagnostics OpenTelemetry exporter for metrics, traces, and logs.

- **[diagnostics-prometheus](/plugins/reference/diagnostics-prometheus)** (`@nodoassist/diagnostics-prometheus`) - npm; ClawHub: `clawhub:@nodoassist/diagnostics-prometheus`. NodoAssist diagnostics Prometheus exporter for runtime metrics.

- **[diffs](/plugins/reference/diffs)** (`@nodoassist/diffs`) - npm; ClawHub. NodoAssist read-only diff viewer plugin and file renderer for agents.

- **[diffs-language-pack](/plugins/reference/diffs-language-pack)** (`@nodoassist/diffs-language-pack`) - npm; ClawHub: `clawhub:@nodoassist/diffs-language-pack`. Adds syntax highlighting for languages outside the default diffs viewer set.

- **[discord](/plugins/reference/discord)** (`@nodoassist/discord`) - npm; ClawHub. NodoAssist Discord channel plugin for channels, DMs, commands, and app events.

- **[exa](/plugins/reference/exa)** (`@nodoassist/exa-plugin`) - npm; ClawHub: `clawhub:@nodoassist/exa-plugin`. Adds web search provider support.

- **[featherless](/plugins/reference/featherless)** (`@nodoassist/featherless-provider`) - npm; ClawHub: `clawhub:@nodoassist/featherless-provider`. NodoAssist Featherless AI provider plugin.

- **[feishu](/plugins/reference/feishu)** (`@nodoassist/feishu`) - npm; ClawHub. NodoAssist Feishu/Lark channel plugin for chats and workplace tools (community maintained by @m1heng).

- **[firecrawl](/plugins/reference/firecrawl)** (`@nodoassist/firecrawl-plugin`) - npm; ClawHub: `clawhub:@nodoassist/firecrawl-plugin`. Adds agent-callable tools. Adds web fetch provider support. Adds web search provider support.

- **[fireworks](/plugins/reference/fireworks)** (`@nodoassist/fireworks-provider`) - npm; ClawHub: `clawhub:@nodoassist/fireworks-provider`. Adds Fireworks model provider support to NodoAssist.

- **[gmi](/plugins/reference/gmi)** (`@nodoassist/gmi-provider`) - npm; ClawHub: `clawhub:@nodoassist/gmi-provider`. NodoAssist GMI Cloud provider plugin.

- **[google-meet](/plugins/reference/google-meet)** (`@nodoassist/google-meet`) - npm; ClawHub. NodoAssist Google Meet participant plugin for joining calls through Chrome or Twilio transports.

- **[googlechat](/plugins/reference/googlechat)** (`@nodoassist/googlechat`) - npm; ClawHub. NodoAssist Google Chat channel plugin for spaces and direct messages.

- **[gradium](/plugins/reference/gradium)** (`@nodoassist/gradium-speech`) - npm; ClawHub: `clawhub:@nodoassist/gradium-speech`. Adds text-to-speech provider support.

- **[groq](/plugins/reference/groq)** (`@nodoassist/groq-provider`) - npm; ClawHub: `clawhub:@nodoassist/groq-provider`. Adds Groq model provider support to NodoAssist.

- **[inworld](/plugins/reference/inworld)** (`@nodoassist/inworld-speech`) - npm; ClawHub: `clawhub:@nodoassist/inworld-speech`. Inworld streaming text-to-speech (MP3, OGG_OPUS, PCM telephony).

- **[irc](/plugins/reference/irc)** (`@nodoassist/irc`) - npm; ClawHub: `clawhub:@nodoassist/irc`. Adds the IRC channel surface for sending and receiving NodoAssist messages.

- **[kilocode](/plugins/reference/kilocode)** (`@nodoassist/kilocode-provider`) - npm; ClawHub: `clawhub:@nodoassist/kilocode-provider`. Adds Kilocode model provider support to NodoAssist.

- **[kimi](/plugins/reference/kimi)** (`@nodoassist/kimi-provider`) - npm; ClawHub: `clawhub:@nodoassist/kimi-provider`. Adds Kimi, Kimi Coding model provider support to NodoAssist.

- **[line](/plugins/reference/line)** (`@nodoassist/line`) - npm; ClawHub. NodoAssist LINE channel plugin for LINE Bot API chats.

- **[llama-cpp](/plugins/reference/llama-cpp)** (`@nodoassist/llama-cpp-provider`) - npm; ClawHub. Local GGUF embeddings through node-llama-cpp.

- **[lobster](/plugins/reference/lobster)** (`@nodoassist/lobster`) - npm; ClawHub. Lobster workflow tool plugin for typed pipelines and resumable approvals.

- **[longcat](/plugins/reference/longcat)** (`@nodoassist/longcat-provider`) - npm; ClawHub: `clawhub:@nodoassist/longcat-provider`. NodoAssist LongCat provider plugin.

- **[matrix](/plugins/reference/matrix)** (`@nodoassist/matrix`) - ClawHub: `clawhub:@nodoassist/matrix`; npm. NodoAssist Matrix channel plugin for rooms and direct messages.

- **[mattermost](/plugins/reference/mattermost)** (`@nodoassist/mattermost`) - npm; ClawHub: `clawhub:@nodoassist/mattermost`. Adds the Mattermost channel surface for sending and receiving NodoAssist messages.

- **[memory-lancedb](/plugins/reference/memory-lancedb)** (`@nodoassist/memory-lancedb`) - npm; ClawHub. NodoAssist LanceDB-backed long-term memory plugin with auto-recall, auto-capture, and vector search.

- **[moonshot](/plugins/reference/moonshot)** (`@nodoassist/moonshot-provider`) - npm; ClawHub: `clawhub:@nodoassist/moonshot-provider`. Adds Moonshot model provider support to NodoAssist.

- **[msteams](/plugins/reference/msteams)** (`@nodoassist/msteams`) - npm; ClawHub. NodoAssist Microsoft Teams channel plugin for bot conversations.

- **[nextcloud-talk](/plugins/reference/nextcloud-talk)** (`@nodoassist/nextcloud-talk`) - npm; ClawHub. NodoAssist Nextcloud Talk channel plugin for conversations.

- **[nostr](/plugins/reference/nostr)** (`@nodoassist/nostr`) - npm; ClawHub. NodoAssist Nostr channel plugin for NIP-04 encrypted direct messages.

- **[openshell](/plugins/reference/openshell)** (`@nodoassist/openshell-sandbox`) - npm; ClawHub. NodoAssist sandbox backend for the NVIDIA OpenShell CLI with mirrored local workspaces and SSH command execution.

- **[parallel](/tools/parallel-search)** (`@nodoassist/parallel-plugin`) - npm; ClawHub: `clawhub:@nodoassist/parallel-plugin`. Adds web search provider support.

- **[perplexity](/plugins/reference/perplexity)** (`@nodoassist/perplexity-plugin`) - npm; ClawHub: `clawhub:@nodoassist/perplexity-plugin`. Adds web search provider support.

- **[pixverse](/plugins/reference/pixverse)** (`@nodoassist/pixverse-provider`) - npm; ClawHub: `clawhub:@nodoassist/pixverse-provider`. NodoAssist PixVerse video generation provider plugin.

- **[qianfan](/plugins/reference/qianfan)** (`@nodoassist/qianfan-provider`) - npm; ClawHub: `clawhub:@nodoassist/qianfan-provider`. Adds Qianfan model provider support to NodoAssist.

- **[qqbot](/plugins/reference/qqbot)** (`@nodoassist/qqbot`) - npm; ClawHub. NodoAssist QQ Bot channel plugin for group and direct-message workflows.

- **[qwen](/plugins/reference/qwen)** (`@nodoassist/qwen-provider`) - npm; ClawHub: `clawhub:@nodoassist/qwen-provider`. Adds Qwen, Qwen Cloud, Model Studio, DashScope, Qwen Oauth, Qwen Portal, Qwen CLI model provider support to NodoAssist.

- **[raft](/plugins/reference/raft)** (`@nodoassist/raft`) - npm; ClawHub. NodoAssist Raft channel plugin for secure CLI wake bridges.

- **[searxng](/plugins/reference/searxng)** (`@nodoassist/searxng-plugin`) - npm; ClawHub: `clawhub:@nodoassist/searxng-plugin`. Adds web search provider support.

- **[signal](/plugins/reference/signal)** (`@nodoassist/signal`) - npm; ClawHub: `clawhub:@nodoassist/signal`. Adds the Signal channel surface for sending and receiving NodoAssist messages.

- **[slack](/plugins/reference/slack)** (`@nodoassist/slack`) - npm; ClawHub. NodoAssist Slack channel plugin for channels, DMs, commands, and app events.

- **[sms](/plugins/reference/sms)** (`@nodoassist/sms`) - npm; ClawHub: `clawhub:@nodoassist/sms`. Twilio SMS channel plugin for NodoAssist text messages.

- **[stepfun](/plugins/reference/stepfun)** (`@nodoassist/stepfun-provider`) - npm; ClawHub: `clawhub:@nodoassist/stepfun-provider`. Adds StepFun, StepFun Plan model provider support to NodoAssist.

- **[synology-chat](/plugins/reference/synology-chat)** (`@nodoassist/synology-chat`) - npm; ClawHub. Synology Chat channel plugin for NodoAssist channels and direct messages.

- **[tavily](/plugins/reference/tavily)** (`@nodoassist/tavily-plugin`) - npm; ClawHub: `clawhub:@nodoassist/tavily-plugin`. Adds agent-callable tools. Adds web search provider support.

- **[tencent](/plugins/reference/tencent)** (`@nodoassist/tencent-provider`) - npm; ClawHub: `clawhub:@nodoassist/tencent-provider`. Adds Tencent TokenHub, Tencent Tokenplan model provider support to NodoAssist.

- **[tlon](/plugins/reference/tlon)** (`@nodoassist/tlon`) - npm; ClawHub. NodoAssist Tlon/Urbit channel plugin for chat workflows.

- **[tokenjuice](/plugins/reference/tokenjuice)** (`@nodoassist/tokenjuice`) - npm; ClawHub: `clawhub:@nodoassist/tokenjuice`. Compacts exec and bash tool results with tokenjuice reducers.

- **[twitch](/plugins/reference/twitch)** (`@nodoassist/twitch`) - npm; ClawHub. NodoAssist Twitch channel plugin for chat and moderation workflows.

- **[venice](/plugins/reference/venice)** (`@nodoassist/venice-provider`) - npm; ClawHub: `clawhub:@nodoassist/venice-provider`. Adds Venice model provider support to NodoAssist.

- **[vercel-ai-gateway](/plugins/reference/vercel-ai-gateway)** (`@nodoassist/vercel-ai-gateway-provider`) - npm; ClawHub: `clawhub:@nodoassist/vercel-ai-gateway-provider`. Adds Vercel AI Gateway model provider support to NodoAssist.

- **[voice-call](/plugins/reference/voice-call)** (`@nodoassist/voice-call`) - npm; ClawHub. NodoAssist voice-call plugin for Twilio, Telnyx, and Plivo phone calls.

- **[whatsapp](/plugins/reference/whatsapp)** (`@nodoassist/whatsapp`) - ClawHub: `clawhub:@nodoassist/whatsapp`; npm. NodoAssist WhatsApp channel plugin for WhatsApp Web chats.

- **[zai](/plugins/reference/zai)** (`@nodoassist/zai-provider`) - npm; ClawHub: `clawhub:@nodoassist/zai-provider`. Adds Z.AI model provider support to NodoAssist.

- **[zalo](/plugins/reference/zalo)** (`@nodoassist/zalo`) - npm; ClawHub. NodoAssist Zalo channel plugin for bot and webhook chats.

- **[zalouser](/plugins/reference/zalouser)** (`@nodoassist/zalouser`) - npm; ClawHub. NodoAssist Zalo Personal Account plugin via native zca-js integration.

## Source checkout only

3 plugins

- **[qa-channel](/plugins/reference/qa-channel)** (`@nodoassist/qa-channel`) - source checkout only. Adds the QA Channel surface for sending and receiving NodoAssist messages.

- **[qa-lab](/plugins/reference/qa-lab)** (`@nodoassist/qa-lab`) - source checkout only. NodoAssist QA lab plugin with private debugger UI and scenario runner.

- **[qa-matrix](/plugins/reference/qa-matrix)** (`@nodoassist/qa-matrix`) - source checkout only. Matrix QA transport runner and substrate.
