import React, { useState } from 'react';
import $ from 'jquery';
import Signup from './Signup';
import { useNavigate } from 'react-router-dom';

async function loginUser(credentials) {
	let ApiUrl = $('#ApiUrl').val();
	return fetch(ApiUrl+'login', {
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify(credentials)
	})
	.then(data => data.json())
}

export default function Signin() {
	
	const [username, setUserName] = useState();
	const [password, setPassword] = useState();
	const [signUp, setSignUp] = useState(false);
	const history = useNavigate();
	const handleSubmit = async e => {
		e.preventDefault();
		const response = await loginUser({
		  username,
		  password
		});
		if ('accessToken' in response) {
			localStorage.setItem('accessToken', response['accessToken']);
			localStorage.setItem('username', JSON.stringify(response['user']['username']));
			window.location.href = "/";
		} else {
		  alert("Failed", response.message, "error");
		}
	}
	
	const goToSignUp = () => {
		//window.location.href = "/sign-up";
		setTimeout(function(){
			history('/sign-up');
		}, 1000);
	}

	return (
		<div className='main-login'>
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-7 login-img" style={{ backgroundImage: "url(/login-background.jpg)" }}></div>
					<div className="col-md-5">
						<form onSubmit={handleSubmit}>
							<div className="main-log-img"><img src={'/logo.png'} width="200px" height="90px"/></div>
							<h3>Sign in</h3>
							<div className="form-group">
								<label htmlFor="username">Username</label>
								<input type="text" className="form-control" id="username" name="username" placeholder="Enter Username" onChange={e => setUserName(e.target.value)} />
							</div>
							<div className="form-group mb-2">
								<label htmlFor="password">Password</label>
								<input type="password" className="form-control" id="password" name="password" placeholder="Enter Password" onChange={e => setPassword(e.target.value)} />
							</div>
							<button type="submit" className="btn btn-primary login-btn">Sign In</button>
						</form>
						<div className="sign-up">Need to <span onClick={goToSignUp}>create account?</span></div>
					</div>
				</div>
			</div>
		</div>
	);
}