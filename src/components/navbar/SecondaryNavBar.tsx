import React, { useState, useEffect, useRef } from "react";
import { Container, Nav, Navbar, Button, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

type CloseDropdownsFunction = () => void;

const DropdownMenuApps: React.FC<{ closeDropdowns: CloseDropdownsFunction }> = ({ closeDropdowns }) => {
    const handleItemClick = () => {
        closeDropdowns();
    };

    return (
        <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/applications/directory" onClick={handleItemClick}>
                <i className="mdi mdi-notebook"/>  Applications Directory
            </Dropdown.Item>
            <Dropdown.Item as={Link} to="/applications/upload" onClick={handleItemClick}>
                <i className="mdi mdi-upload"/> Upload
            </Dropdown.Item>
        </Dropdown.Menu>
    );
};

const DropdownMenuReviews: React.FC<{ closeDropdowns: CloseDropdownsFunction }> = ({ closeDropdowns }) => {
    const handleItemClick = () => {
        closeDropdowns();
    };

    return (
        <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/reviews" onClick={handleItemClick}>
                <i className="mdi mdi-folder-open-outline" /> Reviews Directory
            </Dropdown.Item>
        </Dropdown.Menu>
    );
};

const SecondaryNavBar = () => {
    const [appsDropdownOpen, setAppsDropdownOpen] = useState(false);
    const [reviewsDropdownOpen, setReviewsDropdownOpen] = useState(false);
    const appsDropdownRef = useRef<HTMLDivElement>(null);
    const reviewsDropdownRef = useRef<HTMLDivElement>(null);

    const toggleAppsDropdown = () => {
        setAppsDropdownOpen(!appsDropdownOpen);
        setReviewsDropdownOpen(false);
    };

    const toggleReviewsDropdown = () => {
        setReviewsDropdownOpen(!reviewsDropdownOpen);
        setAppsDropdownOpen(false);
    };

    const closeDropdowns = () => {
        setAppsDropdownOpen(false);
        setReviewsDropdownOpen(false);
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                (appsDropdownRef.current && !appsDropdownRef.current.contains(event.target as Node)) &&
                (reviewsDropdownRef.current && !reviewsDropdownRef.current.contains(event.target as Node))
            ) {
                closeDropdowns();
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

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
                        <div ref={appsDropdownRef}>
                            <Button onClick={toggleAppsDropdown} className="text-white">
                                <i className="mdi mdi-apps mdi-24px"/> Applications <i className={`mdi mdi-chevron-${appsDropdownOpen ? 'down' : 'right'}`}></i>
                            </Button>
                            <Dropdown show={appsDropdownOpen} align="start">
                                <DropdownMenuApps closeDropdowns={closeDropdowns} />
                            </Dropdown>
                        </div>
                    </Nav.Item>
                    <Nav.Item className="mx-lg-1">
                        <div ref={reviewsDropdownRef}>
                            <Link to="/reviews">
                                <Button className="text-white">
                                    <i className="mdi mdi-file-document-multiple mdi-24px" /> Reviews
                                </Button>
                            </Link>

                        </div>
                    </Nav.Item>
                    <Nav.Item as="li" className="mx-lg-1">
                        <Link to="/tree-analyzer">
                            <Button className="text-white">
                                <i className="mdi mdi-sitemap mdi-24px"/> Tree Analyzer
                            </Button>
                        </Link>
                    </Nav.Item>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default SecondaryNavBar;
