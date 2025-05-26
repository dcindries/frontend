// src/app/app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { TokenInterceptor } from './services/token.interceptor';
import { AuthService } from './services/auth.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { GroupsComponent } from './components/groups/groups.component';
import { GroupDetailComponent } from './components/group-detail/group-detail.component';
import { GroupCreateComponent } from './components/group-create/group-create.component';
import { MyGroupsComponent } from './components/my-groups/my-groups.component';
import { MyPrivateGroupsComponent } from './components/my-private-groups/my-private-groups.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PostsComponent } from './components/posts/posts.component';
import { LikedPostsComponent } from './components/liked-posts/liked-posts.component';
import { SavedPostsComponent } from './components/saved-posts/saved-posts.component';

// APP_INITIALIZER: redirige admin antes de la navegación inicial
export function initAppFactory(
  auth: AuthService,
  router: Router
): () => Promise<void> {
  return () =>
    new Promise<void>(resolve => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        resolve();
        return;
      }
      auth.getUser().subscribe({
        next: user => {
          if (user.is_admin) {
            router.navigateByUrl('/admin/users', { replaceUrl: true });
          }
          resolve();
        },
        error: () => resolve()
      });
    });
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    GroupsComponent,
    GroupDetailComponent,
    GroupCreateComponent,
    MyGroupsComponent,
    MyPrivateGroupsComponent,
    ProfileComponent,
    PostsComponent,
    LikedPostsComponent,
    SavedPostsComponent,

  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initAppFactory,
      deps: [AuthService, Router],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
