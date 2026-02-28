import { TableColumn, TableAction } from '../ui-components/table-ui/table-ui';

const COLUMNS_TABLE: TableColumn[] = [
  { key: 'smpName', label: 'Проверяемый СМП' },
  { key: 'authorityName', label: 'Контролирующий орган' },
  { key: 'date', label: 'Плановый период проверки' },
  { key: 'plannedDuration', label: 'Плановая длительность' },
];

const ACTION_TABLE: TableAction[] = [
  { type: 'edit', label: 'Редактировать', icon: 'bi-pencil' },
  { type: 'delete', label: 'Удалить', icon: 'bi-trash' },
];

export { COLUMNS_TABLE, ACTION_TABLE };
