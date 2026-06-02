# NEUROS 🧠

NEUROS is a high-performance, AI-native operating system assistant designed to operate fully locally on consumer-grade hardware. By pairing an asynchronous backend framework with a lightning-fast streaming telemetry interface, NEUROS establishes a secure, private environment for advanced conversational logic, multi-agent orchestration, and isolated host file system intelligence.

---

## 🛠️ Core Architecture & Tech Stack

NEUROS is structured as a decoupled, high-performance monorepo maximizing modern asynchronous protocols:

* **Frontend Interface:** Built using Next.js 15, TypeScript, and Tailwind CSS. State synchronization, non-blocking streaming data flows, and live system telemetry layout states are managed via a centralized Zustand store architecture.
* **Backend Service:** Powering the application layer is FastAPI (Python), utilizing asynchronous request pooling, custom modular routers, and structured Pydantic data validation pipelines.
* **Local Inference Engine:** Driven entirely by Ollama, orchestrating local deployment of specialized language models over a persistent localhost loopback adapter—ensuring 100% data privacy with zero third-party cloud API dependencies.

---

## 🚀 Key Engineering Features (Phase 6 Specs Locked)

* **Asynchronous Token Stream Interception:** Implemented a real-time stream parser within the FastAPI application layer. The backend monitors the incoming LLM token stream generator mid-flight. When structural execution macro tags (`:::WRITE_FILE:::`, `:::RUN_SCRIPT:::`) are detected, the system safely pauses the client-side text generation response and triggers native host automation workflows.
* **Isolated Subprocess Sandbox Runtime:** Deployed secure, non-blocking `subprocess.Popen` execution blocks wrapped with strict execution timeouts. This runtime compiles and runs generated Python scripts in isolation, captures real-time `stdout`/`stderr` compiler diagnostics, and streams execution metrics straight back to the user interface state.
* **Machine Path Virtualization:** Engineered a macro routing layer to safely handle and resolve path directory collisions across cross-platform environments (handling Windows local paths vs. active OneDrive folder synchronization abstracts smoothly).
* **Agentic Mesh Orchestration:** Implemented a dynamic `AgentOrchestrator` system. The core LLM parses input prompts and programmatically hands off execution context to specialized sub-agents (`kernel_engineer` and `brand_strategist`) behind the scenes depending on system complexity.
* **Live Telemetry Monitor Interface:** Re-engineered the Next.js frontend with an industrial, high-density telemetry console side-panel. This component hooks directly into the centralized Zustand state store to expose real-time sandbox states, active sub-agent threads, and system containment flags transparently.
* **Strict Type Safety:** Complete end-to-end type safety mapping backend Pydantic schemas directly to TypeScript interfaces in the frontend workspace, preventing runtime data-structure mutations.
* **Production Build Management:** Fully containerized setup leveraging a multi-stage Docker environment alongside orchestrated multi-container setups via Docker Compose for seamless local deployment.

---

## 📂 Repository Blueprint

```text
neuros/
├── frontend/             # Next.js 15 App Router Frontend
│   ├── app/              # UI Routing, Layouts & Telemetry Pages
│   ├── components/       # Component Library (Chat Console, Sidebar Layout)
│   ├── store/            # Zustand State Management Store
│   └── hooks/            # Contextual Custom Hooks (useChat, useModels)
├── backend/              # FastAPI High-Performance Backend
│   ├── models/           # Database Structures & Core Migrations (SQLAlchemy)
│   ├── routers/          # Modularized Endpoint Routers (Chat, Files)
│   ├── services/         # Core Business Logic (Ollama & Agent Orchestrator)
│   └── main.py           # Application Gateway & Lifespan Hooks
├── docker-compose.yml    # Multi-Service Local Container Orchestration
└── .gitignore            # Monorepo Security & Dependency Filter