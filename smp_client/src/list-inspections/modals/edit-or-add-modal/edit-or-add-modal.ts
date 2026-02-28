import {
  Component,
  ViewChild,
  EventEmitter,
  Output,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { DialogUi, InputUi, ButtonUi, AutocompleteUi, SelectorUi } from '../../../ui-components';

import type { ISelectOption } from '../../../ui-components/selector-ui/selector-ui';

import { InspectionService } from '../../list-inspections.service';
import { ModalService } from '../modals.service';

import { EModalType } from '../modals.constants';

import type {
  IInspection,
  IControlAuthority,
  IModalDataService,
  IInspectionResponse,
} from '../../list-inspections.types';

interface IModalData {
  inspectionId: string;
  title: string;
  primaryButton: string;
}

@Component({
  selector: 'edit-or-add-modal',
  templateUrl: './edit-or-add-modal.html',
  styleUrl: './edit-or-add-modal.css',
  standalone: true,
  imports: [FormsModule, InputUi, AutocompleteUi, SelectorUi, ButtonUi, DialogUi],
})
export class EditOrAddModal implements OnInit, OnDestroy {
  @ViewChild('dialog') dialog!: DialogUi;

  inspection: IInspection = {
    smpId: '',
    authorityId: '',
    plannedStartDate: '',
    plannedEndDate: '',
    plannedDuration: '',
  };
  isModalEdit: boolean = false;
  isModalCreate: boolean = false;
  controlAuthorities: ISelectOption[] = [];
  smpItems = signal<any>([]);
  modalData: IModalData = { inspectionId: '', title: '', primaryButton: '' };
  loading: boolean = false;
  error: string | null = null;
  errorValidationMessage: string = '';

  @Output() addInspection = new EventEmitter<IInspectionResponse>();
  @Output() editInspection = new EventEmitter<IInspectionResponse>();

  // Только для debounce поиска компаний
  private searchCompaniesSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: ModalService,
    private inspectionService: InspectionService,
  ) {}

  ngOnInit() {
    // Настройка debounce для поиска компаний
    this.setupSearchDebounce();

    // Подписка на открытие модального окна
    this.modalService
      .onOpen()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: IModalDataService) => {
        this.isModalEdit = data?.type === EModalType.EDIT;
        this.isModalCreate = data?.type === EModalType.CREATE;
        const isOpenModal = this.isModalEdit || this.isModalCreate;

        if (this.isModalCreate) {
          this.resetForm();
        }

        if (isOpenModal) {
          this.modalData.inspectionId = data?.inspection?.id || '';
          this.modalData.title = this.isModalEdit ? 'Изменение проверки' : 'Добавление проверки';
          this.modalData.primaryButton = this.isModalEdit ? 'Изменить' : 'Сохранить';

          // Заполняем форму данными при редактировании
          if (this.isModalEdit && data?.inspection) {
            const inspection = data.inspection;

            this.inspection = {
              smpId: inspection.smpId,
              authorityId: inspection.authorityId,
              plannedStartDate: inspection.plannedStartDate,
              plannedEndDate: inspection.plannedEndDate,
              plannedDuration: inspection.plannedDuration,
            };

            // Создаем элемент для отображения в автокомплите
            const selectedItem = {
              id: inspection.smpId,
              nameSmp: inspection.smpName,
            };

            // Устанавливаем элемент в smpItems для отображения
            this.smpItems.set([selectedItem]);
          }

          this.dialog.openDialog();
        }
      });

    this.getListOfRegulatoryAuthorities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Настройка debounce для поиска компаний
   */
  private setupSearchDebounce(): void {
    this.searchCompaniesSubject
      .pipe(
        debounceTime(500), // Ждем 500мс после последнего ввода
        distinctUntilChanged(), // Игнорируем если значение не изменилось
        switchMap((search) => {
          if (!search || search.length < 2) {
            // Если меньше 2 символов - очищаем список
            this.smpItems.set([]);

            return of(null);
          }

          // Выполняем поиск
          return this.inspectionService.searchCompanies(search).pipe(
            catchError((err) => {
              console.error('Ошибка загрузки проверяемых СМП:', err);
              this.smpItems.set([]);
              return of(null);
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((response) => {
        if (response) {
          const items = response.items.map((item: any) => ({
            id: item.id,
            nameSmp: item.nameSmp || item.name || item.smpName,
          }));
          this.smpItems.set(items);
        }
      });
  }

  private createListControlAuthorities(list: IControlAuthority[]): ISelectOption[] {
    return list.map(({ id, nameAuthority }) => ({
      value: id,
      label: nameAuthority,
    }));
  }

  addInspections(): void {
    this.loading = true;
    this.error = null;

    this.inspectionService
      .createInspection(this.inspection)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const inspection = response.data;
          const newInspection = {
            ...inspection,
            date: `${inspection.plannedStartDate} - ${inspection.plannedEndDate}`,
          };

          this.addInspection.emit(newInspection);

          this.loading = false;

          this.dialog.closeDialog();
          this.resetForm();
        },
        error: (err) => {
          this.error = 'Не удалось создать проверку';
          this.loading = false;
          console.error('Ошибка добавления:', err);
        },
      });
  }

  editInspections(): void {
    this.loading = true;
    this.error = null;

    this.inspectionService
      .editInspection(this.modalData.inspectionId, this.inspection)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const inspection = response.data;
          const newInspection = {
            ...inspection,
            date: `${inspection.plannedStartDate} - ${inspection.plannedEndDate}`,
          };

          this.editInspection.emit(newInspection);
          this.loading = false;
          this.dialog.closeDialog();
          this.resetForm();
        },
        error: (err) => {
          this.error = 'Не удалось создать проверку';
          this.loading = false;
          console.error('Ошибка добавления:', err);
        },
      });
  }

  getListOfRegulatoryAuthorities() {
    this.inspectionService
      .getListOfRegulatoryAuthorities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.controlAuthorities = this.createListControlAuthorities(response.list);
        },
        error: (err) => {
          console.error('Ошибка загрузки органов контроля:', err);
          this.controlAuthorities = [];
        },
      });
  }

  private resetForm() {
    this.inspection = {
      smpId: '',
      authorityId: '',
      plannedStartDate: '',
      plannedEndDate: '',
      plannedDuration: '',
    };
    this.smpItems.set([]);
    this.error = null;
    this.errorValidationMessage = '';
  }

  createInspection() {
    // Валидация
    if (!this.inspection.smpId) {
      this.errorValidationMessage = 'Укажите субъект малого предпринимательства';
      return;
    }
    if (!this.inspection.plannedStartDate) {
      this.errorValidationMessage = 'Укажите дату начала';
      return;
    }
    if (!this.inspection.plannedEndDate) {
      this.errorValidationMessage = 'Укажите дату окончания';
      return;
    }
    if (!this.inspection.authorityId) {
      this.errorValidationMessage = 'Выберите контролирующий орган';
      return;
    }
    if (!this.inspection.plannedDuration) {
      this.errorValidationMessage = 'Укажите плановую длительность проверки';
      return;
    }

    this.isModalEdit ? this.editInspections() : this.addInspections();
  }

  close() {
    this.resetForm();
    this.dialog.closeDialog();
  }

  onCloseOnOverlayClick() {
    this.resetForm();
  }

  onChangedSelect(value: string | number) {
    this.inspection.authorityId = value as string;
  }

  /**
   * Обработка ввода текста для поиска компаний (с debounce)
   */
  onChangeInput(value: string) {
    this.searchCompaniesSubject.next(value);
  }
}
