import React, { useEffect, useState } from 'react';
import {Container, Navbar, Button, Row, Dropdown} from 'react-bootstrap';
import { signOut, fetchUserAttributes } from 'aws-amplify/auth';
import Logo from '../../static/images/logos/logo.png';
import {Link} from "react-router-dom";

const signOutUser = () => {
    signOut()
        .then((data) => console.log(data))
        .catch((err) => console.log(err));
};


const DropdownMenuUser = () => {
    return (
        <Dropdown.Menu>
            <Dropdown.Item>
                <Link
                    to="#"
                    onClick={signOutUser}
                    style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                >
                    Sign out
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
    const [userData, setUserData] = useState<UserData | null>(null);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = await fetchUserAttributes();
                setUserData({
                    name: currentUser?.name,
                    family_name: currentUser?.family_name,
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []); // Empty dependency array to run the effect only once on mount
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
                        <Button className="mr-2 btn-secondary" onClick={toggleUserDropdown}> <b>{userData?.name} {userData?.family_name} </b></Button>
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
