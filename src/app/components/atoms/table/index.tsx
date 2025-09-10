import React, { JSX, useEffect } from 'react'

// Utility to get nested value by dot notation, always takes first element if array
function getValueByPath(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => {
        if (Array.isArray(acc)) {
            acc = acc[0]; // Always take the first element if it's an array
        }
        return acc && acc[part];
    }, obj);
}

interface TableProps {
    columns: any[];
    data: any[];
    rowClassName?: (row: any, index: number) => string;
    tableHeading?: string,
    className?: string,
}

const Table: React.FC<TableProps> = ({ columns, data, rowClassName, tableHeading, className }): JSX.Element => {

    return (
        <table className={`table-collapse border-collapse border w-full ${className}`}>
            <thead className={`border`}>
                <tr className='text-center '>
                    {columns && columns.length > 0 && columns.map((ele: any, i: any) => {
                        return (
                            <th key={i} className={`border border-black p-2 text-m bg-[#343a40] text-white ${tableHeading} ${ele.headerClasses || ''}`}>
                                {typeof ele.text === 'function' ? ele.text(i) : ele.text}
                            </th>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {data && data.length > 0 && data.map((ele: any, i: any) => {
                    const isDisabled = ele?.Disabled;
                    return (
                        <tr key={i} className={`border text-left ${isDisabled ? 'bg-[#8b8b8b] ' : 'bg-white'} ${rowClassName ? rowClassName(ele, i) : ''}`}>
                            {columns && columns.length > 0 && columns.map((item: any, index: any) => {
                                const value = item.dataField ? getValueByPath(ele, item.dataField) : undefined;
                                if (item?.formatter) {
                                    return <td className={`border text-center text-sm p-1.5 ${item.headerClasses || ''}`} key={index}>{item?.formatter(value, ele, i)}</td>;
                                }
                                return (
                                    <td className={`border text-base font-semibold p-1.5 ${item.headerClasses || ''}`} key={index}>
                                        {(() => {
                                            // Safety check to prevent rendering objects directly
                                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                                console.warn('Object detected in table value:', value);
                                                return "";
                                            }
                                            if (value === undefined || value === null) return "";
                                            if (Array.isArray(value)) return value.join(', ');
                                            return String(value);
                                        })()}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>

        
    )
}

export default Table
