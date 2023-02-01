import React,{ Component } from 'react';
import $ from 'jquery';
import { Form,Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

class MainHeader extends Component {
	constructor(props) {
        super(props);
	 	this.state ={

	 	}
    }
   	
	logout = () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("user");
		window.location.href = "/login";
    }
	
    render(){
		const { builderOption } =this.props;
    	return (
        <div className="card-header top-header">
            <div className="row">
				<div className="col-md-6">
                    <h4>Task Master</h4>
					<div className="instance-version">{'V1.28012023.a'}</div>
                </div>
				<div className="col-md-2">
					{localStorage.getItem('role') == 'SuperAdmin' || localStorage.getItem('role') == 'Admin' ?
					<select id="select-view-option" className="form-control company-select" onChange={builderOption} >
						<option value="taskManager">Task List Manager</option>
						<option value="workFlowManger">Workflow Manager</option>
						<option value="workFlow">Workflow Builder</option>
						<option value="workFlowDetails">Workflow Details</option>
						<option value="workFlowProgress">Workflows in Progress</option>
						<option value="scheduledworkFlow">Scheduled Workflows</option>
						
						{localStorage.getItem('role') == 'SuperAdmin' ?
						<option value="userManager">User Manager</option>
						:null}
					</select>
					:null}
					
					{localStorage.getItem('role') == 'Subscriber' ?
					<select id="select-view-option" className="form-control company-select" onChange={builderOption} >
						<option value="workFlowProgress">Workflows in Progress</option>
					</select>
					:null}
					
				</div>
				<div className="col-md-4 user-top-outer">
					<div className="login-user-top">{'Logged in as: '+localStorage.getItem('username')}</div>
					<a className="btn btn-outline-info sign-out-btn" onClick={this.logout}>Sign Out</a>
                </div>
            </div>
        </div>            
    )}
	
}

export default MainHeader;