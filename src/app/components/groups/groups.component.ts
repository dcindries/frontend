// src/app/components/groups/groups.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService } from '../../services/groups.service';
import { PostsService } from '../../services/posts.service';
import { AuthService, User } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, map, filter, take } from 'rxjs/operators';

interface Group {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  members_count?: number;
}

interface Post {
  id: number;
  content: string;
  image_path?: string;
  created_at: string;
  group_id: number;
  author: { id: number; name: string };
}

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  searchForm!: FormGroup;
  joinCodeForm!: FormGroup;
  groups: Group[] = [];
  searchResults: Group[] = [];
  recentPosts: (Post & { groupName: string; authorName: string })[] = [];
  featuredGroups: Group[] = [];
  isLoggedIn = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private postsService: PostsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si es el admin con email especificado, redirigir directamente al panel admin
    this.auth.currentUser$
      .pipe(
        filter((u): u is User => u !== null),
        take(1)
      )
      .subscribe(user => {
        if (user.email === 'admin@gmail.com') {
          this.router.navigate(['/admin/users'], { replaceUrl: true });
        } else {
          this.initComponent();
        }
      });
  }

  private initComponent(): void {
    // Formularios
    this.searchForm = this.fb.group({ q: [''] });
    this.joinCodeForm = this.fb.group({ code: [''] });

    // Estado de autenticación
    this.auth.isAuthenticated$.subscribe((v: boolean) => this.isLoggedIn = v);

    // Búsqueda en vivo: solo grupos públicos
    this.qControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) =>
        this.groupsService.getGroups().pipe(
          map((all: Group[]) => all.filter(g =>
            g.is_public && term.trim() !== '' && g.name.toLowerCase().includes(term.trim().toLowerCase())
          ))
        )
      )
    ).subscribe((results: Group[]) => this.searchResults = results);

    // Carga inicial
    this.fetchGroups();
  }

  get qControl(): FormControl {
    return this.searchForm.get('q') as FormControl;
  }

  get codeControl(): FormControl {
    return this.joinCodeForm.get('code') as FormControl;
  }

  fetchGroups(search: string = ''): void {
    this.groupsService.getGroups().subscribe({
      next: (all: Group[]) => {
        const term = search.trim().toLowerCase();
        this.groups = all
          .filter(g => g.is_public && (!term || g.name.toLowerCase().includes(term)));
        this.pickFeaturedGroups();
        this.fetchRecentPosts();
      },
      error: (e: any) => {
        console.error('Error cargando grupos:', e);
        this.errorMessage = 'No se pudieron cargar los grupos.';
      }
    });
  }

  fetchRecentPosts(): void {
    this.postsService.getPosts().subscribe({
      next: posts => {
        const publicIds = new Set(this.groups.map(g => g.id));
        this.recentPosts = posts
          .filter((p: Post) => publicIds.has(p.group_id))
          .sort((a: Post, b: Post) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 12)
          .map((p: Post) => {
            const grp = this.groups.find(g => g.id === p.group_id)!;
            return { ...p, groupName: grp.name, authorName: p.author?.name ?? 'Anónimo' };
          });
      },
      error: err => console.error('Error cargando posts:', err)
    });
  }

  pickFeaturedGroups(): void {
    this.featuredGroups = [...this.groups].sort(() => Math.random() - 0.5).slice(0, 6);
  }

  goToCreateGroup(): void {
    this.router.navigate(['/create-group']);
  }

  goToGroup(id: number): void {
    this.router.navigate(['/groups', id]);
    this.searchResults = [];
  }

  joinByCode(): void {
    this.errorMessage = '';
    this.successMessage = '';
    const code = this.codeControl.value.trim();
    if (!code) {
      this.errorMessage = 'Introduce un código válido.';
      return;
    }
    this.groupsService.joinByCode(code).subscribe({
      next: () => {
        this.successMessage = '¡Te has unido al grupo correctamente!';
        this.joinCodeForm.reset();
        this.fetchGroups();
      },
      error: err => {
        console.error('Error al unirse por código:', err);
        this.errorMessage = err.error?.message || 'No se pudo unir al grupo.';
      }
    });
  }
}
