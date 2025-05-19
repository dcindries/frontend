// src/app/components/my-private-groups/my-private-groups.component.ts

import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

interface Group {
  id: number;
  name: string;
  description: string;
  created_by: number;
  access_key?: string | null;
  members_count?: number;
}

@Component({
  selector: 'app-my-private-groups',
  templateUrl: './my-private-groups.component.html',
  styleUrls: ['./my-private-groups.component.css']
})
export class MyPrivateGroupsComponent implements OnInit {
  privateGroups: Group[] = [];
  errorMessage = '';
  loading = false;
  currentUserId = 0;

  constructor(
    private groupsService: GroupsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.authService.getUser()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: user => {
          this.currentUserId = user.id;
          this.fetchMyPrivateGroups();
        },
        error: err => {
          console.error('Error al obtener usuario:', err);
          this.errorMessage = 'Error al obtener datos del usuario.';
        }
      });
  }

  private fetchMyPrivateGroups(): void {
    this.loading = true;
    this.groupsService.getMyPrivateGroups()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: Group[]) => {
          // Ocultamos la clave si no eres el creador
          this.privateGroups = res.map(g => {
            if (g.created_by !== this.currentUserId) {
              g.access_key = null;
            }
            return g;
          });
          console.log('🚀 Mis grupos privados:', this.privateGroups);
        },
        error: err => {
          console.error('Error al cargar mis grupos privados:', err);
          this.errorMessage = 'No se pudieron cargar tus grupos privados.';
        }
      });
  }
}
