// src/app/guards/prevent-admin.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { AuthService, User } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PreventAdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean|UrlTree> {
    // Si no está logueado, permitimos la ruta pública
    if (!this.auth.isLoggedIn) {
      return of(true);
    }
    // Esperamos a que llegue el User real
    return this.auth.currentUser$.pipe(
      filter((u): u is User => u !== null),
      take(1),
      map(user => {
        // Si es admin, devuelve UrlTree a panel admin
        if (user.is_admin) {
          return this.router.createUrlTree(['/admin/users']);
        }
        // Sino, deja pasar
        return true;
      })
    );
  }
}
