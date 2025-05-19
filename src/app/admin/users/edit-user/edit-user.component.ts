import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../services/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  id!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.minLength(6)],
        confirmPassword: ['']
      },
      { validators: this.passwordsMatch }
    );

    // Cargar datos existentes
    this.usersService.get(this.id).subscribe({
      next: user => {
        this.form.patchValue({
          name: user.name,
          email: user.email
        });
        if (user.profile_photo_url) {
          this.previewUrl = user.profile_photo_url;
        }
      },
      error: err => console.error('Error loading user:', err)
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  private passwordsMatch(group: AbstractControl): { [key: string]: any } | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!pass && !confirm) {
      // no se cambia
      return null;
    }
    return pass === confirm ? null : { mismatch: true };
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(this.selectedFile);
  }
onSubmit(): void {
  this.submitted = true;
  console.log('→ onSubmit llamado, form válido?', this.form.valid);
  if (this.form.invalid) return;

  this.loading = true;
  const formData = new FormData();
  formData.append('name', this.f['name'].value);
  formData.append('email', this.f['email'].value);
  if (this.f['password'].value) {
    formData.append('password', this.f['password'].value);
  }
  if (this.selectedFile) {
    formData.append('profile_photo', this.selectedFile);
  }

  // Imprime el contenido real del FormData
  for (const [key, value] of (formData as any).entries()) {
    console.log(`FormData ➞ ${key}:`, value);
  }

  this.usersService.update(this.id, formData).subscribe({
    next: res => {
      console.log('Respuesta UPDATE API:', res);
      this.router.navigate(['/admin/users']);
    },
    error: err => {
      console.error('Error UPDATE API:', err);
      this.loading = false;
    }
  });
}

}
