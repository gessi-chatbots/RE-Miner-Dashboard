import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';

import DynamicTable from '../components/table/DynamicTable';
import {AppData} from "../DTOs/AppDataDTO";
import {fetchData} from "../services/appsAPI";


const defaultColumns = ['App ID', 'App Name', 'Description', 'Summary', 'Release Date'];

const AppsDirectory: React.FC = () => {
    const [data, setData] = useState<React.SetStateAction<AppData | undefined>>(undefined);

    useEffect(() => {
        const fetchDataFromApi = async () => {
            try {
                const mappedData = await fetchData();
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
                {/*<DynamicTable data={} visibleColumns={defaultColumns} />*/}
            </div>
        </Container>
    );
};

export default AppsDirectory;