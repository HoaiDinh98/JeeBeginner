import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { InlineSVGModule } from 'ng-inline-svg';
import { JeeCustomerModule } from 'src/app/pages/jee-customer.module';
import { PhanNhomTaiSanManagementService } from './Services/phannhomtaisan-management.service';
import { PhanNhomTaiSanManagementListComponent } from './phannhomtaisan-management-list/phannhomtaisan-management-list.component';
//import { taikhoanManagementEditDialogComponent } from './nhanhieu-management-edit-dialog/nhanhieu-management-edit-dialog.component';
import { PhanNhomTaiSanManagementComponent } from './phannhomtaisan-management.component';
import { TranslateModule } from '@ngx-translate/core';
import { PhanNhomTaiSanManagementEditDialogComponent } from './phannhomtaisan-management-edit-dialog/phannhomtaisan-management-edit-dialog.component';
//import { nhanhieuManagementStatusDialogComponent } from './nhanhieu-management-status-dialog/nhanhieu-management-status-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: PhanNhomTaiSanManagementComponent,
    children: [
      {
        path: '',
        component: PhanNhomTaiSanManagementListComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    PhanNhomTaiSanManagementEditDialogComponent,
    PhanNhomTaiSanManagementListComponent,
    PhanNhomTaiSanManagementComponent,
    //taikhoanManagementStatusDialogComponent
  ],
  imports: [CommonModule, RouterModule.forChild(routes), JeeCustomerModule, NgxMatSelectSearchModule, InlineSVGModule, TranslateModule],
  providers: [
    PhanNhomTaiSanManagementService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true, height: 'auto', width: '900px' } },
  ],
  entryComponents: [
    PhanNhomTaiSanManagementEditDialogComponent,
    PhanNhomTaiSanManagementListComponent,
    PhanNhomTaiSanManagementComponent,
    //taikhoanManagementStatusDialogComponent
  ],
})
export class PhanNhomTaiSanManagementModule { }
