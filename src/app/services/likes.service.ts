import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LikesService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = localStorage.getItem('authToken')!;
    return { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) };
  }

  likePost(postId: number): Observable<{likes:number}> {
    return this.http.post<{likes:number}>(
      `${this.apiUrl}/posts/${postId}/like`,
      {},
      this.authHeaders()
    );
  }

  unlikePost(postId: number): Observable<{likes:number}> {
    return this.http.delete<{likes:number}>(
      `${this.apiUrl}/posts/${postId}/like`,
      this.authHeaders()
    );
  }

  getMyLikes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/likes`, this.authHeaders());
  }
}
