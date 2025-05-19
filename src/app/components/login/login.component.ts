// src/app/components/login/login.component.ts
import { Component, OnInit }                 from '@angular/core';
import { FormBuilder, FormGroup, Validators }from '@angular/forms';
import { AuthService, LoginResponse, User }  from '../../services/auth.service';
import { Router }                            from '@angular/router';
import { environment }                       from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage = '';
  baseUrl = environment.baseUrl;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.auth.login({ email, password }).subscribe({
      next: (res: LoginResponse) => {
        // Redirige según rol
        if (res.user.is_admin) {
          this.router.navigate(['/admin/users']);
        } else {
          this.router.navigate(['/groups']);
        }
      },
      error: err => {
        console.error('Error en login:', err);
        this.errorMessage =
          err.error?.message || 'Credenciales incorrectas o error de conexión.';
      }
    });
  }
}
