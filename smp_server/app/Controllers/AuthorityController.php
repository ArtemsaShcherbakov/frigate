<?php

namespace App\Controllers;

use App\Models\ControlAuthorityModel;
use CodeIgniter\API\ResponseTrait;

class AuthorityController extends BaseController
{
    use ResponseTrait;
    
    protected $model;
    
    public function __construct()
    {
        $this->model = new ControlAuthorityModel();
    }
    
    /**
     * GET /api/authorities/list - для выпадающего списка (упрощенный)
     */
    public function list()
    {
        
        $builder = $this->model->select('id, name_authority');
        
        
        $items = $builder->orderBy('name_authority', 'ASC')->find();
        
        return $this->respond([
            'success' => true,
            'list' => $items,
        ]);
    }
    
    /**
     * POST /api/authorities - создать новый орган
     */
    public function create()
    {
        // Получаем данные
        $data = $this->request->getJSON(true);
        
        if (!$data || !isset($data['name_authority'])) {
            return $this->fail('Необходимо указать name_authority');
        }
        
        // Проверяем уникальность
        $existing = $this->model->where('name_authority', $data['name_authority'])->first();
        
        if ($existing) {
            return $this->failValidationErrors([
                'name_authority' => 'Контролирующий орган с таким названием уже существует'
            ]);
        }
        
        // Валидация
        if (!$this->model->validate($data)) {
            return $this->failValidationErrors($this->model->errors());
        }
        
        // Сохраняем
        $id = $this->model->insert($data);
        
        if ($id) {
            return $this->respondCreated([
                'success' => true,
                'data' => $this->model->find($id)
            ]);
        }
        
        return $this->fail('Ошибка при создании');
    }
}
