// src/app/components/groups/groups.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, map, filter, take } from 'rxjs/operators';

import { GroupsService } from '../../services/groups.service';
import { PostsService } from '../../services/posts.service';
import { AuthService, User } from '../../services/auth.service';
import { LikesService } from '../../services/likes.service';                // ← añadido
import { SavedPostsService } from '../../services/saved-posts.service';   // ← añadido

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
  likes?: number;
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

  likedPosts = new Set<number>();   // ← añadido
  savedPosts = new Set<number>();   // ← añadido

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private postsService: PostsService,
    private auth: AuthService,
    private router: Router,
    private likesService: LikesService,               // ← añadido
    private savedPostsService: SavedPostsService     // ← añadido
  ) {}

ngOnInit(): void {
  this.auth.currentUser$
    .pipe(take(1))
    .subscribe(user => {
      if (user && user.email === 'admin@gmail.com') {
        this.router.navigate(['/admin/users'], { replaceUrl: true });
      } else {
        this.isLoggedIn = !!user;
        this.initComponent();
      }
    });
}


  private initComponent(): void {
    this.searchForm = this.fb.group({ q: [''] });
    this.joinCodeForm = this.fb.group({ code: [''] });

    this.auth.isAuthenticated$.subscribe((v: boolean) => this.isLoggedIn = v);

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

    this.fetchGroups();

    // inicializar likes y guardados
    this.loadMyLikes();       // ← añadido
    this.loadMySaved();       // ← añadido
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

  // ————— añadido: carga mis likes —————
  private loadMyLikes(): void {
    this.likesService.getMyLikes().subscribe({
      next: myLikes => myLikes.forEach(like => this.likedPosts.add(like.id)),
      error: err => console.error('Error cargando likes:', err)
    });
  }

  // ————— añadido: carga mis guardados —————
  private loadMySaved(): void {
    this.savedPostsService.getMySaved().subscribe({
      next: entries => entries.forEach(e => this.savedPosts.add(e.post.id)),
      error: err => console.error('Error cargando guardados:', err)
    });
  }

  // ————— añadido: toggle like —————
  toggleLike(post: any): void {
    const fn = this.likedPosts.has(post.id)
      ? this.likesService.unlikePost(post.id)
      : this.likesService.likePost(post.id);

    fn.subscribe(res => {
      post.likes = res.likes;
      if (this.likedPosts.has(post.id)) {
        this.likedPosts.delete(post.id);
      } else {
        this.likedPosts.add(post.id);
      }
    });
  }

  // ————— añadido: toggle save —————
  toggleSave(post: any): void {
    const fn = this.savedPosts.has(post.id)
      ? this.savedPostsService.unsavePost(post.id)
      : this.savedPostsService.savePost(post.id);

    fn.subscribe({
      next: () => {
        if (this.savedPosts.has(post.id)) {
          this.savedPosts.delete(post.id);
        } else {
          this.savedPosts.add(post.id);
        }
      },
      error: err => {
        if (err.status === 409) {
          this.savedPosts.add(post.id);
        }
      }
    });
  }
}
