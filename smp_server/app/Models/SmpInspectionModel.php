<?php

namespace App\Models;

use CodeIgniter\Model;

class SmpInspectionModel extends Model
{
    protected $table = 'scheduled_inspections';
    protected $primaryKey = 'id';
    
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    
    // ТОЛЬКО указанные поля
    protected $allowedFields = [
        'smp_name', 
        'control_authority',
        'planned_start_date',
        'planned_end_date',
        'planned_duration',
    ];
    
    // Валидация только для нужных полей
    protected $validationRules = [
        'smp_name' => 'required|max_length[500]',
        'control_authority' => 'required|max_length[500]',
        'planned_start_date' => 'required|valid_date',
        'planned_end_date' => 'required|valid_date',
        'planned_duration' => 'required|integer|greater_than[0]',
    ];
    
    protected $validationMessages = [
        'smp_name' => [
            'required' => 'Название СМП обязательно',
            'max_length' => 'Название СМП не может быть длиннее 500 символов'
        ],
        'control_authority' => [
            'required' => 'Контролирующий орган обязателен'
        ],
        'planned_start_date' => [
            'required' => 'Дата начала обязательна',
            'valid_date' => 'Неверный формат даты начала'
        ],
        'planned_end_date' => [
            'required' => 'Дата окончания обязательна',
            'valid_date' => 'Неверный формат даты окончания'
        ],
        'planned_duration' => [
            'required' => 'Длительность обязательна',
            'integer' => 'Длительность должна быть целым числом',
            'greater_than' => 'Длительность должна быть больше 0',
        ],
    ];
    
    protected $skipValidation = false;
    
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $dateFormat = 'datetime';

    public function insert($data = null, bool $returnID = true)
    {
        // Валидация выполнится автоматически благодаря $skipValidation = false
        return parent::insert($data, $returnID);
    }
    
    /**
     * Создание записи на основе примера из вопроса
     */
    public function create($data): bool
    {
        return $this->save($data) !== false;
    }
    
    /**
     * Найти по номеру
     */
    public function findById(int $id): ?array
    {
        return $this->where('id', $id)->first();
    }
    
    /**
     * Форматирование даты для вывода
     */
    public function formatDateRange(array $inspection): string
    {
        if (empty($inspection['planned_start_date']) || empty($inspection['planned_end_date'])) {
            return '';
        }
        
        $start = date('d.m.Y', strtotime($inspection['planned_start_date']));
        $end = date('d.m.Y', strtotime($inspection['planned_end_date']));
        
        return "{$start}-{$end}";
    }
    
    /**
     * Валидация периода дат
     */
    public function validatePeriod(string $startDate, string $endDate): array
    {
        $start = strtotime($startDate);
        $end = strtotime($endDate);
        
        if ($start > $end) {
          return [
              'success' => false,
              'errors' => 'Дата начала не может быть позже даты окончания',
          ];
        }
        
        return [
            'success' => true,
            'errors' => '',
        ];
    }
}