
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Inject, Injectable } from '@angular/core';

import { QueryParamsModelNew } from '../../../_core/models/query-models/query-params.model';
import { ResultModel, ResultObjModel } from '../../../_core/models/_base.model';
import { environment } from '../../../../../../environments/environment';
import { CATCH_ERROR_VAR } from '@angular/compiler/src/output/output_ast';
import { catchError, finalize, tap } from 'rxjs/operators';
import { GroupingState, ITableState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import {DoiTacBaoHiemModel } from '../Model/doitacbaohiem-management.model';
import { HttpUtilsService } from '../../../_core/utils/http-utils.service';

const API_PRODUCTS_URL = environment.ApiRoot + '/doitacbaohiemManagement';
const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined,
};

@Injectable()
export class DoiTacBaoHiemManagementService {
  // Private fields
  private _items$ = new BehaviorSubject<DoiTacBaoHiemModel[]>([]);
  private _itemstemp$ = new DoiTacBaoHiemModel();
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _isFirstLoading$ = new BehaviorSubject<boolean>(true);
  private _tableState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  private _errorMessage = new BehaviorSubject<string>('');
  private _subscriptions: Subscription[] = [];
  private _tableAppCodeState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  public Visible: boolean;
  // Getters
  private isUpdateModeSubject = new BehaviorSubject<boolean>(false);
  isUpdateMode$ = this.isUpdateModeSubject.asObservable();

  setIsUpdateMode(value: boolean) {
    this.isUpdateModeSubject.next(value);
  }
  get items$() {
    return this._items$.asObservable();
  }
  get itemstemp$() {
    return this._itemstemp$;
  }
  setitemstemp(value: DoiTacBaoHiemModel) {
    this._itemstemp$=value;
  }
  get isLoading$() {
    return this._isLoading$.asObservable();
  }
  get isFirstLoading$() {
    return this._isFirstLoading$.asObservable();
  }
  get errorMessage$() {
    return this._errorMessage.asObservable();
  }
  get subscriptions() {
    return this._subscriptions;
  }
  get tableAppCodeState$() {
    return this._tableAppCodeState$.asObservable();
  }
  // State getters
  get paginator() {
    return this._tableState$.value.paginator;
  }
  get paginatorAppList() {
    return this._tableAppCodeState$.value.paginator;
  }
  get filter() {
    return this._tableState$.value.filter;
  }
  get sorting() {
    return this._tableState$.value.sorting;
  }
  get searchTerm() {
    return this._tableState$.value.searchTerm;
  }
  get grouping() {
    return this._tableState$.value.grouping;
  }

  constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

  public fetch() {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const request = this.findData(this._tableState$.value)
      .pipe(
        tap((res: ResultModel<DoiTacBaoHiemModel>) => {
          if (res && res.status === 1) {
            console.log(res);
            this.Visible = res.Visible;
            this._items$.next(res.data);
            this._tableState$.value.paginator.total = res.panigator.TotalCount;
          } else {
            this._errorMessage.next(res.error.message);
            return of({
              items: [],
              total: 0
            });
          }
        }),
        finalize(() => {
          this._isLoading$.next(false);
        })
      ).subscribe();
    this._subscriptions.push(request);
  }

  

  // Base Methods
  public patchState(patch: Partial<ITableState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch();
  }

  public fetchStateSort(patch: Partial<ITableState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch();
  }

  public patchStateWithoutFetch(patch: Partial<ITableState>) {
    const newState = Object.assign(this._tableState$.value, patch);
    this._tableState$.next(newState);
  }

  private findData(tableState: ITableState): Observable<any> {
    this._errorMessage.next('');
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/DoiTacBaoHiemList';
    return this.http.post<any>(url, tableState, {
      headers: httpHeaders,
    }).pipe(
      catchError(err => {
        this._errorMessage.next(err);
        return of({ items: [], total: 0 });
      })
    );
  }


  DM_DoiTacBaoHiem_Insert(item: DoiTacBaoHiemModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/create-DoiTacBaoHiem';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }

  UpdateDoiTacBaoHiem(item: DoiTacBaoHiemModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/update-DoiTacBaoHiem';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
 DeleteDoiTacBaoHiem(item: DoiTacBaoHiemModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/delete-DoiTacBaoHiem';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
	DeletesDoiTacBaoHiem(ids: any[] = []): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/deletes-DoiTacBaoHiem';
    return this.http.post<any>(url, ids, { headers: httpHeaders });
	}
  UpdateStatustaikhoan(item: DoiTacBaoHiemModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/UpdateStatustaikhoan';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }


  gettaikhoanModelByRowID(RowID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetDoiTacBaoHiemByRowID?RowID=${RowID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }


  getNoteLock(RowID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetNoteLock?RowID=${RowID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }

  getPartnerFilters(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetFilterPartner`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  importData(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const url = API_PRODUCTS_URL + `/import`;
    return this.http.post<any>(url, formData);
  }

  exportToExcel(): Observable<Blob> {
    const url = API_PRODUCTS_URL + '/tai-file-mau'; // Replace YOUR_API_URL with your actual API endpoint
    return this.http.get<Blob>(url, { responseType: 'blob' as 'json' });
  }
  private apiUrl = 'https://localhost:1404/api/doitacbaohiemmanagement'; // Update with your API URL
  importExcel(filePath: string): Observable<any> {
    const url = `${this.apiUrl}/import?filePath=${encodeURIComponent(filePath)}`;
    return this.http.post<any>(url, {});
  }
}
