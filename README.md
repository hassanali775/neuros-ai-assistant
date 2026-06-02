# NEUROS

NEUROS is a high-performance, AI-native operating system assistant designed to execute low-latency contextual tasks and isolated host system automation. Pairing an asynchronous backend architecture with an event-driven telemetry interface, the platform establishes a local sandbox environment for multi-agent collaboration with zero reliance on third-party cloud APIs.

---

## Technical Architecture & Dependencies

The system is structured as a decoupled full-stack monorepo maximizing non-blocking asynchronous runtimes:

* **Frontend Engine:** Next.js 15 (App Router), TypeScript, and Tailwind CSS. State propagation, real-time data streaming, and live system telemetry layout states are managed via a centralized Zustand store.
* **Backend Core:** FastAPI (Python) utilizing asynchronous request pooling, custom modular routing, and structured Pydantic data validation pipelines.
* **Local Inference:** Orchestrated via Ollama, routing localized language models over a persistent local loopback adapter to ensure absolute operational data privacy.

---

## Core Engineering Implementations (Phase 6 Specs Active)

* **Asynchronous Token Stream Interception:** Built a real-time stream parser within the FastAPI application layer. The backend monitors the incoming LLM token generation stream mid-flight. Upon detecting structural execution macro tags (`:::WRITE_FILE:::`, `:::RUN_SCRIPT:::`), the pipeline intercepts the stream, pauses the client-side text generation display, and triggers native host automation workflows.
* **Isolated Subprocess Sandbox Runtime:** Deployed secure, non-blocking `subprocess.Popen` execution blocks wrapped with strict execution timeouts. This runtime compiles and runs generated Python scripts in isolation, captures real-time `stdout`/`stderr` diagnostics, and pipes live execution metrics directly back to the UI state layer.
* **Machine Path Virtualization:** Engineered a macro routing layer to handle and resolve path directory collisions across cross-platform environments, abstracting local Windows paths and active OneDrive cloud-synchronized folder overrides cleanly.
* **Agentic Mesh Orchestration:** Deployed a dynamic `AgentOrchestrator` system. The core model programmatically parses prompts and delegates execution context to specialized sub-agents (`kernel_engineer` and `brand_strategist`) based on task complexity.
* **Live Telemetry Monitor Interface:** Engineered an industrial, high-density system status side panel in Next.js. This component hooks directly into the global Zustand store to expose real-time sandbox flags, active sub-agent threads, and system containment parameters transparently.
* **End-to-End Type Safety:** Mapped backend Pydantic validation schemas directly to TypeScript interfaces in the frontend workspace, preventing runtime data-structure mutations across the network boundary.
* **Build Management:** Fully containerized architecture leveraging a multi-stage Docker environment alongside orchestrated multi-container services via Docker Compose for uniform local deployment.

---

## Repository Structure

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

Strategic Roadmap
Phase 7: Long-Term Memory Vector RAG Pipeline: Integration of an asynchronous vector database layer (ChromaDB) to support hierarchical workspace file ingestion and sliding-window semantic chunk indexing.