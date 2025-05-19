// src/app/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout.component';
import { SidebarComponent }     from './layout/sidebar/sidebar.component';
import { AdminRoutingModule }   from './admin-routing.module';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
