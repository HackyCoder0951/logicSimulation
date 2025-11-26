export class Gate {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 80;
        this.height = 50;
        this.inputs = [];
        this.outputs = [];
        this.id = Date.now() + Math.random();
        this.label = type;
        
        this.setupPins();
    }

    setupPins() {
        // Define pin configurations based on gate type
        if (this.type === 'NOT' || this.type === 'SWITCH' || this.type === 'BULB') {
            // Special cases
            if (this.type === 'NOT') {
                this.inputs = [{ x: 0, y: 0.5, value: 0, label: 'A' }];
                this.outputs = [{ x: 1, y: 0.5, value: 0 }];
            } else if (this.type === 'SWITCH') {
                this.inputs = [];
                this.outputs = [{ x: 1, y: 0.5, value: 0 }];
                this.state = false; // Switch state
            } else if (this.type === 'BULB') {
                this.inputs = [{ x: 0, y: 0.5, value: 0 }];
                this.outputs = [];
                this.state = false; // Bulb state
            }
        } else {
            // Standard 2-input gates
            this.inputs = [
                { x: 0, y: 0.25, value: 0, label: 'A' },
                { x: 0, y: 0.75, value: 0, label: 'B' }
            ];
            this.outputs = [{ x: 1, y: 0.5, value: 0 }];
        }
    }

    compute() {
        const in1 = this.inputs[0]?.value || 0;
        const in2 = this.inputs[1]?.value || 0;

        switch (this.type) {
            case 'AND':
                this.outputs[0].value = in1 && in2 ? 1 : 0;
                break;
            case 'OR':
                this.outputs[0].value = in1 || in2 ? 1 : 0;
                break;
            case 'NOT':
                this.outputs[0].value = !in1 ? 1 : 0;
                break;
            case 'NAND':
                this.outputs[0].value = !(in1 && in2) ? 1 : 0;
                break;
            case 'NOR':
                this.outputs[0].value = !(in1 || in2) ? 1 : 0;
                break;
            case 'XOR':
                this.outputs[0].value = (in1 ^ in2) ? 1 : 0;
                break;
            case 'SWITCH':
                this.outputs[0].value = this.state ? 1 : 0;
                break;
            case 'BULB':
                this.state = in1 === 1;
                break;
        }
    }

    draw(ctx) {
        // Draw body
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = this.selected ? '#3b82f6' : '#475569';
        ctx.lineWidth = 2;
        
        // Simple rounded rect for now, can be enhanced with SVG paths later
        this.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, 5);
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = '#f8fafc';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);

        // Draw Pins
        this.drawPins(ctx, this.inputs, true);
        this.drawPins(ctx, this.outputs, false);
        
        // Special drawing for Switch/Bulb
        if (this.type === 'SWITCH') {
            ctx.fillStyle = this.state ? '#ef4444' : '#475569';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 10, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'BULB') {
            ctx.fillStyle = this.state ? '#fbbf24' : '#1e293b'; // Amber for on
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 15, 0, Math.PI * 2);
            ctx.fill();
            if (this.state) {
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 20;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    }

    drawPins(ctx, pins, isInput) {
        pins.forEach(pin => {
            const px = this.x + pin.x * this.width;
            const py = this.y + pin.y * this.height;
            
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
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
        // Check inputs
        for (let i = 0; i < this.inputs.length; i++) {
            const px = this.x + this.inputs[i].x * this.width;
            const py = this.y + this.inputs[i].y * this.height;
            if (Math.hypot(x - px, y - py) < 10) {
                return { gate: this, type: 'input', index: i, x: px, y: py };
            }
        }
        // Check outputs
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
