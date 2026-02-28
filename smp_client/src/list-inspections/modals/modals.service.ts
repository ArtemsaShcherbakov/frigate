import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  // Subject который будет хранить данные для модалки
  private modalData = new Subject<any>();

  // Открыть модалку с данными
  open(data: any) {
    this.modalData.next(data);
  }

  // Получить данные (подписаться)
  onOpen() {
    return this.modalData.asObservable();
  }
}
