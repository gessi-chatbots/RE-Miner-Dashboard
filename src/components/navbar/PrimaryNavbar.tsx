import React, { useEffect, useState } from 'react';
import { Container, Navbar, Button } from 'react-bootstrap';
import { getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import Logo from '../../static/images/logos/logo.png';
interface UserData {
    name?: string;
    family_name?: string;
}
const PrimaryNavBar = () => {
    const [userData, setUserData] = useState<UserData | null>(null);

    const signOutUser = () => {
        signOut()
            .then((data) => console.log(data))
            .catch((err) => console.log(err));
    };

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

    return (
        <Navbar className="bg-white py-lg-3">
            <Container>
                <Navbar.Brand className="me-lg-5">
                    <a href="https://www.upc.edu/ca" target="_blank">
                        <img src={Logo} style={{ width: '50%' }} alt="Logo" />
                    </a>
                </Navbar.Brand>
                {userData && (
                    <div>
                        <span>Welcome back: {userData?.name} {userData?.family_name} </span>
                    </div>
                )}
                <Button variant="light" onClick={signOutUser}>
                    Sign out
                </Button>
            </Container>
        </Navbar>
    );
};

export default PrimaryNavBar;
