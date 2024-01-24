import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { signOut } from "aws-amplify/auth";

const SecondaryNavBar = () => {
    const signOutUser = () => {
        signOut()
            .then(data => console.log(data))
            .catch(err => console.log(err));
    };

    return (
        <Navbar variant="secondary" className="bg-primary py-lg-3">
            <Container>
                <Nav as="ul" className="me-auto align-items-center">
                    <Nav.Item as="li" className="mx-lg-1">
                        <Nav.Link href="" className="text-white">
                            Apps
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="mx-lg-1">
                        <Nav.Link href="" className="text-white">
                            Reviews
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default SecondaryNavBar;
