import React from 'react';
import {Col, Container, Row} from "react-bootstrap";
import SentimentHistogram from "../components/visual/SentimentHistogram";



const Dashboard = () => {

    return (
        <Container>
            <div>
                <h1 className="text-secondary">Dashboard</h1>
                <Row>
                    <Col>
                        <SentimentHistogram />
                    </Col>
                </Row>
            </div>
        </Container>

    );
};

export default Dashboard;