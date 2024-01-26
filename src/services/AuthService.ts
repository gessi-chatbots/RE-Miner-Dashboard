import { fetchUserAttributes, signOut } from 'aws-amplify/auth';

class AuthService {
    getUserData =  async () => {
        try {
            const currentUser = await fetchUserAttributes();
            return {
                sub: currentUser?.sub,
                name: currentUser?.name,
                family_name: currentUser?.family_name,
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

     signOutUser = () => {
        signOut()
            .then((data) => console.log(data))
            .catch((err) => console.log(err));
    };
}

export default AuthService;
