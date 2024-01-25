import React from 'react';
import { Table } from 'react-bootstrap';

interface TableProps<T> {
    data: T[] | undefined; // Adjusted type for the state
    visibleColumns: (keyof T)[]; // Use keyof to enforce that visibleColumns keys are from T
}

const DynamicTable = <T extends Record<string, any>>({ data, visibleColumns }: TableProps<T>) => {
    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                {visibleColumns.map((column) => (
                    <th key={String(column)}>{String(column)}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data?.map((item, index) => (
                <tr key={index}>
                    {visibleColumns.map((column) => (
                        <td key={String(column)}>{item[column]}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </Table>
    );
};

export default DynamicTable;
