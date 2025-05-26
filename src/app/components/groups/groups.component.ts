// src/app/components/groups/groups.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  filter,
  take
} from 'rxjs/operators';

import { GroupsService } from '../../services/groups.service';
import { PostsService } from '../../services/posts.service';
import { AuthService, User } from '../../services/auth.service';
import { LikesService } from '../../services/likes.service';
import { SavedPostsService } from '../../services/saved-posts.service';

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

  likedPosts = new Set<number>();
  savedPosts = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private postsService: PostsService,
    private auth: AuthService,
    private router: Router,
    private likesService: LikesService,
    private savedPostsService: SavedPostsService
  ) {}

  ngOnInit(): void {
    this.initComponent();

    // redirige admin
    this.auth.currentUser$
      .pipe(filter((u): u is User => u !== null), take(1))
      .subscribe(user => {
        if (user.email === 'admin@gmail.com') {
          this.router.navigate(['/admin/users'], { replaceUrl: true });
        }
      });
  }

  private initComponent(): void {
    this.searchForm = this.fb.group({ q: [''] });
    this.joinCodeForm = this.fb.group({ code: [''] });

    this.auth.isAuthenticated$.subscribe(logged => {
      this.isLoggedIn = logged;
      if (logged) {
        this.loadMyLikes();
        this.loadMySaved();
      }
    });

    this.qControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) =>
          this.groupsService.getGroups().pipe(
            map((all: Group[]) =>
              all.filter((g: Group) =>
                g.is_public &&
                term.trim() !== '' &&
                g.name.toLowerCase().includes(term.trim().toLowerCase())
              )
            )
          )
        )
      )
      .subscribe((results: Group[]) => (this.searchResults = results));

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
        this.groups = all.filter((g: Group) =>
          g.is_public && (!term || g.name.toLowerCase().includes(term))
        );
        this.pickFeaturedGroups();
        this.fetchRecentPosts();
      },
      error: e => {
        console.error('Error cargando grupos:', e);
        this.errorMessage = 'No se pudieron cargar los grupos.';
      }
    });
  }

  fetchRecentPosts(): void {
    this.postsService.getPosts().subscribe({
      next: (posts: Post[]) => {
        const publicIds = new Set(this.groups.map(g => g.id));
        this.recentPosts = posts
          .filter((p: Post) => publicIds.has(p.group_id))
          .sort(
            (a: Post, b: Post) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 12)
          .map((p: Post) => {
            const grp = this.groups.find(g => g.id === p.group_id)!;
            return {
              ...p,
              groupName: grp.name,
              authorName: p.author?.name ?? 'Anónimo'
            };
          });
      },
      error: err => console.error('Error cargando posts:', err)
    });
  }

  pickFeaturedGroups(): void {
    this.featuredGroups = [...this.groups]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);
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

  private loadMyLikes(): void {
    this.likesService.getMyLikes().subscribe({
      next: myLikes => myLikes.forEach(like => this.likedPosts.add(like.id)),
      error: err => console.error('Error cargando likes:', err)
    });
  }

  private loadMySaved(): void {
    this.savedPostsService.getMySaved().subscribe({
      next: entries => entries.forEach(e => this.savedPosts.add(e.post.id)),
      error: err => console.error('Error cargando guardados:', err)
    });
  }

  toggleLike(post: Post & { likes?: number }): void {
    if (!this.isLoggedIn) return;
    const action$ = this.likedPosts.has(post.id)
      ? this.likesService.unlikePost(post.id)
      : this.likesService.likePost(post.id);

    action$.subscribe(res => {
      post.likes = res.likes;
      if (this.likedPosts.has(post.id)) {
        this.likedPosts.delete(post.id);
      } else {
        this.likedPosts.add(post.id);
      }
    });
  }

  toggleSave(post: Post): void {
    if (!this.isLoggedIn) return;
    const action$ = this.savedPosts.has(post.id)
      ? this.savedPostsService.unsavePost(post.id)
      : this.savedPostsService.savePost(post.id);

    action$.subscribe({
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
