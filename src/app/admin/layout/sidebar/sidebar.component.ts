import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { label: 'Usuarios',      route: ['/admin','users'] },
    { label: 'Grupos',        route: ['/admin','groups'] },
    { label: 'Publicaciones', route: ['/admin','posts'] },
    { label: 'Comentarios',   route: ['/admin','comments'] }
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error('Error en logout:', err)
    });
  }
}