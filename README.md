# ArchiPi

A modern, production-ready 2D/3D architectural floor planner built with Next.js, TypeScript, and Three.js.

ArchiPi is a comprehensive modernization of [react-planner](https://github.com/cvdlab/react-planner) by CVDLAB (Roma Tre University). The original project — while pioneering — was effectively unmaintained, locked to React 16, Redux 4, Three.js 0.94, and plain JavaScript with no TypeScript support. ArchiPi rebuilds the core concepts on a modern stack while adding significant new features and capabilities.

## Features

- **2D Floor Plan Editor** — Draw walls, place doors/windows, arrange furniture on an SVG canvas with pan/zoom, rulers, and snap-to-grid
- **3D Walkthrough** — Switch seamlessly from 2D to an interactive 3D view with orbit controls, textures, and lighting
- **Rich Catalog** — ~75 built-in architectural elements: 54 items (furniture, appliances, fixtures), 11 hole types (doors, windows, sliding doors), wall and area types
- **Guide System** — Horizontal, vertical, and circular guides for precise alignment
- **Auto-Save & Persistence** — Automatic saving to localStorage with dirty-state tracking and unsaved changes warnings
- **Save/Load Projects** — Export and import floor plans as JSON files
- **Keyboard Shortcuts** — Undo/redo (Ctrl+Z/Y), and more
- **Screenshot Export** — Capture the 3D scene as an image

## Improvements Over react-planner

### Framework & Build System

| | react-planner | ArchiPi |
|---|---|---|
| Framework | React 16 + Webpack 4 | Next.js 16 + Turbopack |
| Language | JavaScript (ES6) + prop-types | TypeScript (strict mode) |
| State | Redux 4 + react-redux 5 | Zustand 5 + Immer |
| 3D Engine | Three.js 0.94 (imperative) | Three.js 0.183 + React Three Fiber (declarative) |
| Styling | Inline styles + custom components | Tailwind CSS v4 + shadcn/ui |
| Icons | react-icons 3.x | Lucide React |

### Full TypeScript Migration

The entire codebase (200+ files) was migrated from JavaScript/JSX to TypeScript/TSX with `strict: true`. Zero JS/JSX remains in the `app/` directory. This migration exposed and fixed pre-existing bugs (e.g., deprecated Three.js APIs, incorrect vector types) and eliminated ~3,800 lines of dead code.

### State Management: Redux to Zustand

Replaced Redux's action creators, action types, and reducers with Zustand's direct method calls and Immer middleware for immutable updates. This dramatically reduced boilerplate while improving type inference and enabling fine-grained subscriptions.

### 3D Rendering Overhaul

Migrated from imperative Three.js scene management to a declarative React Three Fiber component architecture:

- **Component-based elements** — LineElement3D, HoleElement3D, ItemElement3D, AreaElement3D
- **Scene lighting** — Environment maps and configurable light sources
- **Texture system** — Normal maps, SRGB color space, texture repetition scaling, seamless tiling
- **LOD system** — Level-of-detail management for performance
- **Orbit controls** — Smooth camera interaction via @react-three/drei

### UI Modernization

Replaced inline CSS and custom form components with 17 shadcn/ui components (accordion, dialog, select, switch, tabs, tooltip, etc.) and Tailwind CSS. This provides consistent spacing, colors, and typography, dark theme support, WCAG-compliant accessibility, and keyboard navigation throughout.

### New Features

- **Guide system** — Horizontal, vertical, and circular guides with snap integration
- **Project configurator** — Dynamic scene width/height configuration with validation
- **Drawing overlay system** — Extensible overlay architecture for custom visualizations
- **Enhanced toolbar** — New/Load/Save with improved UX, screenshot export, 3D view toggle, tips and settings modals
- **Sidebar redesign** — Collapsible accordion panels for properties, layers, groups, and guides
- **Auto-save** — Browser localStorage persistence with dirty-state tracking
- **Toast notifications** — User feedback via Sonner

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Development

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build

```bash
yarn build
```

### Type Check

```bash
npx tsc --noEmit
```

## Project Structure

```
app/
├── components/
│   ├── Sidebar/              # Property panels, layers, groups, guides
│   ├── Toolbar/              # Action buttons, mode toggles
│   ├── viewer2d/             # 2D SVG rendering (rulers, grid, snap)
│   ├── viewer3d/             # 3D R3F components (elements, lighting, LOD)
│   ├── properties/           # Property editor components
│   ├── CatalogView/          # Catalog browsing UI
│   ├── ProjectConfigurator/  # Scene configuration
│   ├── Footer/               # Footer controls
│   └── ui/                   # shadcn/ui primitives
├── store/                    # Zustand store + types
├── catalog/                  # Catalog system (factories, registration)
├── objCatalog/               # ~75 element definitions (items, holes, lines, area)
├── context/                  # React context (catalog, translator)
└── utils/                    # Geometry, snap, graph, math utilities
```

## Tech Stack

- **[Next.js](https://nextjs.org/)** 16 — React framework with Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** — Strict mode, full coverage
- **[Zustand](https://zustand.docs.pmnd.rs/)** — State management with Immer
- **[Three.js](https://threejs.org/)** + **[React Three Fiber](https://r3f.docs.pmnd.rs/)** — 3D rendering
- **[react-svg-pan-zoom](https://github.com/chrvadala/react-svg-pan-zoom)** — 2D pan/zoom
- **[Tailwind CSS](https://tailwindcss.com/)** v4 — Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** — Accessible component primitives
- **[Immutable.js](https://immutable-js.com/)** — Persistent data structures for scene state

## Acknowledgments

ArchiPi builds on the foundational work of [react-planner](https://github.com/cvdlab/react-planner) by [CVDLAB](https://github.com/cvdlab) at Roma Tre University. The original project established the core concepts of the 2D/3D floor planning architecture, catalog system, and element model that ArchiPi extends and modernizes.
