<?php
namespace App\Http\Controllers;
use App\ListName;
use App\Workflow;
use App\Task;
use DB;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    
	public function getWorkflow()
    {
        $workflow = app('db')->select("SELECT * FROM workflows WHERE action='1' ORDER BY id ASC;");
		return response()->json($workflow);
    }
	
	public function getWorkflows()
    {
        $workflows = Workflow::all();
		
		$workflowlist = [];
		
		foreach($workflows as $val){
			
			$tasks = app('db')->select("SELECT wt.* FROM workflow_tasks as wt INNER JOIN tasks as tl ON wt.task_id = tl.id where wt.workflow_id = '".$val['id']."'");
			
			$days = 0;
			foreach($tasks as $tsk){
				$days = $days + $tsk->x_days_number;
			}
			$val['total_days'] = $days;
			
			$workflowlist[] = $val;
		}
		return response()->json($workflowlist);
    }
	
	public function getProWorkflow()
    {
        $workflows = app('db')->select("SELECT wt.*, wl.name, wc.name as category FROM workflow_in_progress as wt INNER JOIN workflows as wl ON wt.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id ORDER BY id ASC;");
		
		
		if($workflows){
			$workflowdata = [];
			foreach($workflows as $val){
				$val = json_decode(json_encode($val), true);
				$tdata = app('db')->selectOne("SELECT wpt.*,wt.role,wt.person_id as old_person_id,wt.person as old_person,wt.person_email as old_person_email,wt.gotolink,wt.details_note,wt.x_days_number,tl.uid,tl.name,tl.list_name FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id INNER JOIN tasks as tl ON wpt.task_id = tl.id where wpt.job_id = '".$val['id']."' AND wpt.status != 'Complete' ORDER BY wt.pos ASC");
				$tdata = json_decode(json_encode($tdata), true);
				$days = app('db')->selectOne("SELECT SUM(wpt.days_spent) as workflow_days_spent FROM workflow_progress_tasks as wpt where wpt.job_id = '".$val['id']."'");
				$days = json_decode(json_encode($days), true);
				
				$val['workflow_days_spent'] = $days['workflow_days_spent'];
				$xday = isset($tdata['x_days_number']) + $days['workflow_days_spent'];
				
				
				$days_spent = 0;
				
				$startDate = date('Y-m-d', strtotime($val['start_date']. ' + '.$days['workflow_days_spent'].' days'));
				if(strtotime(date('Y-m-d')) > strtotime($startDate)){
					$diff = abs(strtotime(date('Y-m-d')) - strtotime($startDate));
					$days_spent = floor($diff/(60*60*24));
				}
				
				if($days_spent > 0){
					$val['workflow_days_spent'] = $days_spent + $days['workflow_days_spent'];
				}
				
				$tdata['days_spent'] =  $days_spent;
				$tdata['task_start_date'] =  $startDate;
				if($xday){
					$val['due_date'] = date('Y-m-d', strtotime($val['start_date']. ' + '.$xday.' days'));
				}
				$val['task'] = $tdata;
				$workflowdata[] = $val;
			}	
		}
		
		return response()->json($workflowdata);
    }
	
	public function getCategories()
    {
        $cats = app('db')->select("SELECT * FROM workflow_categories ORDER BY id ASC");
		return response()->json($cats);
    }
	
	public function getAuthors()
    {
        $authors = app('db')->select("SELECT * FROM authors ORDER BY id ASC");
		return response()->json($authors);
    }
	
	public function getAuthorsRes()
    {
        $authors = app('db')->select("SELECT * FROM authors ORDER BY id ASC");
		$authors = json_decode(json_encode($authors), true);
		$userData = [];
		foreach($authors as $val){
			$pdata = app('db')->select("SELECT rp.id as person_id,rp.person,rp.person_email,rr.role FROM responsible_person as rp INNER JOIN responsible_role as rr ON rp.role_id = rr.id WHERE rp.user_id = '".$val['id']."' ORDER BY rp.id ASC");
			$pdata = json_decode(json_encode($pdata), true);
			$person = [];
			foreach($pdata as $vl){
				$role = $vl['role'];
				unset($vl['role']);
				$person[$role][] = $vl;
			}
			
			$val['responsible_role'] = $person;
			
			$userData[] = $val;
			
		}
		
		return response()->json($userData);
    }
	
	public function getWorkflowTasks($id)
    {
        $tasks = app('db')->select("SELECT wt.*,tl.id,tl.uid,tl.name,tl.list_name,tl.status FROM workflow_tasks as wt INNER JOIN tasks as tl ON wt.task_id = tl.id where wt.workflow_id = '".$id."' ORDER BY wt.pos ASC");
		return response()->json($tasks);
    }
	
	public function getWorkflowsV2()
    {
        $tasks = app('db')->select("SELECT wt.*, wl.name, wc.name as category FROM scheduled_workflow as wt INNER JOIN workflows as wl ON wt.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id ORDER BY id ASC;");
		return response()->json($tasks);
    }
	
	public function getGotolink()
    {
        $gotolinks = app('db')->select("SELECT * FROM gotolink ORDER BY id ASC");
		return response()->json($gotolinks);
    }
	
	public function addWorkflow(Request $request)
    {
        $data = $request->all();
		
		if($_POST['name'] && $_POST['ids']){
	
			$name = $_POST['name'];
			$uid = $_POST['uid'];
			$user_id = $_POST['user_id'];
			$facility_id = $_POST['facility_id'];
			$string = $_POST['ids'];
			$ids = explode (",", $string);
			
			
			$exist = app('db')->select("SELECT id FROM workflows where uid ='".$uid."'");
			
			$stm = app('db')->select("SELECT * FROM workflows");
			$rank = count($stm)+1;
			
			if(!$exist){
				
				$insert = app('db')->insert("INSERT INTO workflows (name,uid,user_id,facility_id,task_ids,rank) VALUES ('".$name."','".$uid."','".$user_id."','".$facility_id."','".$string."','".$rank."')");
				
				$lastId = app('db')->select("SELECT id FROM workflows where name ='".$name."'");
				$workflow_id = $lastId[0]->id;
				$pos = 1;
				if($workflow_id){
					
					foreach($ids as $id){
						
						$stmt = app('db')->select("SELECT share,details FROM tasks where id ='".$id."'");
						
						$share = $stmt[0]->share ? $stmt[0]->share : 'Y';
						$details = $stmt[0]->details ? $stmt[0]->details : '';
						
						$insert = app('db')->insert("INSERT INTO workflow_tasks (workflow_id,task_id,details_note,share,pos) VALUES ('".$workflow_id."','".$id."','".$details."','".$share."','".$pos."')");
						
						$pos++;

					}
					
					echo $result = 'The Workflow saved successfully.';
				}
				
			}else{
				echo $result = 'The Workflow already existed.';
			}
			
		}
    }
	
	public function updateWorkflowTasks($id, Request $request)
    {
        $data = $request->all();
		
		if($id && $data['ids']){
	
			$string = $data['ids'];
			$taskIds = explode (",", $string);
			
			app('db')->update("UPDATE workflows SET task_ids='".$string."' WHERE id='".$id."'");
			
			$pos = 1;
			
			foreach($taskIds as $taskId){
						
				$exist = app('db')->select("SELECT id FROM workflow_tasks where workflow_id='".$id."' AND task_id ='".$taskId."'");
				
				if(!$exist){
			
					app('db')->insert("INSERT INTO workflow_tasks (workflow_id,task_id,pos) VALUES ('".$id."','".$taskId."','".$pos."')");
					
				}else{
					app('db')->update("UPDATE workflow_tasks SET pos='".$pos."' WHERE workflow_id='".$id."' AND task_id='".$taskId."'");
				}

				$pos++;
				

			}
			echo 'The Workflow updated successfully!';
		}else{
			echo 'Something went wrong!';
		}
    }
	
	public function importWorkflow(Request $request)
    {
        $data = $request->all();
		
		if($data['name'] && $data['tasks']){
	
			$name = $data['name'];
			$uid = $data['uid'];
			$user_id = $data['user_id'];
			$facility_id = $data['facility_id'];
			$tasks = json_decode($data['tasks']);
			$result ='';
			$ids = [];
			foreach($tasks as $val){
				$ids[] = $val->task_id;
			}
			
			$string = implode(",",$ids);
			
			$exist = app('db')->select("SELECT id FROM workflows where uid ='".$uid."'");
			$stm = app('db')->select("SELECT * FROM workflows");
			$rank = count($stm)+1;
			
			if(!$exist){
				
				$insert = app('db')->insert("INSERT INTO workflows (name,uid,user_id,facility_id,task_ids,rank) VALUES ('".$name."','".$uid."','".$user_id."','".$facility_id."','".$string."','".$rank."')");
				
				$lastId = app('db')->select("SELECT id FROM workflows where name ='".$name."'");
				$workflow_id = $lastId[0]->id;
				$pos = 1;
				if($workflow_id){
					
					foreach($tasks as $val){
						$task_id = $val->task_id;
						$task_option = $val->task_option;
						$x_days = $val->x_days;
						$x_days_number = $val->x_days_number;
						$role = $val->role;
						$completed_before = $val->completed_before;
						$send_message = $val->send_message;
						$synchronize = $val->synchronize;
						$details_note = $val->share == 'No' ? $val->details_note : '';
						$share = $val->share;
						
						$smt= app('db')->insert("INSERT INTO workflow_tasks (workflow_id,task_id,task_option,x_days,x_days_number,role,completed_before,send_message,synchronize,details_note,share,pos) VALUES ('".$workflow_id."','".$task_id."','".$task_option."','".$x_days."','".$x_days_number."','".$role."','".$completed_before."','".$send_message."','".$synchronize."','".$details_note."','".$share."','".$pos."')");
						
						$pos++;
						
					}
					
					$result = 'The Workflow saved successfully.';
				}
				
			}else{
				$result = 'The Workflow already existed.';
			}
			echo $result;
			
		}
    }
	
	public function deleteWorkflow($id)
    {
        
		$smt = app('db')->select("SELECT rank FROM workflows where id ='".$id."'");
		$rank = $smt[0]->rank;
		
		if($rank){
			app('db')->update("UPDATE workflows pd INNER JOIN workflows pd2 ON (pd.rank=pd2.rank) SET pd.rank = pd2.rank-1 WHERE pd.rank > '".$rank."'");
		}
		
		Workflow::where('id','=', $id)->delete();
		
		app('db')->delete("DELETE FROM workflow_tasks WHERE workflow_id='".$id."'");
		
		return response('The Workflow deleted successfully!', 200);
    }
	
	public function deleteWorkflowTask($id, Request $request)
    {
        $data = $request->all();
		app('db')->delete("DELETE FROM workflow_tasks WHERE workflow_id='".$id."' AND task_id='".$data['taskId']."'");
		
    }
	
	
	public function updateWorkflow($id, Request $request)
    {
        
		$data = $request->all();
		
		if($data['name']){
			
			$name = $data['name'];
			$category = $data['category'];
			$shareable = $data['shareable'];
			$rank = $data['rank'];
			
			$smt = app('db')->select("SELECT rank FROM workflows where id ='".$id."'");
			$existRank = $smt[0]->rank;
			
			$smt = app('db')->select("SELECT id FROM workflows where rank ='".$rank."'");
			$rantExist = $smt[0]->id;
			
			if($id != $rantExist['id']){
		
				if($existRank && $rank < $existRank){
					
					app('db')->update("UPDATE workflows pd INNER JOIN workflows pd2 ON (pd.rank=pd2.rank) SET pd.rank = pd2.rank+1 WHERE pd.rank >= '".$rank."' and pd.rank <= '".$existRank."'");
					
				}else if($existRank && $rank > $existRank){
					
					app('db')->update("UPDATE workflows pd INNER JOIN workflows pd2 ON (pd.rank=pd2.rank) SET pd.rank = pd2.rank-1 WHERE pd.rank <= '".$rank."' and pd.rank >= '".$existRank."'");
					
				}else if(!$existRank){
					
					app('db')->update("UPDATE workflows pd INNER JOIN workflows pd2 ON (pd.rank=pd2.rank) SET pd.rank = pd2.rank+1 WHERE pd.rank >= '".$rank."'");
					
				}
			}
			
			if($name && $category){
				
				$SQL = app('db')->update("UPDATE workflows SET name='".$name."', category='".$category."', shareable='".$shareable."', rank='".$rank."' WHERE id='".$id."'");
				
				if($SQL){
					echo 'The Workflow updated successfully.';
				}
			}
			
		}
    }
	
	public function updateWorkflowTasksV2(Request $request)
    {
        
		$data = $request->all();
		
		if($data['taskId']){
			
			$taskId = $data['taskId'];
			$personRole = $data['personRole'];
			$personId = $data['personName'] ? $data['personId'] : 0;
			$personName = $data['personName'];
			$personEmail = $data['personName'] ? $data['personEmail'] : '';
			//$workflowOption = $data['workflowOption'];
			$startDate = $data['startDate'];
			$xDays = $data['xDays'];
			$xDaysNumber = $data['xDaysNumber'];
			$completedBefore = $data['completedBefore'];
			$sendMessage = $data['sendMessage'];
			$synchronize = $data['synchronize'];
			$detailsNote = $data['detailsNote'];
			//$wipNote = $data['wipNote'];
			$doNotShare = $data['doNotShare'];
			$gotolink = $data['gotolink'];
			
			$smt = app('db')->select("SELECT id FROM workflow_tasks where id ='".$taskId."'");
			$exist = $smt[0]->id;
			
			if($exist){
		
				$SQL = app('db')->update("UPDATE workflow_tasks SET role='".$personRole."', person_id='".$personId."', person='".$personName."', person_email='".$personEmail."', due_date='".$startDate."', x_days='".$xDays."', x_days_number='".$xDaysNumber."', completed_before='".$completedBefore."', send_message='".$sendMessage."', synchronize='".$synchronize."', details_note='".$detailsNote."', share='".$doNotShare."', gotolink='".$gotolink."' WHERE id='".$taskId."'");
				
				if ($SQL){
					echo 'The Task updated successufuly.';
				}
			}
		}
    }
	
	public function actionWorkflow($id, Request $request)
    {
		$data = $request->all();
		if($id){
			app('db')->update("UPDATE workflows SET action='".$data['val']."'WHERE id='".$id."'");			
		}
    }
	
	public function getJobDetails($id)
    {
		
		if($id){
			
			$data = app('db')->selectOne("SELECT wt.*, wl.name, wc.name as category FROM workflow_in_progress as wt INNER JOIN workflows as wl ON wt.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id where wt.id = '".$id."' ORDER BY id ASC;");
			$data = json_decode(json_encode($data), true);
			
			$workflowTasks = [];
			$tdata = app('db')->select("SELECT wpt.id,wpt.job_id,wpt.wid,wpt.task_id,wpt.days_spent,wpt.status,wt.role,wpt.person_id,wpt.person,wt.x_days_number,wt.gotolink,wt.details_note,tl.uid,tl.name as task_name FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id INNER JOIN tasks as tl ON wt.task_id = tl.id where wpt.job_id = '".$id."' ORDER BY wpt.job_id ASC");
			
			$tdata = json_decode(json_encode($tdata), true);
			
			$tasks = [];
			$pre = 0;
			
			foreach($tdata as $val){
		
				$previousTask = [];
				
				$previousTask = app('db')->selectOne("SELECT wpt.*,wt.x_days_number FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id where wpt.id < '".$val['id']."' AND wpt.job_id = '".$val['job_id']."' ORDER BY id DESC LIMIT 1");
				$previousTask = json_decode(json_encode($previousTask), true);

				$xday = $val['x_days_number'];
				
				$startDate = date('Y-m-d',  strtotime($data['start_date']));
				
				if($previousTask){
					
					if($previousTask['status'] == 'Complete'){
						$str = $previousTask['x_days_number'] - $previousTask['days_spent'];
						$pre = $pre - $str;
					}
					
					$pre+= $previousTask['x_days_number'];
					$xday = $pre + $val['x_days_number'];
					
					$nDate = $xday - $val['x_days_number'];
					$startDate = date('Y-m-d',  strtotime($data['start_date']. ' + '.$nDate.' days'));

				}else{
					$pre = 0;
				}
				
				$days_spent = 0;
				
				if(!$previousTask || $previousTask['status'] == 'Complete'){
					if(strtotime(date('Y-m-d')) > strtotime($startDate)){
						$diff = abs(strtotime(date('Y-m-d')) - strtotime($startDate));
						$days_spent = floor($diff/(60*60*24));
					}
				}
				$val['days_spent'] = $val['status'] == 'Complete' ? $val['days_spent'] : $days_spent;
				$tasks[] = $val;
				
			}
			
			
			$data['tasks'] = $tasks;
			//echo json_encode($data, JSON_PRETTY_PRINT);
			return response()->json($data);
		}else{
			echo 'Invalid URL!';
		}
		
    }
	
	
	public function getWorkflowInProgressV2($id)
    {
		if($id){
			
			$data = app('db')->select("SELECT wip.id as WF_Job_ID, wl.name as workflow_name, wc.name as workflow_category, wip.patient_name, wip.username as Initiated_by, wip.type as Type, wip.insurance_company,wip.branch_id as Branch, wip.start_date FROM workflow_in_progress as wip INNER JOIN workflows as wl ON wip.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id where wip.workflow_id= '".$id."' ORDER BY wip.id ASC;");
			$data = json_decode(json_encode($data), true);
			
			$count = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$id."'");
			$count = json_decode(json_encode($count), true);
			
			$workflow = array('Wokflow_ID'=> $id,'workflow_name'=> $data[0]['workflow_name'],'workflow_category'=> $data[0]['workflow_category'],"workflow_days_assigned"=>$count['days']);
			if($data){
				$workflowJobs = [];
				foreach($data as $work){
					$workflowTasks = [];
					$tdata = app('db')->select("SELECT wpt.job_id,wpt.task_id,wpt.status,wt.role,wpt.person_id,wpt.person,wpt.days_spent,wt.x_days_number,wt.gotolink,tl.uid,tl.name as task_name,wpt.date_complete FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id INNER JOIN tasks as tl ON wt.task_id = tl.id where wpt.job_id = '".$work['WF_Job_ID']."' ORDER BY wpt.id ASC");
					$tdata = json_decode(json_encode($tdata), true);
					
					$spent_dy = app('db')->selectOne("SELECT SUM(days_spent) as days  FROM `workflow_progress_tasks` WHERE `job_id` = '".$work['WF_Job_ID']."'");
					$spent_dy = json_decode(json_encode($spent_dy), true);
					
					$jobId['WF_Job_ID'] = $work['WF_Job_ID'];
					$jobId['workflow_days_assigned'] = $count['days'];
					$jobId['wokflows_days_spent'] = $spent_dy['days'];
					$jobId['patient_name'] = $work['patient_name'];
					$jobId['Initiated_by'] = $work['Initiated_by'];
					$jobId['insurance_company'] = $work['insurance_company'];
					$jobId['Type'] = $work['Type'];
					$jobId['Branch'] = $work['Branch'];
					$jobId['Due_Date'] = $work['start_date'];
					
					$tasks = [];
					$i=1;
					foreach($tdata as $val){
						$taskCount = 'Task_'.$i;
						$xday = $val['x_days_number'];
						$tasks['Task_name'] = $val['task_name'];
						$tasks['Task_ID'] = $val['uid'].'-'.$work['WF_Job_ID'];
						$tasks['task_days_to_complete'] = $val['x_days_number'];
						$tasks['task_days_spent'] = $val['days_spent'];
						$tasks['Responsible_Role'] = $val['role'];
						$tasks['Responsible_Person_ID'] = $val['person_id'];
						$tasks['Responsible_Person'] = $val['person'];
						$tasks['gotolink'] = $val['gotolink'];
						if($xday && $work['start_date']){
							$tasks['Due_Date'] = date('Y-m-d', strtotime($work['start_date']. ' + '.$xday.' days'));
						}
						$tasks['Status'] = $val['status'];
						$tasks['Date_Completed'] = $val['date_complete'];
						
						$workflowTasks[] = $tasks;
						
						//unset($tasks[$taskCount]);
						$i++;
					}
					
					unset($work['start_date']);
					if($workflowTasks){
						$jobId['Tasks'] = $workflowTasks;
						$workflowJobs[] = $jobId;
					}
					//echo json_encode($workflowData, JSON_PRETTY_PRINT);
				}
				
				
			}
			$workflow['jobs'] = $workflowJobs;
			//echo json_encode($workflow, JSON_PRETTY_PRINT);
			return response()->json($workflow);
			
		}else{
			echo 'Invalid Data!';
		}
	}
	
	public function updatePerson(Request $request)
    {
		$data = $request->all();
		if($data['Id'] && $data['person_id']){
			$SQL = app('db')->update("UPDATE workflow_progress_tasks SET person_id='".$data['person_id']."', person='".$data['person']."', person_email='".$data['person_email']."' WHERE id='".$data['Id']."'");
			if($SQL){
				$task = app('db')->selectOne("SELECT job_id,wid,task_id FROM workflow_progress_tasks WHERE id='".$_POST['Id']."'");
				$task = json_decode(json_encode($task), true);
				
				if($task['task_id']){
					$job_id = $task['job_id'];
					$wid = $task['wid'];
					$task_id = $task['task_id'];
					$note = 'Status changed to '.$data['option'].' by '.$data['user'];
					
					$smt= app('db')->insert("INSERT INTO task_notes (job_id,wid,task_id,note) VALUES ('".$job_id."','".$wid."','".$task_id."','".$note."')");
				}

			}
		}
    }
	
	public function getTaskNote(Request $request)
    {
		$data = $request->all();
		
		if($data['task_id']){
			$smt = app('db')->select("SELECT * FROM task_notes WHERE `job_id` = '".$data['job_id']."' AND `wid` = '".$data['wid']."' AND `task_id` = '".$data['task_id']."' ORDER BY id desc");
			$smt = json_decode(json_encode($smt), true);
			$tableData = [];
			if($smt){
				foreach($smt as $val){
					$date = date('m/d/Y H:i:s', strtotime($val['date']));
					$note = $date. ' - ' .$val['note'];
					
					$tableData[] = $note;
				}
			}

			//echo json_encode($tableData, JSON_PRETTY_PRINT);
			return response()->json($tableData);
		}else{
			echo 'Invalid URL!';
		}
		
    }
	
	public function addTaskNote(Request $request)
    {
		$data = $request->all();
		if($data['task_id'] && $data['note']){
			$job_id = $_POST['job_id'];
			$wid = $_POST['wid'];
			$task_id = $_POST['task_id'];
			$note = $_POST['note'];
			$smt= app('db')->insert("INSERT INTO task_notes (job_id,wid,task_id,note) VALUES ('".$job_id."','".$wid."','".$task_id."','".$note."')");
		}else{
			echo 'Invalid Data!';
		}
		
    }
	
	public function updateOption(Request $request)
    {
		$data = $request->all();
		if($data['Id'] && $data['option']){
			app('db')->update("UPDATE workflow_tasks SET task_option='".$data['option']."'WHERE id='".$data['Id']."'");			
		}
		
    }
	
	public function updateOptionV2(Request $request)
    {
		$data = $request->all();
		if($data['Id'] && $data['option']){
			
			app('db')->update("UPDATE workflow_tasks SET task_option='".$data['option']."'WHERE id='".$data['Id']."'");
			
			if($data['option'] == 'Complete'){
				$SQL = app('db')->update("UPDATE workflow_progress_tasks SET status='".$data['option']."', days_spent='".$data['days']."', date_complete='".$data['date']."' WHERE id='".$data['Id']."'");
			}else{
				$SQL = app('db')->update("UPDATE workflow_progress_tasks SET status='".$data['option']."', days_spent='".$data['days']."' WHERE id='".$data['Id']."'");
			}
			
			if($SQL){
				
				$task = app('db')->selectOne("SELECT job_id,wid,task_id FROM workflow_progress_tasks WHERE id='".$data['Id']."'");
				$task = json_decode(json_encode($task), true);
				if($task['task_id']){
					$job_id = $task['job_id'];
					$wid = $task['wid'];
					$task_id = $task['task_id'];
					$note = 'Status changed to '.$data['option'].' by '.$data['user'];
					
					$smt= app('db')->insert("INSERT INTO task_notes (job_id,wid,task_id,note) VALUES ('".$job_id."','".$wid."','".$task_id."','".$note."')");
	
				}
			}
			
		}
		
    }
	
	public function updateWorkflowName($id, Request $request)
    {
		$data = $request->all();
		if($id && $data['name']){
			app('db')->update("UPDATE workflows SET name='".$data['name']."' WHERE id='".$id."'");			
		}
		
    }
	
	
	public function updateSchWorkflow(Request $request)
    {
        $data = $request->all();
		
		if($data['workflowId']){
	
			app('db')->update("UPDATE scheduled_workflow SET username='".$data['workflowUsername']."', user_id='".$data['workflowUsernameId']."', branch_id='".$data['branchId']."', link_url='".$data['linkUrl']."', patient_name='".$data['patientName']."', patient_id='".$data['patientId']."', rx_id='".$data['rxId']."', claim_id='".$data['claimId']."', insurance_company='".$data['insuranceCompany']."', start_date='".$data['startDate']."', start_time='".$data['startTime']."', recurring='".$data['recurring']."', repeat_after='".$data['repeatAfter']."', repeat_every='".$data['repeatEvery']."', repeat_on='".$data['repeatOnDay']."', type='".$data['type']."' WHERE id='".$data['workflowId']."'");
			
			echo 'The Scheduled Workflow updated successufuly!';
		}else{
			echo 'Something went wrong!';
		}
    }
	
	public function getDetailsWorkflowTasks($id)
    {
        $workflow = app('db')->select("SELECT wt.*,tl.uid,tl.name,tl.list_name,tl.status FROM workflow_tasks as wt INNER JOIN tasks as tl ON wt.task_id = tl.id where wt.workflow_id = '".$id."' ORDER BY wt.pos ASC");
		return response()->json($workflow);
    }

	
}