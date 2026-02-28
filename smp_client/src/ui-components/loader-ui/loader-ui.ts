import { Component, Input } from '@angular/core';

type TLoaderSize = 'sm' | 'md' | 'lg';

type TLoaderColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

@Component({
  selector: 'loader-ui',
  templateUrl: './loader-ui.html',
  styleUrl: './loader-ui.css',
})
export class LoaderUi {
  @Input() size: TLoaderSize = 'md';
  @Input() color: TLoaderColor = 'primary';
  @Input() text: string = '';
}
