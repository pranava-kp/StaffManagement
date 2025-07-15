import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import rootReducer from "./reducer";
import {configureStore} from "@reduxjs/toolkit";

const store = configureStore({
  reducer: rootReducer,
})

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // <React.StrictMode>
        <BrowserRouter>
            <Provider store={store}>
                <App />
                <Toaster />
            </Provider>
        </BrowserRouter>
    /* </React.StrictMode> */
);
