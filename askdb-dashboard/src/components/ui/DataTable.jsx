export default function DataTable({ columns, data, className = '' }) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full text-[12px]">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className="px-4 py-3 text-left font-medium text-[var(--text-tertiary)]/70 text-[10px] uppercase tracking-[0.12em]"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="border-t border-[var(--border-subtle)] 
                         hover:bg-[var(--accent-soft)]/30 
                         transition-colors duration-200"
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="px-4 py-3.5 text-[var(--text-primary)]">
                                    {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div className="py-14 text-center text-[var(--text-tertiary)] text-[12px]">
                    No data available
                </div>
            )}
        </div>
    );
}
