import React, { useState } from 'react';
import $ from 'jquery';
import { useNavigate } from 'react-router-dom';

async function signUser(credentials) {
	
	let ApiUrl = $('#ApiUrl').val();
	return fetch(ApiUrl+'signup', {
	method: 'POST',
	headers: {
	  'Content-Type': 'application/json'
	},
	body: JSON.stringify(credentials)
	})
	.then(data => data.json())
}

export default function Signup() {
	
	const [username, setUserName] = useState();
	const [password, setPassword] = useState();
	const [email, setEmail] = useState();
	const [signUp, setSignUp] = useState(false);
	const history = useNavigate();
	const handleSubmit = async e => {
		e.preventDefault();
		const response = await signUser({
		  username,
		  email,
		  password
		});
		if ('username' in response) {
			$('#username').removeClass('error');
			$('#email').removeClass('error');
			alert('User inserted successfully!');
			setTimeout(function(){
				history('/login');
			}, 1000);
		} else {
			$('#username').addClass('error');
			$('#email').addClass('error');
			alert(response.message);
		}
	}
	
	const goToSignIn = () => {
		//window.location.href = "/login";
		setTimeout(function(){
			history('/login');
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
							<h3>Sign Up</h3>
							<div className="form-group">
								<label htmlFor="username">Username</label>
								<input type="text" className="form-control" id="username" name="username" placeholder="Enter Username" onChange={e => setUserName(e.target.value)} />
							</div>
							
							<div className="form-group">
								<label htmlFor="email">Email</label>
								<input type="text" className="form-control" id="email" name="email" placeholder="Enter Email" onChange={e => setEmail(e.target.value)} />
							</div>
							
							<div className="form-group mb-2">
								<label htmlFor="password">Password</label>
								<input type="password" className="form-control" id="password" name="password" placeholder="Enter Password" onChange={e => setPassword(e.target.value)} />
							</div>
							<button type="submit" className="btn btn-primary login-btn">Sign In</button>
						</form>
						<div className="sign-up">Already have an account? <span onClick={goToSignIn}>Log in?</span></div>
					</div>
				</div>
			</div>
		</div>
	);
}