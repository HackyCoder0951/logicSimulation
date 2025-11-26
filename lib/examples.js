export const EXAMPLES = {
    'full_adder_basic': {
        name: 'Full Adder (Basic Gates)',
        gates: [
            // Inputs
            { type: 'SWITCH', x: 50, y: 50, id: 'in_a', label: 'A' },
            { type: 'SWITCH', x: 50, y: 150, id: 'in_b', label: 'B' },
            { type: 'SWITCH', x: 50, y: 250, id: 'in_cin', label: 'Cin' },

            // Logic
            { type: 'XOR', x: 200, y: 100, id: 'xor1' },
            { type: 'XOR', x: 350, y: 150, id: 'xor2' },
            { type: 'AND', x: 200, y: 250, id: 'and1' }, // A & B
            { type: 'AND', x: 350, y: 250, id: 'and2' }, // (A^B) & Cin
            { type: 'OR', x: 500, y: 250, id: 'or1' },   // Cout

            // Outputs
            { type: 'BULB', x: 500, y: 150, id: 'out_sum', label: 'Sum' },
            { type: 'BULB', x: 650, y: 250, id: 'out_cout', label: 'Cout' }
        ],
        wires: [
            // XOR1 (A ^ B)
            { start: 'in_a', startPin: 0, end: 'xor1', endPin: 0 },
            { start: 'in_b', startPin: 0, end: 'xor1', endPin: 1 },

            // XOR2 (Sum = XOR1 ^ Cin)
            { start: 'xor1', startPin: 0, end: 'xor2', endPin: 0 },
            { start: 'in_cin', startPin: 0, end: 'xor2', endPin: 1 },

            // AND1 (A & B)
            { start: 'in_a', startPin: 0, end: 'and1', endPin: 0 },
            { start: 'in_b', startPin: 0, end: 'and1', endPin: 1 },

            // AND2 (XOR1 & Cin)
            { start: 'xor1', startPin: 0, end: 'and2', endPin: 0 },
            { start: 'in_cin', startPin: 0, end: 'and2', endPin: 1 },

            // OR1 (Cout = AND1 | AND2)
            { start: 'and1', startPin: 0, end: 'or1', endPin: 0 },
            { start: 'and2', startPin: 0, end: 'or1', endPin: 1 },

            // Outputs
            { start: 'xor2', startPin: 0, end: 'out_sum', endPin: 0 },
            { start: 'or1', startPin: 0, end: 'out_cout', endPin: 0 }
        ]
    },
    'full_adder_half': {
        name: 'Full Adder (Using Half Adders)',
        gates: [
            { type: 'SWITCH', x: 50, y: 50, id: 'in_a', label: 'A' },
            { type: 'SWITCH', x: 50, y: 150, id: 'in_b', label: 'B' },
            { type: 'SWITCH', x: 200, y: 250, id: 'in_cin', label: 'Cin' },

            { type: 'HALF_ADDER', x: 200, y: 100, id: 'ha1' },
            { type: 'HALF_ADDER', x: 400, y: 150, id: 'ha2' },
            { type: 'OR', x: 550, y: 250, id: 'or1' },

            { type: 'BULB', x: 550, y: 150, id: 'out_sum', label: 'Sum' },
            { type: 'BULB', x: 700, y: 250, id: 'out_cout', label: 'Cout' }
        ],
        wires: [
            { start: 'in_a', startPin: 0, end: 'ha1', endPin: 0 },
            { start: 'in_b', startPin: 0, end: 'ha1', endPin: 1 },

            { start: 'ha1', startPin: 0, end: 'ha2', endPin: 0 }, // Sum -> HA2 A
            { start: 'in_cin', startPin: 0, end: 'ha2', endPin: 1 }, // Cin -> HA2 B

            { start: 'ha1', startPin: 1, end: 'or1', endPin: 0 }, // Carry1 -> OR
            { start: 'ha2', startPin: 1, end: 'or1', endPin: 1 }, // Carry2 -> OR

            { start: 'ha2', startPin: 0, end: 'out_sum', endPin: 0 },
            { start: 'or1', startPin: 0, end: 'out_cout', endPin: 0 }
        ]
    },
    'full_adder_nand': {
        name: 'Full Adder (NAND Only)',
        gates: [
            // Inputs
            { type: 'SWITCH', x: 50, y: 100, id: 'A', label: 'A' },
            { type: 'SWITCH', x: 50, y: 200, id: 'B', label: 'B' },
            { type: 'SWITCH', x: 50, y: 300, id: 'Cin', label: 'Cin' },

            // XOR using NANDs (A, B) -> Sum1
            // A XOR B = (A NAND (A NAND B)) NAND (B NAND (A NAND B))
            { type: 'NAND', x: 150, y: 150, id: 'n1' }, // A NAND B
            { type: 'NAND', x: 250, y: 100, id: 'n2' }, // A NAND n1
            { type: 'NAND', x: 250, y: 200, id: 'n3' }, // B NAND n1
            { type: 'NAND', x: 350, y: 150, id: 'n4' }, // n2 NAND n3 (XOR output)

            // XOR using NANDs (Sum1, Cin) -> Sum
            { type: 'NAND', x: 450, y: 200, id: 'n5' }, // Sum1 NAND Cin
            { type: 'NAND', x: 550, y: 150, id: 'n6' }, // Sum1 NAND n5
            { type: 'NAND', x: 550, y: 250, id: 'n7' }, // Cin NAND n5
            { type: 'NAND', x: 650, y: 200, id: 'n8' }, // n6 NAND n7 (Final Sum)

            // Cout = n1 NAND n5
            // Wait, standard NAND FA is 9 gates.
            // Cout = (A NAND B) NAND (Sum1 NAND Cin) ... wait logic check.
            // Cout = (A&B) | (Sum1 & Cin)
            // A&B = NOT(A NAND B) = NOT(n1)
            // Sum1 & Cin = NOT(Sum1 NAND Cin) = NOT(n5)
            // Cout = NOT(n1) | NOT(n5) = n1 NAND n5
            { type: 'NAND', x: 650, y: 300, id: 'n9' }, // n1 NAND n5

            { type: 'BULB', x: 750, y: 200, id: 'Sum', label: 'Sum' },
            { type: 'BULB', x: 750, y: 300, id: 'Cout', label: 'Cout' }
        ],
        wires: [
            // XOR 1
            { start: 'A', startPin: 0, end: 'n1', endPin: 0 },
            { start: 'B', startPin: 0, end: 'n1', endPin: 1 },
            { start: 'A', startPin: 0, end: 'n2', endPin: 0 },
            { start: 'n1', startPin: 0, end: 'n2', endPin: 1 },
            { start: 'n1', startPin: 0, end: 'n3', endPin: 0 },
            { start: 'B', startPin: 0, end: 'n3', endPin: 1 },
            { start: 'n2', startPin: 0, end: 'n4', endPin: 0 },
            { start: 'n3', startPin: 0, end: 'n4', endPin: 1 },

            // XOR 2
            { start: 'n4', startPin: 0, end: 'n5', endPin: 0 },
            { start: 'Cin', startPin: 0, end: 'n5', endPin: 1 },
            { start: 'n4', startPin: 0, end: 'n6', endPin: 0 },
            { start: 'n5', startPin: 0, end: 'n6', endPin: 1 },
            { start: 'n5', startPin: 0, end: 'n7', endPin: 0 },
            { start: 'Cin', startPin: 0, end: 'n7', endPin: 1 },
            { start: 'n6', startPin: 0, end: 'n8', endPin: 0 },
            { start: 'n7', startPin: 0, end: 'n8', endPin: 1 },

            // Cout
            { start: 'n1', startPin: 0, end: 'n9', endPin: 0 },
            { start: 'n5', startPin: 0, end: 'n9', endPin: 1 },

            // Outs
            { start: 'n8', startPin: 0, end: 'Sum', endPin: 0 },
            { start: 'n9', startPin: 0, end: 'Cout', endPin: 0 }
        ]
    }
};
