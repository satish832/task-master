import React, { Component } from 'react';
import $ from 'jquery';
import 'bootstrap';
import { CSVLink } from "react-csv";
import axios,{post,get} from 'axios';
import arrayMove from "./arrayMove";
import { ulid } from 'ulid'
import moment from 'moment';
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc';

export default class TaskManager extends Component {
	
	constructor(props){
        super(props);
		this.state ={
			catList:[],
			taskList:[],
			tasks:[],
			csvdata:[],
			file:'',
			taskId:'',
			taskName:'',
			taskStatus:'',
			fabCsvName:'Task-List-Format.csv',
		}
		this.csvLink = React.createRef();
    }
	
	componentDidMount() {
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
	
	getTaskList=()=>{
		let ApiUrl = $('#ApiUrl').val();
		let cat = $('#taskCt').val();
		
		let url = ApiUrl+'tasks/'+cat;
		let data = [];
		axios.get(url)
        .then(response => {
            data = response.data;
			this.setState({taskList:data});
        })
	}
	
	addCategory=()=>{
		let val = $('#addCategory').val();
		let ApiUrl = $('#ApiUrl').val();
		if(val){
			let url = ApiUrl+'add-list';
			let formData = new FormData();
			formData.append('name', val);
			//formData.append('pos', pos+1);;
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				if(response.data.name){
					this.getCategories();
					alert('The list name added successfully!');
					$('#addCategory').val('');
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}else{
			alert("Please insert the category value.");
		}
	}
	
	addTask=()=>{
		let val = $('#addTaskText').val();
		let cat = $('#taskCt').val();
		let ApiUrl = $('#ApiUrl').val();
		let taskStatus = $('#taskStatus').val();
		let UID = ulid();
		if(val && cat){
			let url = ApiUrl+'add-task';
			let formData = new FormData();
			formData.append('name', val);
			formData.append('list_name', cat);
			formData.append('uid', UID);
			formData.append('status', taskStatus);
			formData.append('pos', 1);;
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				if(response.data.name){
					this.getTaskList();
					alert('The task added successfully!');
					$('#addTaskText').val('');
					$('#taskStatus').val('Task');
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}else{
			alert("Please select the list name and insert the task name.");
		}
	}
	
	changeCategory=(event)=>{
		this.getTaskList();
	}
	
	handleOnChange=(e)=>{
		this.setState({file:e.target.files[0]});
    };

    downloadCsvFormat=()=>{
		let data = [
		  ["Name","Details","Do_Not_Share_Details","TaskListName","Task_List_Category","Type","Rank","Dependent_or_concurrent","Complex_Dependencies"],
		];

		let fileName = 'Task-List-Format.csv'
		this.setState({ csvdata:data, fabCsvName:fileName }, () => {
			let that = this;
			setTimeout(function(){ 
				that.csvLink.current.link.click()
			}, 5000);
		})
		
	}
	
    handleOnSubmit=(e)=>{
        e.preventDefault();
		let file = this.state.file;
		let that = this;
		const fileReader = new FileReader();
        if (this.state.file) {
            fileReader.onload = function (event) {
                const text = event.target.result;
				that.csvFileToArray(text);
            };
            fileReader.readAsText(file);
        }
    };
	
	csvFileToArray=(string)=>{
		const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
		const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");
		const cat = $('#taskCt').val();
		const array = csvRows.map(i => {
			i = i.replace('\r', '');
			const UID = ulid();
			let re = /,\s*(?=(?:[^"]|"[^"]*")*$)/g; 
			const values = i.split(re);
			const obj = csvHeader.reduce((object, header, index) => {
				header = header.replace('\r', '');
				if(values[index]){
					if(header == 'Name'){
						object[header] = values[index].replace(/^"|"$/g, '');
					}else{
						object[header] = values[index];
					}
				}
				object['Uid'] = UID;
				//object['Category'] = cat;
				return object;
			}, {});
			return obj;
		});
		//console.log('array->',array);
		if(array.length > 0){
			this.importTask(array);
		}
	};
	
	importTask=(array)=>{
		let ApiUrl = $('#ApiUrl').val();
		let url = ApiUrl+'import-task';
		let taskData = JSON.stringify(array);
		let formData = new FormData();
			formData.append('data', taskData);
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
				$('#csvFileInput').val('');
				alert(response.data);
				this.getCategories();
				//this.getTaskList();
			}
		}).catch(error => {
			alert('error::'+ error);
		})
	}
	
	deleteCategory=()=>{
		let cat = $('#taskCt').val();
		if(cat){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'delete-list/'+cat;
			axios({
				method: 'delete',
				url: url,
			})
			.then(response => {
				this.getCategories();
				if(response.data){
					alert(response.data);
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
	deleteTask=(id)=>{
		if(id){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'delete-task/'+id;
			let formData = new FormData();
			axios({
				method: 'delete',
				url: url,
			})
			.then(response => {
				this.getTaskList();
				if(response.data){
					alert(response.data);
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	}
	
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
	
	handleSubmit=()=>{
		let id = this.state.taskId;
		let name = this.state.taskName;
		let taskStatus = this.state.taskStatus;
		this.editTask(id,name,taskStatus);
		$('#editTasks').modal('hide');
	}
	
	editTask=(id,name,status)=>{
		let ApiUrl = $('#ApiUrl').val();
		
		if(id && name){
			let url = ApiUrl+'update-task/'+id;
			let formData = new FormData();
			formData.append('name', name);
			formData.append('status', status);
			axios({
				method: 'POST',
				url: url,
				data: formData,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				if(response.data == true){
					this.getTaskList();
					alert('The task updated successfully!');
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}else{
			alert("Please select the category and insert the task name.");
		}
	}
	
	onSortEnd = ({oldIndex, newIndex}) => {
		
		this.setState(({taskList}) => ({
		    taskList: arrayMove(taskList, oldIndex, newIndex),
		}));

		let newArray = [];
		this.state.taskList.map((val, i) => {
			let j = i+1;
			newArray[i] = {'id':val.id,'pos':j};
		})
		
		let that = this;
		if(newArray.length > 0){
			let ApiUrl = $('#ApiUrl').val();
			let url = ApiUrl+'task-manager/update_pos.php';
			axios({
				method: 'POST',
				url: url,
				data: newArray,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then(response => {
				if(response.data){
					//alert(response.data);
				}
			}).catch(error => {
				alert('error::'+ error);
			})
		}
	};
	
	taskExportData = () => {
		let taskList = this.state.taskList;
		let currentDate = new Date();

		let data = [
		  ["Name", "Details", "Do_Not_Share_Details", "TaskListName", "Task_List_Category", "Type", "Rank","Dependent_or_concurrent","Complex_Dependencies"],
		];
		
		let fields = [];
		taskList.map((task,i)=>{
			
			fields = [task['name'],task['share'],task['details'],task['list_name'],task['list_category'],task['status'],task['pos'],task['dependent_or_concurrent'],task['dependencies']];
			
			data.push(fields);
		});
		let category = $('#taskCt').val();
		let fileName = category+'_Tasks_'+moment(currentDate).format('MM_DD_YYYY HH_MM_SS')+'.csv'
		this.setState({ csvdata:data, taskCsvName:fileName }, () => {
			let that = this;
			setTimeout(function(){ 
				that.csvLink.current.link.click()
			}, 3000);
		})	
	}
	
	render() {
		
		const {catList,taskList,taskCsvName,fabCsvName} = this.state;
		let catOption = catList.map(function(val,i) {
			return (
				<option value={val['name']} key={i}>{val['name']}</option>
			);
		})
		
		let category = $('#taskCt').val();
		
		let that = this;
		const DragHandle = sortableHandle(() => <span className="showcase"></span>);
		const SortableItem = sortableElement(({value}) => {
			let text = value.name;
			let count = 45;
			let textLimit = text.slice(0, count) + (text.length > count ? "..." : "");
			
			return (<div id={value.id} className={'field-div'}><DragHandle /><span className="input-title task-input">{textLimit}</span><span className="input-status">{value.status}</span>
			<div className="edit-btns-status"><button type="button" className="btn code-dialog btn-edit"><i className="fa fa-edit" onClick={()=>this.editTaskInfo(value.id)}></i></button><button type="button" style={{color:'red'}} className="btn code-dialog btn-delete" onClick={() => { if (window.confirm('Are you sure you want to Delete this status?')) that.deleteTask(value.id)}}><i className="fa fa-trash"></i></button></div>
			</div>);
		});
		
		const SortableContainer = sortableContainer(({children}) => {
		  return <div className="status-inner">{children}</div>;
		});
		
		return (
			<div className="status-list">
				<div className="row">
					<div className="col-md-12 mb-4">
						<h4>Task List Manager</h4>
					</div>
				</div>
				<div className="row">
					<div className="col-md-6">
					<label>Add New Task List Name:</label>
						<div className="input-group">
							<input id="addCategory" className="form-control" name="addCategory" type="text" />
							<div className="input-group-append">
								<button className="btn btn-primary append-btn" type="button" onClick={this.addCategory}>Add</button>
							</div>
						</div>	
					</div>
					<div className="col-md-6">
						<label>Upload Task List:</label>
						<div className="input-group upload-box">
							<input className="form-control" type={"file"} id={"csvFileInput"} accept={".csv"} onChange={this.handleOnChange} />
							<div className="input-group-append">
								<button onClick={(e) => {this.handleOnSubmit(e)}} className="btn btn-primary append-btn" type="button">Upload</button>&nbsp;
								<button onClick={this.downloadCsvFormat} className="btn btn-primary" type="button">Download</button>
								<CSVLink
									data={this.state.csvdata}
									filename={fabCsvName}
									className="hidden"
									ref={this.csvLink}
									target="_blank" 
								/>
							</div>
						</div>
					</div>	
					<div className="col-md-6 mt-2">
						<div className="row">
							<div className="col-md-7 pr-0">
								<label>Task List Name:</label>
								<select id='taskCt' className="form-control" name="taskCt" onChange={this.changeCategory}>
									{catOption}
								</select>
								<button type="button" style={{color:'red',float:'right'}} className="btn code-dialog btn-delete" onClick={() => { if (window.confirm('Are you sure you want to Delete this list Name?')) this.deleteCategory()}}><i className="fa fa-trash"></i></button>
							</div>
							<div className="col-md-5 pl-0">
								<label>Task Type:</label>
								<select id='taskStatus' className="form-control" name="taskStatus">
									<option value="Task">Task</option>
									<option value="Subtask">Subtask</option>
									<option value="Status">Status</option>
									<option value="WIP Status">WIP Status</option>
								</select>
							</div>
						</div>
					</div>
					<div className="col-md-6 mt-2">
						<label>Add New Task:</label>
						<div className="input-group">
							<input id="addTaskText" className="form-control" name="addTaskText" type="text" />
							<div className="input-group-append">
								<button className="btn btn-primary append-btn" type="button" onClick={this.addTask}>Add</button>
							</div>
						</div>	
					</div>
				</div>
					
				{taskList ?
				<div className="tasks-table-div">
					{category ? <p className="task-list-label">"{category}" Task List</p> : ''}
					<SortableContainer onSortEnd={this.onSortEnd} useDragHandle>
						{taskList.map((value, index) => (
						  <SortableItem key={index} index={index} value={value} /> 
						))}
					</SortableContainer>
					
				</div>
				:null}
				
				{taskList && category ?
					<div className="fab-export-btn">
					<button type="button" className="float-right btn btn-outline-info" onClick={this.taskExportData}>Download Task List CSV</button>
						<CSVLink
							data={this.state.csvdata}
							filename={taskCsvName}
							className="hidden"
							ref={this.csvLink}
							target="_blank" 
						/>
					</div>
				:null}
				
				<div className="modal" id={'editTasks'}>
					<div className="modal-dialog modal-lg modal-sm select-modal">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title">Edit Task</h4>
								<button type="button" className="close" data-dismiss="modal">&times;</button>
							</div>
							<div className="modal-body">
								<label> Task Name: </label>
								<input className="form-control" type="text" name='taskName' onChange={this.getValue} value={this.state.taskName} />
								<label> Status: </label>
								<select className="form-control" name='taskStatus' value={this.state.taskStatus} onChange={this.getValue}>
									<option value="Task">Task</option>
									<option value="Subtask">Subtask</option>
									<option value="Status">Status</option>								
									<option value="WIP Status">WIP Status</option>								
								</select>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-primary float-left" onClick={()=>this.handleSubmit()}> Save </button>
								<button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
							</div>
						</div>
					</div>
				</div>
			</div>	
		);
	}
}
