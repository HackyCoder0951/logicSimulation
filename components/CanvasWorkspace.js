'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Gate } from '@/lib/Gate';
import { Wire } from '@/lib/Wire';

const CanvasWorkspace = ({ onSelectionChange }) => {
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
            gatesRef.current.forEach(gate => gate.draw(ctx));

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

                if (gate.type === 'SWITCH') {
                    gate.state = !gate.state;
                }

                isDraggingRef.current = true;
                draggedGateRef.current = gate;
                dragOffsetRef.current = { x: mouseX - gate.x, y: mouseY - gate.y };

                // Move to top
                gatesRef.current.splice(i, 1);
                gatesRef.current.push(gate);
                break;
            }
        }

        // Selection
        gatesRef.current.forEach(g => g.selected = false);
        if (clickedGate) {
            clickedGate.selected = true;
            onSelectionChange(clickedGate.type);
        } else {
            onSelectionChange(null);
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
            draggedGateRef.current.x = mouseX - dragOffsetRef.current.x;
            draggedGateRef.current.y = mouseY - dragOffsetRef.current.y;
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
        onSelectionChange(null);
    };

    return (
        <div className="flex-1 flex flex-col relative h-full">
            <div className="h-16 px-8 flex items-center justify-end pointer-events-none absolute top-0 right-0 w-full z-10">
                <div className="pointer-events-auto flex gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-lg">
                    <button
                        onClick={clearCanvas}
                        className="text-slate-400 hover:text-slate-50 hover:bg-slate-900 px-4 py-2 rounded-md transition-colors font-medium"
                    >
                        Clear
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-[0_0_12px_rgba(59,130,246,0.5)] font-medium">
                        Simulate
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
