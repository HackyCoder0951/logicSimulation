import { Gate } from './gates.js';
import { Wire } from './wire.js';

const canvas = document.getElementById('simulation-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');

let gates = [];
let wires = [];
let isDragging = false;
let draggedGate = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isWiring = false;
let wiringStartGate = null;
let wiringStartPinIndex = null;
let tempWireEnd = { x: 0, y: 0 };

const truthTables = {
    'AND': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
    'OR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]] },
    'NOT': { inputs: ['A'], outputs: ['Out'], rows: [[0, 1], [1, 0]] },
    'NAND': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
    'NOR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]] },
    'XOR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
    'XNOR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
};

function showTruthTable(type) {
    const panel = document.getElementById('truth-table-panel');
    const title = document.getElementById('tt-gate-type');
    const table = document.getElementById('truth-table');
    const tbody = table.querySelector('tbody');
    const thead = table.querySelector('thead');

    if (!truthTables[type]) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');
    title.textContent = type;
    tbody.innerHTML = '';

    // Update header
    const data = truthTables[type];
    let headerHtml = '<tr>';
    data.inputs.forEach(inLabel => headerHtml += `<th>${inLabel}</th>`);
    data.outputs.forEach(outLabel => headerHtml += `<th>${outLabel}</th>`);
    headerHtml += '</tr>';
    thead.innerHTML = headerHtml;

    // Update rows
    data.rows.forEach(row => {
        let rowHtml = '<tr>';
        row.forEach(val => rowHtml += `<td>${val}</td>`);
        rowHtml += '</tr>';
        tbody.innerHTML += rowHtml;
    });
}

// Resize canvas
function resize() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// Drag and Drop from Sidebar
const sidebarItems = document.querySelectorAll('.component-item');
sidebarItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('type', item.dataset.type);
    });
});

container.addEventListener('dragover', (e) => {
    e.preventDefault();
});

container.addEventListener('drop', (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newGate = new Gate(x - 40, y - 25, type); // Center the gate
    gates.push(newGate);
});

// Canvas Interactions
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check for pin click (Wiring)
    for (let gate of gates) {
        const pin = gate.getPinAt(mouseX, mouseY);
        if (pin) {
            if (pin.type === 'output') {
                isWiring = true;
                wiringStartGate = gate;
                wiringStartPinIndex = pin.index;
                tempWireEnd = { x: mouseX, y: mouseY };
                return;
            } else if (pin.type === 'input') {
                // If clicking input, maybe disconnect existing wire?
                // For now, only start wiring from output
            }
        }
    }

    // Check for gate click (Dragging)
    // Iterate backwards to select top-most gate
    let clickedGate = null;
    for (let i = gates.length - 1; i >= 0; i--) {
        const gate = gates[i];
        if (mouseX >= gate.x && mouseX <= gate.x + gate.width &&
            mouseY >= gate.y && mouseY <= gate.y + gate.height) {

            clickedGate = gate;

            // Toggle switch state on click
            if (gate.type === 'SWITCH') {
                gate.state = !gate.state;
                // Don't return here, let selection happen
            }

            isDragging = true;
            draggedGate = gate;
            dragOffsetX = mouseX - gate.x;
            dragOffsetY = mouseY - gate.y;

            // Move to end of array to render on top
            gates.splice(i, 1);
            gates.push(gate);
            break; // Found the top-most gate
        }
    }

    // Handle Selection
    gates.forEach(g => g.selected = false);
    if (clickedGate) {
        clickedGate.selected = true;
        showTruthTable(clickedGate.type);
    } else {
        document.getElementById('truth-table-panel').classList.add('hidden');
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging && draggedGate) {
        draggedGate.x = mouseX - dragOffsetX;
        draggedGate.y = mouseY - dragOffsetY;
    }

    if (isWiring) {
        tempWireEnd = { x: mouseX, y: mouseY };
    }
});

canvas.addEventListener('mouseup', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isWiring) {
        // Check if dropped on an input pin
        let connected = false;
        for (let gate of gates) {
            const pin = gate.getPinAt(mouseX, mouseY);
            if (pin && pin.type === 'input') {
                // Create wire
                // Check if input is already connected?
                // For now allow multiple wires to same input or overwrite? 
                // Better to overwrite or just add. Let's add.
                // Actually, physical gates usually have 1 wire per input pin unless it's a bus.
                // Let's remove existing wire to this input if any.
                wires = wires.filter(w => !(w.endGate === gate && w.endPinIndex === pin.index));

                const newWire = new Wire(wiringStartGate, wiringStartPinIndex, gate, pin.index);
                wires.push(newWire);
                connected = true;
                break;
            }
        }
        isWiring = false;
        wiringStartGate = null;
        wiringStartPinIndex = null;
    }

    isDragging = false;
    draggedGate = null;
});

// Clear Button
document.getElementById('clear-btn').addEventListener('click', () => {
    gates = [];
    wires = [];
});

// Simulation Loop
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Logic
    // 1. Compute all gates
    // Simple approach: just compute all. For complex circuits with feedback loops, 
    // we might need multiple passes or a proper event-driven engine.
    // For this simple sim, one pass per frame is usually enough for visual propagation.

    gates.forEach(gate => gate.compute());
    wires.forEach(wire => wire.update());
    // Compute again to propagate wire values to next gates immediately (helps with lag)
    gates.forEach(gate => gate.compute());

    // Draw Wires
    wires.forEach(wire => wire.draw(ctx));

    // Draw Temp Wire
    if (isWiring && wiringStartGate) {
        const startX = wiringStartGate.x + wiringStartGate.outputs[wiringStartPinIndex].x * wiringStartGate.width;
        const startY = wiringStartGate.y + wiringStartGate.outputs[wiringStartPinIndex].y * wiringStartGate.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        const cp1x = startX + (tempWireEnd.x - startX) / 2;
        const cp2x = tempWireEnd.x - (tempWireEnd.x - startX) / 2;
        ctx.bezierCurveTo(cp1x, startY, cp2x, tempWireEnd.y, tempWireEnd.x, tempWireEnd.y);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw Gates
    gates.forEach(gate => gate.draw(ctx));

    requestAnimationFrame(loop);
}

loop();
