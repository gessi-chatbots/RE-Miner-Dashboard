import React from 'react';
import {Col, Container, Row} from "react-bootstrap";
import StackedBarChart from "../components/visual/StackedBarChart";



const Dashboard = () => {

    return (
        <Container>
            <div>
                <h1 className="text-secondary">Dashboard</h1>
                <Row>
                    <Col>
                        <StackedBarChart />
                    </Col>
                </Row>
            </div>
        </Container>

    );
};

export default Dashboard;