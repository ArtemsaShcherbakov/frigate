import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

import { LoaderUi, TableUi, AutocompleteUi } from '../ui-components';
import { EditOrAddModal, DeleteModal } from './modals';

import { ModalService } from './modals/modals.service';
import { InspectionService } from './list-inspections.service';

import { EModalType } from './modals/modals.constants';
import { COLUMNS_TABLE, ACTION_TABLE } from './list-inspections.constants';

import type { IInspectionResponse, IPagination } from './list-inspections.types';
import type { AutocompleteItem } from '../ui-components/autocomplete-ui/autocomplete-ui';

@Component({
  selector: 'list-inspections',
  templateUrl: './list-inspections.html',
  styleUrl: './list-inspections.css',
  standalone: true,
  imports: [FormsModule, TableUi, DeleteModal, LoaderUi, AutocompleteUi, EditOrAddModal],
})
export class ListInspections implements OnInit, OnDestroy {
  searchInspection: string = '';
  selectedSmpId: number | null = null;
  selectedSmp: AutocompleteItem | null = null;

  constructor(
    private inspectionService: InspectionService,
    private modalService: ModalService,
  ) {}

  private searchSubject = new Subject<{ search?: string; page: number; perPage: number }>();
  private destroy$ = new Subject<void>();
  private currentSearchTerm: string | undefined;

  smpItems: AutocompleteItem[] = [];
  inspections = signal<IInspectionResponse[]>([]);
  loading = signal<boolean>(false);
  error: string | null = null;

  columns = COLUMNS_TABLE;
  actions = ACTION_TABLE;
  selectedInspection: any = null;
  showEditDialog = false;

  pagination = signal<IPagination>({
    total: 0,
    perPage: 5,
    currentPage: 1,
    totalPages: 0,
    from: 0,
    to: 0,
  });

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadInspections(); // Первоначальная загрузка
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Настройка debounce для поиска
   */
  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => {
          // Сравниваем по search, page и perPage
          return (
            prev.search === curr.search && prev.page === curr.page && prev.perPage === curr.perPage
          );
        }),
        switchMap((params) => {
          this.loading.set(true);
          this.error = null;

          return this.inspectionService
            .getAllInspections(params.page, params.perPage, params.search)
            .pipe(
              catchError((err) => {
                this.error = 'Не удалось загрузить данные';
                console.error('Ошибка загрузки:', err);
                return of(null);
              }),
              finalize(() => this.loading.set(false)),
            );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((response) => {
        if (response) {
          // Обновляем список для автокомплита
          this.smpItems = response.data.map(({ id, smpName }) => ({ id, name: smpName }));

          // Форматируем даты
          response.data.forEach(
            (inspection) =>
              (inspection.date = `${inspection.plannedStartDate} - ${inspection.plannedEndDate}`),
          );

          this.inspections.set(response.data);
          this.pagination.set(response.pagination);
        }
      });
  }

  /**
   * Загрузка инспекций с параметрами
   */
  loadInspections(search?: string): void {
    const currentPagination = this.pagination();
    this.searchSubject.next({
      search,
      page: currentPagination.currentPage,
      perPage: currentPagination.perPage,
    });
  }

  /**
   * Принудительная загрузка с текущими параметрами
   */
  private reloadWithCurrentParams(): void {
    const currentPagination = this.pagination();
    this.searchSubject.next({
      search: this.currentSearchTerm,
      page: currentPagination.currentPage,
      perPage: currentPagination.perPage,
    });
  }

  /**
   * Очистка поиска
   */
  clearSearch(): void {
    this.currentSearchTerm = undefined;
    this.selectedSmpId = null;
    this.selectedSmp = null;

    // Сбрасываем на первую страницу
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.reloadWithCurrentParams();
  }

  /**
   * Обработка выбора элемента из автокомплита
   */
  onSmpSelected(item: AutocompleteItem): void {
    this.selectedSmp = item;
    this.currentSearchTerm = item.name;

    // Сбрасываем на первую страницу при новом поиске
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.loadInspections(item.name);
  }

  /**
   * Обработка ввода текста в поиск
   */
  onChangeInput(value: string): void {
    this.currentSearchTerm = value || undefined;

    // Сбрасываем на первую страницу при изменении поиска
    this.pagination.update((p) => ({ ...p, currentPage: 1 }));
    this.loadInspections(value || undefined);
  }

  /**
   * Обработка смены страницы
   */
  onPageChange(event: { page: number; pageSize: number }): void {
    this.pagination.update((p) => ({
      ...p,
      currentPage: event.page,
      perPage: event.pageSize,
    }));

    // Загружаем с новыми параметрами
    this.reloadWithCurrentParams();
  }

  /**
   * Переход на конкретную страницу
   */
  onGoToPage(page: number): void {
    const currentPagination = this.pagination();
    if (page >= 1 && page <= currentPagination.totalPages) {
      this.pagination.update((p) => ({ ...p, currentPage: page }));
      this.reloadWithCurrentParams();
    }
  }

  /**
   * Следующая страница
   */
  onNextPage(): void {
    const currentPagination = this.pagination();
    if (currentPagination.currentPage < currentPagination.totalPages) {
      this.pagination.update((p) => ({ ...p, currentPage: p.currentPage + 1 }));
      this.reloadWithCurrentParams();
    }
  }

  /**
   * Предыдущая страница
   */
  onPrevPage(): void {
    const currentPagination = this.pagination();
    if (currentPagination.currentPage > 1) {
      this.pagination.update((p) => ({ ...p, currentPage: p.currentPage - 1 }));
      this.reloadWithCurrentParams();
    }
  }

  /**
   * Изменение размера страницы
   */
  onChangePageSize(size: number): void {
    console.log(size);
    this.pagination.update((p) => ({
      ...p,
      perPage: size,
      currentPage: 1, // Сбрасываем на первую страницу
    }));
    this.reloadWithCurrentParams();
  }

  onSmpChange(value: number | null): void {
    this.selectedSmpId = value;
  }

  onRowDoubleClick(row: any): void {
    this.selectedInspection = row;
    this.showEditDialog = true;
  }

  onEdit(inspection: IInspectionResponse): void {
    this.modalService.open({
      type: EModalType.EDIT,
      inspection: inspection,
    });
    this.selectedInspection = inspection;
    this.showEditDialog = true;
  }

  onAddModal(_row: any): void {
    this.modalService.open({
      type: EModalType.CREATE,
    });
  }

  onDelete(row: any): void {
    this.modalService.open({
      type: EModalType.DELETE,
      data: row,
    });
  }

  addInspection(newInspection: IInspectionResponse): void {
    this.inspections.update((items) => [...items, newInspection]);
    // Перезагружаем список после добавления
    this.reloadWithCurrentParams();
  }

  deleteInspection(deleteId: string): void {
    this.inspections.update((items) => items.filter((item) => item.id !== deleteId));
    // Перезагружаем список после удаления
    this.reloadWithCurrentParams();
  }

  editInspection(newDate: IInspectionResponse): void {
    const newList = this.inspections().map((item) => {
      if (newDate.id === item.id) {
        return newDate;
      }
      return item;
    });
    this.inspections.set(newList);
    // Перезагружаем список после редактирования
    this.reloadWithCurrentParams();
  }
}
