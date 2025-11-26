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
- **Deletion**:
    - **Delete Component**: Select a component and press `Delete` or `Backspace`.
    - **Remove Wires**: Right-click on a pin to disconnect all wires attached to it.
- **Navigation**:
    - **Zoom**: Use the **Mouse Wheel** to zoom in and out of the workspace.
    - **Pan**: Hold **Middle Mouse Button** (or **Shift + Left Click**) and drag to move the workspace.
- **Dynamic Inputs & Rewiring**:
    - **Manual Toggle**: Click any unconnected input pin to toggle it between 0 and 1.
    - **Rewiring**: Click a connected input pin to detach the wire and move it to another component.
    - **Visuals**: Pins light up Red when High (1). Switches show their state text.

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
    - **Deletion**: Select a gate and press Delete. Right-click a connected pin to clear wires.
    - **Zoom/Pan**: Use mouse wheel to zoom, middle click to pan. Verify gates stay in correct relative positions.
    - **Inputs**: Click unconnected inputs to toggle. Click connected inputs to move wires.
