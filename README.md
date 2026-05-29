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

## 🔮 Strategic Development Roadmap

To elevate NEUROS from a local core architecture into a production-grade enterprise asset, development is structured across the following upcoming execution phases:

* **Phase 2: Semantic Memory & Vector RAG Pipeline** Integration of an asynchronous vector database layer (**ChromaDB**) to support hierarchical file ingestions, sliding-window semantic chunking, and persistent long-term conversation memory.
* **Phase 3: Autonomous Desktop Orchestration & Tool Use**
  Implementation of structured JSON function-calling schemas allowing the local LLM to execute secure runtime system operations, cross-platform file automation, and ambient status monitoring.

---

## 📄 License & Terms

Distributed under the MIT License. See `LICENSE` for more information. Developed with precision for advanced portfolio demonstration.