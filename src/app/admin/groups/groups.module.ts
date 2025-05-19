import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule }        from '@angular/router';

import { GroupsRoutingModule } from './groups-routing.module';
import { ListGroupsComponent } from './list-groups/list-groups.component';

@NgModule({
  declarations: [
    ListGroupsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GroupsRoutingModule
  ]
})
export class GroupsModule {}
