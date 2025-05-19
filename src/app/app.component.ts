import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AuthService, User } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  defaultProfile = 'assets/default-profile.png';
  profileImageUrl = this.defaultProfile;
  showHeader = true;

  private subs = new Subscription();

  constructor(private auth: AuthService, private router: Router) {
    // Redirige admin al cargar /groups
    this.subs.add(
      this.router.events
        .pipe(
          filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd),
          take(1),
          filter(event => event.urlAfterRedirects === '/groups')
        )
        .subscribe(() => {
          this.auth.currentUser$
            .pipe(
              filter((u): u is User => u !== null),
              take(1)
            )
            .subscribe(user => {
              if (user.is_admin) {
                this.router.navigate(['/admin/users'], { replaceUrl: true });
              }
            });
        })
    );
  }

  ngOnInit(): void {
    // 1) Estado de autenticación
    this.subs.add(
      this.auth.isAuthenticated$.subscribe(logged => {
        this.isLoggedIn = logged;
      })
    );

    // 2) Actualizar foto de perfil
    this.subs.add(
      this.auth.currentUser$
        .pipe(filter((u): u is User => u !== null))
        .subscribe(user => {
          const base = user.profile_photo_url || this.defaultProfile;
          const timestamp = user.updated_at
            ? new Date(user.updated_at).getTime()
            : Date.now();
          this.profileImageUrl = `${base}?v=${timestamp}`;
        })
    );

    // 3) Mostrar/ocultar header en rutas /admin
    this.subs.add(
      this.router.events
        .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(event => {
          this.showHeader = !event.urlAfterRedirects.startsWith('/admin');
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error('Logout error', err),
    });
  }
}
