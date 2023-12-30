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


export default class WorkFlowProgress extends Component {
	
	constructor(props){
        super(props)
		this.state ={
			workflows:[],
			wCategories:[],
			types:[],
			wInsurance:[],
			wPatients:[],
			responsibleRole:[],
			responsiblePerson:[],
			filterCategory:'',
			filterWorkflow:'',
			workflowFirstTask:[],
			workflowSuperJobs:[],
			workflowJob:[],
			workflowJobTasks:[],
			rolePerson:[],
			branchs:[],
			taskNote:'',
			checklist:[],
			taskWipNote:'',
			startDate:'',
			endDate:'',
			workflowListTable:true,
			viewWorkflowDetails:false,
			superViewIcon:false,
			superViewShow:false,
			superViewV2:false,
			workflowDaysSpent:0,
			greaterCount:0,
			checklistWid:'',
			checklistTaskId:'',
		}

    }
	
	componentDidMount() {
		this.getWorkflow();
		this.getTaskMasterUsers();
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
				}else if(val.id == 1){
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
		let url = ApiUrl+'pro-workflows';
		let data = [];
		axios.get(url)
        .then(response => {
			data = response.data;
			if(data){
				let wName = [];
				let wCategory = [];
				let wRole = [];
				let wPerson = [];
				let wBranch = [];
				let wType = [];
				let wcompany = [];
				let wPatient = [];

				data.map(function(val,i) {
					wName.push(val['name']);
					wCategory.push(val['category']);
					wBranch.push(val['branch_id']);
					wType.push(val['type']);
					wcompany.push(val['insurance_company']);
					wPatient.push(val['patient_id']);
					if(val['task']['role']){
						wRole.push(val['task']['role']);
						wPerson.push(val['task']['person']);
					}
				})
				let workflows = this.uniqueArray(wName);
				let wCategories = this.uniqueArray(wCategory);
				let responsibleRole = this.uniqueArray(wRole);
				let responsiblePerson = this.uniqueArray(wPerson);
				let branchs = this.uniqueArray(wBranch);
				let types = this.uniqueArray(wType);
				let wInsurance = this.uniqueArray(wcompany);
				let wPatients = this.uniqueArray(wPatient);
				
				this.setState({workflows,wCategories,responsibleRole,responsiblePerson,branchs,types,wInsurance,wPatients,workflowFirstTask:data});
			}
        })
	}
	
	updateTaskOption=(event)=>{
		let str = event.target.id;
		let ids = str.split('|');
		
		let name = event.target.name;
		let val = event.target.value;
		let days = 0;
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-option-v2';
		let date = new Date();
		let currentDate = moment(date).format('MM-DD-YYYY');
		
		let startDate = moment(ids[1]).format('YYYY-MM-DD');
		
		if(val == 'Complete'){
			let start = new Date(startDate);
			let diff  = new Date(date - start);
			days  = Math.round(diff/1000/60/60/24);
		}

		let formData = new FormData();
		formData.append('Id', ids[0]);
		formData.append('option', val);
		formData.append('date', currentDate);
		formData.append('days', days);
		formData.append('user', localStorage.getItem('username'));
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			this.getWorkflow();
		}).catch(error => {
			alert('error::'+ error);
		})
		
	}
	
	updatePerson=(event)=>{
		let id = event.target.id;
		let personData = event.target.selectedOptions[0].dataset.hex;
		let name = personData.split('|');
		
		let val = event.target.value;
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-person';
		let date = new Date();
		let currentDate = moment(date).format('MM/DD/YYYY HH:MM');
		let formData = new FormData();
		formData.append('Id', id);
		formData.append('person_id', name[1]);
		formData.append('person', name[0]);
		formData.append('person_email', name[2]);
		formData.append('user', localStorage.getItem('username'));
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			this.getWorkflow();
		}).catch(error => {
			alert('error::'+ error);
		})
		
	}

	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;
		if(name == 'filterWorkflow' && res != ''){
			this.setState({superViewIcon:true});
		}else if(name == 'filterWorkflow' && res == ''){
			this.setState({superViewIcon:false});
		}
		this.setState({[event.target.name]:event.target.value});
	}
	
	detailsNote=(note)=>{
		this.setState({taskNote:note});
	}
	
	taskChecklist=(wid,taskId,checklist)=>{
		if(checklist){
			this.setState({checklist:checklist ? checklist.split(',') : [],checklistWid:wid,checklistTaskId:taskId});
		}
	}
	
	wipNote=(job_id,wid,task_id)=>{
		this.getWipNote(job_id,wid,task_id);
		//this.setState({taskWipNote:note});
		this.setState({noteJobId:job_id,noteWId:wid,noteTaskId:task_id});
	}
	
	handleWipNote=()=>{
		
		let noteJobId = this.state.noteJobId;
		let noteWId = this.state.noteWId;
		let noteTaskId = this.state.noteTaskId;
		let addWipNote = this.state.addWipNote;
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'add-task-note';
		//let date = new Date();
		//let currentDate = moment(date).format('MM/DD/YYYY HH:MM');
		let formData = new FormData();
		formData.append('job_id', noteJobId);
		formData.append('wid', noteWId);
		formData.append('task_id', noteTaskId);
		formData.append('note', addWipNote);
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
			//this.getWorkflow();
			this.getWipNote(noteJobId,noteWId,noteTaskId);
			this.setState({addWipNote:''});
		}).catch(error => {
			alert('error::'+ error);
		})	
	}
	
	handleWipNoteByRow=(job_id,wid,task_id,row_id) => {
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'task-note';
		let data = [];
		let formData = new FormData();
		formData.append('job_id', job_id);
		formData.append('wid', wid);
		formData.append('task_id', task_id);
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			data = response.data;
			let notes = data.join("<br />");
			if(data != ''){
				$('#note_'+row_id).html(notes);
			}else{
				$('#note_row'+row_id).addClass('hide-row');
			}
			
		}).catch(error => {
			//alert('error::'+ error);
		})
    }
	
	handleViewWipNoteByRow=(job_id,wid,task_id,row_id) => {
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'task-note';
		let data = [];
		let formData = new FormData();
		formData.append('job_id', job_id);
		formData.append('wid', wid);
		formData.append('task_id', task_id);
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			data = response.data;
			let notes = data.join("<br />");
			if(data != ''){
				$('#new_note_'+row_id).html(notes);
			}else{
				$('#note_row'+row_id).addClass('hide-row');
			}
		}).catch(error => {
			alert('error::'+ error);
		})
    }
	
	getWipNote=(job_id,wid,task_id) => {
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'task-note';
		let data = [];
		let formData = new FormData();
		formData.append('job_id', job_id);
		formData.append('wid', wid);
		formData.append('task_id', task_id);
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			data = response.data;
			let notes = data.join("<br />");
			$('#10').html(notes);
		}).catch(error => {
			alert('error::'+ error);
		})

    }
	
	uniqueArray(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++)
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
				a.push(arr[i]);
		return a;
	}
	
	handleChangeStart = date => {
        this.setState({
          startDate: date,date
        });
    }
	
	handleChangeEnd = date => {
        this.setState({
          endDate: date,date
        });
    }
	
	resetFilter = () => {
		this.setState({filterWorkflow:'',filterCategory:'',filterRole:'',filterPerson:'',filterStatus:'',filterBranch:'',filterType:'',filterCompany:'',filterPatient:'',startDate:'',endDate:''});
		$('.wp-filter select').val('');
	}
	
	workflowDetails = (workflowJobId,workflow_days_spent) => {
		this.setState({viewWorkflowJobId:workflowJobId,viewWorkflowDetails:true,workflowListTable:false,workflowJobTasks:[],workflowDaysSpent:workflow_days_spent});
		this.getWorkflowJobDetails(workflowJobId);
	}
	
	workflowDetailsV2 = (workflowJobId) => {
		this.setState({superViewV2:true,viewWorkflowJobId:workflowJobId,viewWorkflowDetails:true,workflowListTable:false,workflowJobTasks:[]});
		this.getWorkflowJobDetails(workflowJobId);
	}
	
	handleBackView = () => {
		this.setState({viewWorkflowJobId:'',viewWorkflowDetails:false,workflowListTable:true,superViewShow:false});
	}
	
	handleBackViewV2 = () => {
		this.setState({viewWorkflowDetails:false,workflowListTable:false,superViewShow:true});
	}
	
	getWorkflowJobDetails=(id)=>{
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'workflow-job-details/'+id;
		
		axios.get(url)
        .then(response => {
			let data = response.data;
			this.setState({workflowJob:data,workflowJobTasks:data.tasks});
		}).catch(error => {
			alert('error::'+ error);
		})
		
	}
	
	superView = (superViewId) => {
		this.setState({workflowSuperJobs:[]});
		let ApiUrl = $('#ApiUrl').val();
		//let url = ApiUrl+'workflow/workflows_in_progress_v2.php';
		let url = ApiUrl+'workflows-in-progress-v2/'+superViewId;
		axios.get(url)
        .then(response => {
			let data = response.data;
			let greaterCount = 0;
			let workflowSuperJobs = data.jobs;
			workflowSuperJobs.map(function(row,i) {
				let superJobTask = row.Tasks;
				let count = superJobTask.length;
				if(count > greaterCount){
					greaterCount = count;
				}
			});
			
			this.setState({workflowSuperJobs:data.jobs,greaterCount});
		}).catch(error => {
			alert('error::'+ error);
		})
		
		this.setState({superViewShow:true,viewWorkflowDetails:false,workflowListTable:false});
	}
	
	showAllNotes =()=> {
		if($("input[name='showAllNotes']").prop("checked") == true){
			$('.note-row').show();
		}else{
			$('.note-row').hide();
		}
	}
	
	saveChecklistOption =()=> {
		let taskId = this.state.checklistTaskId;
		let workflowId = this.state.checklistWid;
		let checklist = this.state.checklist.join();
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-workflow-task-checklist';
		
		let formData = new FormData();
		formData.append('taskId', taskId);
		formData.append('workflowId', workflowId);
		formData.append('checklist', checklist);
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			this.getWorkflow();
		}).catch(error => {
			alert('error::'+ error);
		})
	}
	
	handalChecklistOption =(name)=> {
		let checklist = this.state.checklist;
		if($("input[name='"+name+"']").prop("checked") == true){
			
			if(checklist.length > 0){
				let updateChecklist = [];
				checklist.map(function(val,i) {
					let str = val.split(':');
					if(str[0] == name){
						updateChecklist.push(str[0]+':'+'true');
					}else{
						updateChecklist.push(str[0]+':'+str[1]);
					}
				})
				this.setState({checklist:updateChecklist});
			}
					
		}else{
			if(checklist.length > 0){
				let updateChecklist = [];
				checklist.map(function(val,i) {
					let str = val.split(':');
					if(str[0] == name){
						updateChecklist.push(str[0]+':'+'false');
					}else{
						updateChecklist.push(str[0]+':'+str[1]);
					}
				})
				this.setState({checklist:updateChecklist});
			}
		}
	}
	
	render() {
		const {workflowFirstTask,workflows,wCategories,filterWorkflow,filterCategory,filterRole,filterPerson,filterStatus,filterBranch,filterType,filterCompany,filterPatient,responsibleRole,responsiblePerson,branchs,types,wInsurance,wPatients,viewWorkflowDetails,workflowListTable,workflowJob,workflowJobTasks,superViewIcon,superViewShow,workflowSuperJobs,rolePerson,updateChecklist,checklist} = this.state;
		//console.log('workflowFirstTask->',workflowFirstTask);
		let rowHtml = '';
		let rowHtml2 = '';
		let rowHtml3 = '';
		let tasksHeader = '';
		let href = window.location.href.split('?')[0];
		let that = this;
		let superViewId = '';
		let assignedDays = '';
		
		if(workflowFirstTask){
			
			rowHtml = workflowFirstTask.map(function(row,i) {
				if(row.task.id){
					let icon = 'x';
					if(row.task.status == 'To Do'){
						icon = 'red';
					}else if(row.task.status == 'In Progress'){
						icon = 'yellow';
					}else if(row.task.status == 'Complete'){
						icon = 'green';
					}else if(row.task.status == 'Pending'){
						icon = 'pending';
					}
					
					if(filterWorkflow && filterWorkflow != row.name){
						return false;
					}
					if(filterCategory && filterCategory != row.category){
						return false;
					}
					if(filterRole && filterRole != row.task.role){
						return false;
					}
					
					if(filterPerson && filterPerson != row.task.person){
						return false;
					}
					
					if(filterStatus && filterStatus != row.task.status){
						return false;
					}
					
					if(filterBranch && filterBranch != row.branch_id){
						return false;
					}
					
					if(filterType && filterType != row.type){
						return false;
					}
					
					if(filterCompany && filterCompany != row.insurance_company){
						return false;
					}
					
					if(filterPatient && filterPatient != row.patient_id){
						return false;
					}
					
					let dueDate = moment(row.due_date).format('MM/DD/YYYY');
					
					if(that.state.startDate){
						let sDate = moment(that.state.startDate).format('MM/DD/YYYY');
						if(dueDate < sDate){
							return false;
						}
					}
					
					if(that.state.startDate){
						let eDate = moment(that.state.endDate).format('MM/DD/YYYY');
						if(dueDate > eDate){
							return false;
						}
					}
					let personOption = '';
					if(rolePerson[row.task.role]){
						let persons = rolePerson[row.task.role].split(',');
						personOption = persons.map(function(val,i) {
							let name = val.split('|');
							return (
								<option key={i} data-hex={val} value={name[0]}>{name[0]}</option>
							);
						})
					}
					
					let className = '';
					let days_assigned = parseInt(row.task.x_days_number);
					let days_spent = parseInt(row.task.days_spent);
					
					if(days_assigned < days_spent){
						className = 'row-red';
					}
					
					if(days_assigned == days_spent){
						className = 'row-yellow';
					}
					
					let checklist = row.task.checklist ? row.task.checklist.split(',') : [];
					let checklistChecked = '';
					if(checklist.length > 0){
						let checkedCount = 0;
						//let uncheckedCount = 0;
						checklist.map(function(val,i) {
							let str = val.split(':');
							if(str[1] == 'true'){
								checkedCount= checkedCount+1;
							}
						})
						
						checklistChecked = checkedCount+'/'+checklist.length;
					}
					
					that.handleWipNoteByRow(row.task.job_id,row.task.wid,row.task.task_id,row.id);
					superViewId = row.workflow_id;
					return (<tbody><tr>
						<td>{row.task.name}</td>
						<td>{row.name}</td>
						<td>{row.category}</td>
						<td>{row.task.role}</td>
						<td><span className="input-option">
						<select id={row.task.id} className="workflow-option" onChange={that.updatePerson} name="personName" value={row.task.person}>
							{row.task.person == '' ?
							<option value="">Please Select</option>
							:null}
							{personOption}
						</select>
						</span>
						</td>
						<td>{moment(row.due_date).format('MM/DD/YYYY')}</td>
						<td>
							<span className="input-option">
							<select id={row.task.id+'|'+row.task.task_start_date} className="workflow-option" name="taskOption" onChange={that.updateTaskOption} value={row.task.status}>
								<option value='Pending'>Pending</option>
								<option value='To Do'>To Do</option>
								<option value='In Progress'>In Progress</option>
								<option value='Complete'>Complete</option>
								<option value='N/A'>N/A</option>
							</select>
							</span>
						</td>
						<td>{row.task.x_days_number}</td>
						<td className={className}>{row.task.days_spent}</td>
						<td><span className="task-icon"><img src={href+'/'+icon+'.png'} alt="Status" width="15" height="15" /></span></td>
						
						<td><span className="task-icon task-note" data-toggle="modal" data-target="#checkListPopup" onClick={() => { that.taskChecklist(row.task.wid,row.task.task_id,row.task.checklist) } }>{checklistChecked}</span></td>
						
						<td>
						<span className="task-icon task-note" data-toggle="modal" data-target="#taskNote" onClick={() => { that.detailsNote(row.task.details_note) } }><i className="fa fa-eye"></i></span>
						</td>
						<td><span className="task-icon task-note" data-toggle="modal" data-target="#taskWipNote" onClick={() => { that.wipNote(row.task.job_id,row.task.wid,row.task.task_id) } }><img src={href+'/note.png'} alt="Status" width="15" height="15" /></span></td>
						<td><a href={row.task.gotolink ? row.task.gotolink : 'javascript:void(0)'} target="_blank"><span className="task-icon"><img src={href+'/gotolink.png'} alt="Status" width="15" height="15" /></span></a></td>
						<td><a href={row.link_url ? row.link_url : 'javascript:void(0)'} target="_blank"><span className="task-icon"><img src={href+'/sync.png'} alt="Status" width="15" height="15" /></span></a></td>
						<td>{row.username}</td>
						<td>{row.type}</td>
						<td>{row.branch_id}</td>
						<td>{row.patient_name}</td>
						<td><span id={"view_"+row.id} className="view-workflow-details" onClick={() => { that.workflowDetails(row.id,row.workflow_days_spent) } }><img src={href+'/view-details.png'} alt="View Details" width="15" height="15" /></span></td>
						</tr>
						<tr><td id={"note_row"+row.id} className="note-row" colspan="20"><div className="note-row-div" id={"note_"+row.id}></div></td></tr>
						
					</tbody>);
				}
			})

        }
		
		if(workflowJobTasks){
			let patient_name = workflowJobTasks.patient_name;
			assignedDays = 0;
			rowHtml2 = workflowJobTasks.map(function(row,i) {
				if(row.task_id){
				let icon = 'x';
				if(row.status == 'To Do'){
					icon = 'red';
				}else if(row.status == 'In Progress'){
					icon = 'yellow';
				}else if(row.status == 'Complete'){
					icon = 'green';
				}else if(row.status == 'Pending'){
					icon = 'pending';
				}
				that.handleViewWipNoteByRow(row.job_id,row.wid,row.task_id,row.id);
				assignedDays += parseInt(row.x_days_number);
				
				
				let className = '';
				let days_assigned = parseInt(row.x_days_number);
				let days_spent = parseInt(row.days_spent);
				
				if(days_assigned < days_spent){
					className = 'row-red';
				}
				
				if(days_assigned == days_spent){
					className = 'row-yellow';
				}
				
				return (<tbody>
					<tr>
					<td><span className="task-icon"><img src={href+'/'+icon+'.png'} alt="Status" width="15" height="15" /></span></td>
					<td>{row.task_name}</td>
					<td>{row.role}</td>
					<td>{row.person}</td>
					<td>{row.x_days_number}</td>
					<td className={className}>{row.days_spent}</td>
					<td>
					<span className="task-icon task-note" data-toggle="modal" data-target="#taskNote" onClick={() => { that.detailsNote(row.details_note) } }><i className="fa fa-eye"></i></span>
					</td>
					<td><span className="task-icon task-note" data-toggle="modal" data-target="#taskWipNote" onClick={() => { that.wipNote(row.job_id,row.wid,row.task_id) } }><img src={href+'/note.png'} alt="Status" width="15" height="15" /></span></td>
					<td><a href={row.gotolink ? row.gotolink : 'javascript:void(0)'} target="_blank"><span className="task-icon"><img src={href+'/gotolink.png'} alt="Status" width="15" height="15" /></span></a></td>
					</tr>
					<tr><td id={"note_row"+row.id} className="note-row" colspan="20"><div className="note-row-div" id={"new_note_"+row.id}></div></td></tr>
				</tbody>);
				}
			})
        }
		
		if(workflowSuperJobs){
			let tasksRow = ''
			rowHtml3 = workflowSuperJobs.map(function(row,i) {
				if(row.WF_Job_ID){
					
					let workflowSuperJobTask = row.Tasks;
					let dueDate = moment(row.Due_Date).format('MM/DD/YYYY');
					
					let n = 0;
					let allComlete = 1;
					let count = workflowSuperJobTask.length;
					let greaterCount = that.state.greaterCount;
					
					let colspan = greaterCount - count;
					tasksRow = workflowSuperJobTask.map(function(row1,i) {
						
						if(row1.Status != 'Complete' && n==0){
							dueDate = moment(row1.Due_Date).format('MM/DD/YYYY');
							n=1;
						}
						
						if(row1.Status != 'Complete'){
							allComlete = 0;
						}
						
						let icon = 'x';
						if(row1.Status == 'To Do'){
							icon = 'red';
						}else if(row1.Status == 'In Progress'){
							icon = 'yellow';
						}else if(row1.Status == 'Complete'){
							icon = 'green';
						}else if(row1.Status == 'Pending'){
							icon = 'pending';
						}
						return (<td><a target="_blank" href={row1.gotolink ? row1.gotolink : 'javascript:void(0)'}><span className="task-icon"><img src={href+'/'+icon+'.png'} alt="Status" width="15" height="15" /></span></a></td>);
					})
					
					tasksHeader = workflowSuperJobTask.map(function(row2,n) {
						return (<th style={{padding: '0px !important'}} className="task-header-th"><div className="task-header-span">{row2.Task_name.substr(0,20)}</div></th>);
					})
					
					if(that.state.startDate){
						let sDate = moment(that.state.startDate).format('MM/DD/YYYY');
						if(dueDate < sDate){
							return false;
						}
					}
					
					if(that.state.endDate){
						let eDate = moment(that.state.endDate).format('MM/DD/YYYY');
						if(dueDate > eDate){
							return false;
						}
					}
					let className = '';
					let alertIcon = 0;
					let days_assigned = parseInt(row.workflow_days_assigned);
					let days_spent = parseInt(row.wokflows_days_spent);
					
					if(days_assigned > days_spent){
						if(allComlete == 1){
							className = 'row-green';
						}else{
							className = '';
						}
					}
					
					if(days_assigned < days_spent){
						
						if(allComlete == 1){
							className = 'row-green';
							alertIcon = 1
						}else{
							
							className = 'row-red';
						}
					}
					
					if(days_assigned == days_spent && allComlete != 1){
						
						className = 'row-yellow';
					}
					
					
					const textTd = [];
					for (let i = 0; i < colspan; i++) {
						textTd.push(<td>&nbsp;</td>);
					}
					
					return (<tr>
						<td>{row.patient_name}</td>
						<td>{row.insurance_company}</td>
						<td>{row.Branch}</td>
						<td>{row.Type}</td>
						<td>{days_assigned}</td>
						<td className={className}>{days_spent} {alertIcon == 1 ? <span>!</span> : ''}</td>
						{tasksRow}
						{textTd}
						<td className="new-super-view" colspan={colspan}><span id={"view_"+row.WF_Job_ID} className="view-workflow-details" onClick={() => { that.workflowDetailsV2(row.WF_Job_ID) } }><img src={href+'/view-details.png'} alt="View Details" width="15" height="15" /></span></td>
					</tr>);
				}
			})
        }
		
		let workflowOption = workflows.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		let categoryOption = wCategories.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		let roleOption = responsibleRole.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		let personOption = responsiblePerson.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		let branchOption = branchs.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		let typeOption = types.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		let companyOption = wInsurance.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		let patientOption = wPatients.map(function(val,i) {
			return (
				<option value={val} key={i}>{val}</option>
			);
		})
		
		if(workflowListTable){
			return (
				<div className="workflow-first-task">
					<div className="wdata-table-div">
						<div className="row">
							<div className="col-md-12 mb-3 text-center">
								<h4>Workflow in Progress</h4>
								<div className="show-all-note">
									<label className="showAllSwitch">
										<input id="showAllNotes" type="checkbox" name="showAllNotes" onClick={()=>this.showAllNotes()} />
										<span className="slider round showAllSlide"></span>
									</label>
									<span><b>Show all Notes</b></span>
								</div>
							</div>
						</div>
						
						<div className="workflow-filters">
							<div className="wp-filter">
							<label>Workflow Name:</label>
							<select className="form-control w-filter" name="filterWorkflow" value={this.state.filterWorkflow} onChange={this.getValue}>
								<option value={''}>Select Workflow</option>
								{workflowOption}
							</select>
							</div>
							<div className="wp-filter">
								<label>Category:</label>
								<select className="form-control w-filter" name="filterCategory" onChange={this.getValue}>
									<option value={''}>Select Category</option>
									{categoryOption}
								</select>
							</div>
							<div className="wp-filter">
								<label>Responsible Role:</label>
								<select className="form-control w-filter" name="filterRole" onChange={this.getValue}>
									<option value={''}>Responsible Role</option>
									{roleOption}
								</select>
							</div>
							
							<div className="wp-filter">
								<label>Responsible Person:</label>
								<select className="form-control w-filter" name="filterPerson" onChange={this.getValue}>
									<option value={''}>Responsible Person</option>
									{personOption}
								</select>
							</div>
							
							<div className="wp-filter">
								<label>Status:</label>
								<select className="form-control w-filter" name="filterStatus" onChange={this.getValue}>
									<option value={''}>Select Status</option>
									<option value='Pending'>Pending</option>
									<option value='To Do'>To Do</option>
									<option value='In Progress'>In Progress</option>
									<option value='N/A'>N/A</option>
								</select>
							</div>
							
							<div className="wp-filter">
								<label>Branch:</label>
								<select className="form-control w-filter" name="filterBranch" onChange={this.getValue}>
									<option value={''}>Select Branch</option>
									{branchOption}
								</select>
							</div>
							
							<div className="wp-filter">
								<label>Type:</label>
								<select className="form-control w-filter" name="filterType" onChange={this.getValue}>
									<option value={''}>Select Type</option>
									{typeOption}
								</select>
							</div>
							
							<div className="wp-filter">
								<label>Insurance Company:</label>
								<select className="form-control w-filter" name="filterCompany" onChange={this.getValue}>
									<option value={''}>Select Company</option>
									{companyOption}
								</select>
							</div>
							
							<div className="wp-filter">
								<label>Patient ID:</label>
								<select className="form-control w-filter" name="filterPatient" onChange={this.getValue}>
									<option value={''}>Select Patient ID</option>
									{patientOption}
								</select>
							</div>
							
							<div className="startenddate">
								<label>Due Date Start & End:</label>
								<DatePicker selected={this.state.startDate} onChange={this.handleChangeStart}/><DatePicker selected={this.state.endDate} onChange={this.handleChangeEnd}/>
							</div>
							
							<div className="wp-filter-reset">
								<button onClick={()=>this.resetFilter()} className="btn btn-danger" type="button">Reset</button>
							</div>
							{superViewIcon ?
								<div className="super-view" onClick={()=>this.superView(superViewId)}><span><img src={href+'/view-details.png'} alt="View Details" width="30" height="30" /></span></div>
							:null}
						</div>
						
						<table className="table table-bordered tracker-table">
						<thead>
						<tr><th>Task</th>
							<th>Workflow Name</th>
							<th>Category</th>
							<th>Responsible Role</th>
							<th>Responsible Person</th>
							<th>Due Date</th>
							<th>Status</th>
							<th>Assigned Days</th>
							<th>Actual days</th>
							<th>Status Icon</th>
							<th>Checklist</th>
							<th>Details Icon</th>
							<th>Note Icon</th>
							<th>Go-to Icon</th>
							<th>Link</th>
							<th>Initated by</th>
							<th>Type</th>
							<th>Branch</th>
							<th>Patient Name</th>
							<th>View Details</th>
						</tr>
						</thead>
						{rowHtml}
						</table>
						
						<div className="modal" id={"taskNote"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal mds-description-modal">
								<div className="modal-content">
								  <div className="modal-header">
									<h5 className="modal-title">Details Note</h5>
									<button type="button" className="close" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
								  {this.state.taskNote}
								  </div>
								  <div className="modal-footer">
										<div className="popup-btn-com">
											<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
										</div>
								  </div>
								</div>
							</div>
						</div>
						
						<div className="modal" id={"checkListPopup"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal mds-description-modal">
								<div className="modal-content">
								  <div className="modal-header">
									<h5 className="modal-title">Task Checklist</h5>
									<button type="button" className="close" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
									
									{checklist.map((val, index) => {
										let listtext = val.split(':');
										
										let checked = '';
										if(listtext[1] == 'true'){
											checked = 'checked';
										}
										
										return(
											<div className={'task-list-option'}>
												<input name={listtext[0]} type="checkbox" value={listtext[0]} onClick={()=>this.handalChecklistOption(listtext[0])} checked={checked} /> {listtext[0]}
											</div>
										);
									})}
								  </div>
								  <div className="modal-footer">
										<div className="popup-btn-com">
											<button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.saveChecklistOption}>Save</button>&nbsp;
											<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
										</div>
								  </div>
								</div>
							</div>
						</div>
						
						<div className="modal" id={"taskWipNote"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal mds-description-modal">
								<div className="modal-content">
								  <div className="modal-header">
									<h5 className="modal-title">WIP Note</h5>
									<button type="button" className="close" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
									<div className="add-wip-note2">
										<input className="form-control input-wip-note" name="addWipNote" value={this.state.addWipNote} onChange={this.getValue} />
										<button type="button" className="btn btn-info btn-wip-note" onClick={this.handleWipNote}>Add</button>
									</div>
									<div id="wipNote" className="wip-Note-box"></div>
								  </div>
								  <div className="modal-footer">
										<div className="popup-btn-com">
											<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
										</div>
								  </div>
								</div>
							</div>
						</div>
									
					</div>
				</div>
			);
		
		}
		
		if(viewWorkflowDetails){
			return (
				<div className="workflow-first-task">
					<div className="wdata-table-div">
						<div className="row">
							<div className="col-md-12 mb-3 text-center">
								<h4>Active Workflow Details</h4>
								{ this.state.superViewV2 ? 
								<span className="back-to-view" onClick={this.handleBackViewV2}>Back to Super View</span>
								:
								<span className="back-to-view" onClick={this.handleBackView}>Back to Main View</span>
								}
								<div className="show-all-note">
									<label className="showAllSwitch">
										<input id="showAllNotes" type="checkbox" name="showAllNotes" onClick={()=>this.showAllNotes()} />
										<span className="slider round showAllSlide"></span>
									</label>
									<span><b>Show all Notes</b></span>
								</div>
							</div>
						</div>
						<div className="job-header-section">
							<span><b>Patient Name:</b> {workflowJob.patient_name}</span>
							<span><b>Patient ID:</b> {workflowJob.patient_id}</span>
							<span><b>Branch:</b> {workflowJob.branch_id}</span>
							<span><b>Insurance Company:</b> {workflowJob.insurance_company}</span>
							
							<span className="pull-right">Total Days Since Job was initiated : <b>{this.state.workflowDaysSpent}</b></span>
							<span className="pull-right">Total Days assigned : <b>{assignedDays}</b></span>
						</div>
						<table className="table table-bordered tracker-table">
						<tr><th>Status Icon</th>
							<th>Task Name</th>
							<th>Responsible Role</th>
							<th>Responsible Person</th>
							<th>Assigned Days</th>
							<th>Actual days</th>
							<th></th>
							<th></th>
							<th></th>
						</tr>
						{rowHtml2}
						</table>

						<div className="modal" id={"taskNote"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal mds-description-modal">
								<div className="modal-content">
								  <div className="modal-header">
									<h5 className="modal-title">Details Note</h5>
									<button type="button" className="close" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
								  {this.state.taskNote}
								  </div>
								  <div className="modal-footer">
										<div className="popup-btn-com">
											<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
										</div>
								  </div>
								</div>
							</div>
						</div>
						
						<div className="modal" id={"taskWipNote"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal mds-description-modal">
								<div className="modal-content">
								  <div className="modal-header">
									<h5 className="modal-title">WIP Note</h5>
									<button type="button" className="close" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
									<div className="add-wip-note2">
										<input className="form-control input-wip-note" name="addWipNote" value={this.state.addWipNote} onChange={this.getValue} />
										<button type="button" className="btn btn-info btn-wip-note" onClick={this.handleWipNote}>Add</button>
									</div>
									<div id="wipNote" className="wip-Note-box"></div>
								  </div>
								  <div className="modal-footer">
										<div className="popup-btn-com">
											<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
										</div>
								  </div>
								</div>
							</div>
						</div>						
					</div>
				</div>
			);
		
		}
		
		if(superViewShow && workflowSuperJobs){
			return (
				<div className="workflow-super-view">
					<div className="wdata-table-div">
						<div className="row">
							<div className="col-md-12 mb-3">
								<h4>Super Grid : {filterWorkflow}</h4>
								<span className="back-to-view" onClick={this.handleBackView}>Back to Main View</span>
							</div>
						</div>
						
						<table className="table table-bordered workflow-super-table">
						<tr>
						<th className="super-table-th">Patient Name</th>
						<th className="super-table-th">Insurance Company</th>
						<th className="super-table-th">Branch</th>
						<th className="super-table-th">Type</th>
						<th>Assigned Days</th>
						<th>Actual days</th>
						{tasksHeader}
						<th className="new-super-view">View Details</th>
						</tr>
						{rowHtml3}
						</table>
						
					</div>
				</div>
			);
		
		}
	}	
}
