import { Component, Input, Output, signal, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

type TDialogSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'dialog-ui',
  templateUrl: './dialog-ui.html',
  styleUrl: './dialog-ui.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DialogUi,
      multi: true,
    },
  ],
})
export class DialogUi {
  @Input() title: string = '';
  @Input() showClose: boolean = true;
  @Input() size: TDialogSize = 'md';
  @Input() closeOnOverlayClick: boolean = true;

  @Output() overlayClick = new EventEmitter<any>();

  private _isOpen = signal<boolean>(false);

  get isOpen(): boolean {
    return this._isOpen();
  }

  openDialog() {
    this._isOpen.set(true);
  }

  closeDialog() {
    this._isOpen.set(false);
  }

  onOverlayClick(event: MouseEvent): void {
    if (
      this.closeOnOverlayClick &&
      (event.target as HTMLElement).classList.contains('dialog-overlay')
    ) {
      this.overlayClick.emit();
      this.closeDialog();
    }
  }
}
