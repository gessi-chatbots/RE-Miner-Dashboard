import React, { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import {AppDataDTO} from "../../DTOs/AppDataDTO";
import {fetchData} from "../../services/appsAPI";



const defaultColumns = ['App ID', 'App Name', 'Description', 'Summary', 'Release Date', 'Version', 'Actions'];

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
                <Table className="table table-centered table-striped mt-4">
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
                            <td>{app.version || 'N/A'}</td>
                            <td className="table-action">
                                <a href="" className="action-icon"> <i className="mdi mdi-pencil"></i></a>
                                <a href="" className="action-icon"> <i className="mdi mdi-delete"></i></a>
                            </td>
                        </tr>
                    ))}

                    </tbody>
                </Table>
            </div>
        </Container>
    );
};

export default AppsDirectory;
