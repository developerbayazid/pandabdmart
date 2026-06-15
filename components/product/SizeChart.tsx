'use client';

import { useState } from 'react';

type SizeRow = {
    size: string;
    chestRound?: string;
    length?: string;
    shoulder?: string;
    sleeve?: string;
};

type SizeChartProps = {
    data?: SizeRow[];
    title?: string;
};

const defaultSizeData: SizeRow[] = [
    { size: '40 (M)', chestRound: '41.25', length: '40', shoulder: '18', sleeve: '24' },
    { size: '42 (L)', chestRound: '43.25', length: '42', shoulder: '18.5', sleeve: '24.25' },
    { size: '44 (XL)', chestRound: '43.25', length: '44', shoulder: '19', sleeve: '24.75' },
    { size: '46 (2XL)', chestRound: '47.25', length: '45.5', shoulder: '19.5', sleeve: '24' },
];

export function SizeChart({ data = defaultSizeData, title = 'Size chart - In inches (Expected Deviation < 3%)' }: SizeChartProps) {
    const [showChart, setShowChart] = useState(false);

    return (
        <div className="mt-8">
            <button
                onClick={() => setShowChart(!showChart)}
                className="text-[14px] font-semibold text-text-primary hover:text-text-secondary transition-colors"
            >
                {title}
            </button>

            {showChart && (
                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-surface-tertiary">
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-text-secondary">
                                    Size
                                </th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-text-secondary">
                                    Chest Round
                                </th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-text-secondary">
                                    Length
                                </th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-text-secondary">
                                    Shoulder
                                </th>
                                <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-text-secondary">
                                    Sleeve
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-surface-secondary transition-colors">
                                    <td className="px-4 py-3 text-[14px] text-text-primary">
                                        {row.size}
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-text-primary">
                                        {row.chestRound ?? '-'}
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-text-primary">
                                        {row.length ?? '-'}
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-text-primary">
                                        {row.shoulder ?? '-'}
                                    </td>
                                    <td className="px-4 py-3 text-[14px] text-text-primary">
                                        {row.sleeve ?? '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
