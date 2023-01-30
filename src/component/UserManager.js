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
					<td>{row.role}</td>
					<td><input type="checkbox" checked={row.status == 1 || that.state[row.id] ? 'checked' : ''} name={'user_'+row.id} onClick={()=>that.userApprove(row.id)} /></td>
				</tr>);
			})
		}
		
		return (
			<div className="user-list">
				<div className="row">
					<div className="col-md-12 mb-4">
						<h4>Login Users</h4>
					</div>
				</div>
				<div className="user-table">
					<table className="table table-bordered">
					<tr>
						<th className="w-name">User Name</th>
						<th>Email</th>
						<th>Role</th>
						<th>Approve</th>
					</tr>
					{rowHtml}
					</table>
				</div>
			</div>
		);
		
	}
}
