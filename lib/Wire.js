export class Wire {
    constructor(startGate, startPinIndex, endGate, endPinIndex) {
        this.startGate = startGate;
        this.startPinIndex = startPinIndex;
        this.endGate = endGate;
        this.endPinIndex = endPinIndex;
        this.value = 0;
    }

    update() {
        if (this.startGate && this.startGate.outputs[this.startPinIndex]) {
            this.value = this.startGate.outputs[this.startPinIndex].value;

            if (this.endGate && this.endGate.inputs[this.endPinIndex]) {
                this.endGate.inputs[this.endPinIndex].value = this.value;
            }
        }
    }

    draw(ctx) {
        if (!this.startGate || !this.endGate) return;

        const startX = this.startGate.x + this.startGate.outputs[this.startPinIndex].x * this.startGate.width;
        const startY = this.startGate.y + this.startGate.outputs[this.startPinIndex].y * this.startGate.height;

        const endX = this.endGate.x + this.endGate.inputs[this.endPinIndex].x * this.endGate.width;
        const endY = this.endGate.y + this.endGate.inputs[this.endPinIndex].y * this.endGate.height;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        const cp1x = startX + (endX - startX) / 2;
        const cp1y = startY;
        const cp2x = endX - (endX - startX) / 2;
        const cp2y = endY;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

        ctx.strokeStyle = this.value ? '#ef4444' : '#475569';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (this.value) {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}
