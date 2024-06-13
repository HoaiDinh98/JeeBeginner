
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Inject, Injectable } from '@angular/core';

import { QueryParamsModel } from '../../../_core/models/query-models/query-params.model';
import { QueryResultsModel } from '../../../_core/models/query-models/query-results.model';
import { ResultModel, ResultObjModel } from '../../../_core/models/_base.model';
import { environment } from '../../../../../../environments/environment';
import { CATCH_ERROR_VAR } from '@angular/compiler/src/output/output_ast';
import { catchError, finalize, tap } from 'rxjs/operators';
import { GroupingState, ITableState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import {MatHangModel } from '../Model/mathang-management.model';
import { HttpUtilsService } from '../../../_core/utils/http-utils.service';

const API_PRODUCTS_URL = environment.ApiRoot + '/MatHangManagement';
const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined,
};

@Injectable()
export class MatHangManagementService {
  // Private fields
  lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
  public _items$ = new BehaviorSubject<MatHangModel[]>([]);
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  private _isFirstLoading$ = new BehaviorSubject<boolean>(true);
  private _tableState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  private _errorMessage = new BehaviorSubject<string>('');
  private _subscriptions: Subscription[] = [];
  private _tableAppCodeState$ = new BehaviorSubject<ITableState>(DEFAULT_STATE);
  public intemp:any;
  public Visible: boolean;
  // Getters
  private isUpdateModeSubject = new BehaviorSubject<boolean>(false);
  isUpdateMode$ = this.isUpdateModeSubject.asObservable();

  setIsUpdateMode(value: boolean) {
    this.isUpdateModeSubject.next(value);
  }
 public get items$() {
    return this._items$.asObservable();
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

  // getData(queryParams: QueryParamsModelNew): Observable<QueryResultsModel> {
  //   const httpHeaders = this.httpUtils.getHTTPHeaders();
	// 	const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
  //   const url = API_PRODUCTS_URL + '/MatHangList';
  //   return this.http.post<any>(url, queryParams, { headers: httpHeaders , params: httpParams});
	// }

  getData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
    const url = API_PRODUCTS_URL + '/MatHangList';
    return this.http.post<QueryResultsModel>(url, null, { headers: httpHeaders, params: httpParams });
}
private findData2(tableState: ITableState,queryParams: QueryParamsModel): Observable<any> {
  this._errorMessage.next('');
  const httpHeaders = this.httpUtils.getHTTPHeaders();
  const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
  const url = API_PRODUCTS_URL + '/MatHangList';
  return this.http.post<any>(url, tableState, {
    headers: httpHeaders,params: httpParams 
  }).pipe(
    catchError(err => {
      this._errorMessage.next(err);
      return of({ items: [], total: 0 });
    })
  );
}

  public fetch() {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const request = this.findData(this._tableState$.value)
      .pipe(
        tap((res: ResultModel<MatHangModel>) => {
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
  private findData(tableState: ITableState): Observable<any> {
    this._errorMessage.next('');
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/MatHangList';
    return this.http.post<any>(url, tableState, {
      headers: httpHeaders,
    }).pipe(
      catchError(err => {
        this._errorMessage.next(err);
        return of({ items: [], total: 0 });
      })
    );
  }


  public fetch2() {
    this._isLoading$.next(true);
    this._errorMessage.next('');
    const queryParams: QueryParamsModel = {
      pageNumber: 1, // Số trang hiện tại
      pageSize: 10, // Kích thước của mỗi trang
      filter: '', // Chuỗi tìm kiếm hoặc bộ lọc
      sortOrder: 'asc', // Thứ tự sắp xếp ('asc' hoặc 'desc')
      sortField: 'fieldName', // Trường sắp xếp
      more:false
    };
    const request = this.findData2(this._tableState$.value,queryParams)
      .pipe(
        tap((res: ResultModel<MatHangModel>) => {
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
  public patchState2(patch: Partial<ITableState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch2();
  }

  public fetchStateSort2(patch: Partial<ITableState>) {
    this.patchStateWithoutFetch(patch);
    this.fetch2();
  }

  public patchStateWithoutFetch(patch: Partial<ITableState>) {
    const newState = Object.assign(this._tableState$.value, patch);
    this._tableState$.next(newState);
  }



  DM_MatHang_Insert(item: MatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/create-MatHang';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }

  UpdateMatHang(item: MatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/update-MatHang';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }

  UpdateStatustaikhoan(item: MatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/UpdateStatustaikhoan';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }

  DeleteMatHang(item: MatHangModel): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/delete-MatHang';
    return this.http.post<any>(url, item, { headers: httpHeaders });
  }
	DeletesMatHang(ids: any[] = []): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + '/deletes-MatHang';
    return this.http.post<any>(url, ids, { headers: httpHeaders });
	}
  gettaikhoanModelByRowID(RowID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetMatHangByRowID?RowID=${RowID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  GetKhoID(RowID: number): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/GetMatHangByRowID?RowID=${RowID}`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_Kho_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_Kho_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_XuatXu_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_XuatXu_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  // uploadImage(imageFile: File): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('file', imageFile);
  
  //   const url = API_PRODUCTS_URL + '/Upload'; // Sử dụng URL chính xác của bạn
  //   return this.http.post<any>(url, formData);
  // }
  uploadImage(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', imageFile);
  
    const url = API_PRODUCTS_URL + '/Upload'; 
    return this.http.post<any>(url, formData).toPromise()
      .then(response => response.filePath)
  }
  
  uploadImage2(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', imageFile);
  
    const url = API_PRODUCTS_URL + '/Upload'; 
    return this.http.post(url, formData);
  }
  DM_NhanHieu_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_NhanHieu_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_LoaiMatHang_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_LoaiMatHang_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_DVT_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_DVT_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_DVT_ListCap2(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_DVT_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  DM_DVT_ListCap3(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/DM_DVT_List`;
    return this.http.get<any>(url, { headers: httpHeaders });
  }
  MatHangCha_List(): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const url = API_PRODUCTS_URL + `/MatHangCha_List`;
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
}
