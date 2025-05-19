import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { ReactiveFormsModule }  from '@angular/forms';
import { RouterModule }         from '@angular/router';  
import { UsersRoutingModule }   from './users-routing.module';

import { UsersComponent }       from './users.component';     
import { ListUserComponent }    from './list-users/list-user.component';
import { CreateUserComponent }  from './create-user/create-user.component';
import { EditUserComponent }    from './edit-user/edit-user.component';

@NgModule({
  declarations: [
    UsersComponent,   
    ListUserComponent,
    CreateUserComponent,
    EditUserComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,       
    UsersRoutingModule
  ]
})
export class UsersModule {}
