import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListGroupsComponent }  from './list-groups/list-groups.component';

const routes: Routes = [
  // /admin/groups
  { path: '', component: ListGroupsComponent },
  // Rutas futuras:
  // { path: 'create', component: CreateGroupComponent },
  // { path: 'edit/:id', component: EditGroupComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule {}
