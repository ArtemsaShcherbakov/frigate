import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface ISelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

type TSelectSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'selector-ui',
  templateUrl: './selector-ui.html',
  styleUrl: './selector-ui.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorUi),
      multi: true,
    },
  ],
})
export class SelectorUi implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: ISelectOption[] = [];
  @Input() placeholder: string = 'Выберите...';
  @Input() disabled: boolean = false;
  @Input() size: TSelectSize = 'md';
  @Input() errorMessage: string = '';

  @Output() valueChange = new EventEmitter<string | number>();
  @Output() selectionChange = new EventEmitter<ISelectOption>();

  protected innerValue = signal<string | number>('');
  protected isFocused = signal<boolean>(false);
  protected isTouched = signal<boolean>(false);
  protected searchTerm = signal<string>('');

  // Приватные поля для ControlValueAccessor
  private onChanged: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  protected selectClasses = computed(() => ({
    'form-select': true,
    [`form-select-${this.size}`]: this.size !== 'md',
  }));

  get value(): string | number {
    return this.innerValue();
  }

  set value(val: string | number) {
    if (val !== this.innerValue()) {
      this.innerValue.set(val);

      this.onChanged(val);

      this.valueChange.emit(val);

      const option = this.options.find((opt) => opt.value === val);

      if (option) {
        this.selectionChange.emit(option);
      }
    }
  }

  protected hasError(): boolean {
    return !!this.errorMessage && this.isTouched();
  }

  protected onSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.value = select.value;
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.isTouched.set(true);

    this.onTouched();
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();

    this.value = '';
    this.searchTerm.set('');
  }

  // Реализация ControlValueAccessor
  writeValue(value: string | number): void {
    this.innerValue.set(value || '');
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
