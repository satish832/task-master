import React, { Component } from 'react';
import $ from 'jquery';
import axios,{post,get} from 'axios';
import moment from 'moment';
import { ulid } from 'ulid'
import arrayMove from "./arrayMove";
import { CSVLink } from "react-csv";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';


export default class UserManager extends Component {
	
	constructor(props){
        super(props)
		this.state ={
			users:[],
			userName:'',
			
		}

    }
	
	componentDidMount() {
		this.getUsers();
	}
	
	getUsers=() => {
		
		let user = localStorage.getItem('username');
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'users';
		let data = [];
		axios.get(url)
        .then(response => {
			data = response.data;
			this.setState({users:data});
			
		}).catch(error => {
			alert('error::'+ error);
		})
    }
	
	userApprove=(id) => {
		
		let str = 'user_'+id;
		let val = 0;
		if($("input[name='"+str+"']").prop("checked") == true){
			val = 1;
			this.setState({[str]:true});
		}else{
			this.setState({[str]:false});
		}

		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'user-approve/'+id;
			let formData = new FormData();
			formData.append('val', val);
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				this.getUsers();
			}).catch(error => {
				alert('error::'+ error);
			})
		}
    }
	
	updateRoleOption=(event) => {
		let userId = event.target.id;
		let name = event.target.name;
		let res = event.target.value;
		if(userId){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'update-user-role/'+userId;
			let formData = new FormData();
			formData.append('role', res);
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				this.getUsers();
			}).catch(error => {
				alert('error::'+ error);
			})
		}
    }
	
	getEditUser=(id,username) => {
		this.setState({'userId':id,'userName':username});
	}
	
	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;
		this.setState({[event.target.name]:event.target.value});
	}
	
	addUser=() => {
		let userName = this.state.userName;
		let userPassword = this.state.userPassword;
		let userRole = this.state.userRole ? this.state.userRole : 'Subscriber';
		let userEmail = this.state.userEmail ? this.state.userEmail : '';
		
		if(userName && userPassword){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'add-user';
			let formData = new FormData();
			formData.append('username', userName);
			formData.append('password', userPassword);
			formData.append('role', userRole);
			formData.append('email', userEmail);
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				if(response.data.username){
					alert('The user added successfully!');
				}
				this.getUsers();
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	updateUser=() => {
		
		let userId = this.state.userId;
		let userName = this.state.userName;
		let userPassword = this.state.userPassword;
		
		if(userId){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'update-user/'+userId;
			let formData = new FormData();
			formData.append('username', userName);
			formData.append('password', userPassword);
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				this.getUsers();
				$("input[name='userPassword']").val('');
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	addNewUser=() => {
		$("input[name='userName']").val('');
		$("input[name='userEmail']").val('');
		$("input[name='userPassword']").val('');
	}
	
	deleteUser=(id) => {
		alert(id);
		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'delete-user/'+id;
			let formData = new FormData();
			axios({
				method: 'delete',
				url: url,
			})
			.then(response => {
				this.getUsers();
				if(response.data){
					alert(response.data);
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	
	
	render() {
		const {users} = this.state;
		let rowHtml = '';
		if(users){
			let that = this;
			rowHtml = users.map(function(row,i) {
				if(row.username == 'admin'){
					return false;
				}
				
				return (<tr>
					<td className="w-name">{row.username}</td>
					<td>{row.email }</td>
					<td className="input-role-option">
					<select id={row.id} className="role-option" name="userRole" onChange={that.updateRoleOption} value={row.role}>
						<option value='SuperAdmin'>Super Admin</option>
						<option value='Admin'>Admin</option>
						<option value='Subscriber'>Regular User</option>
						<option value='General'>General User</option>
					</select>
					</td>
					<td><input type="checkbox" checked={row.status == 1 || that.state[row.id] ? 'checked' : ''} name={'user_'+row.id} onClick={()=>that.userApprove(row.id)} /></td>
					<td><button type="button" onClick={()=>that.getEditUser(row.id,row.username)} className="btn btn-edit-workflow" data-toggle="modal" data-target="#editWorkflow"><i className="fa fa-edit"></i></button><i onClick={() => { if (window.confirm('Are you sure you want to delete this user?')) that.deleteUser(row.id) } } className="fa fa-trash"></i></td>
				</tr>);
			})
		}
		
		return (
			<div className="user-list">
				<div className="row">
					<div className="col-md-12">
						<h4>Login Users</h4>
					</div>
				</div>
				<div className="add-user">
					<button type="button" className="btn btn-add-user" onClick={()=>this.addNewUser()} data-toggle="modal" data-target="#addUser">Add User</button>
				</div>
				<div className="user-table">
					<table className="table table-bordered">
					<tr>
						<th className="w-name">UserName</th>
						<th>Email</th>
						<th>Role</th>
						<th>Approve</th>
						<th></th>
					</tr>
					{rowHtml}
					</table>
				</div>
				<div className="modal" id={"editWorkflow"} role="dialog">
					<div className="modal-dialog modal-lg custom-modal mds-description-modal">
						<div className="modal-content">
						  <div className="modal-header">
							<h5 className="modal-title">Update username and password!</h5>
							<button type="button" className="close" data-dismiss="modal">&times;</button>
						  </div>
						  <div className="modal-body">
							<label className="label-control"> UserName </label>
							<input className="form-control" name="userName" type="text" value={this.state.userName} onChange={this.getValue} />
							<label className="label-control"> Password </label>
							<input className="form-control" name="userPassword" type="password " onChange={this.getValue} />
						  </div>
						  <div className="modal-footer">
								<div className="popup-btn-com">
									<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
									<button type="button" onClick={()=>this.updateUser()} className="btn btn-info float-right mr-1" data-dismiss="modal">Update</button>
								</div>
						  </div>
						</div>
					</div>
				</div>
				<div className="modal" id={"addUser"} role="dialog">
					<div className="modal-dialog modal-lg custom-modal mds-description-modal">
						<div className="modal-content">
						  <div className="modal-header">
							<h5 className="modal-title">Add New User!</h5>
							<button type="button" className="close" data-dismiss="modal">&times;</button>
						  </div>
						  <div className="modal-body">
							<label className="label-control"> UserName </label>
							<input className="form-control" name="userName" type="text" onChange={this.getValue} />
							<label className="label-control"> Email </label>
							<input className="form-control" name="userEmail" type="email" onChange={this.getValue} />
							<label className="label-control"> Role </label>
							<select className="form-control role-option-2" name="userRole" onChange={this.getValue} >
								<option value='SuperAdmin'>Super Admin</option>
								<option value='Admin'>Admin</option>
								<option value='Subscriber'>Regular User</option>
								<option value='General'>General User</option>
							</select>
							<label className="label-control"> Password </label>
							<input className="form-control" name="userPassword" type="password" onChange={this.getValue} />
						  </div>
						  <div className="modal-footer">
								<div className="popup-btn-com">
									<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
									<button type="button" onClick={()=>this.addUser()} className="btn btn-info float-right mr-1" data-dismiss="modal">Add</button>
								</div>
						  </div>
						</div>
					</div>
				</div>
			</div>
		);
		
	}
}
