import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import { store } from './redux/store/store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { restoreUser } from './redux/store/slices/userSlice';

const bootAuth = () => {
 const token = localStorage.getItem('access_token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
   // Khôi phục user state từ localStorage vào Redux
 store.dispatch(restoreUser());
};
bootAuth();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();