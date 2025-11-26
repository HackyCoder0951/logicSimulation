// Component Definitions
const COMPONENT_CONFIG = {
    // Basic Gates
    'AND': { width: 80, height: 50, inputs: [{ x: 0, y: 0.25, label: 'A' }, { x: 0, y: 0.75, label: 'B' }], outputs: [{ x: 1, y: 0.5 }] },
    'OR': { width: 80, height: 50, inputs: [{ x: 0, y: 0.25, label: 'A' }, { x: 0, y: 0.75, label: 'B' }], outputs: [{ x: 1, y: 0.5 }] },
    'NOT': { width: 80, height: 50, inputs: [{ x: 0, y: 0.5, label: 'A' }], outputs: [{ x: 1, y: 0.5 }] },
    'NAND': { width: 80, height: 50, inputs: [{ x: 0, y: 0.25, label: 'A' }, { x: 0, y: 0.75, label: 'B' }], outputs: [{ x: 1, y: 0.5 }] },
    'NOR': { width: 80, height: 50, inputs: [{ x: 0, y: 0.25, label: 'A' }, { x: 0, y: 0.75, label: 'B' }], outputs: [{ x: 1, y: 0.5 }] },
    'XOR': { width: 80, height: 50, inputs: [{ x: 0, y: 0.25, label: 'A' }, { x: 0, y: 0.75, label: 'B' }], outputs: [{ x: 1, y: 0.5 }] },
    'XNOR': { width: 80, height: 50, inputs: [{ x: 0, y: 0.25, label: 'A' }, { x: 0, y: 0.75, label: 'B' }], outputs: [{ x: 1, y: 0.5 }] },

    // Inputs/Outputs
    'SWITCH': { width: 60, height: 40, inputs: [], outputs: [{ x: 1, y: 0.5 }] },
    'BULB': { width: 60, height: 60, inputs: [{ x: 0, y: 0.5 }], outputs: [] },
    'CLOCK': { width: 60, height: 40, inputs: [], outputs: [{ x: 1, y: 0.5 }] },

    // Complex Components
    'HALF_ADDER': {
        width: 100, height: 80,
        inputs: [{ x: 0, y: 0.3, label: 'A' }, { x: 0, y: 0.7, label: 'B' }],
        outputs: [{ x: 1, y: 0.3, label: 'S' }, { x: 1, y: 0.7, label: 'C' }]
    },
    'FULL_ADDER': {
        width: 100, height: 100,
        inputs: [{ x: 0, y: 0.2, label: 'A' }, { x: 0, y: 0.5, label: 'B' }, { x: 0, y: 0.8, label: 'Cin' }],
        outputs: [{ x: 1, y: 0.3, label: 'S' }, { x: 1, y: 0.7, label: 'Cout' }]
    },
    'DECODER_2_4': {
        width: 120, height: 120,
        inputs: [{ x: 0, y: 0.3, label: 'A' }, { x: 0, y: 0.7, label: 'B' }],
        outputs: [{ x: 1, y: 0.2, label: 'D0' }, { x: 1, y: 0.4, label: 'D1' }, { x: 1, y: 0.6, label: 'D2' }, { x: 1, y: 0.8, label: 'D3' }]
    },
    'MUX_2_1': {
        width: 100, height: 80,
        inputs: [{ x: 0, y: 0.2, label: 'I0' }, { x: 0, y: 0.5, label: 'I1' }, { x: 0.5, y: 1, label: 'Sel' }], // Sel at bottom
        outputs: [{ x: 1, y: 0.5, label: 'Out' }]
    },
    'COMPARATOR': {
        width: 120, height: 100,
        inputs: [{ x: 0, y: 0.3, label: 'A' }, { x: 0, y: 0.7, label: 'B' }],
        outputs: [{ x: 1, y: 0.2, label: 'A>B' }, { x: 1, y: 0.5, label: 'A=B' }, { x: 1, y: 0.8, label: 'A<B' }]
    },
    'ALU_1BIT': {
        width: 140, height: 120,
        inputs: [{ x: 0, y: 0.2, label: 'A' }, { x: 0, y: 0.5, label: 'B' }, { x: 0, y: 0.8, label: 'Op' }],
        outputs: [{ x: 1, y: 0.5, label: 'Res' }, { x: 1, y: 0.8, label: 'Cout' }]
    }
};

export class Gate {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.id = Date.now() + Math.random();
        this.label = type.replace('_', ' ');
        this.selected = false;

        const config = COMPONENT_CONFIG[type] || COMPONENT_CONFIG['AND'];
        this.width = config.width;
        this.height = config.height;

        // Deep copy inputs/outputs to avoid reference issues
        this.inputs = config.inputs.map(p => ({ ...p, value: 0 }));
        this.outputs = config.outputs.map(p => ({ ...p, value: 0 }));

        this.state = false; // For Switch/Bulb/Clock
        this.timer = 0; // For Clock
    }

    compute(time) {
        const ins = this.inputs.map(i => i.value);

        switch (this.type) {
            // Basic Gates
            case 'AND': this.outputs[0].value = ins[0] && ins[1] ? 1 : 0; break;
            case 'OR': this.outputs[0].value = ins[0] || ins[1] ? 1 : 0; break;
            case 'NOT': this.outputs[0].value = !ins[0] ? 1 : 0; break;
            case 'NAND': this.outputs[0].value = !(ins[0] && ins[1]) ? 1 : 0; break;
            case 'NOR': this.outputs[0].value = !(ins[0] || ins[1]) ? 1 : 0; break;
            case 'XOR': this.outputs[0].value = (ins[0] ^ ins[1]) ? 1 : 0; break;
            case 'XNOR': this.outputs[0].value = !(ins[0] ^ ins[1]) ? 1 : 0; break;

            // I/O
            case 'SWITCH': this.outputs[0].value = this.state ? 1 : 0; break;
            case 'BULB': this.state = ins[0] === 1; break;
            case 'CLOCK':
                if (time) {
                    // Toggle every 1000ms (approx)
                    const period = 1000;
                    this.state = Math.floor(time / period) % 2 === 0;
                    this.outputs[0].value = this.state ? 1 : 0;
                }
                break;

            // Complex
            case 'HALF_ADDER':
                this.outputs[0].value = ins[0] ^ ins[1]; // Sum
                this.outputs[1].value = ins[0] && ins[1]; // Carry
                break;
            case 'FULL_ADDER':
                const sum = ins[0] ^ ins[1] ^ ins[2];
                const cout = (ins[0] && ins[1]) || (ins[2] && (ins[0] ^ ins[1]));
                this.outputs[0].value = sum;
                this.outputs[1].value = cout;
                break;
            case 'DECODER_2_4':
                const val = (ins[0] << 1) | ins[1]; // A is MSB? Let's assume A=1, B=0 -> 2
                // Actually usually A is LSB or MSB. Let's say A=MSB, B=LSB
                // 00 -> D0, 01 -> D1, 10 -> D2, 11 -> D3
                // Wait, inputs are 0 or 1.
                // Let's assume inputs[0] is A (MSB), inputs[1] is B (LSB)
                const idx = (ins[0] ? 2 : 0) + (ins[1] ? 1 : 0);
                this.outputs.forEach((o, i) => o.value = i === idx ? 1 : 0);
                break;
            case 'MUX_2_1':
                // I0, I1, Sel
                this.outputs[0].value = ins[2] ? ins[1] : ins[0];
                break;
            case 'COMPARATOR':
                this.outputs[0].value = ins[0] > ins[1] ? 1 : 0; // >
                this.outputs[1].value = ins[0] === ins[1] ? 1 : 0; // =
                this.outputs[2].value = ins[0] < ins[1] ? 1 : 0; // <
                break;
            case 'ALU_1BIT':
                // A, B, Op (0=ADD, 1=SUB/AND/OR?) - 1 bit op is limited.
                // Let's treat Op as a mode. 0 = AND, 1 = OR.
                // Or maybe 0 = ADD, 1 = SUB?
                // Let's do: 0 = AND, 1 = ADD
                if (ins[2]) { // ADD
                    this.outputs[0].value = ins[0] ^ ins[1];
                    this.outputs[1].value = ins[0] && ins[1];
                } else { // AND
                    this.outputs[0].value = ins[0] && ins[1];
                    this.outputs[1].value = 0;
                }
                break;
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = this.selected ? '#3b82f6' : '#475569';
        ctx.lineWidth = 2;

        this.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Label
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);

        // Draw Pins
        this.drawPins(ctx, this.inputs, true);
        this.drawPins(ctx, this.outputs, false);

        // Special drawing
        if (this.type === 'SWITCH' || this.type === 'CLOCK') {
            ctx.fillStyle = this.state ? '#ef4444' : '#475569';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'BULB') {
            ctx.fillStyle = this.state ? '#fbbf24' : '#1e293b';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 15, 0, Math.PI * 2);
            ctx.fill();
            if (this.state) {
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 20;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    }

    drawPins(ctx, pins) {
        pins.forEach(pin => {
            const px = this.x + pin.x * this.width;
            const py = this.y + pin.y * this.height;

            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();

            // Pin Labels
            if (pin.label) {
                ctx.fillStyle = '#94a3b8';
                ctx.font = '10px Inter';
                // Offset label based on position
                const ox = pin.x < 0.5 ? 8 : -8;
                const oy = pin.y < 0.1 ? 12 : (pin.y > 0.9 ? -12 : 0);
                // If on side
                if (pin.y > 0.1 && pin.y < 0.9) {
                    ctx.textAlign = pin.x < 0.5 ? 'left' : 'right';
                    ctx.fillText(pin.label, px + ox, py + 3);
                } else {
                    ctx.textAlign = 'center';
                    ctx.fillText(pin.label, px, py + oy);
                }
            }
        });
    }

    drawRoundedRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    getPinAt(x, y) {
        for (let i = 0; i < this.inputs.length; i++) {
            const px = this.x + this.inputs[i].x * this.width;
            const py = this.y + this.inputs[i].y * this.height;
            if (Math.hypot(x - px, y - py) < 10) {
                return { gate: this, type: 'input', index: i, x: px, y: py };
            }
        }
        for (let i = 0; i < this.outputs.length; i++) {
            const px = this.x + this.outputs[i].x * this.width;
            const py = this.y + this.outputs[i].y * this.height;
            if (Math.hypot(x - px, y - py) < 10) {
                return { gate: this, type: 'output', index: i, x: px, y: py };
            }
        }
        return null;
    }
}
