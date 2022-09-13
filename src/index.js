import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux'
import {createStore} from 'redux'
import rootReducer from './reducers';
// import wsReducer from './reducers';
import './webSocket'
const store = createStore(rootReducer,
//needed for dev tools
window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())



ReactDOM.render(
    <Provider store={store}>
    <App/>
</Provider>, document.getElementById('root'));
registerServiceWorker();
