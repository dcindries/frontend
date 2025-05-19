// src/app/components/liked-posts/liked-posts.component.ts

import { Component, OnInit } from '@angular/core';
import { LikesService } from '../../services/likes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liked-posts',
  templateUrl: './liked-posts.component.html',
  styleUrls: ['./liked-posts.component.css']
})
export class LikedPostsComponent implements OnInit {
  posts: any[] = [];

  constructor(
    private likesService: LikesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.likesService.getMyLikes()
      .subscribe(data => this.posts = data);
  }

  goToGroup(post: any) {
    this.router.navigate(
      ['/groups', post.group.id],
      { fragment: `post-${post.id}` }
    );
  }
}
