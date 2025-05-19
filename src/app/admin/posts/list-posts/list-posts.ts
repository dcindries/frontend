import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { PostsService, Post } from '../services/posts.service';

@Component({
  selector: 'app-list-posts',
  templateUrl: './list-posts.component.html',
  styleUrls: ['./list-posts.component.css']
})
export class ListPostsComponent implements OnInit {
  posts: Post[] = [];
  error = '';

  constructor(
    private postsService: PostsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.postsService.getAll().subscribe({
      next: data => this.posts = data,
      error: ()   => this.error = 'Error al cargar publicaciones.'
    });
  }

  editPost(id: number): void {
    this.router.navigate(['/admin/posts/edit', id]);
  }

  deletePost(id: number): void {
    if (!confirm('¿Eliminar esta publicación?')) return;
    this.postsService.delete(id).subscribe({
      next: () => this.loadPosts(),
      error: () => this.error = 'Error al eliminar publicación.'
    });
  }
}
