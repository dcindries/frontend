// src/app/admin/users/users-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent }       from './users.component';
import { ListUserComponent }    from './list-users/list-user.component';
import { CreateUserComponent }  from './create-user/create-user.component';
import { EditUserComponent }    from './edit-user/edit-user.component';


const routes: Routes = [
  { path: '', component: ListUserComponent },
  { path: 'create', component: CreateUserComponent },
  { path: 'edit/:id', component: EditUserComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {}
