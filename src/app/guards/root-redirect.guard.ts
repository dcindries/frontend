// src/app/guards/root-redirect.guard.ts
import { Injectable }      from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of }   from 'rxjs';
import { filter, take, map }from 'rxjs/operators';
import { AuthService, User } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RootRedirectGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean|UrlTree> {
    // Not logged in → public landing
    if (!this.auth.isLoggedIn) {
      return of(this.router.createUrlTree(['/groups']));
    }
    // Wait for the real user object
    return this.auth.currentUser$.pipe(
      filter((u): u is User => u !== null),
      take(1),
      map(user => {
        // Admin → admin/users
        if (user.is_admin) {
          return this.router.createUrlTree(['/admin/users']);
        }
        // Normal user → groups
        return this.router.createUrlTree(['/groups']);
      })
    );
  }
}
