import {APICore} from "../apiCore";

export default function useUserHook() {
    const api = new APICore();

    const loggedInUser = api.getLoggedInUser();
    return [loggedInUser];
}
