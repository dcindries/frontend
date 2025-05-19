// src/app/guards/admin-auth.guard.ts
import { Injectable }        from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of }    from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { AuthService, User } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    // 1) Si no hay sesión, al login
    if (!this.auth.isLoggedIn) {
      return of(this.router.createUrlTree(['/login']));
    }

    // 2) Espera a que currentUser$ emita tu User
    return this.auth.currentUser$.pipe(
      filter((u): u is User => u !== null),
      take(1),
      map(user => {
        // 3) Reconoce admin con cualquiera de estos criterios:
        const isAdmin = 
          user.is_admin === true ||
          user.role === 'admin' ||
          user.email === 'admin@gmail.com';

        if (isAdmin) {
          // Permitir acceso a /admin/**
          return true;
        } else {
          // Echar a /groups en caso contrario
          return this.router.createUrlTree(['/groups']);
        }
      })
    );
  }
}
