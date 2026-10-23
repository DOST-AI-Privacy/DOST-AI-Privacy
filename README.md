# DOST-AI-Privacy

**DOST** (**D**etect, **O**bserve, **S**hield, **T**ransfer) is a lightweight, ultra-fast inline **AI Data Loss Prevention (DLP) and privacy proxy appliance** designed to protect sensitive enterprise data when employees and autonomous agents interact with cloud LLMs (such as ChatGPT, Claude, Cursor, and Claude Code).

🌐 **Website:** [https://dost-ai-privacy.github.io/DOST-AI-Privacy/](https://dost-ai-privacy.github.io/DOST-AI-Privacy/)

## Overview

- **The Core Innovation:** Instead of destroying text with irreversible `[REDACTED]` tags—which ruins LLM reasoning and breaks code generation—DOST performs **silent, stateful, reversible pseudonymization**.
- **How It Works:** Outbound sensitive entities (secrets, PII, company codenames, Person IDs) are swapped with structured placeholders (e.g., `Company_Alpha`). On the inbound Server-Sent Events (SSE) response stream, a sliding-window micro-buffer seamlessly translates those placeholders back into the original data in real time with sub-20ms latency.
- **Under the Hood:** Uses a 2-stage detection pipeline combining microsecond keyword/regex scanning (Aho-Corasick, Google RE2) with quantized tiny ML models (GLiNER & GLiClass) to separate public context from confidential data.

## The 4 Pillars of DOST

1. 🔍 **Detect:** Microsecond 2-stage scanning (Google RE2, Aho-Corasick, GLiNER) filtering out false positives.
2. 👁️ **Observe:** Millisecond ML model classification (GLiNER & GLiClass) determining whether data is sensitive in context.
3. 🛡️ **Shield:** Stateful reversible pseudonymization of private data that shouldn't leave the perimeter (e.g., Person ID, internal codenames, secrets).
4. ⚡ **Transfer:** Seamless sliding-window SSE streamer restoring real values on inbound traffic with sub-20ms latency across all LLM providers and agentic tools.

## Maintainers

- **Atahan Alp**
- **Ali Emir Alsırt**
- **Ahmet Eren Gökalp**
- **Ahmet Hakan Kızılçubuk**
- **Can Yıldırım**
