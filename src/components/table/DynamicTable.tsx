import React from 'react';
import { Table } from 'react-bootstrap';
interface TableProps {
    data: Array<Record<any, any>>; // Adjust the type based on the actual structure of your data
    visibleColumns: string[];
}
const DynamicTable: React.FC<TableProps> = ({ data, visibleColumns }) => {
    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                {visibleColumns.map((column) => (
                    <th key={column}>{column}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data.map((item) => (
                <tr key={item.id}>
                    {visibleColumns.map((column) => (
                        <td key={column}>{item[column]}</td>
                    ))}
                </tr>
            ))}
            </tbody>
        </Table>
    );
};

export default DynamicTable;
