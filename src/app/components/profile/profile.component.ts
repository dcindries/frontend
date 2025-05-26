import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user!: User;
  profileForm!: FormGroup;
  isEditing = false;
  errorMessage = '';
  successMessage = '';
  defaultProfile = 'assets/default-profile.png';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  imageTimestamp = Date.now();
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.loadUser();
  }

  private loadUser(): void {
    this.authService.getUser().subscribe({
      next: data => {
        this.user = data;
        this.isLoggedIn = true;
        this.profileForm.patchValue({
          name: data.name,
          email: data.email
        });
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

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.isEditing) {
      // cancelar edición: restaurar valores
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email
      });
    }
  }

  saveProfile(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.profileForm.invalid) {
      this.errorMessage = 'Por favor corrige los errores.';
      this.profileForm.markAllAsTouched();
      return;
    }
    const { name, email } = this.profileForm.value;
    this.authService.updateProfile({ name, email }).subscribe({
      next: updated => {
        this.user = updated;
        this.successMessage = 'Perfil actualizado correctamente.';
        this.isEditing = false;
      },
      error: err => {
        console.error('Error al actualizar perfil:', err);
        this.errorMessage = err.status === 409
          ? 'El correo ya está en uso.'
          : err.error?.message || 'Error al actualizar el perfil.';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
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
      next: res => {
        this.user = res;
        this.imageTimestamp = res.updated_at
          ? new Date(res.updated_at).getTime()
          : Date.now();
        this.selectedFile = null;
        this.previewUrl = null;
        this.successMessage = 'Foto de perfil actualizada.';
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
