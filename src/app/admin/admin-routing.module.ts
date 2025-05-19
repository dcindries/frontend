// src/app/admin/admin-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'users',    loadChildren: () => import('./users/users.module').then(m => m.UsersModule) },
      { path: 'groups',   loadChildren: () => import('./groups/groups.module').then(m => m.GroupsModule) },
      { path: 'posts',    loadChildren: () => import('./posts/posts.module').then(m => m.PostsModule) },
      { path: 'comments', loadChildren: () => import('./comments/comments.module').then(m => m.CommentsModule) },
      { path: '',         redirectTo: 'users', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
