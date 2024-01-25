import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api'
import DynamicTable from "../components/table/DynamicTable";
import {Container} from "react-bootstrap";

interface AppsProps {}

const ReviewsDirectory: React.FC<AppsProps> = () => {
    const [data, setData] = useState<Array<Record<string, any>>>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const restOperation = get({
                    apiName: 'reviewsAPI',
                    path: '/reviews'
                });
                const response = await restOperation.response;
                console.log(response)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const defaultColumns = ['Review ID', 'Review', 'Score', 'Date'];
    return (
        <Container className="mt-2">
            <div>
                <h1 className="text-secondary">Reviews</h1>
                <DynamicTable data={data} visibleColumns={defaultColumns} />
            </div>
        </Container>

    );
};

export default ReviewsDirectory;