import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { GroupsService } from '../../services/groups.service';
import { PostsService } from '../../services/posts.service';
import { AuthService } from '../../services/auth.service';
import { CommentsService } from 'src/app/services/comments.service';
import { LikesService } from 'src/app/services/likes.service';
import { SavedPostsService } from 'src/app/services/saved-posts.service';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.css']
})
export class GroupDetailComponent implements OnInit {
  group: any;
  posts: any[] = [];
  savedPosts = new Set<number>();
  likedPosts = new Set<number>();
  postForm!: FormGroup;
  accessKeyForm!: FormGroup;
  commentForms: { [postId: number]: FormGroup } = {};

  isGroupCreator = false;
  isLoggedIn = false;
  isMember = false;
  isAdmin = false;
  currentUserId = 0;
  errorMessage = '';

  @ViewChild('imageCanvas', { static: false })
  imageCanvas?: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  imagePreview: string | ArrayBuffer | null = null;
  isCropping = false;
  cropStartX = 0;
  cropStartY = 0;
  cropEndX = 0;
  cropEndY = 0;
  croppedImage: string | null = null;
  croppingCompleted = false;
  selectedFile: File | null = null;
  groupForm!: FormGroup;    
  editMode = false;   

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private postsService: PostsService,
    private authService: AuthService,
    private commentsService: CommentsService,
    private likesService: LikesService,
    private savedService: SavedPostsService,
    private savedPostsService: SavedPostsService
  ) {}

  ngOnInit(): void {

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const fragment = this.route.snapshot.fragment;
        if (fragment) {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'No se proporcionó el ID del grupo.';
      return;
    }
    const groupId = +idParam;
    if (isNaN(groupId)) {
      this.errorMessage = 'El ID del grupo no es válido.';
      return;
    }

    this.postForm = this.fb.group({
      content: ['', Validators.required]
    });
    this.accessKeyForm = this.fb.group({
      access_key: ['', Validators.required]
    });
    this.groupForm = this.fb.group({
      name:        ['', Validators.required],
      description: ['']
    });

    this.authService.getUser().subscribe({
      next: user => {
        this.currentUserId = user.id;
        this.isLoggedIn = true;
        this.loadGroup(groupId);
        this.loadPosts(groupId);
      },
      error: err => {
        console.error('Error al obtener usuario:', err);
        this.errorMessage = 'Error de autenticación.';
      }
    });
  }

private loadGroup(id: number): void {
  this.groupsService.getGroupById(id).subscribe({
    next: (res: any) => {
      this.group           = res.group;
      this.isMember        = res.isMember;
      this.isAdmin         = this.currentUserId === this.group.created_by;
      this.isGroupCreator  = this.group.created_by === this.currentUserId;

      this.groupForm.patchValue({
        name:        this.group.name,
        description: this.group.description
      });
    },
    error: err => {
      console.error('Error al cargar el grupo:', err);
      this.errorMessage = 'Error al cargar el grupo.';
    }
  });
}

private loadPosts(groupId: number): void {
  this.postsService.getPostsByGroup(groupId).subscribe({
    next: posts => {
      this.posts = posts;
      this.initCommentForms();

      // 2) Likes
      this.likedPosts.clear();
      this.likesService.getMyLikes().subscribe({
        next: myLikes => {
          myLikes.forEach(like => {
            this.likedPosts.add(like.id);
          });
        },
        error: err => console.error('Error al cargar likes:', err)
      });

      // 3) Saved posts
      this.savedPosts.clear();
      this.savedPostsService.getMySaved().subscribe({
        next: entries => {
          entries.forEach(e => {
            this.savedPosts.add(e.post.id);
          });
        },
        error: err => console.error('Error al cargar guardados:', err)
      });
    },
    error: err => console.error('Error al cargar posts:', err)
  });
}



  private initCommentForms(): void {
    this.posts.forEach(post => {
      if (!this.commentForms[post.id]) {
        this.commentForms[post.id] = this.fb.group({
          content: ['', Validators.required]
        });
      }
    });
  }

  joinGroup(): void {
    if (this.isMember) return;

    if (this.group.is_public) {
      this.groupsService.joinGroup(this.group.id).subscribe({
        next: () => this.loadGroup(this.group.id),
        error: err => {
          console.error('Error al unirse:', err);
          this.errorMessage = err.error?.message || 'Error al unirse al grupo.';
        }
      });
    } else {
      if (this.accessKeyForm.invalid) {
        this.errorMessage = 'Introduce la clave de acceso.';
        return;
      }
      const code = this.accessKeyForm.value.access_key.trim();
      this.groupsService.joinByCode(code).subscribe({
        next: () => {
          this.accessKeyForm.reset();
          this.loadGroup(this.group.id);
          this.loadPosts(this.group.id);
        },
        error: err => {
          console.error('Error al unirse con código:', err);
          this.errorMessage = err.error?.message || 'Clave inválida.';
        }
      });
    }
  }

  leaveGroup(): void {
    if (!this.isLoggedIn) {
      this.errorMessage = 'Debes iniciar sesión para abandonar el grupo.';
      return;
    }
    this.groupsService.leaveGroup(this.group.id).subscribe({
      next: (res: any) => {
        if (res.message?.includes('el grupo se eliminó')) {
          this.router.navigate(['/my-private-groups']);
        } else {
          this.loadGroup(this.group.id);
        }
      },
      error: err => {
        console.error('Error al abandonar:', err);
        this.errorMessage = err.error?.message || 'Error al abandonar el grupo.';
      }
    });
  }

  onPostSubmit(): void {
    if (!this.isMember || this.postForm.invalid) {
      this.errorMessage = this.isMember
        ? 'Escribe algo antes de publicar.'
        : 'Debes unirte para publicar.';
      return;
    }

    const formData = new FormData();
    formData.append('content', this.postForm.value.content);
    formData.append('group_id', this.group.id.toString());
    if (this.croppedImage) {
      formData.append('image', this.dataURLtoBlob(this.croppedImage), 'cropped.png');
    } else if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.postsService.createPost(formData).subscribe({
      next: () => {
        this.postForm.reset();
        this.croppedImage = null;
        this.croppingCompleted = false;
        this.selectedFile = null;
        this.loadPosts(this.group.id);
      },
      error: err => {
        console.error('Error al crear post:', err);
        this.errorMessage = err.error?.message || 'Error al crear el post.';
      }
    });
  }

  onCommentSubmit(postId: number): void {
    const form = this.commentForms[postId];
    if (form.invalid) {
      this.errorMessage = 'Escribe algo antes de comentar.';
      return;
    }
    const payload = { post_id: postId, content: form.value.content };
    this.commentsService.createComment(payload).subscribe({
      next: (newComment: any) => {
        form.reset();
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments = post.comments || [];
          post.comments.push(newComment);
          post.comments.sort((a: any, b: any) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
      },
      error: (err: any) => {
        console.error('Error al comentar:', err);
        this.errorMessage = err.error?.message || 'Error al comentar.';
      }
    });
  }

onFileSelected(event: any): void {
  const file = event.target.files?.[0];
  if (!file) return;
  this.selectedFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    this.imagePreview = e.target?.result || null;
    setTimeout(() => this.initializeCanvas(), 0);
  };
  reader.readAsDataURL(file);
}


  private initializeCanvas(): void {
    if (!this.imagePreview || !this.imageCanvas) return;
    const canvas = this.imageCanvas.nativeElement;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      this.ctx = canvas.getContext('2d')!;
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = this.imagePreview as string;
  }

  // Métodos de crop e imagen...
  private beginCrop(e: MouseEvent): void { /* ... */ }
  private updateCrop(e: MouseEvent): void { /* ... */ }
  private finishCrop(e: MouseEvent): void { /* ... */ }
  private redrawCanvas(): void { /* ... */ }
  applyCrop(): void { /* ... */ }
  completeImage(): void { /* ... */ }

  private dataURLtoBlob(dataurl: string): Blob {
    const [header, data] = dataurl.split(',');
    const mime = header.match(/:(.*?);/)![1];
    const binary = atob(data);
    let len = binary.length;
    const u8 = new Uint8Array(len);
    while (len--) {
      u8[len] = binary.charCodeAt(len);
    }
    return new Blob([u8], { type: mime });
  }

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hrs = diff / (3600000);
    if (hrs < 24) {
      const h = Math.floor(hrs);
      return `hace ${h} hora${h !== 1 ? 's' : ''}`;
    }
    const days = hrs / 24;
    if (days < 30) {
      const d = Math.floor(days);
      return `hace ${d} día${d !== 1 ? 's' : ''}`;
    }
    const m = Math.floor(days / 30);
    return `hace ${m} mes${m !== 1 ? 'es' : ''}`;
  }

  editPost(post: any): void {
    console.log('Editar post:', post);
  }

  deleteComment(post: any, comment: any): void {
    this.commentsService.deleteComment(comment.id).subscribe({
      next: () => {
        post.comments = post.comments.filter((c: any) => c.id !== comment.id);
      },
      error: err => {
        console.error('Error al eliminar comentario:', err);
        this.errorMessage = err.error?.message || 'Error al eliminar el comentario.';
      }
    });
  }
  

  deletePost(post: any): void {
    this.postsService.deletePost(post.id).subscribe({
      next: () => this.loadPosts(this.group.id),
      error: err => {
        console.error('Error al eliminar post:', err);
        this.errorMessage = err.error?.message || 'Error al eliminar el post.';
      }
    });
  }


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

toggleSave(post: any): void {
  if (this.savedPosts.has(post.id)) {

    this.savedPostsService.unsavePost(post.id).subscribe({
      next: () => {
        this.savedPosts.delete(post.id);
      },
      error: err => {
        console.error('No se pudo desguardar:', err);
      }
    });
  } else {
    this.savedPostsService.savePost(post.id).subscribe({
      next: () => {
        this.savedPosts.add(post.id);
      },
      error: err => {
        if (err.status === 409) {
          this.savedPosts.add(post.id);
        } else {
          console.error('No se pudo guardar:', err);
        }
      }
    });
  }
}

toggleEditMode(): void {
  this.editMode = true;
  this.groupForm.patchValue({
    name:        this.group.name,
    description: this.group.description
  });
}

cancelEdit(): void {
  this.editMode = false;
}

saveGroup(): void {
  if (this.groupForm.invalid) return;

  const { name, description } = this.groupForm.value;
  this.groupsService.updateGroup(this.group.id, { name, description })
    .subscribe({
      next: (updated: any) => {
        this.group.name        = updated.name;
        this.group.description = updated.description;
        this.editMode = false;
      },
      error: err => {
        console.error('Error al actualizar grupo:', err);
        this.errorMessage = err.error?.message || 'Error al actualizar el grupo.';
      }
    });
}


}
