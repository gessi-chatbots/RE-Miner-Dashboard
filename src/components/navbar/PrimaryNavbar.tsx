import React, { useEffect, useState } from 'react';
import { Container, Navbar, Button, Row, Dropdown } from 'react-bootstrap';
import Logo from '../../assets/static/images/logos/logo.png';
import {Link} from "react-router-dom";
import AuthService from "../../services/AuthService";




const DropdownMenuUser = () => {
    const authService = new AuthService();

    const handleSignOut = () => {
        authService.signOutUser();
    };

    return (
        <Dropdown.Menu>
            <Dropdown.Item>
                <i className="mdi mdi-account-settings"/> Account Settings
            </Dropdown.Item>
            <Dropdown.Item>
                <i className="mdi mdi-application-settings"/> Application Settings
            </Dropdown.Item>
            <Dropdown.Item>
                <Link
                    to="#"
                    onClick={handleSignOut}
                    style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                >
                    <i className="mdi mdi-export"/> Sign out
                </Link>
            </Dropdown.Item>
        </Dropdown.Menu>
    );
};


interface UserData {
    name?: string;
    family_name?: string;
}


const PrimaryNavBar = () => {
    const [userData, setUserData] = useState<{ name?: string; family_name?: string } | null>(null);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            const authService = new AuthService();
            const userData = await authService.getUserData();
            setUserData(userData);
        };
        fetchUserData();
    }, []);

    const toggleUserDropdown = () => {
        setUserDropdownOpen(!userDropdownOpen);
    };

    return (
        <Navbar className="bg-white py-lg-3">
            <Container>
                <Navbar.Brand className="me-lg-5">
                    <a href="https://www.upc.edu/ca" target="_blank">
                        <img src={Logo} style={{ width: '50%' }} alt="Logo" />
                    </a>
                </Navbar.Brand>

                <Container className="d-flex flex-column align-items-end">
                    <Row>
                        <Button className="mr-2 btn-secondary" onClick={toggleUserDropdown}>
                            <b>{userData?.name} {userData?.family_name}</b>
                        </Button>
                        <Dropdown show={userDropdownOpen} align="start">
                            <DropdownMenuUser />
                        </Dropdown>
                    </Row>
                </Container>
            </Container>
        </Navbar>
    );
};

export default PrimaryNavBar;
