<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_Flow-12-FF0072?style=for-the-badge&logo=react&logoColor=white" alt="React Flow" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<h1 align="center">🏗️ HR Workflow Designer</h1>

<p align="center">
  <strong>A scalable, production-grade visual workflow builder for HR processes</strong><br/>
  Built with React, TypeScript, React Flow, and Tailwind CSS
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-future-improvements">Roadmap</a>
</p>

---

## 📋 Overview

**HR Workflow Designer** is a sophisticated, enterprise-ready visual workflow builder purpose-built for designing and simulating HR business processes — onboarding pipelines, approval chains, automated notifications, and more.

It provides a **drag-and-drop canvas** where users can compose workflows from typed nodes (Start, Task, Approval, Automation, End), connect them with edges, configure each step through dynamic forms, and run simulations — all within a polished, responsive interface backed by strong TypeScript typing and modular architecture.

### Why This Exists

Modern HR teams manage complex, multi-step processes that span departments and systems. This tool turns those invisible processes into **visual, editable, simulatable** diagrams that anyone can understand and iterate on — no code required.

---

## ✨ Features

### Core Workflow Builder
- **Drag & Drop** — Drag typed nodes from the sidebar palette directly onto the canvas
- **Node Connection** — Connect nodes via handles to define process flow
- **Node Deletion** — Remove nodes via keyboard (`Delete`/`Backspace`) or the config panel
- **Canvas Controls** — Zoom, pan, fit-to-view, snap-to-grid, and interactive mini-map
- **Undo / Redo** — Full history stack with `Ctrl+Z` / `Ctrl+Shift+Z` keyboard shortcuts

### Five Node Types
| Node | Purpose | Color |
|------|---------|-------|
| 🟢 **Start** | Workflow entry point with trigger type (manual / scheduled / event) | Emerald |
| 🔵 **Task** | Manual action step with assignee, priority, due date, and custom fields | Blue |
| 🟡 **Approval** | Sign-off gate with approver role, auto-approve threshold, and escalation | Amber |
| 🟣 **Automation** | System action with dynamic fields loaded from mock API | Purple |
| 🔴 **End** | Termination point with status (completed / cancelled / failed) | Rose |

### Dynamic Configuration Forms
- Each node type renders a **custom form** in the right panel on selection
- **Automation nodes** dynamically fetch available actions from a mock API (`GET /automations`) and render form fields specific to the chosen action (text, email, number, select, boolean)
- **Task nodes** support adding unlimited key-value custom fields

### 🔥 Smart Workflow Validation (Advanced)
Real-time validation engine that checks:

| Check | Severity | Description |
|-------|----------|-------------|
| Missing Start Node | 🔴 Error | No entry point defined |
| Multiple Start Nodes | 🔴 Error | Only one Start is allowed |
| Missing End Node | 🔴 Error | No termination point defined |
| Disconnected Nodes | 🟡 Warning | Nodes with zero connections |
| Dead Ends | 🟡 Warning | Non-End nodes with no outgoing edges |
| Unreachable Nodes | 🟡 Warning | Nodes with no incoming edges (except Start) |
| Cycles | 🔴 Error | Circular dependencies detected via DFS |
| Missing Required Fields | 🔴 Error | Task/Approval title, Automation action |

**Validation UI:**
- **Red borders** on invalid nodes with hover tooltips showing specific errors
- **Bottom panel** listing all issues with severity badges, suggestions, and auto-fix buttons
- Issues update in **real-time** as the graph changes

### Simulation Engine
- **POST /simulate** — BFS traversal of the workflow graph with per-node execution logs
- Terminal-style console output with timestamps and color-coded log levels
- Execution stats: duration, node count, success/fail status
- Approval nodes simulate 80/20 approve/reject probability

### Import / Export
- **Export** — Serialize the full graph (nodes + edges + metadata) to a downloadable `.json` file
- **Import** — Load a previously exported workflow and restore the canvas state

### Bonus
- **Mini-map** — Color-coded birds-eye view of the entire workflow
- **JSON Export** — One-click download of the serialized workflow

---

## 🛠 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19 | Component architecture |
| **Language** | TypeScript | 6 | Type safety |
| **Graph Engine** | @xyflow/react (React Flow) | 12 | Canvas, nodes, edges, handles, minimap |
| **Styling** | Tailwind CSS | 4 | Utility-first responsive design |
| **Build Tool** | Vite | 8 | HMR, bundling, dev server |
| **Icons** | Lucide React | 1.8 | Consistent icon system |
| **IDs** | uuid | 14 | Unique node/edge identifiers |

---

## 🏗 Architecture

The project follows a **feature-sliced, layered architecture** with strict separation of concerns:

```
src/
├── app/                    # Application shell
│   └── App.tsx             # Root layout, state orchestration, panels
│
├── components/
│   ├── canvas/             # Canvas-level components
│   │   ├── Sidebar.tsx     # Draggable node palette (left panel)
│   │   ├── WorkflowCanvas.tsx  # React Flow canvas with drag-drop
│   │   └── NodeRenderer.tsx    # Right panel: form routing + actions
│   │
│   ├── nodes/              # Custom React Flow node components
│   │   ├── StartNode.tsx
│   │   ├── TaskNode.tsx
│   │   ├── ApprovalNode.tsx
│   │   ├── AutomatedNode.tsx
│   │   └── EndNode.tsx
│   │
│   ├── forms/              # Per-node configuration forms
│   │   ├── StartForm.tsx
│   │   ├── TaskForm.tsx
│   │   ├── ApprovalForm.tsx
│   │   ├── AutomatedForm.tsx   # Dynamic fields from mock API
│   │   └── EndForm.tsx
│   │
│   └── sandbox/            # Validation & simulation panels
│       ├── ValidationPanel.tsx
│       └── SimulationPanel.tsx
│
├── hooks/                  # Custom React hooks
│   ├── useWorkflow.ts      # Node/edge state, undo/redo
│   ├── useNodes.ts         # Re-export (architecture compliance)
│   └── useEdges.ts         # Re-export (architecture compliance)
│
├── services/               # API layer
│   ├── api.ts              # Public API (swappable facade)
│   └── mockApi.ts          # Mock GET /automations, POST /simulate
│
├── types/                  # TypeScript type definitions
│   └── workflow.types.ts   # All domain types, node data, validation, simulation
│
├── utils/                  # Pure utility functions
│   ├── graphUtils.ts       # Adjacency list, cycle detection, connectivity
│   ├── validator.ts        # Comprehensive workflow validation rules
│   └── serializer.ts       # Serialize, deserialize, import/export
│
├── styles/
│   └── index.css           # Tailwind imports, global styles, animations
│
├── main.tsx                # Entry point
└── vite-env.d.ts           # Vite type declarations
```

### Design Principles

1. **Separation of Concerns** — UI components don't contain business logic; validation, simulation, and serialization live in `utils/` and `services/`
2. **Type-Driven Development** — Discriminated unions for node data (`WorkflowNodeData`) ensure each node type carries exactly the fields it needs
3. **Swappable API Layer** — `services/api.ts` is a thin facade over `mockApi.ts`; replace with real HTTP calls for production
4. **Immutable State Updates** — All node/edge mutations go through React Flow's state setters with spread operators
5. **Memoized Rendering** — Custom nodes are wrapped in `React.memo` to prevent unnecessary re-renders on graph changes

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/ayansahag1010/hr-workflow-designer-react.git
cd hr-workflow-designer-react

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📸 Screenshots

> Screenshots will be added here after the initial deployment.

| View | Description |
|------|-------------|
| **Canvas View** | Workflow with connected nodes on the drag-and-drop canvas |
| **Validation** | Red borders on invalid nodes with the validation panel open |
| **Node Config** | Right panel showing dynamic form for an Automation node |
| **Simulation** | Terminal-style execution logs after running a simulation |
| **Mini-map** | Color-coded birds-eye overview of the workflow graph |

---

## 📐 Design Decisions

### Why React Flow (@xyflow/react)?
React Flow is the de-facto standard for node-based graph UIs in React. It provides performant canvas rendering, built-in zoom/pan, customizable nodes and edges, handles, mini-map, and controls — allowing us to focus on domain logic rather than graph primitives.

### Why Discriminated Union Types?
Node data uses TypeScript discriminated unions (`type` field) so that:
```typescript
type WorkflowNodeData = StartNodeData | TaskNodeData | ApprovalNodeData | ...
```
This makes it impossible to access `assignee` on a Start node or `triggerType` on a Task node at compile time — catching bugs before they ship.

### Why Undo/Redo via Snapshots?
Rather than implementing command-pattern undo (which adds significant complexity for graph operations), we use a bounded snapshot stack of serialized states. This is simpler, handles all operation types uniformly, and the 50-snapshot limit prevents memory issues.

### Why Mock API with Delay?
The mock API adds realistic `async/await` behavior with artificial delays. This ensures:
- Loading states are visible (the Automation form shows a spinner)
- The code patterns match what you'd use with a real backend
- Swapping to real APIs requires zero UI changes

---

## 🔮 Future Improvements

- [ ] **Conditional Branching** — Add conditional edges with expression evaluators
- [ ] **Parallel Execution Paths** — Fork/join nodes for concurrent workflows  
- [ ] **Role-Based Access Control** — Restrict editing by user role
- [ ] **Version History** — Persist and restore named workflow versions
- [ ] **Real Backend Integration** — Replace mock API with REST/GraphQL endpoints
- [ ] **Collaborative Editing** — Real-time multi-user editing via WebSocket/CRDT
- [ ] **Execution Dashboard** — Live monitoring of running workflow instances
- [ ] **Template Library** — Pre-built workflow templates (onboarding, offboarding, etc.)
- [ ] **Dark Mode** — Full dark theme support
- [ ] **Accessibility** — ARIA labels, keyboard navigation, screen reader support
- [ ] **Testing** — Unit tests (Vitest), integration tests (Playwright)
- [ ] **CI/CD Pipeline** — GitHub Actions for lint, test, build, deploy

---

## 💡 Why This Project is Scalable

### 1. Modular Architecture
Every concern is isolated: nodes, forms, validation, simulation, serialization, and API are separate modules. Adding a new node type requires exactly 3 files (node component, form component, type definition) — nothing else changes.

### 2. Type-Safe by Default
The entire codebase is strict TypeScript with discriminated unions, ensuring that adding new node types or modifying data shapes produces compile-time errors wherever consuming code needs updating.

### 3. Swappable Backend
The API layer is a single-file facade. Switching from mock data to a real REST API, GraphQL endpoint, or even a local database requires changing only `services/api.ts` — no UI modifications needed.

### 4. Performance
- Custom nodes are `React.memo`-wrapped to skip re-renders when data hasn't changed
- Validation debounces via ref comparison to avoid redundant state updates
- React Flow handles viewport virtualization natively for large graphs

### 5. Extensible Validation
The validator is a pure function that takes nodes and edges and returns issues. Adding new validation rules is as simple as appending to the array — no hooks, no side effects, fully testable.

### 6. Production Patterns
- Undo/redo with bounded history
- Keyboard shortcuts
- File import/export
- Error boundaries ready
- Clean separation of view and logic

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/ayansahag1010">Ayan Sahag</a></strong>
</p>
