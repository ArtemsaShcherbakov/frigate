<?php

namespace App\Controllers;

use App\Models\RegisterOfInspectionsModel;
use App\Models\SmpEntityModel;
use App\Models\ControlAuthorityModel;
use CodeIgniter\API\ResponseTrait;

class InspectionsController extends BaseController
{
    use ResponseTrait;
    
    protected $model;
    protected $smpModel;
    protected $authorityModel;
    
    public function __construct()
    {
        $this->model = new RegisterOfInspectionsModel();
        $this->smpModel = new SmpEntityModel();
        $this->authorityModel = new ControlAuthorityModel();
    }
    
    /**
     * GET /api/inspections - список с пагинацией и поиском
     */
    public function getPaginated()
    {
        $page = $this->request->getGet('page') ?? 1;
        $perPage = $this->request->getGet('per_page') ?? 10;
        $search = $this->request->getGet('search');
        $smpId = $this->request->getGet('smp_id');
        $authorityId = $this->request->getGet('authority_id');
        $dateFrom = $this->request->getGet('date_from');
        $dateTo = $this->request->getGet('date_to');
        
        // Валидация параметров
        $page = max(1, (int)$page);
        $perPage = min(100, max(1, (int)$perPage));
        
        try {

            // Применяем условия поиска
            $this->model->search($search, [
                'smp_id' => $smpId,
                'authority_id' => $authorityId,
                'date_from' => $dateFrom,
                'date_to' => $dateTo
            ]);
            
            // Получаем SQL для отладки
            $sql = $this->model->builder()->getCompiledSelect(false);
            log_message('debug', 'Search SQL: ' . $sql);
            
            // Получаем данные с пагинацией
            $inspections = $this->model->paginate($perPage, 'default', $page);
            $pager = $this->model->pager;
            
            $total = $pager->getTotal();
            $from = $total > 0 ? ($page - 1) * $perPage + 1 : 0;
            $to = min($page * $perPage, $total);
            
            return $this->respond([
                'success' => true,
                'data' => $inspections,
                'pagination' => [
                    'total' => $total,
                    'perPage' => $perPage,
                    'currentPage' => $page,
                    'totalPages' => $pager->getPageCount(),
                    'from' => $from,
                    'to' => $to,
                ]
            ]);
            
        } catch (\Exception $e) {
            log_message('error', 'Search error: ' . $e->getMessage());
            log_message('error', 'Stack trace: ' . $e->getTraceAsString());
            
            return $this->fail('Ошибка при поиске: ' . $e->getMessage());
        }
    }
    
    /**
     * POST /api/inspections - создать проверку
     */
    public function create()
    {
        $data = $this->request->getJSON(true);
    
        if (!$data) {
            return $this->fail('Неверный формат данных');
        }
        
        // Проверка наличия обязательных полей
        $required = ['smp_id', 'authority_id', 'planned_start_date', 'planned_end_date'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return $this->fail("Отсутствует поле: {$field}");
            }
        }
        // print_r($data);
        //   print_r($data['smp_id']);
        // Проверка существования связанных записей
        if (!$this->smpModel->find($data['smp_id'])) {
            return $this->failValidationErrors(['smp_id' => 'СМП не найден']);
        }
             
        if (!$this->authorityModel->find($data['authority_id'])) {
            return $this->failValidationErrors(['authority_id' => 'Контролирующий орган не найден']);
        }
        
        // Валидация
        if (!$this->model->validate($data)) {
            return $this->failValidationErrors($this->model->errors());
        }
        
        $id = $this->model->insert($data);
        
        if ($id) {
            return $this->respondCreated([
                'success' => true,
                'data' => $this->model->getWithNames($id)
            ]);
        }
        
        return $this->fail('Ошибка при создании проверки');
    }
    
    /**
     * PATCH /api/inspections/{id} - частичное обновление
     */
    public function update($id)
    {
        $existing = $this->model->find($id);
        
        if (!$existing) {
            return $this->failNotFound('Проверка не найдена');
        }
        
        $data = $this->request->getJSON(true);
        
        if (!$data) {
            return $this->fail('Неверный формат данных');
        }
        
        // Формируем массив для обновления (только переданные поля)
        $updateData = [];
        
        $allowedFields = ['smp_id', 'authority_id', 'planned_start_date', 'planned_end_date', 'planned_duration'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }
        
        if (empty($updateData)) {
            return $this->fail('Нет данных для обновления');
        }
        
        // Проверка связанных записей если обновляются
        if (isset($updateData['smp_id']) && !$this->smpModel->find($updateData['smp_id'])) {
            return $this->failValidationErrors(['smp_id' => 'СМП не найден']);
        }
        
        if (isset($updateData['authority_id']) && !$this->authorityModel->find($updateData['authority_id'])) {
            return $this->failValidationErrors(['authority_id' => 'Контролирующий орган не найден']);
        }
        
        // Валидация дат
        $startDate = $updateData['planned_start_date'] ?? $existing['planned_start_date'];
        $endDate = $updateData['planned_end_date'] ?? $existing['planned_end_date'];
        
        if (strtotime($endDate) < strtotime($startDate)) {
            return $this->failValidationErrors([
                'planned_end_date' => 'Дата окончания не может быть раньше даты начала'
            ]);
        }
        
        if ($this->model->update($id, $updateData)) {
            return $this->respond([
                'success' => true,
                'message' => 'Проверка обновлена',
                'data' => $this->model->getWithNames($id)
            ]);
        }
        
        return $this->fail('Ошибка при обновлении');
    }
    
    /**
     * DELETE /api/inspections/{id} - удалить проверку
     */
    public function delete($id)
    {
        $existing = $this->model->find($id);
        
        if (!$existing) {
            return $this->failNotFound('Проверка не найдена');
        }
        
        if ($this->model->delete($id)) {
            return $this->respondDeleted([
                'success' => true,
                'deleted_id' => $id
            ]);
        }
        
        return $this->fail('Ошибка при удалении');
    }
}
