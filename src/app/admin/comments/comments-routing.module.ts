import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCommentsComponent } from './list-comments/list-comments';

const routes: Routes = [
  { path: '', component: ListCommentsComponent }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class CommentsRoutingModule {}
