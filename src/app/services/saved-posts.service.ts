import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SaveEntry {
  post: any;
  saved_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMySaved(): Observable<SaveEntry[]> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<SaveEntry[]>(`${this.apiUrl}/user/saved`, { headers });
  }

  savePost(postId: number): Observable<{ message: string }> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/posts/${postId}/save`,
      {},
      { headers }
    );
  }

  unsavePost(postId: number): Observable<{ message: string }> {
    const token = localStorage.getItem('authToken')!;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/posts/${postId}/save`,
      { headers }
    );
  }
}
