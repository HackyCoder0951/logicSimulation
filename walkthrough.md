# Logic Gate Simulator (Next.js) - Walkthrough

## Overview
The application has been migrated to a **Next.js** architecture and expanded with advanced digital logic components. It retains the premium "Dark Mode" aesthetic and interactive features of the original.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (`useState`, `useRef`, `useEffect`)
- **Canvas**: HTML5 Canvas API wrapped in React

## Project Structure
- `app/page.js`: Main entry point, layout composition.
- `components/Sidebar.js`: Draggable gate components (Basic, Arithmetic, Plexers, I/O).
- `components/CanvasWorkspace.js`: Core simulation engine and canvas rendering.
- `components/TruthTable.js`: Dynamic truth table display.
- `lib/Gate.js`: Logic gate class definition with support for complex components.
- `lib/Wire.js`: Wire connection class definition.

## Features
- **Drag & Drop**: Drag gates from the sidebar to the canvas.
- **Real-time Simulation**: 60FPS simulation loop running on the client.
- **Interactive Wiring**: Connect components with bezier curves.
- **Truth Tables**: Select a gate to see its logic table.
- **Complex Components**:
    - **Arithmetic**: Half Adder, Full Adder, Comparator, ALU.
    - **Plexers**: Multiplexer (2:1), Decoder (2:4).
    - **Timing**: Clock signal generator.

## Running the App
1. **Development**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

2. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## Verification
- **Build Status**: Passed (`npm run build`).
- **Functionality**:
    - **Clock**: Verify the clock component toggles its output automatically.
    - **Adders**: Connect inputs to a Full Adder and verify Sum/Cout logic.
    - **ALU**: Verify basic operations.
    - **Truth Tables**: Select new components to see their tables.
