<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateRegisterOfInspectionsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'SERIAL',
                'constraint' => null,
                'unsigned' => true,
                'auto_increment' => true,
                'comment' => 'ID проверки',
            ],
            'smp_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => false,
                'comment' => 'ID субъекта малого предпринимательства',
            ],
            'authority_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => false,
                'comment' => 'ID контролирующего органа',
            ],
            'planned_start_date' => [
                'type' => 'DATE',
                'null' => false,
                'comment' => 'Начало планового периода',
            ],
            'planned_end_date' => [
                'type' => 'DATE',
                'null' => false,
                'comment' => 'Окончание планового периода',
            ],
            'planned_duration' => [
                'type' => 'INTEGER',
                'constraint' => 3,
                'unsigned' => true,
                'default' => 0,
                'comment' => 'Плановая длительность (дней)',
            ],
            'created_at' => [
                'type' => 'TIMESTAMP',
                'default' => new RawSql('CURRENT_TIMESTAMP'),
                'comment' => 'Дата создания записи',
            ],
            'updated_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
                'comment' => 'Дата обновления записи',
            ],
        ]);
        
        $this->forge->addPrimaryKey('id');
        
        // Внешние ключи
        $this->forge->addForeignKey('smp_id', 'smp_entities', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('authority_id', 'control_authorities', 'id', 'CASCADE', 'CASCADE');
        
        // Индексы для поиска
        $this->forge->addKey('planned_start_date');
        $this->forge->addKey('planned_end_date');
        $this->forge->addKey(['smp_id', 'planned_start_date']);
        $this->forge->addKey(['authority_id', 'planned_start_date']);
        
        $this->forge->createTable('register_of_inspections', true, [
            'comment' => 'Реестр плановых проверок'
        ]);
    }

    public function down()
    {
        $this->forge->dropTable('register_of_inspections', true);
    }
}
