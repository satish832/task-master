<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\ListName;
use App\Task;
use Illuminate\Http\Request;

class TaskManagerController extends Controller
{
    /* public function __construct()
    {
        $this->middleware('auth');
    } */
	
	public function getListName()
    {
        return response()->json(ListName::all());
    }

	public function addListName(Request $request)
    {
        $list = ListName::create($request->all());

        return response()->json($list, 201);
    }

	public function getAllTasks()
    {
        return response()->json(Task::get());
    }
	
	public function getTasks($id)
    {
        return response()->json(Task::where('list_name', urldecode($id))->get());
    }
	
	public function getTaskById($id)
    {
        return response()->json(Task::where('id', urldecode($id))->get());
    }
	
	
	
	public function addTask(Request $request)
    {
        $task = Task::create($request->all());

        return response()->json($task, 201);
    }
	
	public function updateTask($id, Request $request)
    {
        $task = Task::findOrFail($id)->update([
           'name' => $request['name'],
           'status' => $request['status'],
        ]);

        return response()->json($task, 200);
    }
	
	public function importTask(Request $request)
    {
        $tasks = $request->all();
        //echo '<pre>'; print_r($tasks['data']);
		$array = json_decode($tasks['data']);
        //echo '<pre>'; print_r($array);
		
		//$task = Task::create($request->all());

        //return response()->json($task, 201);
    }
	
	public function deleteList($id)
    {
        $name = urldecode($id);
		ListName::where('name','=', $name)->delete();
		Task::where('list_name','=', $name)->delete();
        return response('List name deleted successfully!', 200);
    }
	
	public function deleteTask($id)
    {
        Task::findOrFail($id)->delete();
        return response('Task deleted successfully!', 200);
    }

   /*  public function showOneAuthor($id)
    {
        return response()->json(Author::find($id));
    }

    public function create(Request $request)
    {
        $author = Author::create($request->all());

        return response()->json($author, 201);
    }

    public function update($id, Request $request)
    {
        $author = Author::findOrFail($id);
        $author->update($request->all());

        return response()->json($author, 200);
    }

    public function delete($id)
    {
        Author::findOrFail($id)->delete();
        return response('Deleted Successfully', 200);
    } */
}