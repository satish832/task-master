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


export default class goToTask extends Component {
	
	constructor(props){
        super(props)
		this.state ={
			taskDetails:[],
			checklist:[],
			listPercentage:0,
		}
    }
	
	componentDidMount() {
		
	}
	
	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;
		this.setState({[event.target.name]:event.target.value});
	}
	
	getTaskData=() => {
		let taskGuid = $('#taskGuid').val();
		if(taskGuid){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'details-workflow-task/'+taskGuid;
			let data = [];
			
			axios.get(url)
			.then(response => {
				data = response.data;
				
				let checklist = data[0].checklist ? data[0].checklist.split(',') : [];
	
				if(checklist.length > 0){
					
					let checkedCount = 0;
			
					checklist.map((val, index) => {
						let listtext = val.split(':');
						
						if(listtext[1] == 'true'){
							checkedCount= checkedCount+1;
						}
						
					})
					
					let listPercentage = checkedCount/checklist.length*100;
					this.setState({checkedCount,listPercentage});
				}
				
				this.setState({taskDetails:data[0], checklist:checklist});
				
				setTimeout(function(){
					$('#editTask').modal('show');
				}, 1000);
			})
		}else{
			alert('Please enter the Task Guid!');
		}
	}
	
	updateTaskOption=(event)=>{
		/* let id = event.target.id;
		let name = event.target.name;
		let val = event.target.value;
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-option';
		
		let formData = new FormData();
		formData.append('Id', id);
		formData.append('option', val);
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			//this.getTaskList();
		}).catch(error => {
			alert('error::'+ error);
		}) */
		
	}
	
	handalChecklistOption =(name)=> {
		let checklist = this.state.checklist;
		let updateChecklist = [];
		let that = this;
		if($("input[name='"+name+"']").prop("checked") == true){
			
			if(checklist.length > 0){
				checklist.map(function(val,i) {
					let str = val.split(':');
					if(str[0] == name){
						updateChecklist.push(str[0]+':'+'true');
						let note = 'Checklist item completed: '+name+' - by '+localStorage.getItem('username');
						//that.handleChecklistNote(note);
					}else{
						updateChecklist.push(str[0]+':'+str[1]);
					}
				})
				this.setState({checklist:updateChecklist});
			}
					
		}else{
			if(checklist.length > 0){
				checklist.map(function(val,i) {
					let str = val.split(':');
					if(str[0] == name){
						updateChecklist.push(str[0]+':'+'false');
						let note = 'Checklist item unchecked: '+name+' - by '+localStorage.getItem('username');
						//that.handleChecklistNote(note);
					}else{
						updateChecklist.push(str[0]+':'+str[1]);
					}
				})
				this.setState({checklist:updateChecklist});
			}
		}
		
		
		if(updateChecklist.length > 0){
			let checkedCount = 0;
			updateChecklist.map((val, index) => {
				let listtext = val.split(':');
				
				if(listtext[1] == 'true'){
					checkedCount= checkedCount+1;
				}
				
			})
			
			let listPercentage = checkedCount/updateChecklist.length*100;
			
			this.setState({checkedCount,listPercentage});
		}
		
		
	}
	
	handleChecklistNote=(note)=>{
		
		let jobId = this.state.noteJobId;
		let wId = this.state.checklistWid;
		let taskId = this.state.checklistTaskId;
		//let note = name+' - Completed by '+localStorage.getItem('username');
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'add-task-note';
		//let date = new Date();
		//let currentDate = moment(date).format('MM/DD/YYYY HH:MM');
		let formData = new FormData();
		formData.append('job_id', jobId);
		formData.append('wid', wId);
		formData.append('task_id', taskId);
		formData.append('note', note);
		//formData.append('date', currentDate);
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			this.getWipNote(jobId,wId,taskId);
		}).catch(error => {
			alert('error::'+ error);
		})
	}

	render() {

		const {taskDetails,checkedCount,listPercentage,checklist} = this.state;
		//let checklist = taskDetails.checklist ? taskDetails.checklist.split(',') : [];
		
		/* let checkedCount = 0;
		let listPercentage = 0;	
		if(checklist.length > 0){
			
			checklist.map((val, index) => {
				let listtext = val.split(':');
				
				if(listtext[1] == 'true'){
					checkedCount= checkedCount+1;
				}
				
			})
			
			listPercentage = checkedCount/checklist.length*100;
		} */

		console.log('taskDetails->',taskDetails);
		return (
			<div class="container">
			<div className="row justify-content-center mt-3">
			<div class="col-md-12 text-center">
				<h6>Go-to Task API</h6>
			</div>
				<div className="col-md-5">
					<div class="row">
						<div class="col-md-9 col-9">
							<input type="text" name="goto" className="form-control" id="taskGuid" placeholder="Enter task ID to Go-to a Task" value="01G97N06H0GCN3JR0P99DMDN75-01G7YT23A89H1VE1TA4HME9NDV"></input>
						</div>
						<div class="col-md-3 col-3 pl-0">
						<button type="submit" className="btn btn-primary btn-block" onClick={this.getTaskData}>Submit</button>
						</div>
					</div>
				</div>
			</div>
			<div className="modal go-to-task-modal" id={"editTask"} role="dialog">
				<div className="modal-dialog modal-lg custom-modal mds-description-modal">
					<div className="modal-content">
					  <div className="modal-body">
						<table className="table table-sm table-bordered">
							<tr>
								<th> Task Name </th>
								<th> Workflow Name </th>
							</tr>
							<tr>
								<td>{taskDetails.task_name}</td>
								<td> {taskDetails.workflow_name}</td>
							</tr>
							<tr>
								<th> Due Date </th>
								<th> Status</th>
							</tr>
							<tr>
								<td> {moment(taskDetails.due_date).format('MM/DD/YYYY')}</td>
								<td>
									<select id={taskDetails.id} className="form-control form-control-sm width-50" name="taskOption" onChange={this.updateTaskOption} value={taskDetails.task_option}>
										<option value='Pending'>Pending</option>
										<option value='To Do'>To Do</option>
										<option value='In Progress'>In Progress</option>
										<option value='Complete'>Complete</option>
										<option value='N/A'>N/A</option>
									</select>
								</td>
							</tr>
						</table>
						<div className="row">
							<div className="col-md-12">
								<div className="form-check">
									<label className="form-check-label">
										<input type="checkbox" className="" checked disabled /> 
										<b> Checklist </b>
									</label>
								</div>
							</div>
							<div className="col-md-12 mt-3">
								<div className="custom-progress-bar">
									<span>{parseInt(listPercentage) +'%'}</span>
									<progress id="file" value={checkedCount} max={checklist.length}></progress> 
								</div>
								
							</div>
							<div className="col-md-12">
								{checklist.map((val, index) => {
									let listtext = val.split(':');
									
									let checked = '';
									let classs = '';
									if(listtext[1] == 'true'){
										checked = 'checked';
										classs = 'checklist-completing';
									}
									
									return(
										<div className="form-check">
											<label className="form-check-label">
												<input name={listtext[0]} type="checkbox" value={listtext[0]} onClick={()=>this.handalChecklistOption(listtext[0])} checked={checked} /> <span className={classs}> {listtext[0]}</span>
											</label>
										</div>
									);
								})}
								
							</div>
							<div className="col-md-12 mt-3">
								<h5>WIP Note</h5>
								<form className="">
									<div className="form-group">
										<textarea className="form-control" name="addWipNote" value={this.state.addWipNote} onChange={this.getValue}> </textarea>
									</div>
								</form>
							</div>
							
							
						</div>
					  </div>
					  <div className="modal-footer">
							<div className="popup-btn-com">
								<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
								<button type="button" className="btn btn-info float-right mr-1" data-dismiss="modal">Save</button>
							</div>
					  </div>
					</div>
				</div>
			</div>
			</div>
		);
		
	}
}
