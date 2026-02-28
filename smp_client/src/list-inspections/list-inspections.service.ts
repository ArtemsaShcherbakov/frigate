import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { AutocompleteResponse } from '../ui-components/autocomplete-ui/autocomplete-ui';

import type {
  IDeleteInspectionResponse,
  IAddOrEditInspectionResponse,
  ILoadInspectionsResponse,
  IInspection,
} from './list-inspections.types';

@Injectable({
  providedIn: 'root',
})
export class InspectionService {
  private apiUrl = 'http://localhost:8080/api'; // Базовый URL API

  constructor(private http: HttpClient) {}

  // ============ GET ============
  // Получить все записи
  getAllInspections(
    currentPage: number,
    page: number,
    searchInspection?: string,
  ): Observable<ILoadInspectionsResponse> {
    const url = searchInspection ? `&search=${searchInspection}` : '';

    return this.http
      .get<ILoadInspectionsResponse>(
        `${this.apiUrl}/inspections?page=${currentPage}&per_page=${page}${url}`,
      )
      .pipe(catchError(this.handleError));
  }

  // ============ GET ============
  // Поиск компаний
  searchCompanies = (search: string): Observable<AutocompleteResponse> => {
    return this.http
      .get<AutocompleteResponse>(`${this.apiUrl}/smp/list`, {
        params: {
          search,
        },
      })
      .pipe(catchError(this.handleError));
  };

  // ============ GET ============
  // Получить все записи
  getListOfRegulatoryAuthorities = (): Observable<any> => {
    return this.http.get<any>(`${this.apiUrl}/authority`).pipe(catchError(this.handleError));
  };

  // // ============ POST ============
  // // Создать новую запись
  createInspection(inspection: IInspection): Observable<IAddOrEditInspectionResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<IAddOrEditInspectionResponse>(`${this.apiUrl}/inspections`, inspection, { headers })
      .pipe(catchError(this.handleError));
  }

  // ============ DELETE ============
  // Удалить запись
  deleteInspection(id: string): Observable<IDeleteInspectionResponse> {
    return this.http
      .delete<IDeleteInspectionResponse>(`${this.apiUrl}/inspections/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ============ PATCH ============
  // Частично обновить запись
  editInspection(id: string, inspection: IInspection): Observable<IAddOrEditInspectionResponse> {
    return this.http
      .patch<IAddOrEditInspectionResponse>(`${this.apiUrl}/inspections/${id}`, inspection)
      .pipe(catchError(this.handleError));
  }

  // ============ Обработка ошибок ============
  private handleError(error: any) {
    const errorMessage =
      error.error instanceof ErrorEvent
        ? `Ошибка клиента: ${error.error.message}`
        : `Сервер вернул код: ${error.status}, сообщение: ${error.message}`;

    console.error('API Error:', errorMessage);

    return throwError(() => new Error(errorMessage));
  }
}
