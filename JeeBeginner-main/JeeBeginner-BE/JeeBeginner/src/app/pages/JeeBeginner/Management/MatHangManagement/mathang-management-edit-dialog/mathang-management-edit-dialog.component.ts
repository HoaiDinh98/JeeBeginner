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
import { MatHangManagementService } from "../Services/mathang-management.service";
import { MatHangModel,ListImageModel } from "../Model/mathang-management.model";
import { TranslateService } from "@ngx-translate/core";
import { GeneralService } from "../../../_core/services/general.service";
import { QueryParamsModel } from '../../../_core/models/query-models/query-params.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable} from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ElementRef, ViewChild } from '@angular/core';
@Component({
  
  selector: "app-mathang-management-edit-dialog",
  templateUrl: "./mathang-management-edit-dialog.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatHangManagementEditDialogComponent
  implements OnInit, OnDestroy
{
  
  selectedImageFile: File;
  selectedImageUrl:string='';
  selectedImageUrl2:any;
  DM_MatHang: MatHangModel;
  DM_MatHangId$: Observable<number>;
	oldDM_MatHang: MatHangModel;
  item: MatHangModel = new MatHangModel();
  itemkho: MatHangModel = new MatHangModel();
  isLoading;
  formGroup: FormGroup;
  khoFilters: MatHangModel[] = [];
  loaiMHFilters: MatHangModel[] = [];
  API_ROOT_URL = environment.ApiRoot + '/MatHangManagement' +'/' ;
  API_URL=environment.ApiUrlRoot;
	arrMatHang: any[] = [];
  XuatXuFilters: MatHangModel[] = [];
  XuatXuMHFilters: MatHangModel[] = [];
	selectedTab: number = 0;
	listIdLMH: any[] = [];
	selectIdLMH: string = '0';
	listAnh: any[] = [];
	listIdDVT: any[] = [];
  file: File ;
  filetemp:string='';
	selectIdDVT: string = '0';
	listIdDVTCap2: any[] = [];
	selectIdDVTCap2: string = '0';
	listIdDVTCap3: any[] = [];
	selectIdDVTCap3: string = '0';
	listIdNhanHieu: any[] = [];
	selectIdNhanHieu: string = '0';
	listIdXuatXu: any[] = [];
	selectIdXuatXu: string = '0';
	isView: number = 0;
	disBtnSubmit: boolean = false;
	imagedata: any;
	listimagedata: any;
	imgvl: any[] = [];
	lstimg: any[] = [];

	private headerMargin: number;
  private subscriptions: Subscription[] = [];
  KhofilterForm: FormControl;
  XuatXufilterForm: FormControl;
  isUpdateMode = false;
 tempFile = localStorage.getItem('tempFile');
  @ViewChild('fileInput') fileInput2: ElementRef<HTMLInputElement>;
  loaiMHfilterForm: FormControl;
  hasFormErrors: boolean = false;
  isInitData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loadingSubject = new BehaviorSubject<boolean>(true);
  isLoadingSubmit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  @ViewChild('fileInput') fileInput: ElementRef;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MatHangManagementEditDialogComponent>,
    private fb: FormBuilder,
    private router: Router,
    public mathangManagementService: MatHangManagementService,
    private changeDetect: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    private activatedRoute: ActivatedRoute,
    public general: GeneralService,
    public authService: AuthService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
    private translateService: TranslateService,
    private changeDetectorRefs: ChangeDetectorRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  ngOnInit(): void {
    this.isView = (window.history.state.isView != undefined) ? window.history.state.isView : 0;
    this.item.empty();
    this.item.IdMH = this.data.item.IdMH;
    this.loadForm();
    const sb = this.mathangManagementService.isLoading$.subscribe((res) => {
      this.isLoading = res;
    });
    this.subscriptions.push(sb);
  //   const add = this.mathangManagementService
  //   .DM_Kho_List()
  //   .subscribe((res: ResultModel<MatHangModel>) => {
  //     if (res && res.status === 1) {
  //       this.khoFilters = res.data;
  //       this.KhofilterForm = new FormControl(this.khoFilters[0].IdKho);
  //       this.isInitData.next(true);
  //     }
  //   });
  // this.subscriptions.push(add);

  debugger
this.ListIdXuatXu();
this.ListIdDVT();
this.ListIdLMH();
this.ListIdNhanHieu();
this.ListIdDVTCap2();
this.ListIdDVTCap3();
  this.loadInitDataUpdate();


  this.mathangManagementService.isUpdateMode$.subscribe(value => {
    this.isUpdateMode = value;
  });


  // this.activatedRoute.params.subscribe(params => {
  //   const id = params['id'];
  //   if (id && id > 0) {
  //     this.mathangManagementService.gettaikhoanModelByRowID(id).subscribe(res => {
  //       this.DM_MatHang = res.data;
  //       this.oldDM_MatHang = Object.assign({}, res);
  //       this.loadDM_MatHang(this.DM_MatHang);
  //       this.DM_MatHang.domain = this.API_ROOT_URL;
  //       if (this.DM_MatHang.HinhAnh === null || this.DM_MatHang.HinhAnh === "") {
  //         this.imagedata = {
  //           RowID: "",
  //           Title: "",
  //           Description: "",
  //           Required: false,
  //           Files: []
  //         }
  //       }
  //       else {
  //         this.imagedata = {
  //           RowID: "",
  //           Title: "",
  //           Description: "",
  //           Required: false,
  //           Files: []
  //         }
  //         let a = {
  //           strBase64: "",
  //           filename: "",
  //           extension: "",
  //           Type: 1,
  //           type: "image/png",
  //           src: this.DM_MatHang.domain + this.DM_MatHang.HinhAnh,
  //           IsAdd: false,
  //           IsDel: false
  //         };
  //         this.imagedata.Files.push(a)
  //       }
  //       if (this.DM_MatHang.lstImg.length > 0) {
  //         this.listimagedata = {
  //           RowID: "",
  //           Title: "",
  //           Description: "",
  //           Required: false,
  //           Files: []
  //         }
  //         for (let i = 0; i < this.DM_MatHang.lstImg.length; i++) {
  //           let a = {
  //             strBase64: "",
  //             filename: "",
  //             extension: "",
  //             Type: 1,
  //             type: "image/png",
  //             src: this.DM_MatHang.domain + this.DM_MatHang.lstImg[i].src,
  //             basesrc: this.DM_MatHang.lstImg[i].src,
  //             IsAdd: false,
  //             IsDel: false
  //           };
  //           this.listimagedata.Files.push(a)
  //         }
  //       }
  //       else {
  //         this.listimagedata = {
  //           RowID: "",
  //           Title: "",
  //           Description: "",
  //           Required: false,
  //           Files: []
  //         }
  //       }
  //       this.changeDetectorRefs.detectChanges();
  //     });
  //   } else {
  //     const newDM_MatHang = new MatHangModel();
  //     newDM_MatHang.empty();
  //     this.oldDM_MatHang = Object.assign({}, newDM_MatHang);
  //     this.loadDM_MatHang(newDM_MatHang);
  //     this.DM_MatHang.domain = this.API_ROOT_URL;
  //     this.imagedata = {
  //       RowID: "",
  //       Title: "",
  //       Description: "",
  //       Required: false,
  //       Files: []
  //     };
  //     this.listimagedata = {
  //       RowID: "",
  //       Title: "",
  //       Description: "",
  //       Required: false,
  //       Files: []
  //     };
  //   }
  // });
  // // sticky portlet header
  // window.onload = () => {
  //   const style = getComputedStyle(document.getElementById('kt_header'));
  //   this.headerMargin = parseInt(style.height, 0);
  // };
  // let url = this.router.url;
  // this.changeDetectorRefs.detectChanges();
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
  reset() {
		if (this.formGroup.dirty && this.formGroup.touched) {
			const _title: string = 'Đặt lại';
			const _description: string = 'Bạn có muốn đặt lại dữ liệu?';
			const dialogRef = this.layoutUtilsService.deleteElement(_title, _description);
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					return;
				}
				this.imagedata = {
					RowID: "",
					Title: "",
					Description: "",
					Required: false,
					Files: []
				};
				this.listimagedata = {
					RowID: "",
					Title: "",
					Description: "",
					Required: false,
					Files: []
				};
				this.DM_MatHang = Object.assign({}, this.oldDM_MatHang);
        this.listAnh = [];
				this.loadForm();
				this.hasFormErrors = false;
				this.formGroup.markAsPristine();
				this.formGroup.markAsUntouched();
				this.formGroup.updateValueAndValidity();
				this.changeDetectorRefs.detectChanges();
			});
		}
		else {
			this.imagedata = {
				RowID: "",
				Title: "",
				Description: "",
				Required: false,
				Files: []
			};
			this.listimagedata = {
				RowID: "",
				Title: "",
				Description: "",
				Required: false,
				Files: []
			};
			this.DM_MatHang = Object.assign({}, this.oldDM_MatHang);
      this.listAnh = [];
			this.loadForm();
			this.hasFormErrors = false;
			this.formGroup.markAsPristine();
			this.formGroup.markAsUntouched();
			this.formGroup.updateValueAndValidity();
			this.changeDetectorRefs.detectChanges();
		}
	}
  loadDM_MatHang(_DM_MatHang: MatHangModel) {
		if (!_DM_MatHang) {
			this.goBack();
		}
		this.DM_MatHang = _DM_MatHang;
		this.oldDM_MatHang = Object.assign({}, _DM_MatHang);
		this.initDM_MatHang();
	}
  initDM_MatHang() {
		this.loadForm();
		this.loadingSubject.next(false);
	}
  loadInitData() {
    // if (this.itemkho.IdKho !== 0) {
    //   const sbGet = this.mathangManagementService
    //     .GetKhoID(this.itemkho.IdKho)
    //     .pipe(
    //       tap((res: ResultObjModel<MatHangModel>) => {
    //         if (res.status === 1) {
    //           this.itemkho = res.data;
    //           this.setValueToForm(res.data);
    //         }
    //       })
    //     )
    //     .subscribe();
    //   this.subscriptions.push(sbGet);
    // }
  }
  loadInitDataLoaiMHCHA() {
    if (this.item.SoKyTinhKhauHaoToiDa !== 0) {
      const sbGet = this.mathangManagementService
        .GetKhoID(this.item.SoKyTinhKhauHaoToiDa)
        .pipe(
          tap((res: ResultObjModel<MatHangModel>) => {
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
  // onFileSelected(event: any) {
  //   debugger
  //   // const selectedFile = event.target.files[0]; // Lấy tệp đầu tiên từ danh sách các tệp được chọn
  //   // if (selectedFile) {
  //   //   const fileUrl = URL.createObjectURL(selectedFile); // Lấy đường dẫn tạm thời đến tệp
  //   //   // Làm cái gì đó với đường dẫn fileUrl ở đây, ví dụ, gán cho một biến trong component
  //   //   this.formGroup.get('HinhAnh').setValue(fileUrl);
  //   //   console.log("Đường dẫn đến file hình ảnh:", fileUrl);
  //   // }
  //   // const file: File = event.target.files[0];
  //   // if (file) {
  //   //     const reader = new FileReader();
  //   //     reader.onload = (e: any) => {
  //   //       const fileName = file.name;
  //   //       const imagePath = "E:\\Hinh\\100\\" + fileName;
  //   //     };
  //   //     reader.readAsDataURL(file);
  //   // }
  //   this.selectedImageFile = event.target.files[0];
  // }



  onFileSelected(event: any) {
    debugger
    if (this.listAnh && this.listAnh.length >= 2) {
      alert("Bạn chỉ có thể chọn tối đa 2 hình ảnh.");
      return;
  }
    this.file = event.target.files[0];
    if (this.file) {

      this.mathangManagementService.uploadImage(this.file);
      const fileName = this.file.name;
      const newImageModel = new ListImageModel();
      newImageModel.filename = fileName;
      this.listAnh.push(newImageModel);

    }
  }
  getImageUrl2(image: ListImageModel): string {
    return this.API_URL + '/uploads/' + image.filename;
}
  removeImage(index: number) {
    this.listAnh.splice(index, 1);
}
  uploadFile(inputFile) {
    debugger
    var file = inputFile.files[0];
    var formData = new FormData();
    formData.append("file", file);

    var xhr = new XMLHttpRequest();
    xhr.open("POST",this.API_ROOT_URL +"/Upload", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Xử lý phản hồi thành công ở đây
                console.log("Upload successful");
            } else {
                // Xử lý phản hồi không thành công ở đây
                console.error("Upload failed");
            }
        }
    };
    xhr.send(formData);
}
  
  onChooseFile(): void {
    this.fileInput.nativeElement.click();
  }
  loadInitDataUpdate() {
    debugger
    if (this.item.IdMH !== 0) {
      const sbGet = this.mathangManagementService.gettaikhoanModelByRowID(this.item.IdMH).pipe(tap((res: ResultObjModel<MatHangModel>) => {
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
      maHang: [(this.item.MaHang == null || this.item.MaHang == '') ? '' : this.item.MaHang, Validators.required],
			tenMatHang: [(this.item.TenMatHang == null || this.item.TenMatHang == '') ? '' : this.item.TenMatHang, Validators.required],
			idLMH: [(this.item.IdLMH == 0) ? '' : this.item.IdLMH.toString(), Validators.required],
			idDVT: [(this.item.IdDVT == 0) ? '' : this.item.IdDVT.toString(), Validators.required],
			mota: [(this.item.Mota == null) ? '' : this.item.Mota],
			giaMua: [(this.item.GiaMua == null) ? '0' : this.f_currency_V2(this.item.GiaMua.toString())],
			giaBan: [(this.item.GiaBan == null) ? '0' : this.f_currency_V2(this.item.GiaBan.toString())],
			vAT: [(this.item.VAT == null) ? '0' : this.item.VAT.toString()],
			barcode: [(this.item.Barcode == null) ? '' : this.item.Barcode],
			ngungKinhDoanh: [(this.item.NgungKinhDoanh == null) ? '' : this.item.NgungKinhDoanh],
			idDVTCap2: [(this.item.IdDVTCap2 == null) ? '0' : this.item.IdDVTCap2.toString()],
			quyDoiDVTCap2: [(this.item.QuyDoiDVTCap2 == null) ? '0' : this.f_currency_V2(this.item.QuyDoiDVTCap2.toString())],
			idDVTCap3: [(this.item.IdDVTCap3 == null) ? '0' : this.item.IdDVTCap3.toString()],
			quyDoiDVTCap3: [(this.item.QuyDoiDVTCap3 == null) ? '0' : this.f_currency_V2(this.item.QuyDoiDVTCap3.toString())],
			tenOnSite: [(this.item.TenOnSite == null || this.item.TenOnSite == '') ? '' : this.item.TenOnSite],
			idNhanHieu: [(this.item.IdNhanHieu == null) ? '0' : this.item.IdNhanHieu.toString()],
			idXuatXu: [(this.item.IdXuatXu == null) ? '0' : this.item.IdXuatXu.toString()],
			chiTietMoTa: [(this.item.ChiTietMoTa == null) ? '' : this.item.ChiTietMoTa],
			maPhu: [(this.item.MaPhu == null) ? '' : this.item.MaPhu],
			thongSo: [(this.item.ThongSo == null) ? '' : this.item.ThongSo],
			theoDoiTonKho: [(this.item.TheoDoiTonKho == null) ? '' : this.item.TheoDoiTonKho],
			theodoiLo: [(this.item.TheodoiLo == null) ? true : this.item.TheodoiLo],
			maLuuKho: [(this.item.MaLuuKho == null) ? '' : this.item.MaLuuKho.toString()],
			maViTriKho: [(this.item.MaViTriKho == null) ? '' : this.item.MaViTriKho],
			imageControl: [this.item.HinhAnh],
			lstImageControl: [this.item.lstImg],
			upperLimit: [(this.item.UpperLimit == 0 || this.item.UpperLimit == null) ? '0' :
				this.f_currency_V2('' + this.item.UpperLimit)],
			lowerLimit: [(this.item.LowerLimit == 0 || this.item.LowerLimit == null) ? '0' :
				this.f_currency_V2('' + this.item.LowerLimit)],
			isTaiSan: [(this.item.IsTaiSan == null) ? '' : this.item.IsTaiSan],
			HinhAnh: [(this.item.HinhAnh == null) ? '' : this.item.HinhAnh],

			SoKyTinhKhauHaoToiThieu: [(this.item.SoKyTinhKhauHaoToiThieu == null) ? '0' : this.f_currency_V2(this.item.SoKyTinhKhauHaoToiThieu.toString()),Validators.required],
			SoKyTinhKhauHaoToiDa: [(this.item.SoKyTinhKhauHaoToiDa == null) ? '0' : this.f_currency_V2(this.item.SoKyTinhKhauHaoToiDa.toString()),Validators.required],

			SoNamDeNghi: [(this.item.SoNamDeNghi == null) ? '0' : this.f_currency_V2(this.item.SoNamDeNghi.toString()),Validators.required],
			TiLeHaoMon: [(this.item.TiLeHaoMon == null) ? '0' : this.f_currency_V2(this.item.TiLeHaoMon.toString()),Validators.required],
    });
  }

  setValueToForm(model: MatHangModel) {
    debugger
    this.formGroup.controls.maHang.setValue(model.MaHang);
    this.formGroup.controls.tenMatHang.setValue(model.TenMatHang);
    this.formGroup.controls.idLMH.setValue(model.IdLMH);
    this.formGroup.controls.idDVT.setValue(model.IdDVT);
    this.formGroup.controls.mota.setValue(model.Mota);
    this.formGroup.controls.giaMua.setValue(model.GiaMua);
    this.formGroup.controls.giaBan.setValue(model.GiaBan);
    this.formGroup.controls.vAT.setValue(model.VAT);
    this.formGroup.controls.barcode.setValue(model.Barcode);
    this.formGroup.controls.ngungKinhDoanh.setValue(model.NgungKinhDoanh);
    this.formGroup.controls.idDVTCap2.setValue(model.IdDVTCap2);
    this.formGroup.controls.quyDoiDVTCap2.setValue(model.QuyDoiDVTCap2);
    this.formGroup.controls.idDVTCap3.setValue(model.IdDVTCap3);
    this.formGroup.controls.quyDoiDVTCap3.setValue(model.QuyDoiDVTCap3);
    this.formGroup.controls.tenOnSite.setValue(model.TenOnSite);
    this.formGroup.controls.idNhanHieu.setValue(model.IdNhanHieu);
    this.formGroup.controls.idXuatXu.setValue(model.IdXuatXu);
    this.formGroup.controls.chiTietMoTa.setValue(model.ChiTietMoTa);
    this.formGroup.controls.maPhu.setValue(model.MaPhu);
    this.formGroup.controls.thongSo.setValue(model.ThongSo);
    this.formGroup.controls.theoDoiTonKho.setValue(model.TheoDoiTonKho);
    this.formGroup.controls.theodoiLo.setValue(model.TheodoiLo);
    this.formGroup.controls.isTaiSan.setValue(model.IsTaiSan);
    this.formGroup.controls.maLuuKho.setValue(model.MaLuuKho);
    this.formGroup.controls.maViTriKho.setValue(model.MaViTriKho);
    this.formGroup.controls.upperLimit.setValue(model.UpperLimit);
    this.formGroup.controls.lowerLimit.setValue(model.LowerLimit);
    this.formGroup.controls.SoKyTinhKhauHaoToiThieu.setValue(model.SoKyTinhKhauHaoToiThieu);
    this.formGroup.controls.SoKyTinhKhauHaoToiDa.setValue(model.SoKyTinhKhauHaoToiDa);
    this.formGroup.controls.SoNamDeNghi.setValue(model.SoNamDeNghi);
    this.formGroup.controls.TiLeHaoMon.setValue(model.TiLeHaoMon);
    this.formGroup.controls.HinhAnh.setValue(model.HinhAnh);
    // this.item.listLinkImage = model.listLinkImage;
    if (!this.formGroup.controls.listLinkImage) {
      this.formGroup.addControl('listLinkImage', new FormArray([]));
  }
  
  // Gán giá trị cho các trường khác
  // ...

  // Gán giá trị cho listLinkImage
  const fileName = model.HinhAnh;
  const newImageModel = new ListImageModel();
  newImageModel.filename = fileName;
  this.listAnh.push(newImageModel);
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

  private prepareData(): MatHangModel {
    debugger

		const controls = this.formGroup.controls;
		const _DM_MatHang = new MatHangModel();
		_DM_MatHang.empty();
    _DM_MatHang.IdMH=this.item.IdMH;
		_DM_MatHang.MaHang = controls['maHang'].value;
		_DM_MatHang.TenMatHang = controls['tenMatHang'].value;
		_DM_MatHang.IdLMH = controls['idLMH'].value;
		_DM_MatHang.IdDVT = controls['idDVT'].value;
		_DM_MatHang.Mota = controls['mota'].value;
		_DM_MatHang.GiaMua = controls['giaMua'].value;
		_DM_MatHang.GiaBan = controls['giaBan'].value;
		_DM_MatHang.VAT = controls['vAT'].value;
		_DM_MatHang.Barcode = controls['barcode'].value;
		_DM_MatHang.NgungKinhDoanh = controls['ngungKinhDoanh'].value ? true : false;
		_DM_MatHang.IdDVTCap2 = controls['idDVTCap2'].value;
		_DM_MatHang.QuyDoiDVTCap2 = controls['quyDoiDVTCap2'].value;
		_DM_MatHang.IdDVTCap3 = controls['idDVTCap3'].value;
		_DM_MatHang.QuyDoiDVTCap3 = controls['quyDoiDVTCap3'].value;
		_DM_MatHang.TenOnSite = controls['tenOnSite'].value;
		_DM_MatHang.IdNhanHieu = controls['idNhanHieu'].value;
		_DM_MatHang.IdXuatXu = controls['idXuatXu'].value;
		_DM_MatHang.ChiTietMoTa = controls['chiTietMoTa'].value;
		_DM_MatHang.MaPhu = controls['maPhu'].value;
		_DM_MatHang.ThongSo = controls['thongSo'].value;
		_DM_MatHang.TheoDoiTonKho = controls['theoDoiTonKho'].value ? true : false;
		_DM_MatHang.TheodoiLo = controls['theodoiLo'].value ? true : false;
		_DM_MatHang.IsTaiSan = controls['isTaiSan'].value ? true : false;
		_DM_MatHang.MaLuuKho = controls['maLuuKho'].value;
		_DM_MatHang.MaViTriKho = controls['maViTriKho'].value;
		_DM_MatHang.UpperLimit = controls['upperLimit'].value;
		_DM_MatHang.LowerLimit = controls['lowerLimit'].value;
		_DM_MatHang.SoKyTinhKhauHaoToiThieu = controls['SoKyTinhKhauHaoToiThieu'].value;
		_DM_MatHang.SoKyTinhKhauHaoToiDa = controls['SoKyTinhKhauHaoToiDa'].value;

		_DM_MatHang.SoNamDeNghi = controls['SoNamDeNghi'].value;
		_DM_MatHang.TiLeHaoMon = controls['TiLeHaoMon'].value;


    // if (this.file && this.file.name) {
    //   _DM_MatHang.HinhAnh = this.file.name;
    // } else {
    //     _DM_MatHang.HinhAnh = controls['HinhAnh'].value; 
    // }

    if (this.listAnh && this.listAnh.length === 1) {
      _DM_MatHang.HinhAnh = this.listAnh[0].filename;
  } else if (this.listAnh && this.listAnh.length > 1) {
    const message = 'Chỉ được phép lưu một trong hai hình ảnh. Vui lòng xóa một hình ảnh trước khi lưu.';
    this.layoutUtilsService.showActionNotification(message, MessageType.Read, 2000, true, false);
      // alert('Chỉ được phép lưu một trong hai hình ảnh. Vui lòng xóa một hình ảnh trước khi lưu.');
      return null; 
  } else {
      _DM_MatHang.HinhAnh = controls['HinhAnh'].value || ''; 
  }
  //   if (this.item.listLinkImage && this.item.listLinkImage.length === 1) {
  //     _DM_MatHang.HinhAnh = this.item.listLinkImage[0].filename;
  // } else if (this.item.listLinkImage && this.item.listLinkImage.length > 1) {
  //   const message = 'Chỉ được phép lưu một trong hai hình ảnh. Vui lòng xóa một hình ảnh trước khi lưu.';
  //   this.layoutUtilsService.showActionNotification(message, MessageType.Read, 2000, true, false);
  //     // alert('Chỉ được phép lưu một trong hai hình ảnh. Vui lòng xóa một hình ảnh trước khi lưu.');
  //     return null; 
  // } else {
  //     _DM_MatHang.HinhAnh = controls['HinhAnh'].value || ''; 
  // }

      return _DM_MatHang;
  }
  getTitle() {
    if (this.item.IdMH === 0) {
      return this.translateService.instant('LYDOTANGGIAMTAISANMANAGEMENT.THEMLYDOTANGGIAMTAISAN');
    }
    return this.translateService.instant('LYDOTANGGIAMTAISANMANAGEMENT.SUALYDOTANGGIAMTAISAN');
  }
  Luu() {
    debugger
    const model = this.prepareData();
    if (model.HinhAnh === '' || !this.file || !this.file.name) {
      alert('Vui lòng chọn một bức ảnh để lưu.');
      return;
  }
    console.log(model);
    this.item.IdMH === 0 ? this.create(model) : this.update(model);
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
  getImageUrl(imageName: string): string {
    debugger
    return `${environment.ApiUrlRoot}/uploads/${imageName}`;
  }
  create(item: MatHangModel) {
    this.isLoadingSubmit$.next(true);
    if (this.authService.currentUserValue.IsMasterAccount)
      this.mathangManagementService
        .DM_MatHang_Insert(item)
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

  update(item: MatHangModel) {
    debugger
    this.isLoadingSubmit$.next(true);
    this.mathangManagementService.UpdateMatHang(item).subscribe((res) => {
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
        res ? this.dialogRef.close() : undefined;
      });
    }
    // this.dialogRef.close();
  }
 ListIdXuatXu() {
      const xuatxu = this.mathangManagementService
      .DM_XuatXu_List()
      .subscribe((res: ResultModel<MatHangModel>) => {
        if (res && res.status === 1) {
          this.listIdXuatXu = res.data;
          // this.XuatXufilterForm = new FormControl(this.XuatXuFilters[0].IdXuatXu);
          // this.isInitData.next(true);
          this.selectIdXuatXu = '' + this.listIdXuatXu[0].idXuatXu;
				  this.changeDetectorRefs.detectChanges();
        }
      });
    this.subscriptions.push(xuatxu);
	}
  ListIdLMH() {
    const xuatxu = this.mathangManagementService
    .DM_LoaiMatHang_List()
    .subscribe((res: ResultModel<MatHangModel>) => {
      if (res && res.status === 1) {
        this.listIdLMH = res.data;
        // this.XuatXufilterForm = new FormControl(this.XuatXuFilters[0].IdXuatXu);
        // this.isInitData.next(true);
        this.selectIdLMH = '' + this.listIdLMH[0].idLMH;
        this.changeDetectorRefs.detectChanges();
      }
    });
  this.subscriptions.push(xuatxu);
}
ListIdNhanHieu() {
  const xuatxu = this.mathangManagementService
  .DM_NhanHieu_List()
  .subscribe((res: ResultModel<MatHangModel>) => {
    if (res && res.status === 1) {
      this.listIdNhanHieu = res.data;
      // this.XuatXufilterForm = new FormControl(this.XuatXuFilters[0].IdXuatXu);
      // this.isInitData.next(true);
      this.selectIdNhanHieu = '' + this.listIdNhanHieu[0].idNhanHieu;
      this.changeDetectorRefs.detectChanges();
    }
  });
this.subscriptions.push(xuatxu);
}
ListIdDVTCap2() {
  const xuatxu = this.mathangManagementService
  .DM_DVT_List()
  .subscribe((res: ResultModel<MatHangModel>) => {
    if (res && res.status === 1) {
      this.listIdDVTCap2 = res.data;
      // this.XuatXufilterForm = new FormControl(this.XuatXuFilters[0].IdXuatXu);
      // this.isInitData.next(true);
      this.selectIdDVTCap2 = '' + this.listIdDVTCap2[0].idDVT;
      this.changeDetectorRefs.detectChanges();
    }
  });
this.subscriptions.push(xuatxu);
}
ListIdDVTCap3() {
  const xuatxu = this.mathangManagementService
  .DM_DVT_List()
  .subscribe((res: ResultModel<MatHangModel>) => {
    if (res && res.status === 1) {
      this.listIdDVTCap3 = res.data;
      // this.XuatXufilterForm = new FormControl(this.XuatXuFilters[0].IdXuatXu);
      // this.isInitData.next(true);
      this.selectIdDVTCap3 = '' + this.listIdDVTCap3[0].idDVT;
      this.changeDetectorRefs.detectChanges();
    }
  });
this.subscriptions.push(xuatxu);
}
  ListIdDVT() {
    const xuatxu = this.mathangManagementService
    .DM_DVT_List()
    .subscribe((res: ResultModel<MatHangModel>) => {
      if (res && res.status === 1) {
        this.listIdDVT = res.data;
        // this.XuatXufilterForm = new FormControl(this.XuatXuFilters[0].IdXuatXu);
        // this.isInitData.next(true);
        this.selectIdDVT = '' + this.listIdDVT[0].idDVT;
        this.changeDetectorRefs.detectChanges();
      }
    });
  this.subscriptions.push(xuatxu);
}
  checkDataBeforeClose(): boolean {
    const model = this.prepareData();
    if (this.item.IdMH === 0) {
      const empty = new MatHangModel();
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
	ValidateChangeNumberEvent(event: any) {
		if (event.target.value == null || event.target.value == '') {
			const message = 'Không thể để trống dữ liệu';
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			return false;
		}
		var count = 0;
		for (let i = 0; i < event.target.value.length; i++) {
			if (event.target.value[i] == '.') {
				count += 1;
			}
		}
		var regex = /[a-zA-Z -!$%^&*()_+|~=`{}[:;<>?@#\]]/g;
		var found = event.target.value.match(regex);
		if (found != null) {
			const message = 'Dữ liệu không gồm chữ hoặc kí tự đặc biệt';
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			return false;;
		}
		if (count >= 2) {
			const message = 'Dữ liệu không thể có nhiều hơn 2 dấu .';
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			return false;;
		}
		return true;
	}
	f_currency_V2(value: string): any {
		if (value == '-1') return '';
		if (value == null || value == undefined || value == '') value = '0';
		let nbr = Number((value + '').replace(/,/g, ""));
		return (nbr + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
	}
	changeValueOfForm(controlName: string, event: any) {
		if (controlName == 'upperLimit') {
			let lower = this.formGroup.controls['lowerLimit'].value.replace(/,/g, "");
			let upper = this.formGroup.controls[controlName].value.replace(/,/g, "");
			if (+upper < +lower)
				this.formGroup.controls[controlName].setValue(this.f_currency_V2(lower));
		}
		if (this.ValidateChangeNumberEvent(event)) {
			let tmpValue = this.formGroup.controls[controlName].value.replace(/,/g, "");
			this.formGroup.controls[controlName].setValue(this.f_currency_V2(tmpValue));
		}
	}
	isExistBarcode(event) {
		var arrMH = [...this.arrMatHang.filter(x => x.Barcode.toLowerCase() == event.target.value.trim().toLowerCase())];
		if (arrMH.length > 0) {
			const message = `Barcode đã tồn tại`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			this.disBtnSubmit = true;
		} else {
			this.disBtnSubmit = false;
		}
	}
	isExistMaHang(event) {
		var arrMH = [...this.arrMatHang.filter(x => x.MaHang.toLowerCase() == event.target.value.trim().toLowerCase())];
		if (arrMH.length > 0) {
			const message = `Mã mặt hàng đã tồn tại`;
			this.layoutUtilsService.showActionNotification(message, MessageType.Create, 2000, true, false);
			this.disBtnSubmit = true;
		} else {
			this.disBtnSubmit = false;
		}
	}



	ChangeSoNamDeNghi(event: any){
		if (event.target.value == null || event.target.value == '') {
			return;
		}
		this.formGroup.controls["TiLeHaoMon"].setValue( this.f_currency_V2((event.target.value/100).toString()));
		this.changeDetectorRefs.detectChanges();
	}
	async someMethod(value){
		if(value){
			var res = await this.mathangManagementService.GetKhoID(value).toPromise();
            if(res && res.status == 1){
				this.formGroup.controls['maLuuKho'].setValue(res.data.IdKho);
        
				//this.changeDetectorRefs.detectChanges();
			}
		}

	}
}
