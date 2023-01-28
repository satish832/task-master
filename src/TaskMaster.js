import React,{ Component } from 'react';
import $ from 'jquery';
import MainHeader from "./component/Header/MainHeader";
import TaskManager from "./component/TaskManager";
import WorkFlowManger from "./component/WorkFlowManger";
import WorkFlowBuilder from "./component/WorkFlowBuilder";
import WorkFlowDetails from "./component/WorkFlowDetails";
import WorkFlowProgress from "./component/WorkFlowProgress";
import ScheduledworkFlow from "./component/ScheduledworkFlow";

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
	 	}
    }
   	
	builderOption = (event) => {
		let val = event.target.value;
		if(val == 'workFlow'){
			this.setState({workFlow:true,taskManager:false,workFlowManager:false,workFlowDetails:false,workFlowProgress:false,scheduledworkFlow:false});
		}else if(val == 'taskManager'){
			this.setState({workFlow:false,taskManager:true,workFlowManager:false,workFlowDetails:false,workFlowProgress:false,scheduledworkFlow:false});
		}else if(val == 'workFlowManger'){
			this.setState({workFlow:false,taskManager:false,workFlowManager:true,workFlowDetails:false,workFlowProgress:false,scheduledworkFlow:false});
		}else if(val == 'workFlowDetails'){
			this.setState({workFlow:false,taskManager:false,workFlowManager:false,workFlowDetails:true,workFlowProgress:false,scheduledworkFlow:false});
		}else if(val == 'workFlowProgress'){
			this.setState({workFlow:false,taskManager:false,workFlowManager:false,workFlowDetails:false,workFlowProgress:true,scheduledworkFlow:false});
		}else if(val == 'scheduledworkFlow'){
			this.setState({workFlow:false,taskManager:false,workFlowManager:false,workFlowDetails:false,workFlowProgress:false,scheduledworkFlow:true});
		}
    }
	
    render(){
        const {taskManager,workFlow,workFlowManager,workFlowDetails,workFlowProgress,scheduledworkFlow} = this.state;
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
				</div>           
			</div>           
		)
	}
	
}

export default TaskMaster;