import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

import { BehaviorSubject, of, ReplaySubject, Subscription } from "rxjs";
import { AuthService } from "src/app/modules/auth/_services/auth.service";
import {
  LayoutUtilsService,
  MessageType,
} from "../../../_core/utils/layout-utils.service";
import {
  ResultModel,
  ResultObjModel,
} from "../../../_core/models/_base.model";
import { DatePipe } from "@angular/common";
import { finalize, tap } from "rxjs/operators";
import { PaginatorState } from "src/app/_metronic/shared/crud-table";
import { NhanHieuManagementService } from "../Services/nhanhieu-management.service";
import { NhanHieuModel } from "../Model/nhanhieu-management.model";
import { TranslateService } from "@ngx-translate/core";
import { GeneralService } from "../../../_core/services/general.service";

@Component({
  selector: "app-nhanhieu-management-edit-dialog",
  templateUrl: "./nhanhieu-management-edit-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NhanHieuManagementEditDialogComponent
  implements OnInit, OnDestroy
{
  item: NhanHieuModel = new NhanHieuModel();
  itemkho: NhanHieuModel = new NhanHieuModel();
  isLoading;
  isClicked: boolean = false;
  tempTennhanhieu: string = '';
  formGroup: FormGroup;
  khoFilters: NhanHieuModel[] = [];
  loaiMHFilters: NhanHieuModel[] = [];
  private subscriptions: Subscription[] = [];
  KhofilterForm: FormControl;
  isUpdateMode = false;
  loaiMHfilterForm: FormControl;
  isInitData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoadingSubmit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NhanHieuManagementEditDialogComponent>,
    private fb: FormBuilder,
    public nhanhieuManagementService: NhanHieuManagementService,
    private changeDetect: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    public general: GeneralService,
    private translate: TranslateService,
    public authService: AuthService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  ngOnInit(): void {
    this.item.empty();
    this.item.IdNhanHieu = this.data.item.IdNhanHieu;
    this.loadForm();
    const sb = this.nhanhieuManagementService.isLoading$.subscribe((res) => {
      this.isLoading = res;
    });
    this.subscriptions.push(sb);
  this.loadInitData();

    this.nhanhieuManagementService.isUpdateMode$.subscribe(value => {
      this.isUpdateMode = value;
    });
  }
  loadInitData() {
    if (this.item.IdNhanHieu !== 0) {
      const sbGet = this.nhanhieuManagementService.gettaikhoanModelByRowID(this.item.IdNhanHieu).pipe(tap((res: ResultObjModel<NhanHieuModel>) => {
        if (res.status === 1) {
          this.item = res.data;
          this.setValueToForm(res.data);
        }
      })).subscribe();
      this.subscriptions.push(sbGet);
    }
  }

  reset() {
  debugger
      this.nhanhieuManagementService.setTempTennhanhieu(this.formGroup.get('tennhanhieu').value);
  this.dialogRef.close();
	}
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      this.triggerSubmit();
    }
  }
  triggerSubmit() {
    const submitButton = document.getElementById('submitButton') as HTMLButtonElement;
    if (submitButton) {
      submitButton.click();
    }
  }
  loadForm() {
    debugger
    if (this.nhanhieuManagementService.tempTennhanhieu) {
      this.formGroup = this.fb.group({
        tennhanhieu: [
          this.nhanhieuManagementService.tempTennhanhieu,
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ]),
        ],
      });
    } else {
      this.formGroup = this.fb.group({
        tennhanhieu: [
          "",
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ]),
        ],
      });
    }
  }

  setValueToForm(model: NhanHieuModel) {
    this.formGroup.controls.tennhanhieu.setValue(model.TenNhanHieu);
    //this.formGroup.controls.nhanhieucha.setValue(model.IdLMHParent);
    //this.formGroup.controls.kho.setValue(model.IdKho);
  }

  // getTitle() {
  //   if (this.item.RowId === 0) {
  //     return this.translateService.instant(
  //       "ACCOUNTROLEMANAGEMENT.TAOTAIKHOANSUDUNG"
  //     );
  //   }
  //   return (
  //     this.translateService.instant("ACCOUNTROLEMANAGEMENT.SUATAIKHOAN") +
  //     " " +
  //     this.data.item.Username
  //   );
  // }

  private prepareData(): NhanHieuModel {
    let model = new NhanHieuModel();
    model.empty();
    model.IdNhanHieu=this.item.IdNhanHieu;
    model.TenNhanHieu = this.formGroup.controls.tennhanhieu.value;
    return model;
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
  savecontinute(){
    if (this.formGroup.valid) {
      const model = this.prepareData();
      this.item.IdNhanHieu === 0 ? this.create(model,'saveAndContinue') : this.update(model);
    } else {
      this.validateAllFormFields(this.formGroup);
    }
  }
  Luu() {
    debugger
    // this.nhanhieuManagementService.setTempTennhanhieu('');
    if (this.formGroup.valid) {
      const model = this.prepareData();
      this.item.IdNhanHieu === 0 ? this.create(model,'save') : this.update(model);
    } else {
      this.validateAllFormFields(this.formGroup);
    }
  }
  getTitle() {
    if (this.item.IdNhanHieu === 0) {
      return this.translateService.instant('NHANHIEUMANAGEMENT.THEMNHANHIEU');
    }
    return this.translateService.instant('NHANHIEUMANAGEMENT.SUANHANHIEU');
  }
  create(item: NhanHieuModel, actionType: string) {
    debugger
    this.isLoadingSubmit$.next(true);
      this.nhanhieuManagementService
        .DM_NhanHieu_Insert(item)
        .subscribe((res) => {
          this.isLoadingSubmit$.next(false);
          if (res && res.status === 1) {
            if (actionType === 'saveAndContinue') {
              this.dialogRef.close(res); 

            const item = new NhanHieuModel();
            item.empty();
            let saveMessageTranslateParam = '';
            saveMessageTranslateParam += 'Thêm thành công';
            const saveMessage = this.translate.instant(saveMessageTranslateParam);
            const messageType = MessageType.Create;
            const dialogRef = this.dialog.open(NhanHieuManagementEditDialogComponent, {
              data: { item: item },
              width: '900px',
              disableClose: true,
            });
            dialogRef.afterClosed().subscribe((res) => {
              if (!res) {
                this.nhanhieuManagementService.fetch();
              } else {
                this.layoutUtilsService.showActionNotification(saveMessage, messageType, 4000, true, false);
                this.nhanhieuManagementService.fetch();
              }
            });
            } else {
              this.dialogRef.close(res);
            }
          } else {
            this.layoutUtilsService.showActionNotification(
              res.error.message,
              MessageType.Read,
              999999999,
              true,
              false,
              3000,
              "top",
              0
            );
          }
        });
  }
  // *ngIf="!formHasData()"
  formHasData(): boolean {
    const formValues = this.formGroup.value;
    // Example check for data existence in the form
    // You can modify this based on your actual form structure
    return Object.values(formValues).some(value => !!value);
  }
  update(item: NhanHieuModel) {
    debugger
    this.isLoadingSubmit$.next(true);
    this.nhanhieuManagementService.UpdateNhanHieu(item).subscribe((res) => {
      this.isLoadingSubmit$.next(false);
      if (res && res.status === 1) {
        this.dialogRef.close(res);
      } else {
        this.layoutUtilsService.showActionNotification(res.error.message, MessageType.Read, 999999999, true, false, 3000, 'top', 0);
      }
    });
  }

  goBack() {
    debugger
    if (this.checkDataBeforeClose()) {

      this.dialogRef.close();
    } else {
      const _title = this.translateService.instant("CHECKPOPUP.TITLE");
      const _description = this.translateService.instant(
        "CHECKPOPUP.DESCRIPTION"
      );
      const _waitDesciption = this.translateService.instant(
        "CHECKPOPUP.WAITDESCRIPTION"
      );
      const popup = this.layoutUtilsService.deleteElement(
        _title,
        _description,
        _waitDesciption
      );
      popup.afterClosed().subscribe((res) => {
        this.nhanhieuManagementService.setTempTennhanhieu('');
        res ? this.dialogRef.close() : undefined;
      });
    }
  }

  checkDataBeforeClose(): boolean {
    const model = this.prepareData();
    if (this.item.IdNhanHieu === 0) {
      const empty = new NhanHieuModel();
      empty.empty();
      return this.general.isEqual(empty, model);
    }
    return this.general.isEqual(model, this.item);
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeunloadHandler(e) {
    if (!this.checkDataBeforeClose()) {
      e.preventDefault(); //for Firefox
      return (e.returnValue = ""); //for Chorme
    }
  }
}
