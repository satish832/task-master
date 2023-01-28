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


export default class WorkFlowManger extends Component {
	
	constructor(props){
        super(props)
		this.state ={
			workflowList:[],
			userData:[],
			catList:[],
			authors:[],
			taskList:[],
			filterAuthor:'',
			filterCategory:'',
			actionFilter:1,
			shareableFilter:'Y',
			addEditCategory:false,
			wId:'',
			cusCategoryName:'',
			previewName:'',
			selectedWorkflowName:'',
			notShareable:'N',
			daysCount:0,
			
		}
    }
	
	componentDidMount() {
		this.getTaskMasterUsers();
		this.getWorkflow();	
		this.getCategories();	
	}
	
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
			}, 2000);
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
			console.log('data->',data);
			let authors = [];
			data.map((val,i)=>{
				authors.push(val.user_id);
			});
			let authorsIds = that.uniqueArray(authors);
			this.setState({workflowList:data,authors:authorsIds});
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
			this.setState({catList:data});
        })
	}
	
	getTaskMasterUsers=() => {
		
		let user = localStorage.getItem('username');
		
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'authors';
		let data = [];
		axios.get(url)
        .then(response => {
			data = response.data;
			
			let userDt = [];
			
			data.map(function(val,n) {
				let user = [val.user_guid,val.user_name];
				userDt.push(user);
			})
			this.setState({userData:userDt});
			
		}).catch(error => {
			alert('error::'+ error);
		})
    }
	
	getValue=(event)=>{
		let name = event.target.name;
		let res = event.target.value;
		
		if(name != 'notShareable'){
			this.setState({[event.target.name]:event.target.value});
		}
		
		if($("input[name='actionFilter']").prop("checked") == true){
			this.setState({actionFilter:1});
		}else{
			this.setState({actionFilter:0});
		}
		
		if($("input[name='shareableFilter']").prop("checked") == true){
			this.setState({shareableFilter:'Y'});
		}else{
			this.setState({shareableFilter:'N'});
		}
		
		if(name == 'notShareable' && $("input[name='notShareable']").prop("checked") == true){
			this.setState({notShareable:'N'});
		}
		
		if(name == 'notShareable' && $("input[name='notShareable']").prop("checked") == false){
			this.setState({notShareable:'Y'});
		}
		
		if(name == 'wEditCategory'){
			let selectedCategoryName = event.target.selectedOptions[0].text;
			this.setState({addEditCategory:false,wcatName:selectedCategoryName});
		}
	}
	
	copyWorkflow=(id,name) => {
		
		let currentDate = new Date();
		let newWorkflowName = 'Copy-'+name+'-'+moment(currentDate).format('HHMMSS');
		
		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'workflow-tasks/'+id;
			
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
							}
						}).catch(error => {
							alert('error::'+ error);
						})
						
					}else{
						alert('Data not found!');
					}
				}, 1000);
			})
		}

	}
	
	deleteWorkflow=(id) => {
		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'delete-workflow/'+id;
			axios({
				method: 'delete',
				url: url,
			})
			.then(response => {
				this.getWorkflow();
				alert(response.data);
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	editWorkflow=(id,name,rank,category,shareable) => {
		this.setState({wId:id,wName:name,wRank:rank,wCategory:category,notShareable:shareable});
	}
	
	uniqueArray(arr) {
		var a = [];
		for (var i=0, l=arr.length; i<l; i++)
			if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
				a.push(arr[i]);
		return a;
	}
	
	addCategory=() => {
		this.setState({addEditCategory:true,cusCategoryName:'',editcatId:''});
	}
	
	editCategory=() => {
		let catName = this.state.wcatName;
		this.setState({addEditCategory:true,cusCategoryName:catName,editcatId:this.state.wEditCategory});
	}
	
	addUpdateCategory=() => {
		
		let catName = this.state.cusCategoryName;
		let editcatId = this.state.editcatId;
		let user_id = localStorage.getItem('user_id');
		if(catName){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'task-manager/customize_category.php';
			let formData = new FormData();
			formData.append('id', editcatId);
			formData.append('name', catName);
			formData.append('user_id', user_id);
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
					this.getCategories();
					this.setState({cusCategoryName:'',addEditCategory:false,wcatName:''});
					$('.w-edit-category').val('');
					alert(response.data);
					
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	updateWorkflow=() => {
		let wId = this.state.wId;
		let wName = this.state.wName;
		let wCategory = this.state.wCategory;
		let notShareable = this.state.notShareable;
		let rank = this.state.wRank;
		if(wName && wCategory){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'update-workflow/'+wId;
			let formData = new FormData();
			formData.append('name', wName);
			formData.append('category', wCategory);
			formData.append('shareable', notShareable);
			formData.append('rank', rank);
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
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	deleteCategory=() => {
		let id = this.state.wEditCategory;
		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'task-manager/delete_wcategory.php';
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
				this.getCategories();
				this.getWorkflow();
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	getTaskList=(id,name)=>{
		let ApiUrl = $('#ApiUrl').val();
		this.setState({taskList:''});
		let url = ApiUrl+'workflow-tasks/'+id;
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
			this.setState({taskList:data,daysCount,previewName:name});
        })
	}
	
	detailsNote=(note)=>{
		this.setState({taskNote:note});
	}
	
	wipNote=(note)=>{
		this.setState({taskWipNote:note});
	}
	
	workflowAction=(id,uid)=>{
		let val = 0;
		if($("input[name='"+uid+"']").prop("checked") == true){
			val = 1;
			this.setState({[uid]:true});
		}else{
			this.setState({[uid]:false});
		}

		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'workflow-action/'+id;
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
				this.getWorkflow();
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	getQrCode=(name,uid)=>{
		this.setState({copyQrCode:uid,selectedWorkflowName:name});
	}
	
	copySharingCode=(copyText)=>{
		navigator.clipboard.writeText(copyText);
	}
	
	render() {
		
		const {workflowList,userData,catList,authors,filterAuthor,filterCategory,actionFilter,shareableFilter,addEditCategory,cusCategoryName,taskList,notShareable} = this.state;
		
		let rowHtml = '';
		let href = window.location.href.split('?')[0];
		
		let rankOption = workflowList.map(function(val,i) {
			let pos = i+1;
			return (
				<option value={pos} key={i}>{pos}</option>
			);
		})
		
		let categoryOption = catList.map(function(val,i) {
			return (
				<option value={val.id} key={i}>{val.name}</option>
			);
		})
		
		let editCategoryOption = catList.map(function(val,i) {
			if(val.id != 1){
				return (
					<option value={val.id} key={i}>{val.name}</option>
				);
			}
		})
		
		let authorOption = authors.map(function(val,i) { 
			let author = '';
			userData.map(function(user,i) {
				if(user[0] == val){
					author = user[1];
				}
			})
			
			if(author){
				return (
					<option value={author} key={i}>{author}</option> 
				);
			}
		})

		if(workflowList){
			//console.log('workflowList->',workflowList);
			let that = this;
			rowHtml = workflowList.map(function(row,i) {
				
				let userName = 'Admin';
				userData.map(function(user,i) {
					if(user[0] == row.user_id){
						userName = user[1];
					}
				})
				
				
				
				if(filterAuthor && filterAuthor != userName){
					return false;
				}
				
				if(filterCategory && filterCategory != row.category){
					return false;
				}
				
				if(actionFilter != row.action){
					return false;
				}
				
				if(shareableFilter != row.shareable){
					return false;
				}
				

				let catName = '';
				catList.map(function(cat,i) {
					if(cat.id == row.category){
						catName = cat.name;
					}
					
				})
				
				return (<tr className={'workflow-row'}>
					<td className="w-name">{row.name}</td>
					<td>{catName}</td>
					<td>{userName}</td>
					<td>{row.rank}</td>
					<td>{row.total_days}</td>
					<td><input type="checkbox" checked={row.action == 1 || that.state[row.uid] ? 'checked' : ''} name={row.uid} onClick={()=>that.workflowAction(row.id,row.uid)} /></td>
					
					<td><button className="btn" type="button"><i className={row.shareable == 'Y' ? 'fa fa-unlock' : 'fa fa-lock' } aria-hidden="true"></i></button></td>
					
					<td><button onClick={()=>that.copyWorkflow(row.id,row.name)} className="btn" type="button"><i className="fa fa-copy" aria-hidden="true"></i></button></td>
					<td><button onClick={()=>that.getQrCode(row.name,row.uid)} data-toggle="modal" data-target="#qrCodePopup" className="btn" type="button"><i className="fa fa-qrcode" aria-hidden="true"></i></button></td>
					<td><button id={'btn'} onClick={()=>that.editWorkflow(row.id,row.name,row.rank,row.category,row.shareable)} data-toggle="modal" data-target="#editWorkflow" type="button" className="btn"><i className="fa fa-edit"></i></button></td>
					<td><button onClick={()=>that.getTaskList(row.id,row.name)} data-toggle="modal" data-target="#previewWorkflow"className="btn" type="button"><i className="fa fa-eye" aria-hidden="true"></i></button></td>
						{/* <td><i onClick={() => { if (window.confirm('Are you sure you want to delete this workflow?')) that.deleteWorkflow(row.id) } } className="fa fa-trash"></i></td> */}
					
				</tr>);
			})
		}
		
		return (
			<div className="workflow-manager">
				<div className="workflow-list">
					<div className="row">
						<div className="col-md-12 mb-4">
							<h4>Workflow Manager</h4>
						</div>
					</div>
					<div className="wfilters">
						<div className="wc-filter">
						<label>Category:</label>
						<select className="form-control builder-filter" name="filterCategory" onChange={this.getValue}>
							<option value={''}>Select Category</option>
							{categoryOption}
						</select>
						<span><input type="checkbox" name="actionFilter" checked={actionFilter == 1 ? 'checked' : ''} onChange={this.getValue}/> Active</span>
						</div>
						<div className="wu-filter">
							<label>Author:</label>
							<select className="form-control builder-filter" name="filterAuthor" onChange={this.getValue}>
								<option value={''}>Select Author</option>
								<option value={'Admin'}>Admin</option>
								{authorOption}
							</select>
							<span><input type="checkbox" name="shareableFilter" checked={shareableFilter == 'Y' ? 'checked' : ''} onChange={this.getValue} /> Sharable</span>
						</div>
						
						<div className="cat-manage">
							<button type="button" data-toggle="modal" data-target="#customizeCategory" className="btn btn-info float-right mr-1" data-dismiss="modal">Customize Category</button>
						</div>
					</div>
					<div className="workflow-table">
					<table className="table table-bordered workflow-list-table">
						<tr>
							<th className="w-name">Workflow Name</th>
							<th>Category</th>
							<th>Author</th>
							<th>Rank</th>
							<th>Total Days</th>
							<th>Active</th>
							<th>Sharable</th>
							<th>Copy</th>
							<th>Share</th>
							<th>Edit</th>
							<th>Preview</th>
						</tr>
						{rowHtml}
						</table>
					</div>
				</div>
				
				<div className="modal" id={"editWorkflow"} role="dialog">
					<div className="modal-dialog modal-lg custom-modal">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Update Workflow</h5>
								<button type="button" className="close" data-dismiss="modal">&times;</button>
							</div>
							<div className="modal-body edit-w">
								<label>Workflow Name:</label>
								<input className="form-control" name="wName" value={this.state.wName} type="text" onChange={this.getValue}/>
									
								<label>Category:</label>
								<select className="form-control builder-filter" name="wCategory" value={this.state.wCategory} onChange={this.getValue}>
									{categoryOption}
								</select>
								<label>Rank:</label>
								<select className="form-control builder-filter" name="wRank" value={this.state.wRank} onChange={this.getValue}>
									{rankOption}
								</select>
								<div className="edit-shareable"><input type="checkbox" name="notShareable" checked={notShareable == 'N' ? 'checked' : ''} onChange={this.getValue}/> Not Shareable</div>
							</div>
							<div className="modal-footer">
								<div className="popup-btn-com">
									<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
									<button type="button" onClick={()=>this.updateWorkflow()} className="btn btn-info float-right mr-1" data-dismiss="modal">Update</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div className="modal" id={"customizeCategory"} role="dialog">
					<div className="modal-dialog modal-lg custom-modal">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Workflow Category Manager</h5>
								<button type="button" className="close" data-dismiss="modal">&times;</button>
							</div>
							<div className="modal-body edit-w">
								
								<label>Categories:</label>
								<div>
								<select className="form-control w-edit-category" name="wEditCategory" onChange={this.getValue}>
									<option value={''}>Select Category</option>
									{editCategoryOption}
								</select>
								<span className="w-edit-span" ><button onClick={()=>this.addCategory()} type="button" className="btn"><i className="fa fa-plus"></i></button><button onClick={()=>this.editCategory()} type="button" className="btn"><i className="fa fa-edit"></i></button><button onClick={() => { if (window.confirm('Are you sure you want to delete this category?')) this.deleteCategory() } } type="button" className="btn"><i className="fa fa-trash"></i></button></span>
								</div>
								{ addEditCategory ?
								<div className="new-category-input">
									<label>Add new or Edit category name:</label>
									<input className="form-control" name="cusCategoryName" value={cusCategoryName} type="text" onChange={this.getValue}/>
								</div>
								:null}
							</div>
							<div className="modal-footer">
								<div className="popup-btn-com">
									<button type="button" className="btn btn-danger float-right" data-dismiss="modal">Close</button>
									<button onClick={()=>this.addUpdateCategory()} type="button" className="btn btn-info float-right mr-1" >Add&Update</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div className="modal pre-w-modal" id={"previewWorkflow"} role="dialog">
					<div className="modal-dialog modal-lg preview-workflow-modal">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Workflow Preview</h5>
								<button type="button" className="close" data-dismiss="modal">&times;</button>
							</div>
							<div className="modal-body edit-w">
								{taskList ?
								<div className="tasks-header-div">
									<h6>{this.state.previewName} ({this.state.daysCount} Days)</h6>
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
												<select id={value.id} className="workflow-option" name="taskOption" >
													<option value={value.task_option}>{value.task_option}</option>
												</select>
												</span>
												<span className="input-days">{days}</span>
												<span className="task-icon"><img src={href+'/'+icon+'.png'} alt="Status" width="15" height="15" /></span>
												
												{value.completed_before == 'Y' ?
													<span className="task-icon"><img src={href+'/lock.png'} alt="Completed Before" width="15" height="15" /></span>
												:null}
												
												{value.send_message == 'Y' ?
													<span className="task-icon"><img src={href+'/send-message.png'} alt="Send Message" width="15" height="15" /></span>
												:null}
												
												{value.synchronize == 'Y' ?
													<span className="task-icon"><img src={href+'/sync.png'} alt="Synchronize" width="15" height="15" /></span>
												:null}
												
												{value.details_note != null && value.details_note != '' ?
													<span className="task-icon task-note" data-toggle="modal" data-target="taskNote"><img src={href+'/note.png'} alt="Details Note" width="15" height="15"/></span>
												:null}
												
												{value.wip_note != null && value.wip_note != '' ?
													<span className="task-icon task-wip-note" data-toggle="modal" data-target="taskWipNote"><img src={href+'/wip.png'} alt="WIP Note" width="15" height="15"/></span>
												:null}
												
												{value.gotolink != null && value.gotolink != '' ?
													<a href={value.gotolink} target="_blank" className="task-icon task-link-note"><img src={href+'/gotolink.png'} alt="Go to link" width="15" height="15"/></a>
												:null}
												
											</div>)
										})}
									</div>
								</div>
								:null}
							
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
							<div className="modal-body">
								<img src={"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='"+this.state.copyQrCode+"'"} alt="QR" width="150" height="150" />
								<div className="qr-code-des">
									<b className="mr-3">{this.state.selectedWorkflowName}</b>
									<button onClick={()=>this.copySharingCode(this.state.copyQrCode)} className="copy-code-btn" type="button"><i className="fa fa-copy" aria-hidden="true"></i></button>
									{/* <button onClick={()=>this.saveQrImage(this.state.copyQrCode,this.state.selectedWorkflowName)} className="copy-code-btn" type="button"><i className="fa fa-download" aria-hidden="true"></i></button> */}
								</div>
							</div>
						</div>
					</div>
				</div>
					
			</div>	
		);
	}
}
