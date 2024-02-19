import React, { Component } from 'react';
import $ from 'jquery';
import axios,{post,get} from 'axios';
import moment from 'moment';
import { ulid } from 'ulid'
import arrayMove from "./arrayMove";
import { CSVLink } from "react-csv";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker, DatePicker, LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { copyImageToClipboard } from 'copy-image-clipboard';

export default class WorkFlowDetails extends Component {
	
	constructor(props){
        super(props)
		this.state ={
			workflowList:[],
			taskList:[],
			tasks:[],
			csvdata:[],
			file:'',
			personRole:'',
			personId:'',
			personName:'',
			personEmail:'',
			responsibleRole:[],
			responsiblePerson:[],
			persons:[],
			rolePerson:[],
			taskId:'',
			taskName:'',
			taskStatus:'',
			startDate:'',
			xDays:'',
			completedBefore:'',
			doNotShare:'N',
			gotolink:'',
			checklist:[],
			sendMessage:'',
			synchronize:'',
			detailsNote:'',
			//wipNote:'',
			taskNote:'',
			taskWipNote:'',
			dueDate:'',
			workflowTasks:new Map(),
			wflowTasks:[],
			goLinks:[],
			categories:[],
			wipTableNote:'',
			workflowName:'',
			workflowId:'',
			catId:'',
			taskGuid:'',
			uniqueQrCode:'',
			uniqueGuid:'',
			daysCount:0,
			status_change:'false',
		}
		
		this.csvLink = React.createRef();
		this.handleChange = this.handleChange.bind(this);
    }
	
	componentDidMount() {
		this.loadScript();
		this.getWorkflow();
		this.getTaskMasterUsers();
		this.getGotoLink();
		this.getCategories();
	}
	
	handleChange = date => {
        let newDate = (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
        this.setState({
          startDate: date,date
        });
		this.setState({dueDate:newDate});
    };
	
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
			$('#wrapper2').toggleClass('toggled-3');
		});
		
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
	
	/* getTaskMasterUsers=() => {
		
		let user = localStorage.getItem('username');
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'workflow/get_users.php';
		let data = [];
		let con = {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'content-type': 'multipart/form-data'
			}
		}
        axios.get(url,con)
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
    } */
	
	/* getTaskMasterUsers=() => {
		let user = localStorage.getItem('username');
		let spreadsheetId = config.lookUpSpreadsheetId;
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: spreadsheetId,
			range:'Task Master Logins', 
		})
		.then(
			response => {
				const UsersData = response.result.values;
				let responsibleRole = [];
				UsersData[0].map(function(role,i) {
					if(i > 3){
						responsibleRole.push(role);
					}
				})
				
				let userData = [];
				let newArry2 = [];
				//console.log('UsersData->',UsersData)
				UsersData.map(function(data,n) {
					if(n > 0){
						if(user == data[0]){
							userData = data;
						}else if(n == 1){
							userData = data;
						}
					}
				})
				
				let rolePerson = [];
				responsibleRole.map(function(val,i) {
					let n = i+4;
					rolePerson[val]=userData[n];
				})
				//console.log('responsibleRole->',responsibleRole)
				
				this.setState({userData,responsibleRole,rolePerson});
			},
		);
    } */
	
	getGotoLink=() => {
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'gotolink';
		let data = [];
		axios.get(url)
        .then(response => {
			data = response.data;
			this.setState({goLinks:data});
		}).catch(error => {
			alert('error::'+ error);
		})
    }
	
	getWorkflow=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let that = this;
		let url = ApiUrl+'workflows';
		let data = [];
		axios.get(url)
        .then(response => {
            data = response.data;
			this.setState({workflowList:data});
			if(!this.state.workflowName){
				this.setState({workflowId:data[0]['id'],workflowName:data[0]['name']});
			}
			setTimeout(function(){
				that.getTaskList();
			}, 1000);
        })
	}
	
	getTaskList=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let id = $('#workflowOptionVal').val();
		
		let url = ApiUrl+'details-workflow-tasks/'+id;
		let data = [];
		
        axios.get(url)
        .then(response => {
            data = response.data;
			let daysCount=0;
			data.map((row,i) => {
				if(row.x_days_number){
					daysCount = parseInt(daysCount)+parseInt(row.x_days_number);
				}
			})
			this.setState({taskList:data,daysCount:daysCount});
        })
	}
	
	getCategories=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let that = this;
		let url = ApiUrl+'workflow-categories';
		let data = [];
        axios.get(url)
        .then(response => {
            data = response.data;
			this.setState({categories:data});
        })
	}
	
	uniqueArray(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++)
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
				a.push(arr[i]);
		return a;
	}
	
	changeCategory=(event)=>{
		let name = event.target.selectedOptions[0].text;
		let val = event.target.value;
		this.getTaskList();
		this.setState({workflowId:val,workflowName:name});
	}
	
	filterCategory=(event)=>{
		let catId = event.target.value;
		this.setState({catId});
		let that = this;
		setTimeout(function(){
			that.getTaskList();
		}, 1000);
	}

	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;
		//console.log('res->',res);
		this.setState({[event.target.name]:event.target.value});
		
		if($("input[name='status_change']").prop("checked") == true){
			this.setState({status_change:'true'});
		}else if($("input[name='status_change']").prop("checked") == false){
			this.setState({status_change:'false'});
		}
		
		if($("input[name='xDays']").prop("checked") == false){
			this.setState({xDays:'N'});
		}
		
		if($("input[name='completedBefore']").prop("checked") == false){
			this.setState({completedBefore:'N'});
		}
		
		if($("input[name='doNotShare']").prop("checked") == false){
			this.setState({doNotShare:'Y'});
		}
		
		if($("input[name='sendMessage']").prop("checked") == false){
			this.setState({sendMessage:'N'});
		}
		
		if($("input[name='synchronize']").prop("checked") == false){
			this.setState({synchronize:'N'});
		}
		
		if(name == 'personRole'){
			let rolePerson = this.state.rolePerson;
			rolePerson = rolePerson[res].split(',');
			let personNames = [];
			rolePerson.map((val, i) => {
				//let name = val.split('|');
				//personName.push(name[0]);
				personNames.push(val);
			})
			this.setState({persons:rolePerson,responsiblePerson:personNames});
		}
		
		if(name == 'personName'){
			let index = event.target.selectedIndex;
			let el = event.target.childNodes[index]
			let opt =  el.getAttribute('data-id');
			
			if(opt){
				let person = opt.split('|');
				this.setState({personId:person[1],personName:person[0],personEmail:person[2]});
			}
		}
		
		if(name == 'xDaysNumber'){
			if(res > 90 || res < 0){
				alert('The value must be less than or equal to 90');
				this.setState({xDaysNumber:''});
			}
		}
		
	}

	editTask=(data)=>{
		//this.getWipNote();
		$("#wrapper2").addClass('toggled-3');
		$(".fadeInRight").addClass('is-open');
		$(".fadeInRight").removeClass('is-closed');
		let taskId = data.id;
		$('.add-checklist').hide();
		
		let personRole = data.role != null ? data.role : '';
		//console.log('data->',data);
		if(personRole){
			let rolePerson = this.state.rolePerson;
			rolePerson = rolePerson[personRole].split(',');
			let personNames = [];
			rolePerson.map((val, i) => {
				//let name = val.split('|');
				//personNames.push(name[0]);
				personNames.push(val);
				//personId.push(name[1]);
				//personEmail.push(name[2]);
			})
			this.setState({persons:rolePerson,responsiblePerson:personNames});
		}else{
			this.setState({persons:[],responsiblePerson:[]});
		}
		
		let taskName = data.name != null ? data.name : '';
		let personName = data.person != null ? data.person : '';
		let personId = data.person_id != null ? data.person_id : '';
		let personEmail = data.person_email != null ? data.person_email : '';
		let startDate = data.due_date != null ? data.due_date : '';
		let xDays = data.x_days;
		let xDaysNumber = data.x_days_number != null ? data.x_days_number : '';
		let completedBefore = data.completed_before;
		let doNotShare = data.share;
		let gotolink = data.gotolink;
		let sendMessage = data.send_message;
		let status_change = data.status_change;
		let checklist = data.checklist ? data.checklist.split(',') : [];
		let synchronize = data.synchronize;
		let taskGuid = data.uid;
		let uniqueGuid = data.unique_guid;
		let detailsNote = data.details_note != null ? data.details_note : '';
		//let wipNote = data.wip_note != null ? data.wip_note : '';
		//let workflowOption = data.task_option;
		
		$('.MuiOutlinedInput-input').val('');
		
		//console.log('data',data);
		let currentDate = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
		let cFormUID = data.form_id;
		this.setState({taskName,taskId,personRole,personName,personId,personEmail,startDate,dueDate:null,xDays,xDaysNumber,completedBefore,doNotShare,gotolink,sendMessage,synchronize,checklist,detailsNote,taskNote:'',taskWipNote:'',status_change,taskGuid,uniqueGuid});
	}
	
	updateWorkflowTask=()=>{
		
		let taskId = this.state.taskId;
		//console.log('taskId',taskId);
		let personRole = this.state.personRole;
		let personId = this.state.personId;
		let personName = this.state.personName;
		let personEmail = this.state.personEmail;
		let startDate = this.state.startDate;
		let xDays = this.state.xDays;
		let xDaysNumber = this.state.xDaysNumber;
		let completedBefore = this.state.completedBefore;
		let doNotShare = this.state.doNotShare;
		let gotolink = this.state.gotolink;
		let sendMessage = this.state.sendMessage;
		let synchronize = this.state.synchronize;
		let detailsNote = this.state.detailsNote;
		let checklist = this.state.checklist.join();
		let status_change = this.state.status_change;
		//let wipNote = this.state.wipNote;
		//let workflowOption = this.state.workflowOption;
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'update-workflow-tasks-v2';
		
		let formData = new FormData();
		formData.append('taskId', taskId);
		formData.append('personRole', personRole);
		formData.append('personId', personId);
		formData.append('personName', personName);
		formData.append('personEmail', personEmail);
		formData.append('startDate', startDate);
		formData.append('xDays', xDays);
		formData.append('xDaysNumber', xDaysNumber);
		formData.append('completedBefore', completedBefore);
		formData.append('sendMessage', sendMessage);
		formData.append('synchronize', synchronize);
		formData.append('detailsNote', detailsNote);
		//formData.append('wipNote', wipNote);
		formData.append('doNotShare', doNotShare);
		formData.append('gotolink', gotolink);
		formData.append('checklist', checklist);
		formData.append('status_change', status_change);
		
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
			this.getTaskList();
		}).catch(error => {
			alert('error::'+ error);
		})
		
	}
	
	updateTaskOption=(event)=>{
		let id = event.target.id;
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
			this.getTaskList();
		}).catch(error => {
			alert('error::'+ error);
		})
		
	}
	
	detailsNote=(note)=>{
		this.setState({taskNote:note});
	}
	
	showCheckList=(op)=>{
		if(op == true){
			$('.add-checklist').show();
		}else{
			$('.add-checklist').hide();
		}
	}
	
	handleCheckList=()=>{
		let checklist = this.state.checklist;
		//console.log('checkListOption->',this.state.checkListOption);
		let checkListOption = this.state.checkListOption+':false';
		checklist.push(checkListOption);
		this.setState({checklist,checkListOption:''});
	}
	
	editWorkflow=()=>{
		
		let workflowId = $('#workflowOptionVal').val();
		let workflowName = this.state.workflowName;
		
		if(workflowId && workflowName){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'update-workflow-name/'+workflowId;
			let formData = new FormData();
			formData.append('name', workflowName);
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
	}
	
	deleteCheckList=()=>{
		this.setState({checklist:[]});
	}
	
	deleteCheckListItem=(item)=>{
		let checklist = this.state.checklist;
		let updateChecklist = [];
		if(checklist.length > 0){
			checklist.map(function(val,i) {
				let str = val.split(':');
				if(str[0] != item){
					updateChecklist.push(val);
				}
			})
			this.setState({checklist:updateChecklist});
		}
	}
	
	getQrCode=()=>{
		let qrCode = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+this.state.uniqueGuid;
		this.setState({uniqueQrCode:qrCode,copyQrCode:this.state.uniqueGuid});
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
		
		const {workflowList,taskList,workflowTasks,wflowTasks,responsibleRole,responsiblePerson,goLinks,categories,catId,checklist} = this.state;
		
		let categoriesHtml = categories.map(function(val,i) {
			return (
				<option value={val.id} key={i}>{val.name}</option>
			);
		})
		
		let role = localStorage.getItem('role');
		let userId = localStorage.getItem('user_id');
		let workflowOption = workflowList.map(function(val,i) {
			if(catId && catId != val.category){
				return false;
			}
			if(role == 'OA' && val.user_id == userId){
				return (
					<option value={val['id']} key={i}>{val['name']}</option>
				);
			}else if(role != 'OA'){
				return (
					<option value={val['id']} key={i}>{val['name']}</option>
				);
			}
		})
		let thats = this;
		let checklistHtml = checklist.map(function(val,i) {
			let listtext = val.split(':');
			
			return (
				<label className="label-list">
				<input name="demo" type="checkbox" value={listtext[0]} disabled/> {listtext[0]}
				<span className="delete-checklist-item" onClick={() => {if (window.confirm('Are you sure you want to Delete this checklist item?')) thats.deleteCheckListItem(listtext[0])}} ><i className="fa fa-trash"></i></span>
				</label>						
			);
		})
		
		let goLinksHtml = goLinks.map(function(val,i) {
			return (
				<option key={i} value={val.url}>{val.name}</option>
			);
		})
		
		let personOption = responsiblePerson.map(function(val,i) {
			let name = val.split('|');
			return (
				<option key={i} data-id={val} value={name[0]}>{name[0]}</option>
			);
		})
		
		
		let that = this;
		const DragHandle = sortableHandle(() => <span className="showcase"></span>);
		const SortableItem = sortableElement(({value}) => {
			return (<div id={value.id} className={'field-div'}><DragHandle /><span className="input-title task-input-2">{value.name}</span><span className="input-status">{value.status}</span>
			</div>);
		});
		
		const SortableContainer = sortableContainer(({children}) => {
		  return <div className="status-inner">{children}</div>;
		}); 
		
		let href = window.location.href.split('?')[0];
		//console.log('checklist->',this.state.checklist);
		let wName = $('#workflowOptionVal option:selected').text();
		return (
			<div id="wrapper2" className="toggled">
				<div className="task-list-workflow">
					<div className="row">
						<div className="col-md-12 mb-4">
							<h4>Workflow Details</h4>
						</div>
					</div>
					<div className="row">	
						<div className="col-md-12 mt-2">
							<div className="row">
							{ categoriesHtml ?
							<div className="filter-header col-md-6">
								<label className="cat-lable">Category Filter:</label>
								<div className="select-filter-div">
								<select id='filterCategory' className="form-control" name="filterCategory" onChange={this.filterCategory}>
									<option value=''>Select Category</option>
									{categoriesHtml}
								</select>
								</div>
							</div>
							:null}
							
							{ workflowOption ?
							<div className="workflow-header col-md-6">
								<label className="cat-lable">Select Workflow:</label>
								<div className="select-workflow-div">
								<select id='workflowOptionVal' className="form-control" name="workflowOption" onChange={this.changeCategory}>
									{workflowOption}
								</select>
								<button type="button" className="btn btn-edit-workflow" data-toggle="modal" data-target="#editWorkflow"><i className="fa fa-edit"></i></button>
								</div>
							</div>
							:null}
							
							
							</div>
						</div>
						<div className="col-md-12 mt-2">	
							{taskList ?
							<div className="tasks-header-div">
								{wName != '' ?
								<h6 className="wname-day-count">{wName} ({this.state.daysCount} Days)</h6>
								:null}
								<div className="workflow-tasks-div">
									{taskList.map((value, index) => {
										//console.log('value->',value);
										let className = 'light-yellow';
										if(value.status == 'Task'){
											className = 'light-green';
										}else if(value.status == 'Subtask'){
											className = 'light-blue';
										}
										
										let icon = 'x';
										if(value.task_option == 'To Do'){
											icon = 'red';
										}else if(value.task_option == 'In Progress'){
											icon = 'yellow';
										}else if(value.task_option == 'Complete'){
											icon = 'green';
										}else if(value.task_option == 'Pending'){
											icon = 'pending';
										}
										
										let days = 0;
										if(value.x_days_number > 1){
											days = value.x_days_number+' Days';
										}else{
											days = value.x_days_number+' Day';
										}
										
										return(<div id={value.id} className={'task-div '+className}>
											<span className="input-title task-input-5">{value.name}</span>
											<span className="input-role">{value.role}</span>
											<span className="input-role">{value.person}</span>
											<span className="input-person">{value.due_date && value.due_date != 'null' ? moment(value.due_date).format('MM/DD/YYYY') : ''}</span>
											<span className="input-option">
											<select id={value.id} className="workflow-option" name="taskOption" onChange={this.updateTaskOption} value={value.task_option}>
												<option value='Pending'>Pending</option>
												<option value='To Do'>To Do</option>
												<option value='In Progress'>In Progress</option>
												<option value='Complete'>Complete</option>
												<option value='N/A'>N/A</option>
											</select>
											</span>
											<span className="input-days">{days}</span>
											<span className="task-icon"><img src={href+'/'+icon+'.png'} alt="Status" width="15" height="15" /></span>
											
											{value.share == 'Yes' ?
												<span className="task-icon"><img src={href+'/unlock.png'} alt="Share" width="15" height="15" /></span>
											:
												<span className="task-icon"><img src={href+'/lock.png'} alt="Share" width="15" height="15" /></span>
											}
											
											{value.send_message == 'Y' ?
												<span className="task-icon"><img src={href+'/send-message.png'} alt="Send Message" width="15" height="15" /></span>
											:null}
											{value.checklist != '' ?
												<span className="task-icon"><input className="check-disable" name="demo" type="checkbox" value="" checked='checked' disabled/></span>
											:null}
											
											{value.synchronize == 'Y' ?
												<span className="task-icon"><img src={href+'/sync.png'} alt="Synchronize" width="15" height="15" /></span>
											:null}
											
											{value.details_note != null && value.details_note != 'null' && value.details_note != '' ?
												<span className="task-icon task-note" data-toggle="modal" data-target="#taskNote" onClick={() => { this.detailsNote(value.details_note) } }><img src={href+'/note.png'} alt="Details Note" width="15" height="15"/></span>
											:null}
											
											{/* value.wip_note != null && value.wip_note != 'null' && value.wip_note != '' ?
												<span className="task-icon task-wip-note" data-toggle="modal" data-target="#taskWipNote" onClick={() => { this.wipNote(value.wip_note) } }><img src={href+'/wip.png'} alt="WIP Note" width="15" height="15"/></span>
											:null */}
											
											{value.gotolink != null && value.gotolink != 'null' && value.gotolink != '' ?
												<a href={value.gotolink} target="_blank" className="task-icon task-link-note"><img src={href+'/gotolink.png'} alt="Go to link" width="15" height="15"/></a>
											:null}
											
											<button type="button" className="btn code-dialog btn-edit task-edit" onClick={()=>this.editTask(value)}><i className="fa fa-edit"></i></button>
										</div>)
									})}
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
								<div className="modal" id={"taskWipNote"} role="dialog">
									<div className="modal-dialog modal-lg custom-modal mds-description-modal">
										<div className="modal-content">
										  <div className="modal-header">
											<h5 className="modal-title">WIP Note</h5>
											<button type="button" className="close" data-dismiss="modal">&times;</button>
										  </div>
										  <div className="modal-body">
										  {this.state.taskWipNote}
										  </div>
										  <div className="modal-footer">
												<div className="popup-btn-com">
													<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
												</div>
										  </div>
										</div>
									</div>
								</div>
								<div className="modal" id={"editWorkflow"} role="dialog">
									<div className="modal-dialog modal-lg custom-modal mds-description-modal">
										<div className="modal-content">
										  <div className="modal-header">
											<h5 className="modal-title">Update Workflow Name</h5>
											<button type="button" className="close" data-dismiss="modal">&times;</button>
										  </div>
										  <div className="modal-body">
											<input className="form-control" name="workflowName" type="text" value={this.state.workflowName} onChange={this.getValue} />
										  </div>
										  <div className="modal-footer">
												<div className="popup-btn-com">
													<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
													<button type="button" onClick={()=>this.editWorkflow()} className="btn btn-info float-right mr-1" data-dismiss="modal">Update</button>
												</div>
										  </div>
										</div>
									</div>
								</div>
								
							</div>
							:null}
						</div>
					</div>
					<button type="button" className="hamburger animated fadeInRight is-closed" data-toggle="offcanvas-3"></button>
				</div>
				<nav className="custom-navbar-2" id="sidebar-wrapper-right" role="navigation">
					<div className="nav-content-right">
						<h5 className="page-title">Details Panel</h5>
						<div className="workflow-item-fields">
							<div className="row-input">
								<label className="label-control"> Responsible Role </label>
								<select className="form-control" name="personRole" onChange={this.getValue} value={this.state.personRole}>
									<option value="">Please Select</option>
									{responsibleRole.map((val, i) => (
										<option key={i} value={val}>{val}</option>
									))}
								</select>
							</div>
							<div className="row-input">
								<label className="label-control"> Responsible Person </label>
								<select className="form-control" name="personName" onChange={this.getValue} value={this.state.personName}>
									<option value="">Please Select</option>
									{personOption}
								</select>
							</div>
							
							<div className="row-input-date">
								<label className="label-control"> Select due date </label>
								<LocalizationProvider dateAdapter={AdapterDateFns}>
									<Stack spacing={3}>
										<DesktopDatePicker
											label=""
											inputFormat="MM/dd/yyyy"
											value={this.state.startDate ? this.state.startDate : this.state.dueDate}
											onChange={this.handleChange}
											renderInput={(params) => <TextField {...params} />}
										/>
									</Stack>
								</LocalizationProvider>
							</div>
							
							<div className="workflow-checkbox">
								<input name="xDays" type="checkbox" value="Y" checked={this.state.xDays == 'Y' ? true : false} onChange={this.getValue} /> This task must be completed in X days once started
								{this.state.xDays == 'Y' ?
									<input className="form-control x-days-number" name="xDaysNumber" min="0" max="99" type="number" value={this.state.xDaysNumber} onChange={this.getValue} />
								:null}
							</div>
							
							<div className="workflow-checkbox">
								<input name="completedBefore" type="checkbox" value="Y" checked={this.state.completedBefore == 'Y' ? true : false} onChange={this.getValue} /> This task requires previous task to be completed before starting
							</div>
							
							<div className="workflow-checkbox">
								<input name="sendMessage" type="checkbox" value="Y" checked={this.state.sendMessage == 'Y' ? true : false} onChange={this.getValue} /> Send message to responsible person when task should be started
							</div>
							
							<div className="workflow-checkbox">
								<input name="synchronize" type="checkbox" value="Y" checked={this.state.synchronize == 'Y' ? true : false} onChange={this.getValue} /> Synchronize this status when updated in WIP
							</div>
							
							<div className="row-input text-box">
								<label className="label-control">Task Details Note</label>
								<span className="do-not-share"><input name="doNotShare" type="checkbox" value="N" checked={this.state.doNotShare == 'N' ? true : false} onChange={this.getValue} /> Do not share</span>
								<textarea id="detailsNote" name="detailsNote" rows="4" cols="50" onChange={this.getValue} value={this.state.detailsNote}></textarea>
							</div>
							{/* <div className="row-input">
								<label className="label-control">WIP Notes</label>
								<div className="add-wip-note">
									<input className="form-control input-wip-note" name="addWipNote" value={this.state.addWipNote} onChange={this.getValue} />
									<button type="button" className="btn btn-info btn-wip-note" onClick={this.handleWipNote}>Add</button>
								</div>
								<div id="wipNote" className="wip-Note-box"></div>
							</div> */}
							
							<div className="row-input list-sec">
								<div><label className="label-control" onClick={()=>this.showCheckList(true)}><input name="demo" type="checkbox" value="Y" checked='checked' disabled/> Checklist</label>
								<span className="change-status-com">
								<button onClick={this.getQrCode} data-toggle="modal" data-target="#qrCodePopup" className="btn qr-code-btn" type="button"><i className="fa fa-qrcode" aria-hidden="true"></i></button> Generate QR code for this taks
								</span>
								</div>
								<div className={checklist.length > 0 ? 'has-checklist add-checklist' : "add-checklist"} style={{display:'none'}}>
								    {/* this.state.checklist.length > 0 ?
								    <div className="delete-checklist" onClick={() => {if (window.confirm('Are you sure you want to Delete this checklist?')) this.deleteCheckList()}} ><i className="fa fa-trash"></i></div>
									:null */}
									<div className="check-list">
										{checklistHtml}
									</div>
									<div className="checklist-add">
									<input className="form-control input-checklist" name="checkListOption" value={this.state.checkListOption} onChange={this.getValue} placeholder="Add an item" />
									<button type="button" className="btn btn-info btn-check-list btn-sm" onClick={this.handleCheckList}>Add</button>&nbsp;
									<button type="button" className="btn btn-danger btn-check-list btn-sm" onClick={()=>this.showCheckList(false)}>Cancel</button>
									<span className="change-status-com"><input name="status_change" type="checkbox" value="Y" onChange={this.getValue} checked={this.state.status_change == 'true' ? true : false} /> Status to complete when 100%</span>
									
									</div>
								</div>
							</div>
							
							<div className="row-input">
								<label className="label-control"> Go To Link </label>
								<select className="form-control" name="gotolink" onChange={this.getValue} value={this.state.gotolink}>
									<option value="">Please Select</option>
									{goLinksHtml}
								</select>
							</div>
							
							<div className="row-input-save">
								<button type="button" className="btn btn-info btn-update-status" onClick={this.updateWorkflowTask}>Save</button>
							</div>
						</div>
					</div>
				</nav>
				<div className="modal" id={"qrCodePopup"} role="dialog">
					<div className="modal-dialog modal-lg custom-modal qr-code-modal">
						<div className="modal-content qr-code-modal">
							<div className="modal-header">
								<button type="button" className="close" data-dismiss="modal">&times;</button>
							</div>
							<div className="modal-body text-center">
								<div id="qr-code-img">
								{/* <img src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='"+this.state.copyQrCode+"'"} alt="QR" width="150" height="150" /> */}
								<img src={this.state.uniqueQrCode} alt="QR" width="150" height="150" />
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
		);
	}
}
