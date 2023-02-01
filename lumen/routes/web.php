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
	$router->get('gotolink',  ['uses' => 'WorkflowController@getGotolink']);
	$router->get('details-workflow-tasks/{id}',  ['uses' => 'WorkflowController@getDetailsWorkflowTasks']);
	$router->post('update-option',  ['uses' => 'WorkflowController@updateOption']);
	$router->post('update-option-v2',  ['uses' => 'WorkflowController@updateOptionV2']);
	$router->post('update-person',  ['uses' => 'WorkflowController@updatePerson']);
	$router->get('pro-workflows',  ['uses' => 'WorkflowController@getProWorkflow']);
	$router->post('add-task-note',  ['uses' => 'WorkflowController@addTaskNote']);
	$router->post('task-note',  ['uses' => 'WorkflowController@getTaskNote']);
	$router->get('workflow-job-details/{id}',  ['uses' => 'WorkflowController@getJobDetails']);
	$router->get('workflows-in-progress-v2/{id}',  ['uses' => 'WorkflowController@getWorkflowInProgressV2']);

});