import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type TInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date';

type TInputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'input-ui',
  templateUrl: './input-ui.html',
  styleUrl: './input-ui.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputUi),
      multi: true,
    },
  ],
})
export class InputUi implements ControlValueAccessor {
  @Input() value: string = '';
  @Input() label: string = '';
  @Input() id: string = `input-${Math.random().toString(36).substring(2, 9)}`;
  @Input() type: TInputType = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() size: TInputSize = 'md';
  @Input() errorMessage: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() focus = new EventEmitter<FocusEvent>();

  private innerValue: string = '';
  private isTouched: boolean = false;
  private onChanged: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get displayValue(): string {
    return this.innerValue;
  }

  set displayValue(val: string) {
    if (val !== this.innerValue) {
      this.innerValue = val;
      this.value = val;
      this.onChanged(val);
      this.valueChange.emit(val);
    }
  }

  get inputClass(): string {
    const classes = ['form-control'];

    if (this.size === 'sm') classes.push('form-control-sm');
    if (this.size === 'lg') classes.push('form-control-lg');

    return classes.join(' ');
  }

  get hasError(): boolean {
    return !!this.errorMessage && this.isTouched;
  }

  onInput(event: Event): void {
    this.displayValue = (event.target as HTMLInputElement).value;
  }

  onBlur(event: FocusEvent): void {
    this.isTouched = true;
    this.onTouched();
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.focus.emit(event);
  }

  // ControlValueAccessor
  writeValue(value: string): void {
    this.innerValue = value || '';
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
