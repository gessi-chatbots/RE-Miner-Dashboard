import { Container, Nav, Navbar } from "react-bootstrap";
import { signOut } from "aws-amplify/auth";

const NavBar = () => {
    const signOutUser = () => {
        signOut()
            .then(data => console.log(data))
            .catch(err => console.log(err));
    };

    return (
        <Navbar collapseOnSelect expand="lg" variant="dark" className="py-lg-3">
            <Container>
                <Navbar.Brand href="/" className="me-lg-5">
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="responsive-navbar-nav">
                    <i className="mdi mdi-menu"></i>
                </Navbar.Toggle>
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav as="ul" className="me-auto align-items-center">
                        <Nav.Item as="li" className="mx-lg-1">
                            <Nav.Link href="" className="active">
                                Apps
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item className="mx-lg-1">
                            <Nav.Link href="">Reviews</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    <button onClick={signOutUser}>Sign out</button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;
