// src/app/admin/users/list-users/list-user.component.ts
import { Component, OnInit } from '@angular/core';
import { UsersService }      from '../services/user.service';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {
  users: any[] = [];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getAll().subscribe(
      (data: any[]) => {
        this.users = data;
      },
      (err: any) => {
        console.error('Error al cargar usuarios:', err);
      }
    );
  }

  delete(id: number): void {
    if (!confirm('¿Eliminar usuario?')) {
      return;
    }
    this.usersService.delete(id).subscribe(() => {
      this.loadUsers();
    });
  }
}
