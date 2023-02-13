<?php
namespace App\Http\Controllers;
use App\ListName;
use App\Workflow;
use App\Task;
use DB;
use Illuminate\Http\Request;
use Google_Client;

class WorkflowController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }
	
	public function getWorkflowUsers()
    {
		$client = new Google_Client();
		//echo '<pre>'; print_r($client);
		$client->setApplicationName('Google Sheets API');
		$client->setScopes([\Google_Service_Sheets::SPREADSHEETS]);
		$client->setAccessType('offline');
		$path = getcwd().'/credentials.json';
		$client->setAuthConfig($path);
		$service = new \Google_Service_Sheets($client);
		$spreadsheetId = '1hMKADFhGiO7lOZ60Xgy3AkLDeL8s7i364y3QgMapdSA';
		$range = 'Task Master Logins'; // here we use the name of the Sheet to get all the rows
		$response = $service->spreadsheets_values->get($spreadsheetId, $range);
		$users = $response->getValues();
		//echo '<pre>'; print_r($users);
		$data = json_decode(file_get_contents('php://input'), true);
		if(isset($data['Facility_Id'])){
	
			$userData = [];
			$userRole = [];

			$n = 0;
			foreach($users[0] as $role){
				if($n > 3 ){
					$userRole[] = $role;
				}
				$n++;
			}

			$i = 0;
			foreach($users as $user){
				if($i > 0 && $data['Facility_Id'] == $user[3]){
					$s = 4;
					$roleWithPerson = [];
					foreach($userRole as $role){

						$str = explode(",",$users[$i][$s]);
						$person = [];
						foreach($str as $val){
							$stm = explode("|",$val);
							$person[] = array('person_Id'=>$stm[1],'person'=>$stm[0],'email_Id'=>$stm[2],);
							
						}
						$roleWithPerson[$role][] = $person;
						$s++;
					}

					$userData['user'][] = array(
					'username'=>$user[0],
					'userId'=>$user[1],
					'facilityId'=>$user[3],
					'role' => $roleWithPerson,
					);
				}
				$i++;
			}
			echo json_encode($userData, JSON_PRETTY_PRINT);
			
		}else{
			echo 'Invalid Data!';
		}
	}
	
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
	
	public function getAllGotolink()
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
	
	
	public function getWorkflowList($id=null)
    {
        $data = app('db')->select("SELECT wl.id as workflow_id,wl.user_id,wc.name as category,wl.action,wl.shareable,wl.facility_id,wl.name as workflow_name FROM workflows as wl INNER JOIN workflow_categories as wc ON wl.category = wc.id ORDER BY wl.id ASC;");
		
		if($id){
			$data = app('db')->select("SELECT wl.id as workflow_id,wl.user_id,wc.name as category,wl.action,wl.shareable,wl.facility_id,wl.name as workflow_name FROM workflows as wl INNER JOIN workflow_categories as wc ON wl.category = wc.id where wl.id = '".$id."' ORDER BY wl.id ASC;");
		}
		$data = json_decode(json_encode($data), true);
		$tableData = [];
		if($data){
			foreach($data as $val){
				$count = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$val['workflow_id']."'");
				$count = json_decode(json_encode($count), true);
				$val['workflow_days_assigned'] = $count['days'];
				$val['status'] = $val['action'] == 1 ? 'active' : 'inactive';
				$val['shareable'] = $val['shareable'] == 'Y' ? 'yes' : 'no';
				unset($val['action']);
				$tableData[] = $val;
			}
		}
		
		return response()->json($tableData);
		//return json_encode($tableData, JSON_PRETTY_PRINT);
    }
	
	public function getWorkflowListV2()
    {
        $data = json_decode(file_get_contents('php://input'), true);
		$tasks = [];
		$stmt = [];
		if(isset($data['Facility_Id']) && isset($data['User_Id'])){
			$stmt = app('db')->select("SELECT id as workflow_id,user_id,facility_id,action,shareable,name FROM workflows where user_id = '".$data['User_Id']."' AND facility_id = '".$data['Facility_Id']."' ORDER BY id ASC;");
		}else if(isset($data['Facility_Id'])){
			$stmt = app('db')->select("SELECT id as workflow_id,user_id,facility_id,action,shareable,name FROM workflows where facility_id = '".$data['Facility_Id']."' ORDER BY id ASC;");
		}else if(isset($data['User_Id'])){
			$stmt = app('db')->select("SELECT id as workflow_id,user_id,facility_id,action,shareable,name FROM workflows where user_id = '".$data['User_Id']."' ORDER BY id ASC;");
			
		}else{
			return 'Invalid Data!';
		}
		
		$tasks = json_decode(json_encode($stmt), true);
		
		if($tasks){
			$tData = [];
			foreach($tasks as $val){
				$stm = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$val['workflow_id']."'");
				$count = json_decode(json_encode($stm), true);
				$val['workflow_days_assigned'] = $count['days'];
				$val['status'] = $val['action'] == 1 ? 'active' : 'inactive';
				$val['shareable'] = $val['shareable'] == 'Y' ? 'yes' : 'no';
				unset($val['action']);
				$tData[] = $val;
			}
			
			$tableData['Workflows_List'] = $tData;
			
		}
		
		return json_encode($tableData, JSON_PRETTY_PRINT);
		//return response()->json($tableData);
    }
	
	public function getWorkflowListV3()
    {
        $data = json_decode(file_get_contents('php://input'), true);
		
		if(isset($data['Include_deactivated']) && isset($data['Include_non_shareable'])){
	
			$stmt = app('db')->select("SELECT id,user_id,facility_id,action,shareable,name FROM workflows ORDER BY id ASC;");
			$tasks = json_decode(json_encode($stmt), true);
			$list = [];
			
			if($tasks){
				
				foreach($tasks as $val){
					$stm = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$val['id']."'");
					$count = json_decode(json_encode($stm), true);
					$val['workflow_days_assigned'] = $count['days'];
					$val['status'] = $val['action'] == 1 ? 'active' : 'inactive';
					$val['shareable'] = $val['shareable'] == 'Y' ? 'yes' : 'no';
					unset($val['action']);
					
					if($data['Include_deactivated'] == 'no' && $val['status'] == 'inactive'){
						continue;
					}
					
					if($data['Include_non_shareable'] == 'no' && $val['shareable'] == 'no'){
						continue;
					}
					
					$list[] = $val; 
				}
				
			}
			
			$tableData['Workflows_List'] = $list;
			return json_encode($tableData, JSON_PRETTY_PRINT);
		}else{
			return 'Invalid Data!';
		}
    }
	
	
	public function getWorkflowProgress()
    {
		$stmt = app('db')->select("SELECT wip.id as WF_Job_ID,wip.workflow_id as workflow_ID, wl.name as workflow_name, wc.name as workflow_category, wip.patient_name, wip.username as Initiated_by, wip.type as Type,wip.branch_id as Branch, wip.start_date FROM workflow_in_progress as wip INNER JOIN workflows as wl ON wip.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id ORDER BY wip.id ASC;");
		$data = json_decode(json_encode($stmt), true);

		if($data){
			$workflowdata = [];
			foreach($data as $val){
				
				$stm = app('db')->selectOne("SELECT wpt.job_id,wpt.task_id,wpt.status,wt.role,wt.person,wt.person,wt.x_days_number,tl.uid,tl.name as task_name FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id INNER JOIN tasks as tl ON wt.task_id = tl.id where wpt.job_id = '".$val['WF_Job_ID']."' AND wpt.status != 'Complete' ORDER BY wpt.id ASC");
				$tdata = json_decode(json_encode($stm), true);
				
				$st = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$val['workflow_ID']."'");
				$count = json_decode(json_encode($st), true);
				
				
				
				if($tdata){
					$xday = $tdata['x_days_number'];
					if($xday){
						$val['due_date'] = date('Y-m-d', strtotime($val['start_date']. ' + '.$xday.' days'));
					}
					$val['workflow_days_assigned'] = $count['days'];
					$val['current_task_status'] = $tdata['status'];
					$val['current_task_name'] = $tdata['task_name'];
					$val['responsible_role'] = $tdata['role'];
					$val['responsible_person'] = $tdata['person'];
					
					$workflowdata[] = $val;
				}
				
			}
			
			$tableData['workflow_list'] = $workflowdata;
			return json_encode($tableData, JSON_PRETTY_PRINT);
		}else{
			return 'Data not found!';
		}
	}
	
	public function getWorkflowProgressV2()
    {
		
		$wid = json_decode(file_get_contents('php://input'), true);
		if(isset($wid['Wokflow_ID'])){
	
			$stmt = app('db')->select("SELECT wip.id as WF_Job_ID, wl.name as workflow_name, wc.name as workflow_category, wip.patient_name, wip.username as Initiated_by, wip.type as Type, wip.insurance_company,wip.branch_id as Branch, wip.start_date FROM workflow_in_progress as wip INNER JOIN workflows as wl ON wip.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id where wip.workflow_id= '".$wid['Wokflow_ID']."' ORDER BY wip.id ASC;");
			$data = json_decode(json_encode($stmt), true);
			
			$st = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$wid['Wokflow_ID']."'");
			$count = json_decode(json_encode($st), true);
			$workflow = [];
			if($data){
				
				$workflow = array('Wokflow_ID'=> $wid['Wokflow_ID'],'workflow_name'=> $data[0]['workflow_name'],'workflow_category'=> $data[0]['workflow_category'],"workflow_days_assigned"=>$count['days']);
				
				$workflowJobs = [];
				foreach($data as $work){
					$workflowTasks = [];
					$stm = app('db')->select("SELECT wpt.job_id,wpt.task_id,wpt.status,wt.role,wpt.person_id,wpt.person,wpt.days_spent,wt.x_days_number,wt.gotolink,tl.uid,tl.name as task_name,wpt.date_complete FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id INNER JOIN tasks as tl ON wt.task_id = tl.id where wpt.job_id = '".$work['WF_Job_ID']."' ORDER BY wpt.id ASC");
					$tdata = json_decode(json_encode($stm), true);
					
					$stv = app('db')->selectOne("SELECT SUM(days_spent) as days  FROM `workflow_progress_tasks` WHERE `job_id` = '".$work['WF_Job_ID']."'");
					$spent_dy = json_decode(json_encode($stv), true);
					
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
			return json_encode($workflow, JSON_PRETTY_PRINT);
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	
	public function getWorkflowProgressTasks()
    {
		
		$data = json_decode(file_get_contents('php://input'), true);
		
		if(isset($data['WF_Job_ID'])){
			
			$stmt = app('db')->selectOne("SELECT wip.id as WF_Job_ID, wl.id as workflow_ID, wl.name as workflow_name, wc.name as workflow_category, wip.patient_name, wip.patient_id, wip.username as Initiated_by, wip.type as Type,wip.branch_id as Branch, wip.start_date FROM workflow_in_progress as wip INNER JOIN workflows as wl ON wip.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id where wip.id= '".$data['WF_Job_ID']."' ORDER BY wip.id ASC;");
			$data = json_decode(json_encode($stmt), true);
					
			
			$stm = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$data['workflow_ID']."'");
			$count = json_decode(json_encode($stm), true);
			
			$st = app('db')->selectOne("SELECT SUM(days_spent) as days  FROM `workflow_progress_tasks` WHERE `job_id` = '".$data['WF_Job_ID']."'");
			$spent_dy = json_decode(json_encode($st), true);
			
			$data['workflow_days_assigned'] = $count['days'];
			$data['workflow_days_spent'] = $spent_dy['days'];
			
			if($data){
				$workflowTasks = [];
				$stmm = app('db')->select("SELECT wpt.job_id,wpt.task_id,wpt.task_uid,wpt.status,wpt.days_spent,wt.role,wpt.person_id,wpt.person,wt.pos,wt.gotolink,wt.x_days_number,tl.uid,tl.name as task_name FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id INNER JOIN tasks as tl ON wt.task_id = tl.id where wpt.job_id = '".$data['WF_Job_ID']."' ORDER BY wpt.job_id ASC");
				$tdata = json_decode(json_encode($stmm), true);
				
				
				
				$tasks = [];
				foreach($tdata as $val){
					
					$xday = $val['x_days_number'];
					$tasks['Task_name'] = $val['task_name'];
					$tasks['Task_Rank'] = $val['pos'];
					$tasks['Task_ID'] = $val['task_uid'];
					$tasks['Task_days_to_complete'] = $val['x_days_number'];
					$tasks['tasks_days_spent'] = $val['days_spent'];
					$tasks['Go_To_Link'] = $val['gotolink'];
					$tasks['Responsible_Role'] = $val['role'];
					$tasks['Responsible_Person_ID'] = $val['person_id'];
					$tasks['Responsible_Person'] = $val['person'];
					if($xday && $data['start_date']){
						$tasks['Due_Date'] = date('m-d-Y', strtotime($data['start_date']. ' + '.$xday.' days'));
						//$val['due_date'] = date('m-d-Y', strtotime($val['start_date']. ' + '.$xday.' days'));
					}

					$tasks['Status'] = $val['status'];
					
					$workflowTasks[] = $tasks;
				}
				
				unset($data['start_date']);
				$workflowData = $data;
				$workflowData['Tasks'] = $workflowTasks;
				return json_encode($workflowData, JSON_PRETTY_PRINT);
			}else{
				return 'Data not found!';
			}
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	public function workflowInitiate()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		
		if(isset($data['Workflow_Id'])){
	
			$workflow_id = $data['Workflow_Id'];
			$username = $data['Username'];
			$user_id = $data['User_Id'];
			$branch_id = $data['Branch_Id'];
			$link_url = $data['Link_Url'];
			$patient_name = $data['Patient_name'];
			$patient_id = $data['Patient_ID'];
			$rx_id = $data['Rx_ID'];
			$claim_id = $data['Claim_ID'];
			$insurance_company = $data['Insurance_company'];
			$start_date = date("Y-m-d");
			$type = $data['Type'];
			
			$stm = app('db')->insert("INSERT INTO workflow_in_progress (workflow_id,username,user_id,branch_id,link_url,patient_name,patient_id,rx_id,claim_id,insurance_company,start_date,type) VALUES ('".$workflow_id."','".$username."','".$user_id."','".$branch_id."','".$link_url."','".$patient_name."','".$patient_id."','".$rx_id."','".$claim_id."','".$insurance_company."','".$start_date."','".$type."')");
			
			if($stm){
				$sm = app('db')->selectOne("SELECT id FROM workflow_in_progress ORDER BY id DESC");
				$sm = json_decode(json_encode($sm), true);
				$jobId = $sm['id'];
				//echo '<pre>'; print_r($tasks);
				$stmt = app('db')->select("SELECT wt.*,tl.uid FROM workflow_tasks as wt INNER JOIN tasks as tl ON wt.task_id = tl.id where wt.workflow_id = '".$workflow_id."' ORDER BY pos ASC");
				$tasks = json_decode(json_encode($stmt), true);
				
				if($tasks){
					foreach($tasks as $val){
						$taskUid = $val['uid'].'-'.$jobId;
						
						$SQL = app('db')->insert("INSERT INTO workflow_progress_tasks (job_id,wid,task_id,task_uid,person_id,person,person_email,status) VALUES ('".$jobId."','".$workflow_id."','".$val['task_id']."','".$taskUid."','".$val['person_id']."','".$val['person']."','".$val['person_email']."','".$val['task_option']."')");
					}
				}

				$result = 'The Workflow Started successufuly.';
			}
			
			return $result;
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	public function scheduledWorkflowInitiate()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		
		if(isset($data['Workflow_Id'])){
			$workflow_id = $data['Workflow_Id'];
			$username = 'Task Master-1';
			$user_id = '01G8GMHWBC7K41G3ZSMEM4Y3NB';
			$start_date = $data['Start_date'];
			$start_time = $data['Start_time'].':00';
			$type = 'Prosthetics';
			
			$stm = app('db')->insert("INSERT INTO scheduled_workflow (workflow_id,username,user_id,start_date,start_time,type) VALUES ('".$workflow_id."','".$username."','".$user_id."','".$start_date."','".$start_time."','".$type."')");
			
			if($stm){
				return 'The scheduled Workflow added successufuly.';
			}

			
		}else{
			return 'Invalid Data!';
		}
	}
	
	public function getScheduledWorkflow()
    {
		$stmt = app('db')->select("SELECT wt.id as Scheduled_Job_Id, wt.workflow_id, wl.name, wt.username, wt.patient_id, wt.patient_name, wt.start_date, wt.start_time, wc.name as category FROM scheduled_workflow as wt INNER JOIN workflows as wl ON wt.workflow_id = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id ORDER BY wt.id ASC;");
		$data = json_decode(json_encode($stmt), true);
		if($data){
			return json_encode($data, JSON_PRETTY_PRINT);
		}
	}
	
	public function changeTaskStatus()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if($data['WF_Job_ID'] && $data['Task_ID']){
			$date = date('m-d-Y-');
			if($data['Status'] == 'Complete'){
				$SQL = app('db')->update("UPDATE workflow_progress_tasks SET status='".$data['Status']."' WHERE job_id='".$data['WF_Job_ID']."', date_complete='".$date."' AND task_uid='".$data['Task_ID']."'");
			}else{
				$SQL = app('db')->update("UPDATE workflow_progress_tasks SET status='".$data['Status']."' WHERE job_id='".$data['WF_Job_ID']."' AND task_uid='".$data['Task_ID']."'");
			}
			
			if($SQL){
				$sm = app('db')->selectOne("SELECT job_id,wid,task_id FROM workflow_progress_tasks WHERE job_id='".$data['WF_Job_ID']."' AND job_id='".$data['Task_ID']."'");
				$task = json_decode(json_encode($sm), true);
				
				if($task['task_id']){
					$job_id = $task['job_id'];
					$wid = $task['wid'];
					$task_id = $task['task_id'];
					$note = 'Status changed to '.$data['Status'].' by '.$data['User'];
					
					$stm = app('db')->insert("INSERT INTO task_notes (job_id,wid,task_id,note) VALUES ('".$job_id."','".$wid."','".$task_id."','".$note."')");
				}
				
				return 'The task status changed successfully!';
			}
		}
	}
	
	public function getTaskStatus()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if($data['WF_Job_ID'] && $data['Task_ID']){
	
			$stm = app('db')->selectOne("SELECT wpt.job_id,wpt.task_id,wpt.person,wpt.days_spent,tl.name as task_title,wpt.status,wt.x_days_number,wt.role,wnt.start_date,wpt.date_complete FROM workflow_progress_tasks as wpt INNER JOIN workflow_in_progress as wnt ON wnt.id = wpt.job_id INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id INNER JOIN tasks as tl ON wt.task_id = tl.id where wpt.job_id = '".$data['WF_Job_ID']."' AND wpt.task_uid = '".$data['Task_ID']."'");
			$tdata = json_decode(json_encode($stm), true);
			$xday = $tdata['x_days_number'];
			$dueDate = $tdata['start_date'];
			if($xday){
				$dueDate = date('Y-m-d', strtotime($tdata['start_date']. ' + '.$xday.' days'));
			}
			
			$taskData = array(
				"WF_Job_ID" => $tdata['job_id'],
				"Task_ID" => $tdata['task_id'],
				"Task_Title" => $tdata['task_title'],
				"Task_days_to_complete" => $tdata['x_days_number'],
				"Task_days_spent" => $tdata['days_spent'],
				"Responsible_role" => $tdata['role'],
				"Responsible_person_completed_by" => $tdata['person'],
				"Due_Date" => $dueDate,
				"Current_status" => $tdata['status'],
				"Date_Completed" => $tdata['date_complete'],
			);
			
			return json_encode($taskData, JSON_PRETTY_PRINT);
		}
	}
	
	public function getActiveTasks()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		
		if($data['Responsible_Person_ID']){
	
			$personId = $data['Responsible_Person_ID'];
			$oldDate = $data['Oldest_Due_Date'];
			$NewDate = $data['Newest_Due_Date'];
			$active = $data['Only_show_active_in_table'];

			$stm = app('db')->select("SELECT wpt.*,wt.role,wt.gotolink,wt.details_note,wt.x_days_number,wt.x_days_number,tl.uid,tl.name,tl.list_name,wit.start_date,wit.link_url,wit.patient_id,wit.branch_id,wit.patient_name,wl.name as workflow_name, wc.name as workflow_category FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id AND wt.task_id = wpt.task_id INNER JOIN workflow_in_progress as wit ON wit.id = wpt.job_id INNER JOIN workflows as wl ON wpt.wid = wl.id INNER JOIN workflow_categories as wc ON wl.category = wc.id INNER JOIN tasks as tl ON wpt.task_id = tl.id ORDER BY wpt.job_id ASC");
			
			$tdata = json_decode(json_encode($stm), true);
			$tasks = [];
			$pre = 0;
			
			foreach($tdata as $val){
				$previousTask = [];
				$sm = app('db')->selectOne("SELECT wpt.*,wt.x_days_number FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id where wpt.id < '".$val['id']."' AND wpt.job_id = '".$val['job_id']."' ORDER BY id DESC LIMIT 1");
				$previousTask = json_decode(json_encode($sm), true);

				$xday = $val['x_days_number'];
				
				$startDate = date('Y-m-d',  strtotime($val['start_date']));
				
				if($previousTask){
					
					if($previousTask['status'] == 'Complete'){
						$str = $previousTask['x_days_number'] - $previousTask['days_spent'];
						$pre = $pre - $str;
					}
					
					$pre+= $previousTask['x_days_number'];
					$xday = $pre + $val['x_days_number'];
					
					$nDate = $xday - $val['x_days_number'];
					$startDate = date('Y-m-d',  strtotime($val['start_date']. ' + '.$nDate.' days'));

				}else{
					$pre = 0;
				}
				
				$days_spent = 0;

				if(strtotime(date('Y-m-d')) > strtotime($startDate)){
					$diff = abs(strtotime(date('Y-m-d')) - strtotime($startDate));
					$days_spent = floor($diff/(60*60*24));
				}
				
				$val['due_date'] = date('m-d-Y', strtotime($val['start_date']. ' + '.$xday.' days'));
				
					
				$stm = app('db')->selectOne("SELECT SUM(x_days_number) as days  FROM `workflow_tasks` WHERE `workflow_id` = '".$val['wid']."'");
				$count = json_decode(json_encode($stm), true);

				$task['Job_ID'] = $val['job_id'];
				$task['Workflow_Category'] = $val['workflow_category'];
				$task['Workflow_ID'] = $val['wid'];
				$task['Workflow_Name'] = $val['workflow_name'];
				
				$task['workflow_days_assigned'] = $count['days'];
				$task['Workflow_days_spent_cumulative'] = 0;
				$task['Workflow_days_spent_complete'] = 0;
				
				$task['Responsible_person_ID'] = $val['person_id'];
				$task['Responsible_person'] = $val['person'];
				$task['Patient_ID'] = $val['patient_id'];
				$task['Patient_Name'] = $val['patient_name'];
				$task['Branch'] = $val['branch_id'];
				
				$task['Task_UID'] = $val['task_uid'];
				$task['Task_name'] = $val['name'];
				$task['task_days_to_complete'] = $val['x_days_number'];
				$task['task_days_spent'] = $val['status'] == 'Complete' ? $val['days_spent'] : $days_spent;
				
				$task['Status'] = $val['status'];
				$task['Due_Date'] = $val['due_date'];
				$task['Link'] = $val['link_url'];
				$task['Go_To_Link'] = $val['gotolink'];
				$task['View_Link'] = 'http://soogap.info/build?wid='.$val['job_id'];
				
				$tasks[] = $task;

			}
			
			sort($tasks);
			
			if($tasks){
				
				$wdays_spent = [];
				$wdays_spent_c = [];
				foreach($tasks as $vts){
					
					if(isset($wdays_spent[$vts['Job_ID']])){
						$wdays_spent[$vts['Job_ID']]+= $vts['task_days_spent'];
					}else{
						$wdays_spent[$vts['Job_ID']]= $vts['task_days_spent'];
					}
					
					if($vts['Status'] == 'Complete'){
						if(isset($wdays_spent_c[$vts['Job_ID']])){
							$wdays_spent_c[$vts['Job_ID']]+= $vts['task_days_spent'];
						}else{
							$wdays_spent_c[$vts['Job_ID']]= $vts['task_days_spent'];
						}
					}
				}
				
				$responsileTasks = [];
				//echo '<pre>'; print_r($tasks);
				foreach($tasks as $tx){
					
					if($active == 'yes'){
						$stm = app('db')->selectOne("SELECT * FROM workflow_progress_tasks as wpt INNER JOIN workflow_tasks as wt ON wt.workflow_id = wpt.wid AND wt.task_id = wpt.task_id where wpt.job_id = '".$tx['Job_ID']."' AND wpt.status != 'Complete' ORDER BY wt.pos ASC");
						$tsk = json_decode(json_encode($stm), true);
						if($tx['Task_UID'] != $tsk['task_uid']){
							continue;
						}
					}
					
					//echo '<pre>'; print_r($tx);
					
					$Due_Date = explode('-', $tx['Due_Date']);
					$Due_Date  = date('Y-m-d', strtotime(implode('-', array_reverse($Due_Date))));
					
					$oldDate = explode('-', $oldDate);
					$oldDate  = date('Y-m-d', strtotime(implode('-', array_reverse($oldDate))));
					
					$NewDate = explode('-', $NewDate);
					$NewDate  = date('Y-m-d', strtotime(implode('-', array_reverse($NewDate))));
						
					if($tx['Responsible_person_ID'] == $personId && $Due_Date >= $oldDate && $tx['Due_Date'] <= $NewDate){
						if(isset($wdays_spent[$tx['Job_ID']])){
							$tx['Workflow_days_spent_cumulative'] = $wdays_spent[$tx['Job_ID']];
						}
						if(isset($wdays_spent_c[$tx['Job_ID']])){
							$tx['Workflow_days_spent_complete'] = $wdays_spent_c[$tx['Job_ID']];
						}
						$responsileTasks[] = $tx;
					}
				}
			}
			
			$tasksData = array(
				"Responsible_Person_ID" => $personId,
				"Oldest_Due_Date" => $oldDate,
				"Newest_Due_Date" => $NewDate,
				"tasks" => $responsileTasks,
			);
			
			return json_encode($tasksData, JSON_PRETTY_PRINT);
		}
	}
	
	public function createUsers()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		$bytes = random_bytes(14);
		$user_guid = '01'.strtoupper(bin2hex($bytes));

		if(isset($data['User'])){
			
			$User = $data['User'];
			$Facility_name = $data['Facility_name'];
			$FacilityID = $data['Facility_ID'];
			$Responsible_role = $data['Responsible_role'];
			$Person = $data['Person'];
			$Email_ID = $data['Email_ID'];
			
			$ssa = app('db')->selectOne("SELECT id FROM authors WHERE `user_name` = '".$User."'");
			$exist_user = json_decode(json_encode($ssa), true);
			
			if($exist_user['id']){
				$user_id = $exist_user['id'];
			}else{
				$stm = app('db')->insert("INSERT INTO authors (user_name,user_guid,facility_id,facility_name) VALUES ('".$User."','".$user_guid."','".$FacilityID."','".$Facility_name."')");
				
				$sm = app('db')->selectOne("SELECT id FROM authors where user_name ='".$User."'");
				$user = json_decode(json_encode($sm), true);
				
				$user_id = $user['id'];
			}

			if($user_id){
				
				$sa = app('db')->selectOne("SELECT id FROM responsible_role WHERE `role` = '".$Responsible_role."'");
				$exist = json_decode(json_encode($sa), true);
				
				if($exist['id']){
					$role_id = $exist['id'];
				}else{
					$stma = app('db')->insert("INSERT INTO responsible_role (role) VALUES ('".$Responsible_role."')");
					
					$sa = app('db')->selectOne("SELECT id FROM responsible_role WHERE `role` = '".$Responsible_role."'");
					$role = json_decode(json_encode($sa), true);
					$role_id = $role['id'];
				}

				if($user_id && $role_id){
					
					$sb = app('db')->selectOne("SELECT id FROM responsible_person WHERE `user_id` = '".$user_id."' AND `role_id` = '".$role_id."' AND `person` = '".$Person."'");
					$exist_person = json_decode(json_encode($sb), true);
					
					
					if(!$exist_person['id']){
						$sm = app('db')->insert("INSERT INTO responsible_person (user_id,role_id,person,person_email) VALUES ('".$user_id."','".$role_id."','".$Person."','".$Email_ID."')");
					}
				}
				
				$result = 'The User data added successufuly.';
			}
			
			return $result;
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	public function getUsers()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if(isset($data['Facility_ID'])){
			$Facility_ID = $data['Facility_ID'];
			$stm = app('db')->select("SELECT id as user_id, user_guid, user_name, facility_id, facility_name FROM authors WHERE `facility_id` = '".$Facility_ID."' ORDER BY id ASC");
		}else{
			$stm = app('db')->select("SELECT id as user_id, user_guid, user_name, facility_id, facility_name FROM authors ORDER BY id ASC");
		}

		$tdata = json_decode(json_encode($stm), true);
					
		$userData = [];
		foreach($tdata as $val){
			
			$stma = app('db')->select("SELECT rp.id as person_id,rp.person,rp.person_email,rr.role FROM responsible_person as rp INNER JOIN responsible_role as rr ON rp.role_id = rr.id WHERE rp.user_id = '".$val['user_id']."' ORDER BY rp.id ASC");
			$pdata = json_decode(json_encode($stma), true);
			$person = [];
			foreach($pdata as $vl){
				$role = $vl['role'];
				unset($vl['role']);
				$person[$role][] = $vl;
			}
			
			$val['responsible_role'] = $person;
			
			$userData[] = $val;
			
		}

		return json_encode($userData, JSON_PRETTY_PRINT);
	}
	
	public function createGotoLink()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		
		if(isset($data['URL'])){
	
			$FacilityID = $data['FacilityID'];
			$Category = $data['Category'];
			$Type = $data['Type'];
			$Friendly_name = $data['Friendly_name'];
			$URL = $data['URL'];
			
			$stm = app('db')->insert("INSERT INTO gotolink (facility_id,category,name,type,url) VALUES ('".$FacilityID."','".$Category."','".$Friendly_name."','".$Type."','".$URL."')");
			
			if($stm){
				$result = 'The GoToLink added successufuly.';
			}
			
			return $result;
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	public function getGotoLink()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if(isset($data['FacilityID'])){
	
			$FacilityID = $data['FacilityID'];
			$Category = $data['Category'];
			$Type = $data['Type'];
			
			if($FacilityID && $Category && $Type){
				$stmt = app('db')->select("SELECT * FROM gotolink WHERE `facility_id` = '".$FacilityID."' AND `category` = '".$Category."' AND `type` = '".$Type."' ORDER BY id ASC");
			}else if($FacilityID && $Category == '' && $Type  == ''){
				$stmt = app('db')->select("SELECT * FROM gotolink WHERE `facility_id` = '".$FacilityID."' ORDER BY id ASC");
			}else if($FacilityID == '' && $Category == '' && $Type  == ''){
				$stmt = app('db')->select("SELECT * FROM gotolink ORDER BY id ASC");
			}
			
			$data = json_decode(json_encode($stmt), true);
			$tableData = [];
			$newData = [];
			if($data){
				foreach($data as $val){
					$newData['Go_to_link_ID'] = $val['id']; 
					$newData['Friendly_Name'] = $val['name']; 
					$newData['Category'] = $val['category']; 
					$newData['Type'] = $val['type']; 
					$newData['URL'] = $val['url']; 
					$tableData[] = $newData;
				}
			}

			return json_encode($tableData, JSON_PRETTY_PRINT);
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	
	public function deleteGotoLink()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if(isset($data['GoToLink_ID'])){
	
			$stm = app('db')->delete("DELETE FROM gotolink WHERE id='".$data['GoToLink_ID']."'");
			if($stm){
				$result = 'The GoToLink deleted successufuly.';
			}
			return $result;
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	public function removeScheduledWorkflow()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if(isset($data['Scheduled_Job_Id'])){
	
			$stm = app('db')->delete("DELETE FROM scheduled_workflow WHERE id='".$data['Scheduled_Job_Id']."'");
			if($stm){
				$result = 'The scheduled workflow deleted successufuly.';
			}
			return $result;
			
		}else{
			return 'Invalid Data!';
		}
	}
	
	public function editScheduledWorkflow()
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if(isset($data['Scheduled_Job_Id'])){
			
			app('db')->update("UPDATE scheduled_workflow SET start_date='".$data['start_date']."', start_time='".$data['start_time']."', recurring='".$data['Repeat']."', repeat_after='".$data['Repeat_after']."', repeat_every='".$data['Repeat_every']."', repeat_on='".$data['repeat_on']."' WHERE id='".$data['Scheduled_Job_Id']."'");
			
			echo 'The Scheduled Workflow updated successufuly!';
		}else{
			echo 'Something went wrong!';
		}
	}
	
	public function editTask($id)
    {
		$data = json_decode(file_get_contents('php://input'), true);
		if($id){
			$query = '';
			if($data['name'] != 'xxx'){
				$query .= "name='".$data['name']."'";
			}
			if($data['list_name'] != 'xxx'){
				$query .= ", list_name='".$data['list_name']."'";
			}
			if($data['list_category'] != 'xxx'){
				$query .= ", list_category='".$data['list_category']."'";
			}
			if($data['status'] != 'xxx'){
				$query .= ", status='".$data['status']."'";
			}
			if($data['details'] != 'xxx'){
				$query .= ", details='".$data['details']."'";
			}
			
			if($data['share'] != 'xxx'){
				$query .= ", share='".$data['share']."'";
			}
			if($data['dependent_or_concurrent'] != 'xxx'){
				$query .= ", dependent_or_concurrent='".$data['dependent_or_concurrent']."'";
			}
			if($data['dependencies'] != 'xxx'){
				$query .= ", dependencies='".$data['dependencies']."'";
			}
			
			//app('db')->update("UPDATE tasks SET name='".$data['name']."', list_name='".$data['list_name']."', list_category='".$data['list_category']."', status='".$data['status']."', details='".$data['details']."', share='".$data['share']."', dependent_or_concurrent='".$data['dependent_or_concurrent']."', dependencies='".$data['dependencies']."' WHERE id='".$id."'");
			app('db')->update("UPDATE tasks SET ".$query." WHERE id='".$id."'");
			
			echo 'The task updated successufuly!';
		}else{
			echo 'Something went wrong!';
		}
	}
	
}
