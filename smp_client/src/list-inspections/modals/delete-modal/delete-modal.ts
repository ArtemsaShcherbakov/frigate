import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonUi, DialogUi } from '../../../ui-components';

import { InspectionService } from '../../list-inspections.service';
import { ModalService } from '../modals.service';

import { EModalType } from '../modals.constants';

@Component({
  selector: 'delete-modal',
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.css',
  standalone: true,
  imports: [FormsModule, ButtonUi, DialogUi],
})
export class DeleteModal {
  @ViewChild('deleteDialog') deleteDialog!: DialogUi;

  @Output() deleteInspection = new EventEmitter<any>();

  modalData: any;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private modalService: ModalService,
    private inspectionService: InspectionService,
  ) {}

  ngOnInit() {
    this.modalService.onOpen().subscribe((data) => {
      if (data.type === EModalType.DELETE) {
        this.modalData = data;
        this.deleteDialog.openDialog();
      }
    });
  }

  deleteInspections(): void {
    this.loading = true;
    this.error = null;

    this.inspectionService.deleteInspection(this.modalData.data.id).subscribe({
      next: () => {
        this.deleteInspection.emit(this.modalData.data.id);

        this.loading = false;
        this.deleteDialog.closeDialog();
      },
      error: (err) => {
        this.error = 'Не удалось удалить данные';
        this.loading = false;

        console.error('Ошибка удаления:', err);
      },
    });
  }

  onOpenModal(_row: any, _event: MouseEvent): void {
    this.deleteDialog.openDialog();
  }

  confirm() {
    this.deleteInspections();
  }

  close() {
    this.deleteDialog.closeDialog();
  }
}
