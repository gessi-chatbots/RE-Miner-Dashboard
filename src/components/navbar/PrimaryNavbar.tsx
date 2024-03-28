import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/static/images/logos/logo-GESSI.jpg';
import { Container, Navbar, Button, Row, Dropdown } from 'react-bootstrap';

const DropdownMenuUser = () => {
    const navigate = useNavigate();

    const handleSignOut = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const accessToken = localStorage.getItem('ACCESS_TOKEN');
            if (!accessToken) {
                throw new Error('Access token not found');
            }

            const response = await fetch('http://localhost:3001/api/v1/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                localStorage.removeItem('USER_ID');
                localStorage.removeItem('ACCESS_TOKEN');
                localStorage.removeItem('REFRESH_TOKEN');
                navigate('/login');
            } else {
                console.error('Logout failed:', response.statusText);
            }
        } catch (error: any) {
            console.error('Logout failed:', error.message);
        }
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
                <Button
                    onClick={handleSignOut}
                    style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                >
                    <i className="mdi mdi-export"/> Sign out
                </Button>
            </Dropdown.Item>
        </Dropdown.Menu>
    );
};

const PrimaryNavBar = () => {
    const [userData, setUserData] = useState<{ name?: string; family_name?: string } | null>(null);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setUserData(userData);
        };
        fetchUserData();
    }, []);

    const toggleUserDropdown = () => {
        setUserDropdownOpen(!userDropdownOpen);
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    return (
        <Navbar className="bg-white py-lg-3">
            <Container>
                <Navbar.Brand className="me-lg-5">
                    <a href="https://gessi.upc.edu/en" target="_blank">
                        <img src={Logo} style={{ width: '40%' }} alt="Logo GESSI" />
                    </a>
                </Navbar.Brand>

                <Container className="d-flex flex-column align-items-end">
                    <Row>
                        <div ref={userDropdownRef}>
                            <Button className="mr-2 btn-secondary" onClick={toggleUserDropdown}>
                                <b>{userData?.name} {userData?.family_name}</b>
                            </Button>
                            <Dropdown show={userDropdownOpen} align="start">
                                <DropdownMenuUser />
                            </Dropdown>
                        </div>
                    </Row>
                </Container>
            </Container>
        </Navbar>
    );
};

export default PrimaryNavBar;

