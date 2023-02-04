<?php

/** @var \Laravel\Lumen\Routing\Router $router */

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$router->group(['prefix' => '/'], function () use ($router) {
	$router->get('users',  ['uses' => 'UserController@showAllUsers']);
	$router->post('add-user',  ['uses' => 'UserController@addUser']);
	$router->post('user-approve/{id}',  ['uses' => 'UserController@userApproved']);
	$router->post('update-user/{id}',  ['uses' => 'UserController@updateUser']);
	$router->delete('delete-user/{id}',  ['uses' => 'UserController@deleteUser']);
	$router->post('update-user-role/{id}',  ['uses' => 'UserController@updateUserRole']);
	$router->post('login',  ['uses' => 'UserController@login']);
	$router->post('signup',  ['uses' => 'UserController@signup']);
	
	$router->get('list-name',  ['uses' => 'TaskManagerController@getListName']);
	$router->post('add-list',  ['uses' => 'TaskManagerController@addListName']);
	$router->get('all-tasks',  ['uses' => 'TaskManagerController@getAllTasks']);
	$router->get('tasks/{id}',  ['uses' => 'TaskManagerController@getTasks']);
	$router->post('add-task',  ['uses' => 'TaskManagerController@addTask']);
	$router->post('import-task',  ['uses' => 'TaskManagerController@importTask']);
	$router->post('update-task/{id}',  ['uses' => 'TaskManagerController@updateTask']);
	$router->delete('delete-task/{id}',  ['uses' => 'TaskManagerController@deleteTask']);

	$router->get('workflow-categories',  ['uses' => 'WorkflowController@getCategories']);
	$router->post('add-workflow',  ['uses' => 'WorkflowController@addWorkflow']);
	$router->get('workflows',  ['uses' => 'WorkflowController@getWorkflows']);
	$router->get('workflow',  ['uses' => 'WorkflowController@getWorkflow']);
	$router->get('workflow-tasks/{id}',  ['uses' => 'WorkflowController@getWorkflowTasks']);
	$router->post('import-workflow',  ['uses' => 'WorkflowController@importWorkflow']);
	$router->delete('delete-workflow/{id}',  ['uses' => 'WorkflowController@deleteWorkflow']);
	$router->post('update-workflow/{id}',  ['uses' => 'WorkflowController@updateWorkflow']);
	$router->post('update-workflow-name/{id}',  ['uses' => 'WorkflowController@updateWorkflowName']);
	$router->post('update-workflow-tasks/{id}',  ['uses' => 'WorkflowController@updateWorkflowTasks']);
	$router->post('update-workflow-tasks-v2',  ['uses' => 'WorkflowController@updateWorkflowTasksV2']);
	$router->post('workflow-action/{id}',  ['uses' => 'WorkflowController@actionWorkflow']);
	$router->get('authors',  ['uses' => 'WorkflowController@getAuthors']);
	$router->get('authors-responsible',  ['uses' => 'WorkflowController@getAuthorsRes']);
	$router->post('delete-workflow-task/{id}',  ['uses' => 'WorkflowController@deleteWorkflowTask']);
	$router->get('workflows-v2',  ['uses' => 'WorkflowController@getWorkflowsV2']);
	$router->post('update-scheduled-workflow',  ['uses' => 'WorkflowController@updateSchWorkflow']);
	$router->get('gotolink',  ['uses' => 'WorkflowController@getAllGotolink']);
	$router->get('details-workflow-tasks/{id}',  ['uses' => 'WorkflowController@getDetailsWorkflowTasks']);
	$router->post('update-option',  ['uses' => 'WorkflowController@updateOption']);
	$router->post('update-option-v2',  ['uses' => 'WorkflowController@updateOptionV2']);
	$router->post('update-person',  ['uses' => 'WorkflowController@updatePerson']);
	$router->get('pro-workflows',  ['uses' => 'WorkflowController@getProWorkflow']);
	$router->post('add-task-note',  ['uses' => 'WorkflowController@addTaskNote']);
	$router->post('task-note',  ['uses' => 'WorkflowController@getTaskNote']);
	$router->get('workflow-job-details/{id}',  ['uses' => 'WorkflowController@getJobDetails']);
	$router->get('workflows-in-progress-v2/{id}',  ['uses' => 'WorkflowController@getWorkflowInProgressV2']);
	
	//swaggerhub API
	$router->get('workflow-list',  ['uses' => 'WorkflowController@getWorkflowList']);
	$router->post('workflow-users',  ['uses' => 'WorkflowController@getWorkflowUsers']);
	$router->get('workflow-list/{id}',  ['uses' => 'WorkflowController@getWorkflowList']);
	$router->post('workflow-list-v2',  ['uses' => 'WorkflowController@getWorkflowListV2']);
	$router->post('workflow-list-v3',  ['uses' => 'WorkflowController@getWorkflowListV3']);
	$router->get('workflows-progress',  ['uses' => 'WorkflowController@getWorkflowProgress']);
	$router->get('get-scheduled-workflow',  ['uses' => 'WorkflowController@getScheduledWorkflow']);
	$router->post('workflows-progress-v2',  ['uses' => 'WorkflowController@getWorkflowProgressV2']);
	$router->post('workflows-progress-tasks',  ['uses' => 'WorkflowController@getWorkflowProgressTasks']);
	$router->post('workflow-initiate',  ['uses' => 'WorkflowController@workflowInitiate']);
	$router->post('scheduled-workflow-initiate',  ['uses' => 'WorkflowController@scheduledWorkflowInitiate']);
	$router->post('change-task-status',  ['uses' => 'WorkflowController@changeTaskStatus']);
	$router->post('get-task-status',  ['uses' => 'WorkflowController@getTaskStatus']);
	$router->post('get-active-tasks',  ['uses' => 'WorkflowController@getActiveTasks']);
	$router->post('create-users',  ['uses' => 'WorkflowController@createUsers']);
	$router->post('get-users',  ['uses' => 'WorkflowController@getUsers']);
	$router->post('create-goto-link',  ['uses' => 'WorkflowController@createGotoLink']);
	$router->post('get-goto-link',  ['uses' => 'WorkflowController@getGotoLink']);
	$router->post('delete-goto-link',  ['uses' => 'WorkflowController@deleteGotoLink']);
	$router->post('remove-scheduled-workflow',  ['uses' => 'WorkflowController@removeScheduledWorkflow']);

});