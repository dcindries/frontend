import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule }        from '@angular/router';

import { PostsRoutingModule }  from './posts-routing.module';
import { ListPostsComponent }  from './list-posts/list-posts';

@NgModule({
  declarations: [
    ListPostsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PostsRoutingModule
  ]
})
export class PostsModule {}
