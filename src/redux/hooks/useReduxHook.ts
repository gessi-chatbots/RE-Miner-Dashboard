import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {AppDispatch, RootState} from "../store";


/**
 * This hook allows to access to the Redux Store
 */
export default function useReduxHook() {
    const dispatch = useDispatch<AppDispatch>();
    const appSelector: TypedUseSelectorHook<RootState> = useSelector;
    return { dispatch, appSelector };
}
