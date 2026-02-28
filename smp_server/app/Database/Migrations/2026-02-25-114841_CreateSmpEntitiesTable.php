<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateSmpEntitiesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'SERIAL',
                'constraint' => null,
                'unsigned' => true,
                'auto_increment' => true,
                'comment' => 'ID субъекта малого предпринимательства',
            ],
            'name_smp' => [
                'type' => 'VARCHAR',
                'constraint' => 500,
                'null' => false,
                'comment' => 'Название СМП',
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
        $this->forge->addKey('name_smp');
        
        $this->forge->createTable('smp_entities', true, [
            'comment' => 'Субъекты малого предпринимательства'
        ]);
    }

    public function down()
    {
        $this->forge->dropTable('smp_entities', true);
    }
}
