// autocomplete-ui.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  forwardRef,
} from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface AutocompleteResponse {
  items: AutocompleteItem[];
  total: number;
  page: number;
  has_more: boolean;
}

export interface AutocompleteItem {
  id: string | number;
  name: string;
  [key: string]: any;
}

@Component({
  selector: 'autocomplete-ui',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './autocomplete-ui.html',
  styleUrl: './autocomplete-ui.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteUi),
      multi: true,
    },
  ],
})
export class AutocompleteUi implements ControlValueAccessor {
  @Input() value: any = null;
  @Input() label = '';
  @Input() placeholder = 'Выберите...';
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() errorMessage = '';
  @Input() displayField: string = 'name';
  @Input() valueField: string = 'id';
  @Input() minChars: number = 2; // Минимум символов для поиска
  @Input() items: AutocompleteItem[] = []; // Просто массив элементов

  @Output() changeInput = new EventEmitter<any>();
  @Output() valueChange = new EventEmitter<any>();
  @Output() itemSelected = new EventEmitter<AutocompleteItem>();

  // Состояние
  protected searchText = signal<string>('');
  protected filteredItems = signal<AutocompleteItem[]>([]);
  protected selectedItem = signal<AutocompleteItem | null>(null);
  protected isOpen = signal<boolean>(false);
  protected isFocused = signal<boolean>(false);
  protected isTouched = signal<boolean>(false);

  // Убираем лишние сигналы: isLoading, currentPage, hasMore

  // Приватные поля для ControlValueAccessor
  private onChanged: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // Computed
  protected inputClasses = computed(() => {
    const classes: any = {
      'form-control': true,
    };

    if (this.size === 'lg') classes['form-control-lg'] = true;
    if (this.size === 'sm') classes['form-control-sm'] = true;

    return classes;
  });

  protected displayText = computed(() => {
    const selected = this.selectedItem();
    return selected ? selected[this.displayField] : '';
  });

  protected showDropdown = computed(() => {
    return (
      this.isOpen() && this.searchText().length >= this.minChars && this.filteredItems().length > 0
    );
  });

  protected showEmptyMessage = computed(() => {
    return (
      this.isOpen() &&
      this.searchText().length >= this.minChars &&
      this.filteredItems().length === 0
    );
  });

  // Фильтрация происходит сразу на клиенте
  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.changeInput.emit(value);

    this.searchText.set(value);

    if (value.length >= this.minChars) {
      this.filteredItems.set(this.items);
      this.isOpen.set(true);
    } else {
      this.filteredItems.set([]);
      this.isOpen.set(false);
    }

    // Если поле пустое - очищаем выбранное значение
    if (!value) {
      this.selectedItem.set(null);
      this.onChanged(null);
      this.valueChange.emit(null);
    }
  }

  protected onFocus(): void {
    this.isFocused.set(true);

    if (this.items.length > 0 && this.searchText().length >= this.minChars) {
      // Показываем все элементы при фокусе
      this.filteredItems.set(this.items);
      this.isOpen.set(true);
    }
  }

  protected onBlur(): void {
    setTimeout(() => {
      this.isFocused.set(false);
      this.isOpen.set(false);
      this.isTouched.set(true);
      this.onTouched();
    }, 200);
  }

  protected selectItem(item: AutocompleteItem): void {
    this.selectedItem.set(item);
    this.searchText.set(item[this.displayField]); // Показываем название в поле
    this.isOpen.set(false);

    const value = item[this.valueField];

    this.onChanged(value);

    this.valueChange.emit(value);
    this.itemSelected.emit(item);
  }

  protected clearSelection(event: MouseEvent): void {
    event.stopPropagation();

    this.selectedItem.set(null);
    this.searchText.set('');

    this.changeInput.emit('');

    this.filteredItems.set([]);
    this.onChanged(null);

    this.valueChange.emit(null);
  }

  // Реализация ControlValueAccessor
  writeValue(value: any): void {
    if (value && typeof value === 'object') {
      this.selectedItem.set(value);
      this.searchText.set(value[this.displayField]);

      this.value = value;
    } else if (value) {
      const found = this.items.find((item) => item[this.valueField] === value);

      if (found) {
        this.selectedItem.set(found);
        this.searchText.set(found[this.displayField]);
      }

      this.value = value;
    } else {
      this.selectedItem.set(null);
      this.searchText.set('');

      this.value = null;
    }
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
