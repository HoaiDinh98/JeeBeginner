import {ChangeDetectionStrategy,ChangeDetectorRef,Component,HostListener,Inject,OnDestroy,OnInit,} from "@angular/core";
import {MatDialog, MatDialogRef,MAT_DIALOG_DATA,} from "@angular/material/dialog";
import {FormArray,FormBuilder,FormControl,FormGroup,Validators,} from "@angular/forms";
import { BehaviorSubject, of, ReplaySubject, Subscription } from "rxjs";
import { AuthService } from "src/app/modules/auth/_services/auth.service";
import {LayoutUtilsService,MessageType,} from "../../../_core/utils/layout-utils.service";
import { ResultModel,ResultObjModel,} from "../../../_core/models/_base.model";
import { DatePipe } from "@angular/common";
import { finalize, tap } from "rxjs/operators";
import { PaginatorState } from "src/app/_metronic/shared/crud-table";
import { LoaiMatHangManagementService } from "../Services/loaimathang-management.service";
import { LoaiMatHangModel,ListImageModel } from "../Model/loaimathang-management.model";
import { TranslateService } from "@ngx-translate/core";
import { GeneralService } from "../../../_core/services/general.service";
import { environment } from '../../../../../../environments/environment';
import { ElementRef, ViewChild } from '@angular/core';
@Component({
  selector: "app-loaimathang-management-edit-dialog",
  templateUrl: "./loaimathang-management-edit-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaiMatHangManagementEditDialogComponent
  implements OnInit, OnDestroy
{
  item: LoaiMatHangModel = new LoaiMatHangModel();
  itemkho: LoaiMatHangModel = new LoaiMatHangModel();
  isLoading;
  file: File ;
  API_ROOT_URL = environment.ApiRoot + '/MatHangManagement' +'/' ;
  API_URL=environment.ApiUrlRoot;
  selectedImages: { name: string; url: string }[] = [];
  formGroup: FormGroup;
  listAnh: any[] = [];
  khoFilters: LoaiMatHangModel[] = [];
  loaiMHFilters: LoaiMatHangModel[] = [];
  private subscriptions: Subscription[] = [];
  KhofilterForm: FormControl;
  isUpdateMode = false;
  hasFormErrors: boolean = false;
  loaiMHfilterForm: FormControl;
  isInitData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoadingSubmit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  @ViewChild('fileInput') fileInput: ElementRef;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LoaiMatHangManagementEditDialogComponent>,
    private fb: FormBuilder,
    public loaimathangManagementService: LoaiMatHangManagementService,
    private changeDetect: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    public general: GeneralService,
    public authService: AuthService,
    public datepipe: DatePipe,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  ngOnInit(): void {
    this.item.empty();
    this.item.IdLMH = this.data.item.IdLMH;
    this.loadForm();
    const sb = this.loaimathangManagementService.isLoading$.subscribe((res) => {
      this.isLoading = res;
    });
    this.subscriptions.push(sb);
    const add = this.loaimathangManagementService
    .DM_Kho_List()
    .subscribe((res: ResultModel<LoaiMatHangModel>) => {
      if (res && res.status === 1) {
        this.khoFilters = res.data;
        this.KhofilterForm = new FormControl(this.khoFilters[0].IdKho);
        this.isInitData.next(true);
      }
    });
  this.subscriptions.push(add);
  this.loadInitData();
  const addLMHC = this.loaimathangManagementService
    .LoaiMatHangCha_List()
    .subscribe((res: ResultModel<LoaiMatHangModel>) => {
      if (res && res.status === 1) {

        this.loaiMHFilters = res.data;
        this.loaiMHfilterForm = new FormControl(
          this.loaiMHFilters[0].IdLMHParent
        );
        this.isInitData.next(true);
      }
    });
  this.subscriptions.push(addLMHC);
  this.loadInitDataLoaiMHCHA();

  this.loadInitDataUpdate();

  this.loaimathangManagementService.isUpdateMode$.subscribe(value => {
    this.isUpdateMode = value;
  });
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

  loadInitData() {
    if (this.itemkho.IdKho !== 0) {
      const sbGet = this.loaimathangManagementService
        .GetKhoID(this.itemkho.IdKho)
        .pipe(
          tap((res: ResultObjModel<LoaiMatHangModel>) => {
            if (res.status === 1) {
              this.itemkho = res.data;
              this.setValueToForm(res.data);
            }
          })
        )
        .subscribe();
      this.subscriptions.push(sbGet);
    }
  }
  loadInitDataLoaiMHCHA() {
    if (this.item.IdLMHParent !== 0) {
      const sbGet = this.loaimathangManagementService
        .GetKhoID(this.item.IdLMHParent)
        .pipe(
          tap((res: ResultObjModel<LoaiMatHangModel>) => {
            if (res.status === 1) {
              this.item = res.data;
              this.setValueToForm(res.data);
            }
          })
        )
        .subscribe();
      this.subscriptions.push(sbGet);
    }
  }
  async onFileSelected(event: any) {
    debugger
  //   if (this.listAnh && this.listAnh.length >= 2) {
  //     alert("Bạn chỉ có thể chọn tối đa 2 hình ảnh.");
  //     return;
  // }
    this.file = event.target.files[0];
    const files = event.target.files;
    if (files) {
      for (const fileload of files) {
        this.loaimathangManagementService.uploadImage(fileload);
        // const fileName = this.file.name;
        // const newImageModel = new ListImageModel();
        // newImageModel.filename = fileName;
        // this.selectedImages.push(fileload);
        this.selectedImages.push({
          name: fileload.name,
          url: this.getImageUrl(fileload.name),
        });
      }
    }
    console.log(this.selectedImages);
    for (const image of this.selectedImages) {
      console.log(image);
      console.log(image.name);
    }
  }
  getImageUrl(imageName: string): string {
    debugger;
    return `${environment.ApiUrlRoot}/uploads/${imageName}`;
  }  
  getImageUrl2(image: ListImageModel): string {
    return this.API_URL + '/uploads/' + image.filename;
}
  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
}

  loadInitDataUpdate() {
    if (this.item.IdLMH !== 0) {
      const sbGet = this.loaimathangManagementService.gettaikhoanModelByRowID(this.item.IdLMH).pipe(tap((res: ResultObjModel<LoaiMatHangModel>) => {
        if (res.status === 1) {
          this.item = res.data;
          this.setValueToForm(res.data);
        }
      })).subscribe();
      this.subscriptions.push(sbGet);
    }
  }
  loadForm() {
    this.formGroup = this.fb.group({
      tenloaimathang: [
        "",
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),
      ],
      loaimathangcha: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^-?(0|[0-9]\d*)?$/),
          Validators.maxLength(50),
        ]),
      ],
      kho: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^-?(0|[0-9]\d*)?$/),
          Validators.maxLength(50),
        ]),
      ],
      douutien: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(/^-?(0|[0-9]\d*)?$/),
          Validators.maxLength(50),
        ]),
      ],
      mota: ["", Validators.compose([Validators.maxLength(500)])],
      HinhAnh: [(this.item.HinhAnh == null) ? '' : this.item.HinhAnh],
    });
  }
  // reset() {
  //   this.formGroup.controls.tenloaimathang.setValue("");
  //   this.formGroup.controls.loaimathangcha.setValue("");
  //   this.formGroup.controls.mota.setValue("");
  //   this.formGroup.controls.douutien.setValue("");
  //   this.formGroup.controls.kho.setValue("");
  //   this.formGroup.controls.image.setValue("");
	// }
  reset() {
		if (this.formGroup.dirty && this.formGroup.touched) {
			const _title: string = 'Đặt lại';
			const _description: string = 'Bạn có muốn đặt lại dữ liệu?';
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
				this.loadForm();
				this.hasFormErrors = false;
        this.selectedImages = [];
				this.formGroup.markAsPristine();
				this.formGroup.markAsUntouched();
				this.formGroup.updateValueAndValidity();
				this.changeDetectorRefs.detectChanges();
			});
		}
		else {
			this.loadForm();
			this.hasFormErrors = false;
      this.selectedImages = [];
			this.formGroup.markAsPristine();
			this.formGroup.markAsUntouched();
			this.formGroup.updateValueAndValidity();
			this.changeDetectorRefs.detectChanges();
		}
	}
  setValueToForm(model: LoaiMatHangModel) {
    debugger
    this.formGroup.controls.tenloaimathang.setValue(model.TenLMH);
    this.formGroup.controls.loaimathangcha.setValue(model.IdLMHParent);
    this.formGroup.controls.mota.setValue(model.Mota);
    this.formGroup.controls.douutien.setValue(model.DoUuTien);
    this.formGroup.controls.kho.setValue(model.IdKho);

    //this.formGroup.controls.nhanhieucha.setValue(model.IdLMHParent);
    //this.formGroup.controls.kho.setValue(model.IdKho);
    // const fileName = model.HinhAnh;
    // const newImageModel = new ListImageModel();
    // newImageModel.filename = fileName;
    // this.listAnh.push(newImageModel);
    if (model.HinhAnh !== "") {
      this.formGroup.controls.HinhAnh.setValue(model.HinhAnh);
    this.selectedImages.push({
      name: model.HinhAnh,
      url: this.getImageUrl(model.HinhAnh),
    });
  }
  }

  getTitle() {
    if (this.item.IdLMH === 0) {
      return this.translateService.instant("LOAIMATHANGMANAGEMENT.THEMLOAIMATHANG");
    }
    return this.translateService.instant("LOAIMATHANGMANAGEMENT.SUALOAIMATHANG");
  }

  private prepareData(): LoaiMatHangModel {
    const model = new LoaiMatHangModel();
      model.empty();
      debugger;
      model.TenLMH = this.formGroup.controls.tenloaimathang.value;
      model.IdLMHParent = this.formGroup.controls.loaimathangcha.value;
      model.IdKho = this.formGroup.controls.kho.value;
      model.Mota = this.formGroup.controls.mota.value;
      model.DoUuTien = this.formGroup.controls.douutien.value;
      model.IdLMH = this.item.IdLMH;
      //model.Mobile = this.formGroup.controls.sodienthoai.value;
      //model.Note = this.formGroup.controls.ghichu.value;
      // model.PartnerId = this.item.PartnerId;
      // model.Password = this.formGroup.controls.password.value;
      // model.Username = this.formGroup.controls.username.value;
      
    if (this.selectedImages && this.selectedImages.length === 1) {
      model.HinhAnh = this.selectedImages[0].name;
    } else if (this.selectedImages && this.selectedImages.length > 1) {
      const message = 'Chỉ được phép lưu một trong hai hình ảnh. Vui lòng xóa một hình ảnh trước khi lưu.';
      this.layoutUtilsService.showActionNotification(message, MessageType.Read, 2000, true, false);
        // alert('Chỉ được phép lưu một trong hai hình ảnh. Vui lòng xóa một hình ảnh trước khi lưu.');
        return null; 
    } else {
      model.HinhAnh = this.formGroup.controls.HinhAnh.value || ''; 
    }
      return model;
  }

  Luu() {
    debugger
    const model = this.prepareData();
    if (model.HinhAnh === '' || !this.file || !this.file.name) {
      alert('Vui lòng chọn một bức ảnh để lưu.');
      return;
  }
    this.item.IdLMH === 0 ? this.create(model) : this.update(model);
    // if (this.formGroup.valid) {
    //   if (
    //     this.formGroup.controls.password.value !==
    //     this.formGroup.controls.repassword.value
    //   ) {
    //     const message = this.translateService.instant(
    //       "ERROR.MATKHAUKHONGTRUNGKHOP"
    //     );
    //     this.layoutUtilsService.showActionNotification(
    //       message,
    //       MessageType.Read,
    //       999999999,
    //       true,
    //       false,
    //       3000,
    //       "top",
    //       0
    //     );
    //     return;
    //   }
    //   const model = this.prepareData();
    //   this.item.IdLMH === 0 ? this.create(model) : this.update(model);
    // } else {
    //   this.validateAllFormFields(this.formGroup);
    // }
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

  create(item: LoaiMatHangModel) {
    this.isLoadingSubmit$.next(true);
      this.loaimathangManagementService
        .DM_LoaiMatHang_Insert(item)
        .subscribe((res) => {
          this.isLoadingSubmit$.next(false);
          if (res && res.status === 1) {
            this.dialogRef.close(res);
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

  update(item: LoaiMatHangModel) {
    debugger
    this.isLoadingSubmit$.next(true);
    this.loaimathangManagementService.UpdateLoaiMatHang(item).subscribe((res) => {
      this.isLoadingSubmit$.next(false);
      if (res && res.status === 1) {
        this.dialogRef.close(res);
      } else {
        this.layoutUtilsService.showActionNotification(res.error.message, MessageType.Read, 999999999, true, false, 3000, 'top', 0);
      }
    });
  }

  goBack() {
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
        res ? this.dialogRef.close() : undefined;
      });
    }
  }

  checkDataBeforeClose(): boolean {
    const model = this.prepareData();
    if (this.item.IdLMH === 0) {
      const empty = new LoaiMatHangModel();
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
