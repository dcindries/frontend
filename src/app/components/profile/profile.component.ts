// src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  errorMessage = '';
  defaultProfile = 'assets/default-profile.png';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  imageTimestamp = Date.now();
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.authService.getUser().subscribe({
      next: (data: any) => {
        this.user = data;
        this.isLoggedIn = true;
        this.imageTimestamp = data.updated_at
          ? new Date(data.updated_at).getTime()
          : this.imageTimestamp;
      },
      error: err => {
        console.error('Error al obtener datos del usuario:', err);
        this.errorMessage = 'No se pudieron cargar los datos del usuario.';
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  updateProfilePhoto(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Debes seleccionar una imagen.';
      return;
    }

    const formData = new FormData();
    formData.append('profile_photo', this.selectedFile, this.selectedFile.name);
    formData.append('_method', 'PUT');

    this.authService.updateProfilePost(formData).subscribe({
      next: (res: any) => {
        this.user = res;
        this.imageTimestamp = res.updated_at
          ? new Date(res.updated_at).getTime()
          : Date.now();
        this.selectedFile = null;
        this.previewUrl = null;
      },
      error: err => {
        console.error('Error al actualizar foto de perfil:', err);
        this.errorMessage = err.error?.message || 'Error al actualizar la foto de perfil.';
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('authToken');
        this.router.navigate(['/login']);
      },
      error: err => console.error('Error al cerrar sesión:', err)
    });
  }

  get profileImageUrl(): string {
    const base = this.user?.profile_photo_url || this.defaultProfile;
    return `${base}?v=${this.imageTimestamp}`;
  }
}
