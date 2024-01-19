import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
/*
* reducers specify how the application's state changes in response to actions
* arguments:
*  - current state
*  - action
* return:
*  - new state
* */
import reducers from './reducers';
/*
* Generator functions for complex asynchronous actions
* */
import rootSaga from './sagas';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];


export function configureStore(initialState: {}) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const localstore = createStore(reducers, initialState, composeEnhancers(applyMiddleware(...middlewares)));
    sagaMiddleware.run(rootSaga);
    return localstore;
}
