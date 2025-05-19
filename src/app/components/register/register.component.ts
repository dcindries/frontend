import { Component, OnInit }                  from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router }                             from '@angular/router';
import { AuthService }                        from '../../services/auth.service';
import { environment }                        from '../../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  defaultProfile = 'assets/default-profile.png';      // ← propiedad añadida

  apiUrl = environment.apiUrl;
  baseUrl = environment.baseUrl;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, completa el formulario correctamente.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.registerForm.get('name')!.value);
    formData.append('email', this.registerForm.get('email')!.value);
    formData.append('password', this.registerForm.get('password')!.value);
    if (this.selectedFile) {
      formData.append('profile_photo', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: (res: any) => {
        console.log('Registro exitoso:', res);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Error en el registro:', err);
        this.errorMessage = err.error?.message || 'Error al registrarse. Intenta nuevamente.';
      }
    });
  }
}
