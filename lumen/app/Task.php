<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uid', 'name', 'list_name', 'list_category', 'status', 'details', '	share', 'pos', 'dependent_or_concurrent', 'dependencies', 'created_at'
    ];

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [];
}