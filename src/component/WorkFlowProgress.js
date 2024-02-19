import React, { Component } from 'react';
import $ from 'jquery';
import axios,{post,get} from 'axios';
import moment from 'moment';
import { ulid } from 'ulid'
import arrayMove from "./arrayMove";
import { CSVLink } from "react-csv";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { copyImageToClipboard } from 'copy-image-clipboard';
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
			taskDetails:[],
			taskName:'',
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
			listPercentage:0,
			copyQrCode:'',
			uniqueQrCode:'',
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
		let date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
		let currentDate = moment(date).format('MM-DD-YYYY');
		
		let startDate = moment(ids[1]).format('MM/DD/YYYY');
		
		if(val == 'Complete'){
			let startDay = new Date(startDate);  
			let endDay = new Date(date);
			let millisBetween = startDay.getTime() - endDay.getTime();  
			days = millisBetween / (1000 * 3600 * 24);
		}
		
		let currentDate2 = moment(date).format('YYYY-MM-DD HH:MM');
		

		let formData = new FormData();
		formData.append('Id', ids[0]);
		formData.append('option', val);
		formData.append('date', currentDate);
		formData.append('days', days);
		formData.append('user', localStorage.getItem('username'));
		formData.append('updated_at', currentDate2);
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
		let date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
		let currentDate = moment(date).format('YYYY-MM-DD HH:MM');
		let formData = new FormData();
		formData.append('Id', id);
		formData.append('person_id', name[1]);
		formData.append('person', name[0]);
		formData.append('person_email', name[2]);
		formData.append('user', localStorage.getItem('username'));
		formData.append('updated_at', currentDate);
		
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
	
	taskDetails=(data)=>{
		this.setState({taskDetails:data});
	}
	
	taskChecklist=(id,task_uid,task_name,job_id,wid,taskId,checklist,status_change,task_start_date)=>{
		let checklists = checklist.split(',');
		if(checklists.length > 0){
			let checkedCount = 0;
			
			checklists.map((val, index) => {
				let listtext = val.split(':');
				
				if(listtext[1] == 'true'){
					checkedCount= checkedCount+1;
				}
				
			})
			
			let listPercentage = checkedCount/checklists.length*100;
			
			this.setState({tId:id,taskUid:task_uid,taskName:task_name,checklist:checklists ? checklists : [],noteJobId:job_id,checklistWid:wid,checklistTaskId:taskId,checkedCount,listPercentage,status_change,task_start_date});
		}
	}
	
	wipNote=(job_id,task_uid,wid,task_id)=>{
		this.getWipNote(task_uid);
		//this.setState({taskWipNote:note});
		this.setState({noteJobId:job_id,taskUid:task_uid,noteWId:wid,noteTaskId:task_id});
	}
	
	handleWipNote=()=>{
		
		let noteJobId = this.state.noteJobId;
		let taskUid = this.state.taskUid;
		let noteTaskId = this.state.noteTaskId;
		let addWipNote = this.state.addWipNote;
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'add-task-note';
		//let date = new Date();
		//let currentDate = moment(date).format('MM/DD/YYYY HH:MM');
		let formData = new FormData();
		formData.append('task_uid', taskUid);
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
			this.getWipNote(taskUid);
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
	
	getWipNote=(task_uid) => {
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'task-note';
		let data = [];
		let formData = new FormData();
		formData.append('task_uid', task_uid);
		//formData.append('wid', wid);
		//formData.append('task_id', task_id);
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
		let tId = this.state.tId;
		let task_start_date = this.state.task_start_date;
		let checklist = this.state.checklist.join();
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-workflow-task-checklist';
		let date = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
		let currentDate = moment(date).format('YYYY-MM-DD HH:MM');
		let formData = new FormData();
		formData.append('tId', tId);
		formData.append('checklist', checklist);
		formData.append('updated_at', currentDate);
		axios({
			method: 'POST',
			url: url,
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		.then(response => {
			let checkedCount = this.state.checkedCount;
			let status_change = this.state.status_change;
			if(checkedCount == this.state.checklist.length && status_change == 'true'){
				this.updateTaskToComplete(tId,task_start_date);
			}
			this.getWorkflow();
			this.getWorkflowJobDetails(this.state.noteJobId);
		}).catch(error => {
			alert('error::'+ error);
		})
	}
	
	updateTaskToComplete=(tId,task_start_date)=>{
		let val = 'Complete';
		let days = 0;
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-option-v2';
		let date = new Date();
		let currentDate = moment(date).format('MM-DD-YYYY');
		
		let startDate = moment(task_start_date).format('YYYY-MM-DD');
		
		if(val == 'Complete'){
			let startDay = new Date(startDate);  
			let endDay = new Date(date);
			let millisBetween = startDay.getTime() - endDay.getTime();  
			days = millisBetween / (1000 * 3600 * 24);
		}
		let currentDate2 = moment(date).format('YYYY-MM-DD HH:MM');
		
		
		let formData = new FormData();
		formData.append('Id', tId);
		formData.append('option', val);
		formData.append('date', currentDate);
		formData.append('days', days);
		formData.append('user', localStorage.getItem('username'));
		formData.append('updated_at', currentDate2);
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
		let updateChecklist = [];
		let that = this;
		if($("input[name='"+name+"']").prop("checked") == true){
			
			if(checklist.length > 0){
				checklist.map(function(val,i) {
					let str = val.split(':');
					if(str[0] == name){
						updateChecklist.push(str[0]+':'+'true');
						let note = 'Checklist item completed: '+name+' - by '+localStorage.getItem('username');
						that.handleChecklistNote(note);
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
						that.handleChecklistNote(note);
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
		let taskUid = this.state.taskUid;
		let wId = this.state.checklistWid;
		let taskId = this.state.checklistTaskId;
		//let note = name+' - Completed by '+localStorage.getItem('username');
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'add-task-note';
		//let date = new Date();
		//let currentDate = moment(date).format('MM/DD/YYYY HH:MM');
		let formData = new FormData();
		formData.append('task_uid', taskUid);
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
			this.getWipNote(taskUid);
		}).catch(error => {
			alert('error::'+ error);
		})
	}
	
	getQrCode=(task_uid,wname,tname)=>{
		console.log('task_uid->',task_uid);
		let qrCode = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+task_uid;
		this.setState({uniqueQrCode:qrCode,copyQrCode:task_uid,workflowName:wname,taskName:tname});
	}
	
	copyQrImage=(img)=>{
		let path = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+img;
		copyImageToClipboard(path).then(() => {
		  console.log('Image Copied');
		}).catch((e) => {
		  console.log('Error: ', e.message);
		})
	}
	
	saveQrImage=(img,fileName)=>{
		let url = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+img;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.responseType = "blob";
		xhr.onload = function(){
			var urlCreator = window.URL || window.webkitURL;
			var imageUrl = urlCreator.createObjectURL(this.response);
			var tag = document.createElement('a');
			tag.href = imageUrl;
			tag.download = fileName+'.png';
			document.body.appendChild(tag);
			tag.click();
			document.body.removeChild(tag);
		}
		xhr.send();
	}
	
	printQrImage=()=>{
		let w = window.open();
		let html = $("#qr-code-img").html();
		$(w.document.body).html(html);
		setTimeout(function(){w.print()}, 1000);
	}
	
	render() {
		const {workflowFirstTask,workflows,wCategories,filterWorkflow,filterCategory,filterRole,filterPerson,filterStatus,filterBranch,filterType,filterCompany,filterPatient,responsibleRole,responsiblePerson,branchs,types,wInsurance,wPatients,viewWorkflowDetails,workflowListTable,workflowJob,workflowJobTasks,superViewIcon,superViewShow,workflowSuperJobs,rolePerson,updateChecklist,checklist,taskDetails} = this.state;
		console.log('taskDetails->',taskDetails);
		let rowHtml = '';
		let rowHtml2 = '';
		let rowHtml3 = '';
		let tasksHeader = '';
		let href = window.location.href.split('?')[0];
		let that = this;
		let superViewId = '';
		let assignedDays = '';
		
		if(workflowFirstTask && !viewWorkflowDetails){
			
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
					
					let notes = row.task.notes;
					
					let noteHtml = '';
					if(notes){
						noteHtml = notes.map(function(val,i) {
							return (
								<div className="note-row-div" id={"note_"+row.id}>{val}</div>
							);
							
						})
					}
					
					//that.handleWipNoteByRow(row.task.job_id,row.task.wid,row.task.task_id,row.id);
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
						<td>{moment(row.task.updated_at).format('MM/DD/YYYY')}</td>
						<td>{row.task.x_days_number}</td>
						<td className={className}>{row.task.days_spent}</td>
						<td><span className="task-icon"><img src={href+'/'+icon+'.png'} alt="Status" width="15" height="15" /></span></td>
						
						<td><span className="task-icon task-note" data-toggle="modal" data-target="#checkListPopup" onClick={() => { that.taskChecklist(row.task.id,row.task.task_uid,row.task.name,row.task.job_id,row.task.wid,row.task.task_id,row.task.checklist,row.task.status_change,row.task.task_start_date) } }>{checklistChecked}</span></td>
						<td>
						<span className="task-icon task-info" data-toggle="modal" data-target="#taskDetails" onClick={() => { that.taskDetails(row) } }><i className="fa fa-info-circle"></i></span>
						</td>
						<td>
						<span className="task-icon task-note" data-toggle="modal" data-target="#taskNote" onClick={() => { that.detailsNote(row.task.details_note) } }><i className="fa fa-eye"></i></span>
						</td>
						<td><button onClick={() => { that.getQrCode(row.task.task_uid,row.name,row.task.name) } } data-toggle="modal" data-target="#qrCodePopup" className="btn qr-code-btn" type="button"><i className="fa fa-qrcode" aria-hidden="true"></i></button></td>
						<td><span className="task-icon task-note" data-toggle="modal" data-target="#taskWipNote" onClick={() => { that.wipNote(row.task.job_id,row.task.task_uid,row.task.wid,row.task.task_id) } }><img src={href+'/note.png'} alt="Status" width="15" height="15" /></span></td>
						<td><a href={row.task.gotolink ? row.task.gotolink : 'javascript:void(0)'} target="_blank"><span className="task-icon"><img src={href+'/gotolink.png'} alt="Status" width="15" height="15" /></span></a></td>
						<td><a href={row.link_url ? row.link_url : 'javascript:void(0)'} target="_blank"><span className="task-icon"><img src={href+'/sync.png'} alt="Status" width="15" height="15" /></span></a></td>
						<td>{row.username}</td>
						<td>{row.type}</td>
						<td>{row.branch_id}</td>
						<td>{row.patient_first_name}</td>
						<td><span id={"view_"+row.id} className="view-workflow-details" onClick={() => { that.workflowDetails(row.id,row.workflow_days_spent) } }><img src={href+'/view-details.png'} alt="View Details" width="15" height="15" /></span></td>
						</tr>
						<tr><td id={"note_row"+row.id} className="note-row" colspan="20">{noteHtml}</td></tr>
						
					</tbody>);
				}
			})

        }
		
		if(workflowJobTasks){
			let patient_first_name = workflowJobTasks.patient_first_name;
			assignedDays = 0;
			rowHtml2 = workflowJobTasks.map(function(row,i) {
				//console.log('row',row);
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
				//that.handleViewWipNoteByRow(row.job_id,row.wid,row.task_id,row.id);
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
				
				let checklist = row.checklist ? row.checklist.split(',') : [];
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
				
				let notes = row.notes;
					
				let noteHtml = '';
				if(notes){
					noteHtml = notes.map(function(val,i) {
						return (
							<div className="note-row-div" id={"new_note_"+row.id}>{val}</div>
						);
						
					})
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
					
					<td><span className="task-icon task-note" data-toggle="modal" data-target="#checkListPopup2" onClick={() => { that.taskChecklist(row.id,row.task_uid,row.task_name,row.job_id,row.wid,row.task_id,row.checklist,row.status_change,row.task_start_date) } }>{checklistChecked}</span></td>
					<td><button onClick={() => { that.getQrCode(row.task_uid,row.workflow_name,row.task_name) } } data-toggle="modal" data-target="#qrCodePopup2" className="btn qr-code-btn" type="button"><i className="fa fa-qrcode" aria-hidden="true"></i></button></td>
					<td><span className="task-icon task-note" data-toggle="modal" data-target="#taskWipNote" onClick={() => { that.wipNote(row.job_id,row.task_uid,row.wid,row.task_id) } }><img src={href+'/note.png'} alt="Status" width="15" height="15" /></span></td>
					<td><a href={row.gotolink ? row.gotolink : 'javascript:void(0)'} target="_blank"><span className="task-icon"><img src={href+'/gotolink.png'} alt="Status" width="15" height="15" /></span></a></td>
					
					</tr>
					<tr><td id={"note_row"+row.id} className="note-row" colspan="20">{noteHtml}</td></tr>
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
						<td>{row.patient_first_name}</td>
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
							<th>Last Activity</th>
							<th>Assigned Days</th>
							<th>Actual days</th>
							<th>Status Icon</th>
							<th>Checklist</th>
							<th>Details</th>
							<th>Note</th>
							<th>QR Code</th>
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
						
						<div className="modal" id={"taskDetails"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal mds-description-modal">
								<div className="modal-content">
								  <div className="modal-header">
									<h5 className="modal-title">Workflow Initiate Details</h5>
									<button type="button" className="close" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
								  {taskDetails ?
								  <table className="table table-bordered task-details-tb">
									  <tr><th>Workflow_ID</th><td>{taskDetails.workflow_id}</td> </tr>
									  <tr><th>Facility_ID</th><td>{taskDetails.facility_id}</td></tr>
									  <tr><th>Patient_Branch_ID</th><td>{taskDetails.patient_branch_id}</td></tr>
									  <tr><th>Branch_Id</th><td>{taskDetails.branch_id}</td></tr>
									  <tr><th>User_Id</th><td>{taskDetails.user_id}</td> </tr>
									  <tr><th>Username</th><td>{taskDetails.username}</td> </tr>
									  <tr><th>TreatingPractitioner_ID</th><td>{taskDetails.treating_practitioner_id}</td> </tr>
									  <tr><th>Patient_ID</th><td>{taskDetails.patient_id}</td> </tr>
									  <tr><th>Patient_FirstName</th><td>{taskDetails.patient_first_name}</td> </tr>
									  <tr><th>Patient_LastName</th><td>{taskDetails.patient_last_name}</td> </tr>
									  <tr><th>Wip_ID</th><td>{taskDetails.wip_id}</td> </tr>
									  <tr><th>Type</th><td>{taskDetails.type}</td> </tr>
									  <tr><th>Insurance_company</th><td>{taskDetails.insurance_company}</td> </tr>
									  <tr><th>Rx_ID</th><td>{taskDetails.rx_id}</td> </tr>
									  <tr><th>Claim_ID</th><td>{taskDetails.claim_id}</td> </tr>
									  <tr><th>Visit_ID</th><td>{taskDetails.visit_id}</td> </tr>
									  <tr><th>InitiatingForm_ID</th><td>{taskDetails.initiating_form_id}</td> </tr>
									  <tr><th>Link_Url</th><td>{taskDetails.link_url}</td> </tr>
								  </table>
								  :null}
								  </div>
								</div>
							</div>
						</div>
						
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
									<h6>{this.state.taskName}</h6>
									<button className="close custom-btn" type="button" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
								  <div className="list-header"><input type="checkbox" checked="checked" disabled /> Checklist</div>

								  <div className="custom-progress-bar"><span>{parseInt(this.state.listPercentage) +'%'}</span><progress id="file" value={this.state.checkedCount} max={checklist.length}></progress></div>
									
									{checklist.map((val, index) => {
										let listtext = val.split(':');
										
										let checked = '';
										let classs = '';
										if(listtext[1] == 'true'){
											checked = 'checked';
											classs = 'checklist-completed';
										}
										
										return(
											<div className={'task-list-option'}>
												<input name={listtext[0]} type="checkbox" value={listtext[0]} onClick={()=>this.handalChecklistOption(listtext[0])} checked={checked} /> <span className={classs}> {listtext[0]}</span>
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
						
						<div className="modal" id={"qrCodePopup"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal qr-code-modal">
								<div className="modal-content qr-code-modal">
									<div className="modal-header">
										<button type="button" className="close" data-dismiss="modal">&times;</button>
									</div>
									<div className="modal-body text-center">
										<div id="qr-code-img"><img src={this.state.uniqueQrCode} alt="QR" width="150" height="150" />
										</div>
										<div className="qr-code-des">
											
											<div className="mr-3"><b>Workflow:</b> {this.state.workflowName}</div>
											<div className="mr-3"><b>Task Name:</b> {this.state.taskName}</div>
											<div className="qr-code-button">
											<button onClick={()=>this.copyQrImage(this.state.copyQrCode)} className="btn copy-code-btn" type="button"><i className="fa fa-copy" aria-hidden="true"></i></button>
											<button onClick={()=>this.saveQrImage(this.state.copyQrCode,this.state.taskName)} className="btn copy-code-btn" type="button"><i className="fa fa-download" aria-hidden="true"></i></button>
											<button onClick={()=>this.printQrImage(this.state.copyQrCode,this.state.taskName)} className="btn copy-code-btn" type="button"><i className="fa fa-print" aria-hidden="true"></i></button>
											</div>
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
							<span><b>Patient Name:</b> {workflowJob.patient_first_name}</span>
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
							<th>View</th>
							<th>Checklist</th>
							<th>QR Code</th>
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
						
						<div className="modal" id={"checkListPopup2"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal mds-description-modal">
								<div className="modal-content">
								  <div className="modal-header">
									<h6>{this.state.taskName}</h6>
									<button className="close custom-btn" type="button" data-dismiss="modal">&times;</button>
								  </div>
								  <div className="modal-body">
								  <div className="list-header"><input type="checkbox" checked="checked" disabled /> Checklist</div>

								  <div className="custom-progress-bar"><span>{parseInt(this.state.listPercentage) +'%'}</span><progress id="file" value={this.state.checkedCount} max={checklist.length}></progress></div>
									
									{checklist.map((val, index) => {
										let listtext = val.split(':');
										
										let checked = '';
										let classs = '';
										if(listtext[1] == 'true'){
											checked = 'checked';
											classs = 'checklist-completed';
										}
										
										return(
											<div className={'task-list-option'}>
												<input name={listtext[0]} type="checkbox" value={listtext[0]} onClick={()=>this.handalChecklistOption(listtext[0])} checked={checked} /><span className={classs} > {listtext[0]}</span>
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
							
						<div className="modal" id={"qrCodePopup2"} role="dialog">
							<div className="modal-dialog modal-lg custom-modal qr-code-modal">
								<div className="modal-content qr-code-modal">
									<div className="modal-header">
										<button type="button" className="close" data-dismiss="modal">&times;</button>
									</div>
									<div className="modal-body text-center">
									<div id="qr-code-img"><img src={this.state.uniqueQrCode} alt="QR" width="150" height="150" /></div>
										<div className="qr-code-des">
											
											<div className="mr-3"><b>Workflow:</b> {this.state.workflowName}</div>
											<div className="mr-3"><b>Task Name:</b> {this.state.taskName}</div>
											<div className="qr-code-button">
											<button onClick={()=>this.copyQrImage(this.state.copyQrCode)} className="btn copy-code-btn" type="button"><i className="fa fa-copy" aria-hidden="true"></i></button>
											<button onClick={()=>this.saveQrImage(this.state.copyQrCode,this.state.taskName)} className="btn copy-code-btn" type="button"><i className="fa fa-download" aria-hidden="true"></i></button>
											<button onClick={()=>this.printQrImage(this.state.copyQrCode,this.state.taskName)} className="btn copy-code-btn" type="button"><i className="fa fa-print" aria-hidden="true"></i></button>
											</div>
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
