import { Component, Input, Output, EventEmitter } from '@angular/core';

type TButtonType = 'button' | 'submit' | 'reset';
type TButtonSize = 'sm' | 'md' | 'lg';
type TButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

@Component({
  selector: 'button-ui',
  templateUrl: './button-ui.html',
  styleUrl: './button-ui.css',
})
export class ButtonUi {
  @Input() type: TButtonType = 'button';
  @Input() variant: TButtonVariant = 'primary';
  @Input() size: TButtonSize = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() block: boolean = false;
  @Input() outline: boolean = false;

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClass(): string {
    const classes = ['btn'];
    const btnOutline = this.outline ? `btn-outline-${this.variant}` : `btn-${this.variant}`;

    classes.push(btnOutline);

    if (this.size === 'lg') classes.push('btn-lg');
    if (this.size === 'sm') classes.push('btn-sm');
    if (this.block) classes.push('w-100');

    return classes.join(' ');
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
