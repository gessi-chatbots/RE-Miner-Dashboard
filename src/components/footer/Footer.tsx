import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const linkStyle = {
        textDecoration: 'none'
    };

    return (
        <footer className="footer align-items-center">
            <div className="container-fluid">
                <Row className="justify-content-center">
                    <Col md={6} className="text-secondary text-center">
                        {currentYear} © <a style={linkStyle} className="text-secondary" href="https://gessi.upc.edu/en" target="_blank" rel="noopener noreferrer">GESSI</a> - <a style={linkStyle} className="text-secondary" href="https://github.com/mtiessler" target="_blank" rel="noopener noreferrer">Max Tiessler</a>
                    </Col>
                </Row>
            </div>
        </footer>
    );
};

export default Footer;
