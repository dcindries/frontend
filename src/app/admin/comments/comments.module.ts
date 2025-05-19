import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule }        from '@angular/router';

import { CommentsRoutingModule } from './comments-routing.module';
import { ListCommentsComponent } from './list-comments/list-comments';

@NgModule({
  declarations: [ ListCommentsComponent ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CommentsRoutingModule
  ]
})
export class CommentsModule {}
