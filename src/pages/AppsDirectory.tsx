import React, { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';

import { AppDataDTO } from "../DTOs/AppDataDTO";
import { fetchData } from "../services/appsAPI";

const defaultColumns = ['App ID', 'App Name', 'Description', 'Summary', 'Release Date'];

const AppsDirectory: React.FC = () => {
    const [data, setData] = useState<AppDataDTO[] | null>();

    useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                const mappedData = await fetchData();
                console.log(mappedData)

                if (mappedData !== undefined) {
                    setData(mappedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataFromApi();
    }, []);
    return (
        <Container className="mt-2">
            <div>
                <h1 className="text-secondary">Applications</h1>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        {defaultColumns.map(column => (
                            <th key={column}>{column}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data && data.map(app => (
                        <tr key={app.id}>
                            <td>{app.id}</td>
                            <td>{app.name || 'N/A'}</td>
                            <td>{app.description || 'N/A'}</td>
                            <td>{app.summary || 'N/A'}</td>
                            <td>{app.release_date || 'N/A'}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default AppsDirectory;
