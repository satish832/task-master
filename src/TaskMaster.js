import React,{ Component } from 'react';
import $ from 'jquery';
import MainHeader from "./component/Header/MainHeader";
import TaskManager from "./component/TaskManager";
import WorkFlowManger from "./component/WorkFlowManger";
import WorkFlowBuilder from "./component/WorkFlowBuilder";
import WorkFlowDetails from "./component/WorkFlowDetails";
import WorkFlowProgress from "./component/WorkFlowProgress";
import ScheduledworkFlow from "./component/ScheduledworkFlow";
import UserManager from "./component/UserManager";
import GoToTask from "./component/goToTask";

class TaskMaster extends Component {
	
	constructor(props) {
        super(props);
	 	this.state ={
			taskManager:localStorage.getItem('role') == 'Subscriber' || localStorage.getItem('role') == 'General' ? false : true,
			workFlow:false,
			workFlowManager:false,
			workFlowDetails:false,
			workFlowProgress:localStorage.getItem('role') == 'Subscriber' ? true : false,
			scheduledworkFlow:false,
			userManager:false,
			goToTask:localStorage.getItem('role') == 'General' ? true : false,
	 	}
    }
   	
	builderOption = (event) => {
		let val = event.target.value;
		this.setState({workFlow:false,taskManager:false,workFlowManager:false,workFlowDetails:false,workFlowProgress:false,scheduledworkFlow:false,userManager:false,goToTask:false});
		if(val == 'workFlow'){
			this.setState({workFlow:true});
		}else if(val == 'taskManager'){
			this.setState({taskManager:true});
		}else if(val == 'workFlowManger'){
			this.setState({workFlowManager:true});
		}else if(val == 'workFlowDetails'){
			this.setState({workFlowDetails:true});
		}else if(val == 'workFlowProgress'){
			this.setState({workFlowProgress:true});
		}else if(val == 'scheduledworkFlow'){
			this.setState({scheduledworkFlow:true});
		}else if(val == 'userManager'){
			this.setState({userManager:true});
		}else if(val == 'goToTask'){
			this.setState({goToTask:true});
		}
    }
	
    render(){
        const {taskManager,workFlow,workFlowManager,workFlowDetails,workFlowProgress,scheduledworkFlow,userManager,goToTask} = this.state;
    	return (
			<div className="full-container">
				<div className="card">
					<MainHeader builderOption = {this.builderOption} />
					<div id="wrapper" className="main-content toggled">
					{taskManager ? 
						<TaskManager />
					:null}
					
					{workFlow ? 
						<WorkFlowBuilder />
					:null}
					
					{workFlowManager ? 
						<WorkFlowManger />
					:null}
					</div>
					{workFlowDetails ? 
						<WorkFlowDetails />
					:null}
					
					{workFlowProgress ? 
						<WorkFlowProgress />
					:null}
					
					{scheduledworkFlow ? 
						<ScheduledworkFlow />
					:null}
					
					{userManager ? 
						<UserManager />
					:null}
					
					{goToTask ? 
						<GoToTask />
					:null}
					
				</div>           
			</div>           
		)
	}
	
}

export default TaskMaster;