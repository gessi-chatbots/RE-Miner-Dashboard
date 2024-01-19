import { all } from 'redux-saga/effects';
import authorizationSaga from './auth/saga';

export default function* rootSaga() {
    yield all([authorizationSaga()]);
}
