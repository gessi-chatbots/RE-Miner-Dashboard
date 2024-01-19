import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UPCLogo from '../../static/images/logos/logo.png';

type AuthLayoutProperties = {
    bottomLinks?: React.ReactNode;
    children?: React.ReactNode;
};

const AuthLayout = ({ bottomLinks, children }: AuthLayoutProperties) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5} xxl={4}>
                            <Card>
                                <Card.Header className="pt-4 pb-4 text-center bg-primary">
                                    <Link to="/">
                                        <span>
                                            <img src={UPCLogo} alt="" height="100" />
                                        </span>
                                    </Link>
                                </Card.Header>
                                <Card.Body className="p-4">{children}</Card.Body>
                            </Card>
                            {bottomLinks}
                        </Col>
                    </Row>
                </Container>
            </div>
            <Row className="footer">
                <Col lg={12}>
                    <div className="mt-1">
                        <p className="text-muted mt-4 text-center mb-0">
                            {t(`2024 - ${new Date().getFullYear()} © Max Tiessler - GESSI`)}
                        </p>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default AuthLayout;
