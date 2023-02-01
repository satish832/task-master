<?php
namespace App\Http\Controllers;
use App\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    
	public function showAllUsers()
    {
        return response()->json(User::all());
    }
	
	public function addUser(Request $request)
    {
        try {
            $user = User::create($request->all()); 
			return response()->json($user, 201);
        } catch(\Illuminate\Database\QueryException $e){
            $errorCode = $e->errorInfo[1];
            if($errorCode == '1062'){
                return response()->json([
					'success' => false,
					'message' => 'Username or Email already exist!',
				], 400);
            }
        }

        
    }
	
	public function login(Request $request)
    {
        $user = User::whereUsername($request->username)->wherePassword($request->password)->whereStatus(1)->first();
		if($user){
			$str = '0123456789ABCIJKLMNOPQRmnopqrstuvwxyz';
			$apiToken = base64_encode($str);
			return response()->json([
			'success' => true,
			'message' => 'Login Success!',
			'accessToken' => $apiToken,
			'user' => $user,
			], 201);
		} else {
			return response()->json([
				'success' => false,
				'message' => 'Login  fail!',
			], 400);
		}
		
        die;
    }
	
	public function signup(Request $request)
    {
        
		
		 try {
            $user = User::create($request->all()); 
			return response()->json($user, 201);
        } catch(\Illuminate\Database\QueryException $e){
            $errorCode = $e->errorInfo[1];
            if($errorCode == '1062'){
                return response()->json([
					'success' => false,
					'message' => 'Username or Email already exist!',
				], 400);
            }
        }

        
    }
	
	public function userApproved($id, Request $request)
    {
        $user = User::findOrFail($id)->update([
           'status' => $request['val'],
        ]);

        return response()->json($user, 200);
    }
	
	public function updateUser($id, Request $request)
    {
        if($request['password']){
			$user = User::findOrFail($id)->update([
			   'username' => $request['username'],
			   'password' => $request['password'],
			]);
		}else{
			$user = User::findOrFail($id)->update([
			   'username' => $request['username'],
			]);
		}
		
        return response()->json($user, 200);
    }
	
	public function updateUserRole($id, Request $request)
    {
        if($request['role']){
			
			$user = User::findOrFail($id)->update([
			   'role' => $request['role'],
			]);
			
			return response()->json($user, 200);
		}
    }
	
	public function deleteUser($id)
    {
        User::findOrFail($id)->delete();
        return response('User deleted successfully', 200);
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