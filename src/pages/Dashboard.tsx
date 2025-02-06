import React, { useEffect, useState } from 'react';
import { Col, Row, Alert, Spinner } from 'react-bootstrap';
import DescriptorHistogram from '../components/visual/DescriptorHistogram';
import DescriptorPolarAreaChart from "../components/visual/DescriptorPolarAreaChart";
import TopFeaturesHistogram from "../components/visual/TopFeaturesHistogram";
import FeatureLineChart from "../components/visual/FeatureLineChart";
import CrossDescriptorEmotion from "../components/visual/CrossDescriptorEmotion";
import AppService from '../services/AppService';
import { AppDataSimpleDTO } from "../DTOs/AppDataSimpleDTO";

const Dashboard = () => {
    const [apps, setApps] = useState<AppDataSimpleDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const appService = new AppService();

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const result = await appService.fetchAllAppsPackages();
                if (result && result.apps) {
                    setApps(result.apps);
                } else {
                    setApps([]);
                }
            } catch (error) {
                console.error('Error fetching applications:', error);
                setApps([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchApps();
    }, []);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" role="status" style={{ width: '4rem', height: '4rem' }} />
                    <p className="mt-3 text-secondary fs-5">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <h1 className="text-secondary mb-4">Dashboard</h1>

            {apps.length === 0 && (
                <Alert variant="warning" className="mb-4 d-flex align-items-center">
                    No applications have been found. Please upload them using the:
                    <button
                        onClick={() => window.location.href = '/applications/upload'}
                        className="ms-2 btn btn-primary btn-sm"
                        style={{ fontWeight: '500', whiteSpace: 'nowrap', width: 'auto' }}
                    >
                        <i className="mdi mdi-upload me-1"></i>
                        Uploader
                    </button>
                </Alert>



            )}

            <Row className="gx-5">
                <Col className="col-md-6 mb-4 ml-3">
                    <Row className="mb-4">
                        <DescriptorPolarAreaChart/>
                    </Row>
                    <Row>
                        <DescriptorHistogram/>
                    </Row>
                </Col>
                <Col className="col-md-6 mb-4 mr-3">
                    <Row className="mb-4">
                        <TopFeaturesHistogram/>
                    </Row>
                    <Row className="mb-4">
                        <FeatureLineChart />
                    </Row>
                    <Row>
                        <CrossDescriptorEmotion />
                    </Row>
                </Col>
            </Row>
        </>
    );
};

export default Dashboard;
