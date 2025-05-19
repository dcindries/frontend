import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { CommentsService, Comment } from '../services/comments.service';

@Component({
  selector: 'app-list-comments',
  templateUrl: './list-comments.component.html',
  styleUrls: ['./list-comments.component.css']
})
export class ListCommentsComponent implements OnInit {
  comments: Comment[] = [];
  error = '';

  constructor(
    private commentsService: CommentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.commentsService.getAll().subscribe({
      next: data => this.comments = data,
      error: ()   => this.error = 'Error al cargar comentarios.'
    });
  }

  editComment(id: number): void {
    this.router.navigate(['/admin/comments/edit', id]);
  }

  deleteComment(id: number): void {
    if (!confirm('¿Eliminar este comentario?')) return;
    this.commentsService.delete(id).subscribe({
      next: () => this.loadComments(),
      error: () => this.error = 'Error al eliminar comentario.'
    });
  }
}
