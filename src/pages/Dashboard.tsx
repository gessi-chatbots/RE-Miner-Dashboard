import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api'
import DynamicTable from "../components/table/DynamicTable";
import {Container} from "react-bootstrap"; // Import your API library



const Dashboard = () => {
    // State to store data from the API
    const [data, setData] = useState<Array<Record<string, any>>>([]);

    // Fetch data from the API when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const restOperation = get({
                    apiName: 'appsAPI',
                    path: '/apps'
                });
                const response = await restOperation.response;
                console.log(response)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <Container>
            <div>
                <h1 className="text-secondary">Dashboard</h1>
            </div>
        </Container>

    );
};

export default Dashboard;