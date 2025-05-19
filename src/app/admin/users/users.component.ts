import { Component, OnInit } from '@angular/core';
import { UsersService }      from './services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[]       = [];
  loading = false;
  errorMessage = '';

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getAll().subscribe({
      next: data => {
        this.users = data;
        this.loading = false;
      },
      error: err => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'No se pudieron cargar los usuarios.';
        this.loading = false;
      }
    });
  }

  deleteUser(id: number): void {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.usersService.delete(id).subscribe({
      next: () => this.loadUsers(),
      error: err => console.error('Error borrando usuario:', err)
    });
  }
}
