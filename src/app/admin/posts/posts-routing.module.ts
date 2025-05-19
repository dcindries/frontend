import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPostsComponent }   from './list-posts/list-posts';

const routes: Routes = [
  { path: '', component: ListPostsComponent }
  // Más rutas: create, edit...
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostsRoutingModule {}
