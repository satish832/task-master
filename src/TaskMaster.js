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

class TaskMaster extends Component {
	
	constructor(props) {
        super(props);
	 	this.state ={
			taskManager:true,
			workFlow:false,
			workFlowManager:false,
			workFlowDetails:false,
			workFlowProgress:false,
			scheduledworkFlow:false,
			userManager:false,
	 	}
    }
   	
	builderOption = (event) => {
		let val = event.target.value;
		this.setState({workFlow:false,taskManager:false,workFlowManager:false,workFlowDetails:false,workFlowProgress:false,scheduledworkFlow:false,userManager:false});
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
		}
    }
	
    render(){
        const {taskManager,workFlow,workFlowManager,workFlowDetails,workFlowProgress,scheduledworkFlow,userManager} = this.state;
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
					
				</div>           
			</div>           
		)
	}
	
}

export default TaskMaster;