import React, { useState } from "react";
import { Container, Nav, Navbar, Button, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const DropdownMenuApps = () => {
    return (
        <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/apps/upload"><i className="mdi mdi-upload"/> Upload Apps</Dropdown.Item>
            <Dropdown.Item as={Link} to="/apps"><i className="mdi mdi-eye"/> View Apps</Dropdown.Item>
        </Dropdown.Menu>
    );
};

const DropdownMenuReviews = () => {
    return (
        <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/reviews"><i className="mdi mdi-eye"/> View Reviews</Dropdown.Item>
            <Dropdown.Item as={Link} to="/reviews/process"><i className="mdi mdi-orbit-variant"/> Process Reviews</Dropdown.Item>
        </Dropdown.Menu>
    );
};

const SecondaryNavBar = () => {
    const [appsDropdownOpen, setAppsDropdownOpen] = useState(false);
    const [reviewsDropdownOpen, setReviewsDropdownOpen] = useState(false);

    const toggleAppsDropdown = () => {
        setAppsDropdownOpen(!appsDropdownOpen);
        setReviewsDropdownOpen(false);
    };

    const toggleReviewsDropdown = () => {
        setReviewsDropdownOpen(!reviewsDropdownOpen);
        setAppsDropdownOpen(false);
    };

    return (
        <Navbar variant="secondary" className="bg-primary py-lg-3 mb-3">
            <Container>
                <Nav as="ul" className="me-auto align-items-center">
                    <Nav.Item as="li" className="mx-lg-1">
                        <Link to="/dashboard">
                            <Button className="text-white">
                                <i className="mdi mdi-view-dashboard-variant mdi-24px"/> Dashboard
                            </Button>
                        </Link>
                    </Nav.Item>
                    <Nav.Item as="li" className="mx-lg-1">
                        <Button onClick={toggleAppsDropdown} className="text-white">
                            <i className="mdi mdi-apps mdi-24px"/> Apps <i className={`mdi mdi-chevron-${appsDropdownOpen ? 'down' : 'right'}`}></i>
                        </Button>
                        <Dropdown show={appsDropdownOpen} align="start">
                            <DropdownMenuApps />
                        </Dropdown>
                    </Nav.Item>
                    <Nav.Item className="mx-lg-1">
                        <Button onClick={toggleReviewsDropdown} className="text-white">
                            <i className="mdi mdi-file-document-multiple mdi-24px" /> Reviews <i className={`mdi mdi-chevron-${reviewsDropdownOpen ? 'down' : 'right'}`}></i>
                        </Button>
                        <Dropdown show={reviewsDropdownOpen} align="start">
                            <DropdownMenuReviews />
                        </Dropdown>
                    </Nav.Item>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default SecondaryNavBar;
