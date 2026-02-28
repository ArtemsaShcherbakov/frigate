<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;
use CodeIgniter\Database\RawSql;

class CreateControlAuthoritiesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'SERIAL',
                'constraint' => null,
                'unsigned' => true,
                'auto_increment' => true,
                'comment' => 'ID контролирующего органа',
            ],
            'name_authority' => [
                'type' => 'VARCHAR',
                'constraint' => 500,
                'null' => false,
                'comment' => 'Название контролирующего органа',
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
        $this->forge->addKey('name_authority');
        
        $this->forge->createTable('control_authorities', true, [
            'comment' => 'Контролирующие органы'
        ]);
    }

    public function down()
    {
        $this->forge->dropTable('control_authorities', true);
    }
}
