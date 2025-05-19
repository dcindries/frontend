import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SavedPostsService, SaveEntry } from '../../services/saved-posts.service';

@Component({
  selector: 'app-saved-posts',
  templateUrl: './saved-posts.component.html',
  styleUrls: ['./saved-posts.component.css']
})
export class SavedPostsComponent implements OnInit {
  posts: SaveEntry[] = [];

  constructor(
    private savedPostsService: SavedPostsService,
    private router: Router  
  ) {}

  ngOnInit(): void {
    this.savedPostsService.getMySaved().subscribe({
      next: data => this.posts = data,
      error: err => console.error('Error cargando guardados:', err)
    });
  }

  goToGroup(post: any): void {
    this.router.navigate(['/groups', post.group.id]);
  }
}
