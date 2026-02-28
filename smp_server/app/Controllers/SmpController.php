<?php

namespace App\Controllers;

use App\Models\SmpEntityModel;
use CodeIgniter\API\ResponseTrait;

class SmpController extends BaseController
{
    use ResponseTrait;
    
    protected $model;
    
    public function __construct()
    {
        $this->model = new SmpEntityModel();
    }
    
    /**
     * GET /api/smp/list - для выпадающего списка (с поиском)
     */
    public function list()
    {
        $search = $this->request->getGet('search');
        $page = $this->request->getGet('page') ?? 1;
        $limit = 20;
        
        $builder = $this->model->select('id, name_smp');
        
        if ($search) {
            $builder->like('name_smp', $search);
        }
        
        $total = $builder->countAllResults(false);
        $items = $builder->orderBy('name_smp', 'ASC')
                        ->limit($limit, ($page - 1) * $limit)
                        ->find();
        
        return $this->respond([
            'items' => $items,
            'total' => $total,
            'page' => (int)$page,
            'has_more' => $total > ($page * $limit)
        ]);
    }
    
    /**
     * POST /api/smp - создать новый СМП
     */
    public function create()
    {
        $data = $this->request->getJSON(true);
 
        if (!$data) {
            return $this->fail('Неверный формат данных');
        }
        
        // Подготовка и валидация
        $data = $this->model->prepareData($data);
        
        if (!$this->model->validateBeforeSave($data)) {

            return $this->failValidationErrors($this->model->errors());
        }
           
        $id = $this->model->insert($data);
        
        if ($id) {
            return $this->respondCreated([
                'success' => true,
                'data' => $this->model->find($id)
            ]);
        }


        return $this->fail('Ошибка при создании СМП');
    }

    /**
     * PATCH /api/smp/{id} - обновить СМП
     */
    public function update($id)
    {
        $data = $this->request->getJSON(true);
        
        if (!$data) {
            return $this->fail('Неверный формат данных');
        }

        $existing = $this->model->find($id);

        if (!$existing) {
            return $this->failNotFound('СМП с ID ' . $id . ' не найден');
        }
        
        $data['id'] = $id;
        $data = $this->model->prepareData($data);
        
        if (!$this->model->validateBeforeSave($data)) {
            return $this->failValidationErrors($this->model->errors());
        }
        
        if ($this->model->update($id, $data)) {
            return $this->respond([
                'success' => true,
                'data' => $this->model->find($id)
            ]);
        }
        
        return $this->fail('Ошибка при обновлении');
    }
}
