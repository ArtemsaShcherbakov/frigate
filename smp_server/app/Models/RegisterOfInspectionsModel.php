<?php

namespace App\Models;

use CodeIgniter\Model;

class RegisterOfInspectionsModel extends Model
{
    protected $table = 'register_of_inspections';
    protected $primaryKey = 'id';
    
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    
    protected $allowedFields = [
        'smp_id',
        'authority_id',
        'planned_start_date',
        'planned_end_date',
        'planned_duration',
    ];
    
    protected $validationRules = [
        'smp_id' => [
            'label' => 'СМП',
            'rules' => 'required|integer|is_not_unique[smp_entities.id]'
        ],
        'authority_id' => [
            'label' => 'Контролирующий орган',
            'rules' => 'required|integer|is_not_unique[control_authorities.id]'
        ],
        'planned_start_date' => [
            'label' => 'Дата начала',
            'rules' => 'required|valid_date'
        ],
        'planned_end_date' => [
            'label' => 'Дата окончания',
            'rules' => 'required|valid_date'
        ],
        'planned_duration' => [
            'label' => 'Длительность',
            'rules' => 'required|integer|greater_than[0]|less_than[366]'
        ],
    ];
    
    protected $validationMessages = [
        'smp_id' => [
            'required' => 'Выберите СМП',
            'is_not_unique' => 'Выбранный СМП не существует'
        ],
        'authority_id' => [
            'required' => 'Выберите контролирующий орган',
            'is_not_unique' => 'Выбранный орган не существует'
        ],
        'planned_start_date' => [
            'required' => 'Укажите дату начала',
            'valid_date' => 'Неверный формат даты'
        ],
        'planned_end_date' => [
            'required' => 'Укажите дату окончания',
            'valid_date' => 'Неверный формат даты'
        ],
        'planned_duration' => [
            'required' => 'Укажите длительность',
            'integer' => 'Длительность должна быть числом',
            'greater_than' => 'Длительность должна быть больше 0',
            'less_than' => 'Длительность не может превышать 365 дней'
        ],
    ];
    
    protected $skipValidation = false;
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $dateFormat = 'datetime';
    
    protected $allowCallbacks = true;
    protected $beforeInsert = ['validateDates'];
    protected $beforeUpdate = ['validateDates'];
    
    /**
     * Валидация дат
     */
    protected function validateDates(array $data)
    {
        if (isset($data['data']['planned_start_date']) && isset($data['data']['planned_end_date'])) {
            $start = strtotime($data['data']['planned_start_date']);
            $end = strtotime($data['data']['planned_end_date']);
            
            if ($end < $start) {
                throw new \Exception('Дата окончания не может быть раньше даты начала');
            }
            
            // ИСПРАВЛЕНИЕ: Пересчитываем длительность ТОЛЬКО если она не передана
            if (!isset($data['data']['planned_duration'])) {
                $startDate = new \DateTime($data['data']['planned_start_date']);
                $endDate = new \DateTime($data['data']['planned_end_date']);
                $interval = $startDate->diff($endDate);
                $data['data']['planned_duration'] = $interval->days;
            }
        }
        return $data;
    }
    
    /**
     * Получить проверку с названиями
     */
    public function getWithNames(int $id): ?array
    {
        return $this->select('register_of_inspections.*, 
                              smp_entities.name_smp as smp_name,
                              control_authorities.name_authority as authority_name')
                    ->join('smp_entities', 'smp_entities.id = register_of_inspections.smp_id')
                    ->join('control_authorities', 'control_authorities.id = register_of_inspections.authority_id')
                    ->where('register_of_inspections.id', $id)
                    ->first();
    }
    
    /**
     * Получить все проверки с названиями
     */
    public function getAllWithNames()
    {
        return $this->select('register_of_inspections.*, 
                              smp_entities.name_smp as smp_name,
                              control_authorities.name_authority as authority_name')
                    ->join('smp_entities', 'smp_entities.id = register_of_inspections.smp_id')
                    ->join('control_authorities', 'control_authorities.id = register_of_inspections.authority_id')
                    ->orderBy('register_of_inspections.planned_start_date', 'DESC')
                    ->find();
    }
    
/**
 * Поиск проверок - возвращает модель с примененными условиями
 */
public function search(string $term = null, array $filters = [])
{
    // Сбрасываем предыдущие условия и начинаем новый запрос
    $this->builder()->resetQuery();
    
    $this->select('register_of_inspections.*, 
                   smp_entities.name_smp as smp_name,
                   control_authorities.name_authority as authority_name')
         ->join('smp_entities', 'smp_entities.id = register_of_inspections.smp_id', 'left')
         ->join('control_authorities', 'control_authorities.id = register_of_inspections.authority_id', 'left');
    
    if ($term && trim($term) !== '') {
        $this->groupStart()
             ->like('smp_entities.name_smp', $term)
             ->orLike('control_authorities.name_authority', $term)
             ->groupEnd();
    }
    
    if (!empty($filters['smp_id'])) {
        $this->where('register_of_inspections.smp_id', $filters['smp_id']);
    }
    
    if (!empty($filters['authority_id'])) {
        $this->where('register_of_inspections.authority_id', $filters['authority_id']);
    }
    
    if (!empty($filters['date_from'])) {
        $this->where('register_of_inspections.planned_start_date >=', $filters['date_from']);
    }
    
    if (!empty($filters['date_to'])) {
        $this->where('register_of_inspections.planned_end_date <=', $filters['date_to']);
    }
    
    $this->orderBy('register_of_inspections.planned_start_date', 'DESC');
    
    return $this;
}
}