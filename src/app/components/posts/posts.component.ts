import { Component, OnInit } from '@angular/core';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  errorMessage: string = '';

  constructor(private postsService: PostsService) { }

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.postsService.getPosts().subscribe({
      next: (res) => {
        this.posts = res;
        console.log('Posts obtenidos:', res);
      },
      error: (err) => {
        console.error('Error al obtener posts:', err);
        this.errorMessage = 'Error al cargar los posts.';
      }
    });
  }
}
