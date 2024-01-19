import { Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input } from '../components';
import AuthLayout from './AuthLayout';
import useLoginHook from "./hooks/useLoginHook";


export type UserData = {
    username: string;
    password: string;
};

const BottomLink = () => {
    const { t } = useTranslation();

    return (
        <Row className="mt-3">
            <Col className="text-center">
                <p className="text-muted">
                    {t("Don't have an account?")}{' '}
                    <Link to={'/authorization/login'} className="text-muted ms-1">
                        <b>{t('Sign Up')}</b>
                    </Link>
                </p>
            </Col>
        </Row>
    );
};

const Login = () => {
    const { t } = useTranslation();

    const {
        loading,
        userLoggedIn,
        user,
        error,
        onSubmit,
        redirectUrl } = useLoginHook();

    return (
        <>
            {(userLoggedIn || user) && <Navigate to={redirectUrl} replace />}

            <AuthLayout bottomLinks={<BottomLink />}>
                <div className="text-center w-75 m-auto">
                    <h4 className="text-dark-50 text-center mt-0 fw-bold">{t('Sign In')}</h4>
                    <p className="text-muted mb-4">
                        {t('Enter your username and password to access to AppReview Miner.')}
                    </p>
                </div>

                {error && (
                    <Alert variant="danger" className="my-2">
                        {error}
                    </Alert>
                )}

                <Form<UserData>
                    onSubmit={onSubmit}
                    defaultValues={{ username: 'test', password: 'test' }}
                >
                    <Input
                        label={t('Username')}
                        type="text"
                        name="username"
                        placeholder={t('Enter your Username')}
                        containerClass={'mb-3'}
                    />
                    <Input
                        label={t('Password')}
                        type="password"
                        name="password"
                        placeholder={t('Enter your password')}
                        containerClass={'mb-3'}
                    >
                        <Link to="/authorization/login" className="text-muted float-end">
                            <small>{t('Forgot your password?')}</small>
                        </Link>
                    </Input>

                    <div className="mb-3 mb-0 text-center">
                        <Button variant="primary" type="submit" disabled={true}>
                            {t('Log In')}
                        </Button>
                    </div>
                </Form>
            </AuthLayout>
        </>
    );
};

export default Login;
