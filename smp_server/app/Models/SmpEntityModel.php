<?php

namespace App\Models;

use CodeIgniter\Model;

class SmpEntityModel extends Model
{
    protected $table = 'smp_entities';
    protected $primaryKey = 'id';
    
    protected $useAutoIncrement = true;
    protected $returnType = 'array'; // Можно изменить на 'object' если нужно
    protected $useSoftDeletes = false; // Если не используете мягкое удаление
    
    /**
     * Поля, которые можно заполнять через insert/update
     * Соответствуют полям в таблице (кроме id, created_at, updated_at)
     */
    protected $allowedFields = [
        'name_smp',  // Название СМП
    ];
    
    /**
     * Правила валидации
     */
    protected $validationRules = [
        'name_smp' => [
            'label' => 'Название СМП',
            'rules' => 'required|min_length[3]|max_length[500]|is_unique[smp_entities.name_smp,id,{id}]'
        ],
    ];
    
    /**
     * Сообщения об ошибках валидации (на русском)
     */
    protected $validationMessages = [
        'name_smp' => [
            'required' => 'Поле "Название СМП" обязательно для заполнения',
            'min_length' => 'Название СМП должно содержать минимум 3 символа',
            'max_length' => 'Название СМП не может быть длиннее 500 символов',
            'is_unique' => 'Такое название СМП уже существует в базе',
        ],
    ];
    
    protected $skipValidation = false;
    
    /**
     * Автоматическое обновление created_at/updated_at
     */
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
    protected $dateFormat = 'datetime';
    
    /**
     * Callbacks
     */
    protected $allowCallbacks = true;
    protected $beforeInsert = [];
    protected $afterInsert = [];
    protected $beforeUpdate = [];
    protected $afterUpdate = [];
    protected $beforeFind = [];
    protected $afterFind = [];
    protected $beforeDelete = [];
    protected $afterDelete = [];
  
    
    /**
     * Поиск СМП по названию (для автодополнения)
     * 
     * @param string $term Поисковый термин
     * @param int $limit Лимит
     * @return array
     */
    public function searchByName(string $term, int $limit = 10): array
    {
        return $this->select('id, name_smp as text')
                    ->like('name_smp', $term)
                    ->orderBy('name_smp', 'ASC')
                    ->limit($limit)
                    ->find();
    }
    
    /**
     * Валидация перед вставкой/обновлением
     * 
     * @param array $data
     * @return bool
     */
    public function validateBeforeSave(array &$data): bool
    {
        $this->setValidationRule('name_smp', [
            'label' => 'Название СМП',
            'rules' => 'required|min_length[3]|max_length[500]' . 
                      (isset($data['id']) ? "|is_unique[smp_entities.name_smp,id,{$data['id']}]" : '|is_unique[smp_entities.name_smp]')
        ]);
        
        return $this->validate($data);
    }
    
    /**
     * Подготовка данных перед сохранением
     * 
     * @param array $data
     * @return array
     */
    public function prepareData(array $data): array
    {
        if (isset($data['name_smp'])) {
            $data['name_smp'] = trim($data['name_smp']);
        }
        
        return $data;
    }
}