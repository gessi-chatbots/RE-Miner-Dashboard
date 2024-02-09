import {
  Authenticator,
  Button, Heading, useAuthenticator, useTheme, View, Text, Image} from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import {Amplify} from "aws-amplify";
import config from './amplifyconfiguration.json';
import './assets/scss/app.scss';
import Logo from './assets/static/images/logos/logo-GESSI.jpg';
import AppRoutes from "./routes/AppRoutes";
Amplify.configure(config);
const authenticationComponents = {
  Header() {
    const { tokens } = useTheme();
    return (
        <View textAlign="center" padding={tokens.space.large}>
          <a href="https://gessi.upc.edu/en" target="_blank">
            <Image
                alt="GESSI logo"
                src={Logo}
            />
          </a>
        </View>
    );
  },

  Footer() {
    const { tokens } = useTheme();
    const currentYear = new Date().getFullYear();
    return (
        <View textAlign="center" padding={tokens.space.large}>
          <Text color={tokens.colors.neutral[80]}>
            {currentYear} © <a
                href="https://gessi.upc.edu/en"
                target="_blank"
                style={{ textDecoration: "none", color: "inherit" }}
            >
              GESSI
            </a>{" - "}
            <a
                href="https://github.com/mtiessler"
                target="_blank"
                style={{ textDecoration: "none", color: "inherit" }}
            >
              Max Tiessler
            </a>
          </Text>
        </View>
    );
  },

  SignIn: {
    Header() {
      const { tokens } = useTheme();

      return (
          <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
          >
            Sign In RE-Miner Dashboard
          </Heading>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();

      return (
          <View textAlign="center">
            <Button
                fontWeight="normal"
                onClick={toForgotPassword}
                size="small"
                variation="link"
            >
              Reset Password
            </Button>
          </View>
      );
    },
  },

  SignUp: {
    Header() {
      const { tokens } = useTheme();

      return (
          <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={6}
          >
            Create a new account in RE-Miner Dashboard
          </Heading>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();

      return (
          <View textAlign="center">
            <Button
                fontWeight="normal"
                onClick={toSignIn}
                size="small"
                variation="link"
            >
              Back to Sign In
            </Button>
          </View>
      );
    },
  },
  ConfirmSignUp: {
    Header() {
      const { tokens } = useTheme();
      return (
          <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
          >
            Enter Information:
          </Heading>
      );
    },
  },
  SetupTotp: {
    Header() {
      const { tokens } = useTheme();
      return (
          <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
          >
            Enter Information:
          </Heading>
      );
    },
  },
  ConfirmSignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
          <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
          >
            Enter Information:
          </Heading>
      );
    },
  },
  ForgotPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
          <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
          >
            Enter Information:
          </Heading>
      );
    },
  },
  ConfirmResetPassword: {
    Header() {
      const { tokens } = useTheme();
      return (
          <Heading
              padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
              level={3}
          >
            Enter Information:
          </Heading>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
    },
  },
  signUp: {
    email: {
      label: 'Email:',
      placeholder: 'Enter your email',
      isRequired: true,
      order: 1,
    },
    name: {
      label: 'Name',
      placeholder: 'Enter your Name',
      isRequired: true,
      order: 2,
    },
    family_name: {
      label: 'Family Name',
      placeholder: 'Enter your Family Name',
      isRequired: true,
      order: 3,
    },
    password: {
      label: 'Password',
      placeholder: 'Enter your Password',
      isRequired: false,
      order: 4,
    },
    confirm_password: {
      label: 'Confirm Password',
      order: 5,
    },
  },
  forceNewPassword: {
    password: {
      placeholder: 'Enter your Password',
    },
  },
  forgotPassword: {
    username: {
      placeholder: 'Enter your email',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: 'Enter your Confirmation Code',
      label: 'New Label',
      isRequired: false,
    },
    confirm_password: {
      placeholder: 'Enter your Password Please',
    },
  },
  setupTotp: {
    QR: {
      totpIssuer: 'test issuer',
      totpUsername: 'amplify_qr_test_user',
    },
    confirmation_code: {
      label: 'New Label',
      placeholder: 'Enter your Confirmation Code',
      isRequired: false,
    },
  },
  confirmSignIn: {
    confirmation_code: {
      label: 'New Label',
      placeholder: 'Enter your Confirmation Code',
      isRequired: false,
    },
  },
};

export default function App() {
  return (
      <Authenticator formFields={formFields} components={authenticationComponents}>
        <AppRoutes />
      </Authenticator>
  );
}
