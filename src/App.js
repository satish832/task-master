import React from 'react';
import ReactDOM from 'react-dom/client';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Switch, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import Signin from './Signin';
import TaskMaster from "./TaskMaster";

function App() {
	const history = useNavigate();
	const token = localStorage.getItem('accessToken');

	if(!token) {
		setTimeout(function(){
			history('/login');
		}, 1000);	
		return <Signin />
	}else{
	
		return (
			<div className="App">
				<TaskMaster />
			</div>
		);
	}
}

export default App;
