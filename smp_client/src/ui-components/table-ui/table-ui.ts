import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IPagination } from '../../list-inspections/list-inspections.types';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
}

export interface TableAction {
  type: 'edit' | 'delete';
  label: string;
  icon?: string;
}

@Component({
  selector: 'table-ui',
  templateUrl: './table-ui.html',
  styleUrl: './table-ui.css',
})
export class TableUi implements OnChanges {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() showActions: boolean = true;
  @Input() actions: TableAction[] = [
    { type: 'edit', label: 'Редактировать', icon: 'bi-pencil' },
    { type: 'delete', label: 'Удалить', icon: 'bi-trash' },
  ];
  @Input() emptyMessage: string = 'Нет данных для отображения';
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  // Входной параметр пагинации
  @Input() pagination: IPagination = {
    total: 0,
    perPage: 5,
    currentPage: 1,
    totalPages: 1,
    from: 0,
    to: 0,
  };

  // Выходные события
  @Output() rowDoubleClick = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() addModal = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();

  showPagination = (): boolean => {
    return this.pagination.total > this.pagination.perPage;
  };

  ngOnChanges(_eventchanges: SimpleChanges) {}

  // Методы для работы с пагинацией
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages) {
      this.pageChange.emit({ page, pageSize: this.pagination.perPage });
    }
  }

  onNextPage(): void {
    if (this.pagination.currentPage < this.pagination.totalPages) {
      this.pageChange.emit({
        page: this.pagination.currentPage + 1,
        pageSize: this.pagination.perPage,
      });
    }
  }

  onPrevPage(): void {
    if (this.pagination.currentPage > 1) {
      this.pageChange.emit({
        page: this.pagination.currentPage - 1,
        pageSize: this.pagination.perPage,
      });
    }
  }

  onFirstPage(): void {
    if (this.pagination.currentPage !== 1) {
      this.pageChange.emit({ page: 1, pageSize: this.pagination.perPage });
    }
  }

  onLastPage(): void {
    if (this.pagination.currentPage !== this.pagination.totalPages) {
      this.pageChange.emit({
        page: this.pagination.totalPages,
        pageSize: this.pagination.perPage,
      });
    }
  }

  onChangePageSize(size: string): void {
    const newSize = Number(size);
    console.log(typeof size);
    if (newSize !== this.pagination.perPage) {
      // Эмитим событие с новой страницей (1) и новым размером
      this.pageChange.emit({ page: 1, pageSize: newSize });
    }
  }

  // Генерация номеров страниц для отображения
  getPageNumbers(): (number | string)[] {
    const total = this.pagination.totalPages;
    const current = this.pagination.currentPage;
    const delta = 2;

    if (total <= 1) return [1];

    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }

  // Обработчики событий строк
  onRowDoubleClick(row: any): void {
    this.rowDoubleClick.emit(row);
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onAddModal(event: MouseEvent): void {
    event.stopPropagation();
    this.addModal.emit();
  }

  onEdit(row: any, event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(row);
  }

  onDelete(row: any, event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(row);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // Для расчета номера строки с учетом пагинации
  getRowNumber(index: number): number {
    return (this.pagination.currentPage - 1) * this.pagination.perPage + index + 1;
  }
}
