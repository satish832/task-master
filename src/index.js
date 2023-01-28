import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signin from './Signin';
import Signup from './Signup';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
		<BrowserRouter>
			<Routes>
				<Route exact path="/" element=<App /> />
				<Route path="/login" element=<Signin /> />
				<Route path="/sign-up" element=<Signup /> />
			</Routes>
		</BrowserRouter>
);

reportWebVitals();
