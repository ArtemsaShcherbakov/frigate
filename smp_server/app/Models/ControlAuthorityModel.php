<?php

namespace App\Models;

use CodeIgniter\Model;

class ControlAuthorityModel extends Model
{
    protected $table = 'control_authorities';
    protected $primaryKey = 'id';
    
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    
    /**
     * Поля, которые можно заполнять
     */
    protected $allowedFields = [
        'name_authority',
    ];
    
    /**
     * Правила валидации
     */
    protected $validationRules = [
        'name_authority' => [
            'label' => 'Название контролирующего органа',
            'rules' => 'required|min_length[3]|max_length[500]|is_unique[control_authorities.name_authority,id,{id}]'
        ],
    ];
    
    /**
     * Сообщения об ошибках
     */
    protected $validationMessages = [
        'name_authority' => [
            'required' => 'Поле "Название контролирующего органа" обязательно',
            'min_length' => 'Название должно содержать минимум 3 символа',
            'max_length' => 'Название не может быть длиннее 500 символов',
            'is_unique' => 'Такой контролирующий орган уже существует',
        ],
    ];
    
    protected $skipValidation = false;
    
    /**
     * Автоматические timestamp
     */
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $dateFormat = 'datetime';
    
    /**
     * Callbacks
     */
    protected $allowCallbacks = true;
    protected $beforeInsert = ['prepareData'];
    protected $beforeUpdate = ['prepareData'];
    
    /**
     * Подготовка данных перед сохранением
     */
    protected function prepareData(array $data)
    {
        if (isset($data['data']['name_authority'])) {
            $data['data']['name_authority'] = trim($data['data']['name_authority']);
        }
        return $data;
    }
}
