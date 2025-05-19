// src/app/app-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent }       from './components/login/login.component';
import { RegisterComponent }    from './components/register/register.component';
import { GroupsComponent }      from './components/groups/groups.component';
import { GroupDetailComponent } from './components/group-detail/group-detail.component';
import { GroupCreateComponent } from './components/group-create/group-create.component';
import { MyGroupsComponent }    from './components/my-groups/my-groups.component';
import { MyPrivateGroupsComponent } from './components/my-private-groups/my-private-groups.component';
import { ProfileComponent }     from './components/profile/profile.component';
import { PostsComponent }       from './components/posts/posts.component';

import { AdminGuard }           from './guards/admin-auth.guard';
import { PreventAdminGuard }    from './guards/prevent-admin.guard';
import { LikedPostsComponent } from './components/liked-posts/liked-posts.component';
import { SavedPostsComponent } from './components/saved-posts/saved-posts.component';

const routes: Routes = [
  // 1) Redirección raíz estática:
  { path: '', redirectTo: 'groups', pathMatch: 'full' },

  // 2) Rutas públicas con PreventAdminGuard
  { path: 'login',    component: LoginComponent,       canActivate: [PreventAdminGuard] },
  { path: 'register', component: RegisterComponent,    canActivate: [PreventAdminGuard] },
  { path: 'groups',   component: GroupsComponent,      canActivate: [PreventAdminGuard] },
  { path: 'groups/:id', component: GroupDetailComponent, canActivate: [PreventAdminGuard] },
  { path: 'create-group', component: GroupCreateComponent, canActivate: [PreventAdminGuard] },
  { path: 'my-groups', component: MyGroupsComponent,   canActivate: [PreventAdminGuard] },
  { path: 'my-private-groups', component: MyPrivateGroupsComponent, canActivate: [PreventAdminGuard] },
  { path: 'profile',  component: ProfileComponent,     canActivate: [PreventAdminGuard] },
  { path: 'posts',    component: PostsComponent,       canActivate: [PreventAdminGuard] },
  { path: 'my-likes', component: LikedPostsComponent },
  { path: 'saved', component: SavedPostsComponent },


  // 3) Zona admin normal
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule)
  },

  // 4) Cualquier otra → /groups (y PreventAdminGuard aplicará de nuevo)
  { path: '**', redirectTo: 'groups' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
