# Logic Gate Simulator - Walkthrough

## Overview
I have created a premium, web-based Logic Gate Simulator. It allows users to build digital logic circuits using standard gates (AND, OR, NOT, etc.) and visualize signal propagation in real-time.

## Features
- **Drag & Drop Interface**: Easily drag gates from the sidebar to the workspace.
- **Interactive Wiring**: Connect gates by clicking and dragging from output pins to input pins.
- **Real-time Simulation**: Changes in inputs (Switches) propagate immediately through the circuit.
- **Truth Table Reference**: Selecting a gate displays its truth table in the sidebar, aiding in learning.
- **Premium UI**: Dark mode, glassmorphism effects, and smooth animations.

## Files Created
- [index.html](file:///home/hackycoder/mca_labs/logicSimulation/index.html): Main application structure.
- [style.css](file:///home/hackycoder/mca_labs/logicSimulation/style.css): Styling and animations.
- [script.js](file:///home/hackycoder/mca_labs/logicSimulation/script.js): Main application logic (interaction, simulation loop).
- [gates.js](file:///home/hackycoder/mca_labs/logicSimulation/gates.js): Logic Gate class definitions.
- [wire.js](file:///home/hackycoder/mca_labs/logicSimulation/wire.js): Wire class definition.

## Verification Steps

### 1. Basic Gate Operation
1. Open `index.html` in a browser.
2. Drag an **AND** gate and two **Switch** components to the canvas.
3. Drag a **Light Bulb** component to the canvas.
4. Connect the Switches to the AND gate inputs.
5. Connect the AND gate output to the Light Bulb.
6. Toggle the switches.
   - **Expected**: The bulb should only light up when BOTH switches are ON (Red).

### 2. Truth Table Feature
1. Click on the **AND** gate.
2. Observe the sidebar.
   - **Expected**: A "Truth Table: AND" panel should appear at the bottom of the sidebar showing the correct logic table.

### 3. Complex Logic (XOR)
1. Clear the canvas.
2. Drag an **XOR** gate, two Switches, and a Bulb.
3. Connect them.
4. Toggle switches.
   - **Expected**: Bulb lights up when switches are different (0,1 or 1,0).

### 4. UI Responsiveness
1. Resize the browser window.
   - **Expected**: The canvas should resize to fill the available space.

## Next Steps
- Implement "Save/Load" functionality to persist circuits.
- Add more complex components like Flip-Flops, Multiplexers, etc.
- Add a "Tutorial Mode" with guided challenges.
