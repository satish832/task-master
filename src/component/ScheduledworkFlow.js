import React, { Component } from 'react';
import $ from 'jquery';
import axios,{post,get} from 'axios';
import moment from 'moment';
import { ulid } from 'ulid'
import arrayMove from "./arrayMove";
import Recurring from "./Recurring";
import { CSVLink } from "react-csv";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';

export default class ScheduledworkFlow extends Component {
	
	constructor(props){
        super(props)
		this.state ={
			workflows:[],
		}

    }
	
	componentDidMount() {
		this.getWorkflow();
		this.getTaskMasterUsers();
		this.loadScript();
	}
	
	loadScript() {
		var trigger2 = $('.fadeInRight'),
			overlay = $('.overlay'),
		   isClosed2 = false;
		
		function buttonSwitch2() {
			if (isClosed2 === true) {
				overlay.hide();
				trigger2.removeClass('is-open');
				trigger2.addClass('is-closed');
				isClosed2 = false;
			} else {
				overlay.show();
				trigger2.removeClass('is-closed');
				trigger2.addClass('is-open');
				isClosed2 = true;
			}
		}
		
		trigger2.click(function () {
			buttonSwitch2();
		});

		$('[data-toggle="offcanvas-3"]').click(function () {
			$('#wrapper3').toggleClass('toggled-3');
		});
		
	}
	
	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;
		this.setState({[event.target.name]:event.target.value});
		let startDate = this.state.startDate;
		let onDayName = moment(startDate).format('dddd');
		if(name == 'repeatEvery' && res == 'months'){
			
			let onDayNum = moment(startDate).format('DD');
			
			let date2 = moment(startDate); 
			let dayNumber = date2.day();
			
			let weekNumber = Math.ceil(parseInt(onDayNum, 10) / 7);
			
			let weekNumberText = 'first';
			if(weekNumber == 2){
				weekNumberText = 'second';
			}else if(weekNumber == 3){
				weekNumberText = 'third';
			}else if(weekNumber == 4){
				weekNumberText = 'fourth';
			}else if(weekNumber == 5){
				weekNumberText = 'fifth';
			}
			let repeatday = '';
			let that = this;
			setTimeout(function(){
				repeatday = $("#repeatOnDay option:selected" ).val();
				that.setState({repeatOnDay:repeatday});
			}, 2000);
			
			
			this.setState({onDayNum,dayNumber,onDayName,weekNumber,weekNumberText});
		}
		
		this.setState({onDayName});
		if(this.state.repeatEvery == 'weeks' && name == 'repeatOnDay'){
			let nextDay = moment().day(res)
			let nextDate = nextDay.format('YYYY-MM-DD');
			onDayName = moment(nextDate).format('dddd');
			this.setState({onDayName});
		}
		
	}
	
	getTaskMasterUsers=() => {
		
		let user = localStorage.getItem('username');
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'authors-responsible';
		let data = [];
		axios.get(url)
        .then(response => {
			data = response.data;
			
			let userDt = [];
		
			data.map(function(val,n) {
				if(user == val.user_name){
					userDt = val.responsible_role;
				}else if(val.user_id == 1){
					userDt = val.responsible_role;
				}
			})
			
			let rolePerson = [];
			let responsibleRole = Object.keys(userDt);
			
			responsibleRole.map(function(val,n) {
				let persons = userDt[val];
				let person = [];
				persons.map(function(vl,n) {
					person.push(vl.person+'|'+vl.person_id+'|'+vl.person_email);
				})
				
				rolePerson[val] = person.join(",");
				
			})
			
			this.setState({userData:data,responsibleRole,rolePerson});
			
		}).catch(error => {
			alert('error::'+ error);
		})
    }
	
	getWorkflow=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let that = this;
		let url = ApiUrl+'workflows-v2';
		let data = [];
		axios.get(url)
        .then(response => {
            data = response.data;
			this.setState({workflows:data});
        })
	}
	
	editScheduledWorkflow=(data)=>{

		$("#wrapper3").addClass('toggled-3');
		$(".fadeInRight").addClass('is-open');
		$(".fadeInRight").removeClass('is-closed');

		let username = data.username != null ? data.username : '';
		let user_id = data.user_id != null ? data.user_id : '';
		let branch_id = data.branch_id != null ? data.branch_id : '';
		let link_url = data.link_url != null ? data.link_url : '';
		let patient_name = data.patient_name != null ? data.patient_name : '';
		let patient_id = data.patient_id != null ? data.patient_id : '';
		let rx_id = data.rx_id != null ? data.rx_id : '';
		let claim_id = data.claim_id != null ? data.claim_id : '';
		let insurance_company = data.insurance_company != null ? data.insurance_company : '';
		let start_date = data.start_date != null ? data.start_date : '';
		let start_time = data.start_time != null ? data.start_time : '';
		let recurring = data.recurring;
		
		let repeatAfter = data.repeat_after;
		let repeatEvery = data.repeat_every;
		let repeatOnDay = data.repeat_on;
		
		let type = data.type != null ? data.type : '';
		let weekNumber = '';
		let dayNumber = '';
		let onDayNum = moment(start_date).format('DD');
		if(repeatEvery == 'months'){
			let str = repeatOnDay;
			let dayText = 'Sunday';
			
			if(str.indexOf('|') > -1){
				let ret = str.split("|");
				weekNumber = ret[0];
				dayNumber = ret[1];
			}else{
				let date2 = moment(start_date); 
				dayNumber = date2.day();
				weekNumber = Math.ceil(parseInt(onDayNum, 10) / 7);
			}
			
			
			if(dayNumber == 1){
				dayText = 'Monday';
			}else if(dayNumber == 2){
				dayText = 'Tuesday';
			}else if(dayNumber == 3){
				dayText = 'Wednesday';
			}else if(dayNumber == 4){
				dayText = 'Thursday';
			}else if(dayNumber == 5){
				dayText = 'Friday';
			}else if(dayNumber == 6){
				dayText = 'Saturday';
			}
			
			let weekNumberText = 'first';
			if(weekNumber == 2){
				weekNumberText = 'second';
			}else if(weekNumber == 3){
				weekNumberText = 'third';
			}else if(weekNumber == 4){
				weekNumberText = 'fourth';
			}else if(weekNumber == 5){
				weekNumberText = 'fifth';
			}
			
			this.setState({onDayNum,onDayName:dayText,dayNumber,weekNumber,weekNumberText});
		}
		
		if(repeatEvery == 'weeks'){
			let that = this;
			setTimeout(function(){
				let dayName = $("#repeatOnDay option:selected" ).text();
				that.setState({onDayName:dayName})
			}, 2000);
		}
		
		let newDate = moment(start_date).format('MM/DD/YYYY');
		
		this.setState({workflowId:data.id,workflowUsername:username,workflowUsernameId:user_id,branchId:branch_id,linkUrl:link_url,patientName:patient_name,patientId:patient_id,rxId:rx_id,claimId:claim_id,insuranceCompany:insurance_company,startDate:start_date,startTime:start_time,repeatAfter,repeatEvery,repeatOnDay,workflowType:type,recurring,newDate});
	
	}
	
	setStartDate=(date)=>{
		let start_date = moment(date).format('YYYY-MM-DD');
		let date2 = moment(date); 
		let dayNumber = date2.day();
		this.setState({newDate:date,repeatOnDay:dayNumber,startDate:start_date,repeatEvery:'days'});
	}
	
	updateScheduledWorkflow=()=>{
		
		let workflowId = this.state.workflowId;
		let workflowUsername = this.state.workflowUsername;
		let workflowUsernameId = this.state.workflowUsernameId;
		let branchId = this.state.branchId;
		let linkUrl = this.state.linkUrl;
		let patientName = this.state.patientName;
		let patientId = this.state.patientId;
		let rxId = this.state.rxId;
		let claimId = this.state.claimId;
		let insuranceCompany = this.state.insuranceCompany;
		let startDate = this.state.startDate;
		let startTime = this.state.startTime;
		let recurring = this.state.recurring;
		
		let repeatAfter = this.state.repeatAfter;
		let repeatEvery = this.state.repeatEvery;
		let repeatOnDay = this.state.repeatOnDay;
		
		let type = this.state.workflowType;
		
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-scheduled-workflow';
		
		let formData = new FormData();
		formData.append('workflowId', workflowId);
		formData.append('workflowUsername', workflowUsername);
		formData.append('workflowUsernameId', workflowUsernameId);
		formData.append('branchId', branchId);
		formData.append('linkUrl', linkUrl);
		formData.append('patientName', patientName);
		formData.append('patientId', patientId);
		formData.append('rxId', rxId);
		formData.append('claimId', claimId);
		formData.append('insuranceCompany', insuranceCompany);
		formData.append('startDate', startDate);
		formData.append('startTime', startTime);
		formData.append('recurring', recurring);
		formData.append('repeatAfter', repeatAfter);
		formData.append('repeatEvery', repeatEvery);
		formData.append('repeatOnDay', repeatOnDay);
		formData.append('type', type);
		
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			if(response.data){
				alert(response.data);
			}
			this.getWorkflow();
		}).catch(error => {
			alert('error::'+ error);
		})
		
	}
	
	render() {
		const {workflows} = this.state;
		
		let rowHtml = '';
		let that = this;
		
		if(workflows){
			
			rowHtml = workflows.map(function(row,i) {
				
				
				return (<tbody><tr>
					<td>{row.name}</td>
					<td>{row.category}</td>
					<td>{row.start_date}</td>
					<td>{row.start_time}</td>
					<td>{row.repeat_every}</td>
					<td><button type="button" className="btn code-dialog btn-edit task-edit"><i className="fa fa-edit" onClick={()=>that.editScheduledWorkflow(row)}></i></button></td>
					</tr>
				</tbody>);
				
			})

        }
		
		return (
			<div id="wrapper3" className="workflow-first-task toggled">
				<div className="wdata-scheduled">
					<div className="row">
						<div className="col-md-12 mb-3 text-center">
							<h4>Scheduled Workflows</h4>
						</div>
					</div>
					
					<table className="table table-bordered tracker-table">
					<thead>
					<tr>
						<th>Workflow Name</th>
						<th>Category</th>
						<th>Start Date</th>
						<th>Start Time</th>
						<th>Repeat</th>
						<th></th>
						
					</tr>
					</thead>
					{rowHtml}
					</table>
					<button type="button" className="hamburger animated fadeInRight is-closed" data-toggle="offcanvas-3"></button>	
				</div>
				<nav className="custom-navbar-2" id="sidebar-wrapper-right" role="navigation">
					<div className="nav-content-right">
						<h5 className="page-title">Details Panel</h5>
						<div className="workflow-item-fields scheduled-input">
							<div className="row-input">
								<label className="label-control"> Workflow Username </label>
								<input className="form-control" type="text" name='workflowUsername' onChange={this.getValue} value={this.state.workflowUsername} />
							</div>
							
							<div className="row-input">
								<label className="label-control"> Workflow Username ID</label>
								<input className="form-control" type="text" name='workflowUsernameId' onChange={this.getValue} value={this.state.workflowUsernameId} />
							</div>
							
							<Recurring 
								defaultProps = {this.state}
								getValue = {this.getValue}
								setStartDate = {this.setStartDate}
							/>
							
							<div className="row-input">
								<label className="label-control"> Branch ID </label>
								<input className="form-control" type="text" name='branchId' onChange={this.getValue} value={this.state.branchId} />
							</div>
							
							<div className="row-input">
								<label className="label-control"> Link Url </label>
								<input className="form-control" type="text" name='linkUrl' onChange={this.getValue} value={this.state.linkUrl} />
							</div>
							
							<div className="row-input">
								<label className="label-control"> Patient Name </label>
								<input className="form-control" type="text" name='patientName' onChange={this.getValue} value={this.state.patientName} />
							</div>
							
							<div className="row-input">
								<label className="label-control"> Patient ID </label>
								<input className="form-control" type="text" name='patientId' onChange={this.getValue} value={this.state.patientId} />
							</div>
							
							<div className="row-input">
								<label className="label-control"> RX ID </label>
								<input className="form-control" type="text" name='rxId' onChange={this.getValue} value={this.state.rxId} />
							</div>
							
							<div className="row-input">
								<label className="label-control"> Claim ID </label>
								<input className="form-control" type="text" name='claimId' onChange={this.getValue} value={this.state.claimId} />
							</div>
							
							<div className="row-input">
								<label className="label-control"> Insurance Company </label>
								<input className="form-control" type="text" name='insuranceCompany' onChange={this.getValue} value={this.state.insuranceCompany} />
							</div>
							
							
							{/*<div className="row-input">
								<label className="label-control"> Start Time </label>
								<input className="form-control" type="text" name='startTime' onChange={this.getValue} value={this.state.startTime} />
							</div>
							
							
							
							<div className="row-input">
								<label className="label-control"> Recurring </label>
								<select className="form-control" name="recurring" onChange={this.getValue} value={this.state.recurring}>
									<option value="No">No</option>
									<option value="Yes">Yes</option>
								</select>
							</div>
							{this.state.recurring == 'Yes' ? 
							<div className="row-input">
								<label className="label-control"> Repeat </label>
								<select className="form-control" name="repeat" onChange={this.getValue} value={this.state.repeat}>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
									
								</select>
							</div>
							:null}
							{this.state.recurring == 'Yes' ? 
							<div className="row-input">
								<label className="label-control"> Repeat Day </label>
								<select className="form-control" name="repeatDay" onChange={this.getValue} value={this.state.repeatDay}>
									<option value="monday">Monday</option>
									<option value="tuesday">Tuesday</option>
									<option value="wednesday">Wednesday</option>
									<option value="thursday">Thursday</option>
									<option value="friday">Friday</option>
									<option value="saturday">Saturday</option>
								</select>
							</div>
							:null*/}
							<div className="row-input">
								<label className="label-control"> Workflow Type </label>
								<input className="form-control" type="text" name='workflowType' onChange={this.getValue} value={this.state.workflowType} />
							</div>
							
							<div className="row-input-save">
								<button type="button" className="btn btn-info btn-update-status" onClick={this.updateScheduledWorkflow}>Update</button>
							</div>
							
						</div>
					</div>
				</nav>
			</div>
		);	
	}	
}
