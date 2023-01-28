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
	
	public function login(Request $request)
    {
        $user = User::whereUsername($request->username)->wherePassword($request->password)->first();
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