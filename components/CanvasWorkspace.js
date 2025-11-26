'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Gate } from '@/lib/Gate';
import { Wire } from '@/lib/Wire';
import { EXAMPLES } from '@/lib/examples';

const CanvasWorkspace = ({ onSelectionChange, onAnalyze, onInputStateChange }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Refs for simulation state to avoid re-renders during loop
    const gatesRef = useRef([]);
    const wiresRef = useRef([]);
    const isDraggingRef = useRef(false);
    const draggedGateRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    const isWiringRef = useRef(false);
    const wiringStartGateRef = useRef(null);
    const wiringStartPinIndexRef = useRef(null);
    const tempWireEndRef = useRef({ x: 0, y: 0 });

    // Viewport State
    const transformRef = useRef({ x: 0, y: 0, zoom: 1 });
    const isPanningRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });

    // Selection Box State
    const isSelectingRef = useRef(false);
    const selectionStartRef = useRef({ x: 0, y: 0 });
    const selectionBoxRef = useRef(null); // {x, y, w, h}
    const selectedGatesRef = useRef(new Set()); // Set of gate IDs

    // Coordinate Helpers
    const toWorld = (sx, sy) => {
        const { x, y, zoom } = transformRef.current;
        return {
            x: (sx - x) / zoom,
            y: (sy - y) / zoom
        };
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selectedGate = gatesRef.current.find(g => g.selected);
                if (selectedGate) {
                    // Remove wires connected to this gate
                    wiresRef.current = wiresRef.current.filter(w =>
                        w.startGate !== selectedGate && w.endGate !== selectedGate
                    );
                    // Remove gate
                    gatesRef.current = gatesRef.current.filter(g => g !== selectedGate);
                    onSelectionChange(null);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSelectionChange]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas.getContext('2d');

        // ... existing resize and loop logic ...
        const resize = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let animationFrameId;

        const loop = (time) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const { x, y, zoom } = transformRef.current;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(zoom, zoom);

            // Logic Updates
            gatesRef.current.forEach(gate => gate.compute(time));
            wiresRef.current.forEach(wire => wire.update());
            gatesRef.current.forEach(gate => gate.compute(time));

            // Notify Input States for Truth Table Highlighting
            if (onInputStateChange) {
                const inputs = gatesRef.current.filter(g => g.type === 'SWITCH').sort((a, b) => a.y - b.y);
                if (inputs.length > 0) {
                    const currentStates = inputs.map(g => g.state ? 1 : 0);
                    onInputStateChange(currentStates);
                }
            }

            // Draw Wires
            wiresRef.current.forEach(wire => wire.draw(ctx));

            // Draw Temp Wire
            if (isWiringRef.current && wiringStartGateRef.current) {
                const startGate = wiringStartGateRef.current;
                const pinIndex = wiringStartPinIndexRef.current;
                const startX = startGate.x + startGate.outputs[pinIndex].x * startGate.width;
                const startY = startGate.y + startGate.outputs[pinIndex].y * startGate.height;
                const endX = tempWireEndRef.current.x;
                const endY = tempWireEndRef.current.y;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                const cp1x = startX + (endX - startX) / 2;
                const cp2x = endX - (endX - startX) / 2;
                ctx.bezierCurveTo(cp1x, startY, cp2x, endY, endX, endY);
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // Draw Gates
            gatesRef.current.forEach(gate => {
                // Highlight if in multi-selection
                if (selectedGatesRef.current.has(gate)) {
                    ctx.save();
                    ctx.shadowColor = '#3b82f6';
                    ctx.shadowBlur = 10;
                    gate.draw(ctx);
                    ctx.restore();
                } else {
                    gate.draw(ctx);
                }
            });

            // Draw Selection Box
            if (selectionBoxRef.current) {
                const { x, y, w, h } = selectionBoxRef.current;
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 1;
                ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
                ctx.fillRect(x, y, w, h);
                ctx.strokeRect(x, y, w, h);
            }

            ctx.restore(); // Restore transform

            animationFrameId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleDrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        if (!type) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const { x, y } = toWorld(screenX, screenY);

        const newGate = new Gate(x - 40, y - 25, type);
        gatesRef.current.push(newGate);
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // Panning (Middle Click or Shift+Click)
        if (e.button === 1 || (e.button === 0 && e.getModifierState('Shift'))) { // Shift+Click for pan alternative
            isPanningRef.current = true;
            lastMouseRef.current = { x: screenX, y: screenY };
            return;
        }

        const { x: mouseX, y: mouseY } = toWorld(screenX, screenY);

        // Check pins
        for (let gate of gatesRef.current) {
            const pin = gate.getPinAt(mouseX, mouseY);
            if (pin) {
                if (pin.type === 'output') {
                    isWiringRef.current = true;
                    wiringStartGateRef.current = gate;
                    wiringStartPinIndexRef.current = pin.index;
                    tempWireEndRef.current = { x: mouseX, y: mouseY };
                    return;
                } else if (pin.type === 'input') {
                    // Check if connected
                    const wireIndex = wiresRef.current.findIndex(w => w.endGate === gate && w.endPinIndex === pin.index);

                    if (wireIndex !== -1) {
                        // Connected: Detach and start wiring
                        const wire = wiresRef.current[wireIndex];
                        wiresRef.current.splice(wireIndex, 1); // Remove wire

                        isWiringRef.current = true;
                        wiringStartGateRef.current = wire.startGate;
                        wiringStartPinIndexRef.current = wire.startPinIndex;
                        tempWireEndRef.current = { x: mouseX, y: mouseY };

                        // Reset input value
                        gate.inputs[pin.index].value = 0;
                        return;
                    } else {
                        // Not Connected: Toggle Value
                        gate.inputs[pin.index].value = gate.inputs[pin.index].value ? 0 : 1;
                        return;
                    }
                }
            }
        }

        // Check gates
        let clickedGate = null;
        for (let i = gatesRef.current.length - 1; i >= 0; i--) {
            const gate = gatesRef.current[i];
            if (mouseX >= gate.x && mouseX <= gate.x + gate.width &&
                mouseY >= gate.y && mouseY <= gate.y + gate.height) {

                clickedGate = gate;
                break;
            }
        }

        if (clickedGate) {
            // Handle Gate Interaction
            if (clickedGate.type === 'SWITCH') {
                clickedGate.state = !clickedGate.state;
            }

            isDraggingRef.current = true;
            draggedGateRef.current = clickedGate;
            dragOffsetRef.current = { x: mouseX - clickedGate.x, y: mouseY - clickedGate.y };

            // Multi-Selection Logic
            if (e.ctrlKey || e.metaKey) {
                // Toggle selection
                if (selectedGatesRef.current.has(clickedGate)) {
                    selectedGatesRef.current.delete(clickedGate);
                    clickedGate.selected = false;
                } else {
                    selectedGatesRef.current.add(clickedGate);
                    clickedGate.selected = true;
                }
            } else {
                // If clicking an unselected gate without Ctrl, clear others
                if (!selectedGatesRef.current.has(clickedGate)) {
                    selectedGatesRef.current.clear();
                    gatesRef.current.forEach(g => g.selected = false);
                    selectedGatesRef.current.add(clickedGate);
                    clickedGate.selected = true;
                }
                // If clicking a selected gate, keep selection for drag
            }

            // Move clicked to top (visual)
            const idx = gatesRef.current.indexOf(clickedGate);
            if (idx > -1) {
                gatesRef.current.splice(idx, 1);
                gatesRef.current.push(clickedGate);
            }

            onSelectionChange(clickedGate.type);
        } else {
            // Clicked Empty Space -> Start Selection Box
            if (!e.ctrlKey && !e.metaKey) {
                selectedGatesRef.current.clear();
                gatesRef.current.forEach(g => g.selected = false);
                onSelectionChange(null);
            }

            isSelectingRef.current = true;
            selectionStartRef.current = { x: mouseX, y: mouseY };
            selectionBoxRef.current = { x: mouseX, y: mouseY, w: 0, h: 0 };
        }
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        if (isPanningRef.current) {
            const dx = screenX - lastMouseRef.current.x;
            const dy = screenY - lastMouseRef.current.y;
            transformRef.current.x += dx;
            transformRef.current.y += dy;
            lastMouseRef.current = { x: screenX, y: screenY };
            return;
        }

        const { x: mouseX, y: mouseY } = toWorld(screenX, screenY);

        if (isDraggingRef.current && draggedGateRef.current) {
            const dx = mouseX - dragOffsetRef.current.x - draggedGateRef.current.x;
            const dy = mouseY - dragOffsetRef.current.y - draggedGateRef.current.y;

            // Move all selected gates
            selectedGatesRef.current.forEach(gate => {
                gate.x += dx;
                gate.y += dy;
            });

            // Update drag offset for the primary dragged gate to prevent drift
            dragOffsetRef.current = { x: mouseX - draggedGateRef.current.x, y: mouseY - draggedGateRef.current.y };
        }

        if (isSelectingRef.current) {
            const startX = selectionStartRef.current.x;
            const startY = selectionStartRef.current.y;
            const w = mouseX - startX;
            const h = mouseY - startY;
            selectionBoxRef.current = { x: startX, y: startY, w, h };

            // Update selection
            const absX = w > 0 ? startX : mouseX;
            const absY = h > 0 ? startY : mouseY;
            const absW = Math.abs(w);
            const absH = Math.abs(h);

            selectedGatesRef.current.clear();
            gatesRef.current.forEach(gate => {
                // Simple AABB intersection
                if (gate.x < absX + absW && gate.x + gate.width > absX &&
                    gate.y < absY + absH && gate.y + gate.height > absY) {
                    selectedGatesRef.current.add(gate);
                    gate.selected = true;
                } else {
                    gate.selected = false;
                }
            });
        }

        if (isWiringRef.current) {
            tempWireEndRef.current = { x: mouseX, y: mouseY };
        }
    };

    const handleMouseUp = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const { x: mouseX, y: mouseY } = toWorld(screenX, screenY);

        isPanningRef.current = false;

        if (isWiringRef.current) {
            for (let gate of gatesRef.current) {
                const pin = gate.getPinAt(mouseX, mouseY);
                if (pin && pin.type === 'input') {
                    // Remove existing wires to this input
                    wiresRef.current = wiresRef.current.filter(w => !(w.endGate === gate && w.endPinIndex === pin.index));

                    const newWire = new Wire(wiringStartGateRef.current, wiringStartPinIndexRef.current, gate, pin.index);
                    wiresRef.current.push(newWire);
                    break;
                }
            }
            isWiringRef.current = false;
            wiringStartGateRef.current = null;
            wiringStartPinIndexRef.current = null;
        }

        isDraggingRef.current = false;
        draggedGateRef.current = null;
        isSelectingRef.current = false;
        selectionBoxRef.current = null;
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const { x: mouseX, y: mouseY } = toWorld(screenX, screenY);

        // Check pins to disconnect
        for (let gate of gatesRef.current) {
            const pin = gate.getPinAt(mouseX, mouseY);
            if (pin) {
                if (pin.type === 'input') {
                    // Remove wire connected to this input
                    wiresRef.current = wiresRef.current.filter(w => !(w.endGate === gate && w.endPinIndex === pin.index));
                } else if (pin.type === 'output') {
                    // Remove wires connected to this output
                    wiresRef.current = wiresRef.current.filter(w => !(w.startGate === gate && w.startPinIndex === pin.index));
                }
                return;
            }
        }
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
        const newZoom = Math.min(Math.max(transformRef.current.zoom + delta, 0.1), 5);

        // Zoom towards mouse pointer
        // world = (screen - x) / zoom
        // newX = screen - world * newZoom
        const worldX = (screenX - transformRef.current.x) / transformRef.current.zoom;
        const worldY = (screenY - transformRef.current.y) / transformRef.current.zoom;

        transformRef.current.x = screenX - worldX * newZoom;
        transformRef.current.y = screenY - worldY * newZoom;
        transformRef.current.zoom = newZoom;
    };

    const clearCanvas = () => {
        gatesRef.current = [];
        wiresRef.current = [];
        selectedGatesRef.current.clear();
        onSelectionChange(null);
    };

    // Serialization
    const saveCircuit = () => {
        const data = {
            gates: gatesRef.current.map(g => ({
                type: g.type, x: g.x, y: g.y, id: g.id, label: g.label, state: g.state
            })),
            wires: wiresRef.current.map(w => ({
                startGateId: w.startGate.id,
                startPin: w.startPinIndex,
                endGateId: w.endGate.id,
                endPin: w.endPinIndex
            }))
        };
        localStorage.setItem('logicSimSave', JSON.stringify(data));
        alert('Circuit Saved!');
    };

    const loadCircuit = (data = null) => {
        try {
            if (!data) {
                const json = localStorage.getItem('logicSimSave');
                if (!json) return;
                data = JSON.parse(json);
            }

            // Reconstruct Gates
            const newGates = data.gates.map(g => {
                const gate = new Gate(g.x, g.y, g.type);
                gate.id = g.id;
                if (g.label) gate.label = g.label;
                if (g.state !== undefined) gate.state = g.state;
                return gate;
            });

            // Reconstruct Wires
            const newWires = [];
            data.wires.forEach(w => {
                const startGate = newGates.find(g => g.id === w.startGateId);
                const endGate = newGates.find(g => g.id === w.endGateId);
                if (startGate && endGate) {
                    newWires.push(new Wire(startGate, w.startPin, endGate, w.endPin));
                }
            });

            gatesRef.current = newGates;
            wiresRef.current = newWires;
            selectedGatesRef.current.clear();
            onSelectionChange(null);
        } catch (e) {
            console.error('Failed to load', e);
            alert('Failed to load circuit');
        }
    };

    const exportCircuit = () => {
        const data = {
            gates: gatesRef.current.map(g => ({
                type: g.type, x: g.x, y: g.y, id: g.id, label: g.label, state: g.state
            })),
            wires: wiresRef.current.map(w => ({
                startGateId: w.startGate.id,
                startPin: w.startPinIndex,
                endGateId: w.endGate.id,
                endPin: w.endPinIndex
            }))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'circuit.json';
        a.click();
    };

    const importCircuit = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => loadCircuit(JSON.parse(e.target.result));
        reader.readAsText(file);
    };

    const loadExample = (key) => {
        const ex = EXAMPLES[key];
        if (ex) {
            // Map example format to save format
            // Example format uses string IDs for start/end, save format uses IDs
            // Actually my example format is slightly different, let's adapt it
            const data = {
                gates: ex.gates,
                wires: ex.wires.map(w => ({
                    startGateId: w.start,
                    startPin: w.startPin,
                    endGateId: w.end,
                    endPin: w.endPin
                }))
            };
            loadCircuit(data);
        }
    };

    const generateTruthTable = () => {
        const inputs = gatesRef.current.filter(g => g.type === 'SWITCH').sort((a, b) => a.y - b.y);
        const outputs = gatesRef.current.filter(g => g.type === 'BULB').sort((a, b) => a.y - b.y);

        if (inputs.length === 0 || outputs.length === 0) {
            alert("Need at least 1 Switch and 1 Bulb to analyze.");
            return;
        }

        if (inputs.length > 8) {
            if (!confirm(`Analyzing ${inputs.length} inputs will generate ${Math.pow(2, inputs.length)} rows. This might be slow. Continue?`)) {
                return;
            }
        }

        const rows = [];
        const combinations = Math.pow(2, inputs.length);

        // Save current state
        const savedStates = inputs.map(g => g.state);

        for (let i = 0; i < combinations; i++) {
            // Set Inputs
            inputs.forEach((inp, idx) => {
                // MSB first or LSB first? Let's do MSB at top (index 0)
                // If i=1 (001), last input should be 1.
                // So inputs[last] is LSB.
                const bit = (i >> (inputs.length - 1 - idx)) & 1;
                inp.state = bit === 1;
            });

            // Simulate (Run enough cycles to stabilize)
            // Complex circuits might need more cycles. 50 should be safe for DAGs.
            for (let cycle = 0; cycle < 50; cycle++) {
                gatesRef.current.forEach(gate => gate.compute());
                wiresRef.current.forEach(wire => wire.update());
            }
            gatesRef.current.forEach(gate => gate.compute()); // Final compute

            // Record Output
            const row = [
                ...inputs.map(g => g.state ? 1 : 0),
                ...outputs.map(g => g.state ? 1 : 0)
            ];
            rows.push(row);
        }

        // Restore state
        inputs.forEach((inp, idx) => inp.state = savedStates[idx]);

        // Send data
        onAnalyze({
            inputs: inputs.map(g => g.label || 'In'),
            outputs: outputs.map(g => g.label || 'Out'),
            rows: rows
        });
    };

    return (
        <div className="flex-1 flex flex-col relative h-full">
            <div className="h-16 px-8 flex items-center justify-between pointer-events-none absolute top-0 right-0 w-full z-10">
                <div className="pointer-events-auto flex gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-lg mt-4">
                    <select
                        className="bg-slate-900 text-slate-200 text-xs p-2 rounded border border-slate-700 outline-none"
                        onChange={(e) => loadExample(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>Load Example...</option>
                        {Object.entries(EXAMPLES).map(([k, v]) => (
                            <option key={k} value={k}>{v.name}</option>
                        ))}
                    </select>
                </div>
                <div className="pointer-events-auto flex gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-lg mt-4">
                    <button onClick={saveCircuit} className="text-xs text-slate-300 hover:text-white px-3 py-1 bg-slate-700 rounded">Save</button>
                    <button onClick={() => loadCircuit()} className="text-xs text-slate-300 hover:text-white px-3 py-1 bg-slate-700 rounded">Load</button>
                    <button onClick={exportCircuit} className="text-xs text-slate-300 hover:text-white px-3 py-1 bg-slate-700 rounded">Export</button>
                    <label className="text-xs text-slate-300 hover:text-white px-3 py-1 bg-slate-700 rounded cursor-pointer">
                        Import
                        <input type="file" className="hidden" accept=".json" onChange={importCircuit} />
                    </label>
                    <div className="w-px bg-slate-600 mx-1"></div>
                    <button
                        onClick={clearCanvas}
                        className="text-slate-400 hover:text-red-400 px-3 py-1 transition-colors font-medium text-xs"
                    >
                        Clear
                    </button>
                    <button
                        onClick={generateTruthTable}
                        className="bg-blue-600 text-white px-3 py-1 rounded shadow-[0_0_12px_rgba(59,130,246,0.5)] font-medium text-xs hover:bg-blue-500 transition-all"
                    >
                        Analyze
                    </button>
                </div>
            </div>
            <div
                ref={containerRef}
                className="flex-1 relative overflow-hidden bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onContextMenu={handleContextMenu}
                    onWheel={handleWheel}
                    className="block outline-none"
                    tabIndex={0} // Make canvas focusable for keyboard events
                />
            </div>
        </div>
    );
};

export default CanvasWorkspace;
