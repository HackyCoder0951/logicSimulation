import React from 'react';

const truthTables = {
    'AND': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
    'OR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]] },
    'NOT': { inputs: ['A'], outputs: ['Out'], rows: [[0, 1], [1, 0]] },
    'NAND': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
    'NOR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]] },
    'XOR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
    'XNOR': { inputs: ['A', 'B'], outputs: ['Out'], rows: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },

    'HALF_ADDER': {
        inputs: ['A', 'B'],
        outputs: ['Sum', 'Carry'],
        rows: [[0, 0, 0, 0], [0, 1, 1, 0], [1, 0, 1, 0], [1, 1, 0, 1]]
    },
    'FULL_ADDER': {
        inputs: ['A', 'B', 'Cin'],
        outputs: ['Sum', 'Cout'],
        rows: [
            [0, 0, 0, 0, 0], [0, 0, 1, 1, 0], [0, 1, 0, 1, 0], [0, 1, 1, 0, 1],
            [1, 0, 0, 1, 0], [1, 0, 1, 0, 1], [1, 1, 0, 0, 1], [1, 1, 1, 1, 1]
        ]
    },
    'MUX_2_1': {
        inputs: ['I0', 'I1', 'Sel'],
        outputs: ['Out'],
        rows: [
            ['X', 0, 1, 0], ['X', 1, 1, 1], // Sel=1 -> I1
            [0, 'X', 0, 0], [1, 'X', 0, 1]  // Sel=0 -> I0
        ]
    }
};

const TruthTable = ({ type, circuitTable }) => {
    // Priority: Circuit Table > Selected Gate Table

    if (circuitTable) {
        return (
            <div className="mt-auto bg-slate-900/50 border-t border-slate-700 pt-6 p-4 max-h-64 overflow-y-auto">
                <h2 className="text-sm text-slate-400 mb-3 flex justify-between items-center">
                    Truth Table: <span className="text-blue-500 font-bold">Circuit Analysis</span>
                </h2>
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr>
                            {circuitTable.inputs.map((label, i) => (
                                <th key={`in-${i}`} className="p-2 text-center border border-slate-700 bg-slate-900 text-slate-400 font-semibold">{label}</th>
                            ))}
                            {circuitTable.outputs.map((label, i) => (
                                <th key={`out-${i}`} className="p-2 text-center border border-slate-700 bg-slate-900 text-slate-400 font-semibold">{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {circuitTable.rows.map((row, i) => (
                            <tr key={i} className="hover:bg-blue-500/10">
                                {row.map((val, j) => (
                                    <td key={j} className={`p-2 text-center border border-slate-700 ${j < circuitTable.inputs.length ? 'text-slate-400' : 'text-blue-400 font-bold'}`}>
                                        {val}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (!type) return null;

    // If no table defined, show generic info
    if (!truthTables[type]) {
        return (
            <div className="mt-auto bg-slate-900/50 border-t border-slate-700 pt-6 p-4">
                <h2 className="text-sm text-slate-400 mb-2">Selected: <span className="text-blue-500 font-bold">{type}</span></h2>
                <p className="text-xs text-slate-500">No truth table available for this component.</p>
            </div>
        );
    }

    const data = truthTables[type];

    return (
        <div className="mt-auto bg-slate-900/50 border-t border-slate-700 pt-6 p-4 max-h-64 overflow-y-auto">
            <h2 className="text-sm text-slate-400 mb-3 flex justify-between items-center">
                Truth Table: <span className="text-blue-500 font-bold">{type}</span>
            </h2>
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr>
                        {data.inputs.map(input => (
                            <th key={input} className="p-2 text-center border border-slate-700 bg-slate-900 text-slate-400 font-semibold">{input}</th>
                        ))}
                        {data.outputs.map(output => (
                            <th key={output} className="p-2 text-center border border-slate-700 bg-slate-900 text-slate-400 font-semibold">{output}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-500/10">
                            {row.map((val, j) => (
                                <td key={j} className="p-2 text-center border border-slate-700 text-slate-200">{val}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TruthTable;
