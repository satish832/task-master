import React, { Component } from 'react';
import $ from 'jquery';
import axios,{post,get} from 'axios';
import moment from 'moment';
import { ulid } from 'ulid'
import arrayMove from "./arrayMove";
import Html5QrcodePlugin  from "./Html5QrcodePlugin";
import ResultContainerPlugin from './ResultContainerPlugin'
import { copyImageToClipboard } from 'copy-image-clipboard'
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';

export default class WorkFlowBuilder extends Component {
	
	constructor(props){
        super(props)
		this.state ={
			catList:[],
			taskList:[],
			tasks:[],
			csvdata:[],
			selectedWorkflow:'',
			file:'',
			taskId:'',
			taskName:'',
			taskStatus:'',
			userId:'',
			uId:'',
			copyQrCode:'',
			facilityId:'',
			workflowUid:'',
			newWorkflowName:'',
			selectedWorkflowName:'',
			workflowSharingCode:'',
			workflowTasks:new Map(),
			wflowTasks:[],
			workflowList:[],
			showUpdate:false,
			showSharing:false,
			showScaner:false,
			decodedResults:[],
			categories:[],
			shareable:1,
			catId:'',
		}
		this.onNewScanResult = this.onNewScanResult.bind(this);
    }
	
	componentDidMount() {
		this.getCategories();
		this.getWorkflowCategories();
		this.getWorkflow();
	}
	
	
	/* getCategories=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let that = this;
		let url = ApiUrl+'task-manager/get_list_name.php';
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
			this.setState({catList:data});
			setTimeout(function(){
				that.getTaskList();
			}, 2000);
        })
	} */
	
	getCategories=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let that = this;
		let url = ApiUrl+'list-name';
		let data = [];
		axios.get(url)
        .then(response => {
            data = response.data;
			this.setState({catList:data});
			setTimeout(function(){
				that.getTaskList();
			}, 1000);
        })
	}
	
	getWorkflowCategories=()=>{
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
	
	getTaskList=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let cat = $('#taskCtWork').val();
		
		let url = ApiUrl+'tasks/'+cat;
		let data = [];
		
        axios.get(url)
        .then(response => {
            data = response.data;
			this.setState({taskList:data});
        })
	}
	
	changeCategory=(event)=>{
		this.getTaskList();
	}
	
	/* deleteTask=(id)=>{
		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'task-manager/delete_task.php';
			let formData = new FormData();
			formData.append('id', id);
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
				if(response.data){
					//alert(response.data);
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	} */
	
	editTaskInfo=(id)=>{
		this.setState({taskId:id});
		let taskList = this.state.taskList;
		
		taskList.map((value, i) => {
			if(value.id == id){
				this.setState({taskName:value.name,taskStatus:value.status});
			}
		})
		
		$('#editTasks').modal('show');
	}
	
	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;
		this.setState({[event.target.name]:event.target.value});
	}
	
	onSortEnd = ({oldIndex, newIndex}) => {
		this.setState(({wflowTasks}) => ({
		    wflowTasks: arrayMove(wflowTasks, oldIndex, newIndex),
		}));
	};
	
	setWorkflowList = (event) => {
		
		let taskId = parseInt(event.target.id);
		let taskName = event.target.name;
		let workflowId = $('#builderWorkflowOption').val();
		let wflowTasksLength = this.state.wflowTasks.length;
		let workflowTasks = this.state.workflowTasks;
		
		if(event.target.checked){
			this.state.taskList.map((val, i) => {
				if(val.id == taskId){
					val.pos = wflowTasksLength+1;
					workflowTasks.set(taskId,val);
				}
			});
		}else{
			workflowTasks.delete(taskId);
		}
		
		this.setState({workflowTasks:workflowTasks});
		
		let opTasks = Object.fromEntries(workflowTasks.entries());
		let wflowTasks = [];
		
		for (let prop in opTasks) {
			wflowTasks.push(opTasks[prop]);
		}
		wflowTasks = wflowTasks.filter(function(x) {
			 return x !== '';
		});
		
		wflowTasks.sort(function(a, b){
			return parseInt(a.pos)- parseInt(b.pos);
		});
		
		this.setState({wflowTasks:wflowTasks});
		
		if(taskName == 'delete' && this.state.selectedWorkflow != ''){
			this.deleteTask(workflowId,taskId);
		}	
	}
	
	handleSubmit=()=>{
		
		let workflowName = $('#workflowName').val();
		let wflowTasks = this.state.wflowTasks;
		
		let newArray = [];
		this.state.wflowTasks.map((val, i) => {
			newArray.push(val['id']);
		})
		let ids = newArray.join();
		let user_id = localStorage.getItem('user_id');
		let user_facility_id = localStorage.getItem('user_facility_id');
		let uid = ulid();
		if(workflowName && newArray){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'add-workflow';
			let formData = new FormData();
			formData.append('name', workflowName);
			formData.append('uid', uid);
			formData.append('user_id', user_id);
			formData.append('facility_id', user_facility_id);
			formData.append('ids', ids);
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
					//this.getTaskList();
					this.getWorkflow();
					this.setState({workflowTasks:new Map(),wflowTasks:[]});
					alert(response.data);
					$('#workflowName').val('');
					//$('#taskStatus').val('Task');
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}else{
			alert("Please insert the workflow name.");
		}

	}
	
	updateWorkflow=()=>{
		
		let workflowId = $('#builderWorkflowOption').val();
		let wflowTasks = this.state.wflowTasks;
		
		let newArray = [];
		this.state.wflowTasks.map((val, i) => {
			newArray.push(val['id']);
		})

		let ids = newArray.join();
		
		if(workflowId && newArray){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'update-workflow-tasks/'+workflowId;
			let formData = new FormData();
			formData.append('ids', ids);
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
					this.updateWorkflowPos(workflowId);
					alert(response.data);
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	getWorkflow=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let that = this;
		let url = ApiUrl+'workflow';
		let data = [];
		
        axios.get(url)
        .then(response => {
            data = response.data;
			this.setState({workflowList:data});
			setTimeout(function(){
				//that.getTaskList();
			}, 3000);
        })
	}
	
	updateWorkflowPos=(Id)=>{
		this.setState({workflowTasks:new Map()});
		if(Id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'workflow-tasks/'+Id;
			let that = this;
			let data = [];
			setTimeout(function(){
				let workflowTasks = that.state.workflowTasks;
				let wflowTasks = that.state.wflowTasks;
				
				axios.get(url)
				.then(response => {
					data = response.data;
					
					let wTasks = [];
					data.map((val, i) => {
						workflowTasks.set(val.id,val);
						that.setState({workflowTasks:workflowTasks});
						wTasks.push(val);
					});
					that.setState({wflowTasks:wTasks});
				})
			}, 1000);
		}
	}
	
	selectWorkflow=(event)=>{
		let Id = event.target.value;
		let selectedWorkflowName = event.target.selectedOptions[0].text;
		let workflowList = this.state.workflowList;
		workflowList.map((val, i) => {
			
			if(val.id == Id){
				this.setState({userId:val.user_id,uId:val.uid,facilityId:val.facility_id,workflowSharingCode:val.uid,shareable:val.shareable});
			}
			
		});
		
		this.setState({selectedWorkflowName,workflowTasks:new Map(),wflowTasks:[]});
		if(Id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'workflow-tasks/'+Id;
			
			
			let that = this;
			let data = [];
			setTimeout(function(){
				let workflowTasks = that.state.workflowTasks;
				let wflowTasks = that.state.wflowTasks;
				axios.get(url)
				.then(response => {
					data = response.data;
					let wTasks = [];
					data.map((val, i) => {
						workflowTasks.set(val.id,val);
						that.setState({workflowTasks:workflowTasks});
						wTasks.push(val);
					});
					
					that.setState({wflowTasks:wTasks});
				})
				
			}, 1000);

			that.setState({showUpdate:true, selectedWorkflow:Id});
			//console.log('workflowTasks->',this.state.workflowTasks);
		}else{
			this.setState({showUpdate:false});
		}
	}
	
	filterCategory=(event)=>{
		let catId = event.target.value;
		this.setState({catId,wflowTasks:[]});
		$('#builderWorkflowOption').val('');
	}
	
	uniqueArray(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++)
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
				a.push(arr[i]);
		return a;
	}
	
	deleteTask=(id,taskId)=>{
		if(id && taskId){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'delete-workflow-task/'+id;
			let formData = new FormData();
			formData.append('id', id);
			formData.append('taskId', taskId);
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	copyWorkflow=()=>{
		
		let workflowName = this.state.newWorkflowName;
		let wflowTasks = this.state.wflowTasks;
		
		/* let newArray = [];
		this.state.wflowTasks.map((val, i) => {
			newArray.push(val['id']);
		})
		let ids = newArray.join(); */
		let user_id = localStorage.getItem('user_id');
		let user_facility_id = localStorage.getItem('user_facility_id');
		let uid = ulid();
		//console.log('ids->',ids);
		if(workflowName && wflowTasks){
			let tasks = JSON.stringify(wflowTasks);
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'import-workflow';
			let formData = new FormData();
			formData.append('name', workflowName);
			formData.append('uid', uid);
			formData.append('user_id', user_id);
			formData.append('facility_id', user_facility_id);
			formData.append('tasks', tasks);
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
					this.getWorkflow();
					alert(response.data);
					this.setState({newWorkflowName:''});
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}else{
			alert("Please select the category and insert the task name.");
		}
		
	}
	
	saveAsWorkflow=()=>{
		
		let workflowName = this.state.newWorkflowName;
		let wflowTasks = this.state.wflowTasks;
		let user_id = localStorage.getItem('user_id');
		let user_facility_id = localStorage.getItem('user_facility_id');
		let uid = ulid();
		//console.log('ids->',ids);
		if(workflowName && wflowTasks){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'import-workflow';
			let formData = new FormData();
			let tasks = JSON.stringify(wflowTasks);
			formData.append('name', workflowName);
			formData.append('uid', uid);
			formData.append('user_id', user_id);
			formData.append('facility_id', user_facility_id);
			formData.append('tasks', tasks);
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
					this.getWorkflow();
					alert(response.data);
					this.setState({newWorkflowName:''});
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}else{
			alert("Please select the category and insert the task name.");
		}
		
	}
	
	importBySharingCode=()=>{
		
		let sharingCode = this.state.sharingCode;
		let newWorkflowName = this.state.newWorkflowName;
		
		let workflowId = '';
		this.state.workflowList.map(function(val,i) {
			if(val.uid == sharingCode){
				workflowId = val.id;
			}
		});

		if(workflowId){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'workflow-tasks/'+workflowId;
			
			axios.get(url).then(response => {
				let data = response.data;
				let that = this;
				setTimeout(function(){
					let tasks = JSON.stringify(data);
					if(newWorkflowName && tasks){
						
						let ApiUrl = $('#ApiUrl').val();
						let url = ApiUrl+'import-workflow';
						let user_id = localStorage.getItem('user_id');
						let user_facility_id = localStorage.getItem('user_facility_id');
						let uid = ulid();
					
						let formData = new FormData();
						formData.append('name', newWorkflowName);
						formData.append('uid', uid);
						formData.append('user_id', user_id);
						formData.append('facility_id', user_facility_id);
						formData.append('tasks', tasks);
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
								that.getWorkflow();
								alert(response.data);
								that.setState({newWorkflowName:'',workflowUid:'',workflowByQrcode:'',decodedResults:[]});
							}
						}).catch(error => {
							alert('error::'+ error);
						})
						
					}else{
						alert('Data not found!');
					}
				}, 1000);
			})
		}else{
			alert('Sharing code is invalid!');
		}
	}
	
	showHideCode=(action)=>{
		if(action == 'show'){
			this.setState({showSharing:true});
		}else{
			this.setState({showSharing:false});
		}
	}
	
	copySharingCode=()=>{
		let copyText = document.getElementById("workflowSharingCode");
		copyText.select();
		copyText.setSelectionRange(0, 99999);
		navigator.clipboard.writeText(copyText.value);
	}
	
	copyQrImage=(img)=>{
		let path = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data="+img;
		copyImageToClipboard(path).then(() => {
		  //console.log('Image Copied');
		}).catch((e) => {
		  console.log('Error: ', e.message);
		})
		// Browser
		/* CopyImageClipboard.copyImageToClipboard(path).then(() => {
			console.log('Image Copied')
		}).catch((e) => {
			console.log('Error: ', e.message)
		}) */
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
	
	getQrCode=()=>{
		let copyText = $('#workflowSharingCode').val();
		this.setState({copyQrCode:copyText});
	}
	
	scanCodeByCamera=()=>{
		this.setState({showScaner:true,workflowUid:'',workflowByQrcode:''});
		$('#builderSection').hide();
	}
	
	backToBuilder=()=>{
		this.setState({showScaner:false});
		$('#builderSection').show();
	}
	
	onNewScanResult(decodedText, decodedResult) {
		this.setState((state, props) => {
		  state.decodedResults.push(decodedResult);
		  return state;
		});
		let workflowName = '';
		let workflowList = this.state.workflowList;
		let uid = decodedText.replaceAll("'","");
		if(uid){
			workflowList.map((val, i) => {
				if(val.uid == uid){
					workflowName = val.name;
				}
			});
			this.setState({workflowUid:uid, workflowByQrcode:workflowName});
		}
		//this.html5QrcodeScanner.pause(true);
    }
	
	addToWorkflowList=()=>{
		let workflowUid = this.state.workflowUid;
		let currentDate = new Date().toLocaleString("en-US").replace(',','');
		let workflowNewName = this.state.workflowByQrcode;
		let newName = workflowNewName+'-QR '+moment(currentDate).format('MMDDYYYY');
	
		this.setState({sharingCode:workflowUid,newWorkflowName:newName});
		let that = this;
		setTimeout(function(){
			that.importBySharingCode();
			$("button:contains('Stop Scanning')" ).trigger("click");
		}, 1000);
	}
	
	render() {
		
		const {workflowList,catList,taskList,workflowTasks,wflowTasks,categories,catId} = this.state;
		let categoriesHtml = categories.map(function(val,i) {
			return (
				<option value={val.id} key={i}>{val.name}</option>
			);
		})
		
		let href = window.location.href.split('?')[0];
		let catOption = catList.map(function(val,i) {
			return (
				<option value={val['name']} key={i}>{val['name']}</option>
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
		
		let category = $('#taskCtWork').val();
		
		let that = this;
		const DragHandle = sortableHandle(() => <span className="showcase"></span>);
		const SortableItem = sortableElement(({value}) => {
			let className = 'light-yellow';
			if(value.status == 'Task'){
				className = 'light-green';
			}else if(value.status == 'Subtask'){
				className = 'light-blue';
			}
			
			return (<div id={value.id} className={'wt-section field-div ' + className +' move-'+value.id}><input className="delete-checkbox" type="checkbox" name='delete' id={value.id} checked={workflowTasks.get(value.id) ? true:false} onChange={this.setWorkflowList}/><DragHandle /><span className="input-title task-input-4">{value.name}</span>
			</div>);
		});
		
		const SortableContainer = sortableContainer(({children}) => {
		  return <div className="status-inner">{children}</div>;
		}); 
		let currentDate = new Date().toLocaleString("en-US").replace(',','');
		
		return (
			<div className="status-list-workflow">
			
				{this.state.showScaner ? 
				<div id="scanerSection" className="scanerDiv">
					<div className="row">
						<div className="col-md-12 mb-4">
							<h4><button className="sharing-code-btn" type="button" onClick={()=>this.backToBuilder()}><i className="fa fa-arrow-left" aria-hidden="true"></i></button> QR Scaner </h4>
						</div>
					</div>
					<Html5QrcodePlugin 
					fps={10}
					qrbox={250}
					disableFlip={false}
					qrCodeSuccessCallback={this.onNewScanResult}/>
					<ResultContainerPlugin results={this.state.decodedResults} />
					{ this.state.workflowByQrcode != '' && this.state.workflowUid != '' ? 
						<div className="add-to-list">
						<h5>{this.state.workflowByQrcode}</h5>
						<button type="button" onClick={()=>this.addToWorkflowList()} className="btn btn-info mr-1" data-dismiss="modal">Add to Workflow list</button>
						</div>
					:null}
				</div>
				:null}
				<div id="builderSection" className="builder-section">
					<div className="row">
						<div className="col-md-12 mb-4">
							<h4>Workflow Builder</h4>
						</div>
					</div>
					
					<div className="row">	
						<div className="col-md-6 mt-2">
							{ catOption ?
							<div className="cat-header-div">
								<label className="cat-lable">Task List Name:</label>
								<select id='taskCtWork' className="form-control" name="taskCtWork" onChange={this.changeCategory}>
									{catOption}
								</select>
							</div>
							:null}
							{taskList && category ?
							<div className="tasks-header-div">
								<p className="task-list-label">"{category}" Task List</p>
								<div className="tasks-table-div">
									{taskList.map((value, index) => (
										<div id={value.id} className={'task-div'}>
											<input type="checkbox" name={value.id} id={value.id} checked={workflowTasks.get(value.id) ? true:false} onChange={this.setWorkflowList}/>
											<span className="input-title task-input-2">{value.name}</span>
											<span className="input-status">{value.status}</span>
										</div>
									))}
									
								</div>
							</div>
							:null}
							
						</div>
						<div className="workflow-main col-md-6">
							{taskList && category ?
							<div>
							{ workflowOption ?
							<div className="cat-header-div row">
								{ categoriesHtml ?
								<div className="filter-header col-md-12">
									<label className="cat-lable">Category Filter:</label>
									<div className="select-filter-div">
									<select id='filterCategory' className="form-control builder-filter" name="filterCategory" onChange={this.filterCategory}>
										<option value=''>Select Category</option>
										{categoriesHtml}
									</select>
									</div>
								</div>
								:null}
								<div className="col-md-5">
								<label className="cat-lable">Select Workflow:</label>
								<select id='builderWorkflowOption' className="form-control" name="workflowOption" onChange={this.selectWorkflow}>
									<option value={''}>Please Select</option>
									{workflowOption}
								</select>
								</div>
								{this.state.selectedWorkflowName ? 
								<div className="col-md-7">
									<label className="cat-lable">Workflow Sharing Code:</label>
									{this.state.showSharing && this.state.shareable == 'Y' ?
										<div className="row">
											<div className="col-md-1"><button className="sharing-code-btn" type="button" onClick={()=>this.showHideCode('hide')}><i className="fa fa-eye" aria-hidden="true"></i></button></div>
											<div className="col-md-10 code-copy"><input id="workflowSharingCode" className="form-control" name="workflowSharingCode" value={this.state.workflowSharingCode} type="text" onChange={this.getValue}/><button className="copy-code-btn" type="button" onClick={()=>this.copySharingCode()}><i className="fa fa-copy" aria-hidden="true"></i></button><button onClick={this.getQrCode} data-toggle="modal" data-target="#qrCodePopup" className="qr-code-btn" type="button"><i className="fa fa-qrcode" aria-hidden="true"></i></button></div>
										</div>
									:
										<div className="row"><div className="col-md-1"><button className="sharing-code-btn" type="button" onClick={()=>this.showHideCode('show')}><i className="fa fa-eye-slash" aria-hidden="true"></i></button></div>
										<div className="col-md-10">
											<button className="sharing-code-btn" type="button" ><i className={this.state.shareable == 'Y' ? 'fa fa-unlock' : 'fa fa-lock' } aria-hidden="true"></i></button>
										</div>
										</div>
									}
								</div>
								:null}
							</div>
							:null}
							<div className="workflow-div">
								{wflowTasks ?
								<div className="workflow-select-list">
									<SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
										{wflowTasks.map((value, index) => (
										  <SortableItem key={index} index={index} value={value} /> 
										))}
									</SortableContainer>
									
								</div>
								:null}
							</div>
							{ this.state.showUpdate ? 
								<div className="workflow-save">
									<button className="btn btn-primary mr-1" type="button" onClick={()=>this.updateWorkflow()}>Update Workflow</button>
									<button className="btn btn-primary mr-1" data-toggle="modal" data-target="#copyWorkflow" type="button" >Copy Workflow</button>
									<button className="btn btn-primary" data-toggle="modal" data-target="#saveAsWorkflow" type="button" >Save as</button>
									<div className="modal" id={"copyWorkflow"} role="dialog">
										<div className="modal-dialog modal-lg custom-modal mds-description-modal">
											<div className="modal-content">
											  <div className="modal-header">
												<h5 className="modal-title">Workflow New Name</h5>
												<button type="button" className="close" data-dismiss="modal">&times;</button>
											  </div>
											  <div className="modal-body">
												<input className="form-control" name="newWorkflowName" type="text" value={this.state.newWorkflowName} onChange={this.getValue} />
											  </div>
											  <div className="modal-footer">
													<div className="popup-btn-com">
														<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
														<button type="button" onClick={()=>this.copyWorkflow()} className="btn btn-info float-right mr-1" data-dismiss="modal">Save</button>
													</div>
											  </div>
											</div>
										</div>
									</div>
									<div className="modal" id={"saveAsWorkflow"} role="dialog">
										<div className="modal-dialog modal-lg custom-modal mds-description-modal">
											<div className="modal-content">
											  <div className="modal-header">
												<h5 className="modal-title">Workflow New Name</h5>
												<button type="button" className="close" data-dismiss="modal">&times;</button>
											  </div>
											  <div className="modal-body">
												<input className="form-control" name="newWorkflowName" type="text" value={this.state.newWorkflowName} onChange={this.getValue} />
											  </div>
											  <div className="modal-footer">
													<div className="popup-btn-com">
														<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
														<button type="button" onClick={()=>this.saveAsWorkflow()} className="btn btn-info float-right mr-1" data-dismiss="modal">Save</button>
													</div>
											  </div>
											</div>
										</div>
									</div>
								</div>
							:
								
								<div className="workflow-save">
									<label className="save-lable">Name Workflow:</label>
									<input id="workflowName" className="form-control" name="workflowName" type="text" />
									<button className="btn btn-primary" type="button" onClick={()=>this.handleSubmit()}>Save</button>
								</div>
								
							}
							<button className="import-btn" data-toggle="modal" data-target="#importWorkflow" type="button" ><i className="fa fa-upload" aria-hidden="true"></i></button>
							<div className="modal" id={"importWorkflow"} role="dialog">
								<div className="modal-dialog modal-lg custom-modal mds-description-modal">
									<div className="modal-content">
									  <div className="modal-header">
										<h5 className="modal-title">Import Workflow</h5>
										<button type="button" className="close" data-dismiss="modal">&times;</button>
									  </div>
									  <div className="modal-body">
									  
										<label className="save-lable">Insert Sharing Code:</label>
										<input className="form-control" name="sharingCode" type="text" value={this.state.sharingCode} onChange={this.getValue} />
										<label className="save-lable">New Workflow Name:</label>
										<input className="form-control" name="newWorkflowName" type="text" value={this.state.newWorkflowName} onChange={this.getValue} />
										</div>
									  <div className="modal-footer">
											<div className="popup-btn-com">
												<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
												<button type="button" onClick={()=>this.importBySharingCode()} className="btn btn-info float-right mr-1" data-dismiss="modal">Import</button>
												<button type="button" data-dismiss="modal" onClick={()=>this.scanCodeByCamera()} className="copy-code-btn mr-1"><img className="scaner-btn" src={href+'/scanner.png'} /></button>
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
										<div className="modal-body">
											<img src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='"+this.state.copyQrCode+"'"} alt="QR" width="150" height="150" />
											<div className="qr-code-des">
												<b className="mr-3">{this.state.selectedWorkflowName}</b>
												<button onClick={()=>this.copyQrImage(this.state.copyQrCode)} className="copy-code-btn" type="button"><i className="fa fa-copy" aria-hidden="true"></i></button>
												<button onClick={()=>this.saveQrImage(this.state.copyQrCode,this.state.selectedWorkflowName)} className="copy-code-btn" type="button"><i className="fa fa-download" aria-hidden="true"></i></button>
											</div>
										</div>
									</div>
								</div>
							</div>
							
							</div>
							:null}
						</div>
					</div>
				</div>
				

			</div>	
		);
	}
}
