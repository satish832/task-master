<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uid', 'user_id', 'facility_id', 'category', 'name', 'task_ids', '	rank', 'action', 'shareable'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}