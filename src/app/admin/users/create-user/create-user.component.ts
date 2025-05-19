import { Component, OnInit }        from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router }                   from '@angular/router';
import { UsersService }             from '../services/user.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.usersService.create(this.form.value).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: (err: any) => console.error('Error creating user:', err)
    });
  }
}
