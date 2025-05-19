// src/app/admin/layout/admin-layout.component.ts
import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private headerEl: HTMLElement | null = null;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    // Oculta el <header> de AppComponent
    this.headerEl = document.querySelector('header');
    if (this.headerEl) {
      this.renderer.setStyle(this.headerEl, 'display', 'none');
    }
  }

  ngOnDestroy(): void {
    // Restaura el <header> al salir de /admin
    if (this.headerEl) {
      this.renderer.removeStyle(this.headerEl, 'display');
    }
  }
}
