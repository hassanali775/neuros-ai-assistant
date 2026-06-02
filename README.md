# NEUROS

> **NEUROS** is a high-performance, AI-native operating system assistant designed to operate fully locally on consumer-grade hardware. By pairing an asynchronous backend framework with a lightning-fast streaming interface, NEUROS establishes a secure, private environment for advanced conversational logic and local file intelligence.

---

## 🛠️ Core Architecture & Tech Stack

NEUROS is structured as a decoupled, high-performance monorepo maximizing modern asynchronous protocols:

* **Frontend Interface:** Built using **Next.js 15**, **TypeScript**, and **Tailwind CSS**. State synchronization and non-blocking streaming data flows are managed via a centralized **Zustand** store architecture.
* **Backend Service:** Powering the application layer is **FastAPI (Python)**, utilizing asynchronous request pooling, custom routers, and structured **Pydantic** validation pipelines.
* **Local Inference Engine:** Driven entirely by **Ollama**, orchestrating local deployment of the **Llama 3** model over a persistent localhost loopback adapter—ensuring 100% data privacy with zero third-party API dependencies.

---
## 🚀 Key Engineering Features

* **Asynchronous Local Inference:** Non-blocking streaming chat loops utilizing Server-Sent Events (SSE) to deliver token-by-token processing directly from local hardware.
* **State Synchronization:** Fully unified global frontend state utilizing Zustand, enabling optimistic UI updates, multi-model selection polling, and elegant sidebar interaction.
* **Strict Type Safety:** Complete end-to-end type safety mapping Pydantic schemas in the backend to TypeScript interfaces in the frontend, mitigating data-structure mutations.
* **Production Build Management:** Fully containerized setup leveraging a multi-stage Docker environment alongside orchestrated multi-container setups for seamless local deployment.

---

## 📂 Repository Blueprint

```text
neuros/
├── frontend/             # Next.js 15 App Router Frontend
│   ├── app/              # UI Routing & Core Pages
│   ├── components/       # Component Library (Chat, Layout, UI)
│   ├── store/            # Zustand State Management Store
│   └── hooks/            # Contextual Custom Hooks (useChat, useModels)
├── backend/              # FastAPI High-Performance Backend
│   ├── models/           # SQLAlchemy Database Structures & Migrations
│   ├── routers/          # Modularized Endpoint Routers (Chat, Files)
│   ├── services/         # Core Business Logic Layers (Ollama Orchestrator)
│   └── main.py           # Application Gateway & Lifespan Hooks
├── docker-compose.yml    # Multi-Service Local Container Orchestration
└── .gitignore            # Explicit Repository Security Filter
---

## 🚀 Completed Core Architecture & Engineering Features (Phase 6 Specs)

NEUROS has been upgraded from a basic local chat interface into a fully functional, event-driven local AI operating system assistant capable of autonomous host execution.

* **Asynchronous Token Stream Interception:** Implemented a real-time stream parser within the FastAPI application layer. The backend monitors the incoming LLM token generation generator mid-flight. When structural execution macro tags (`:::WRITE_FILE:::`, `:::RUN_SCRIPT:::`) are detected, the system safely pauses the text stream client response and triggers native host automation workflows.
* **Isolated Subprocess Sandbox Runtime:** Deployed secure, non-blocking `subprocess.Popen` execution blocks wrapped with strict execution timeouts. This runtime compiles and runs generated Python code scripts in isolation, captures real-time `stdout`/`stderr` compiler diagnostics, and streams execution metrics straight back to the user interface.
* **Machine Path Virtualization:** Engineered a macro routing layer to resolve directory and path collision bugs across cross-platform environments (handling Windows local paths vs. active OneDrive folder synchronization abstracts smoothly).
* **Agentic Mesh Orchestration:** Implemented a dynamic `AgentOrchestrator` system. The core LLM parses input prompts and programmatically hands off execution context to specialized sub-agents (`kernel_engineer` and `brand_strategist`) behind the scenes depending on system complexity.
* **Live Telemetry Monitor Interface:** Re-engineered the Next.js frontend with an industrial, high-density telemetry console side-panel. This component hooks directly into the centralized Zustand state store to expose real-time sandbox states, active sub-agent threads, and system containment flags.

---

## 🔮 Next Phase Engineering Roadmap

* **Phase 7: Long-Term Memory Vector RAG Pipeline:** Integration of an asynchronous vector database layer (**ChromaDB**) to support hierarchical workspace file ingestion and sliding-window semantic chunk indexing.

---

## 📄 License & Terms

Distributed under the MIT License. See `LICENSE` for more information. Developed with precision for advanced portfolio demonstration.