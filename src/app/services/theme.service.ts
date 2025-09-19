import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private isDark = false;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  toggleTheme() {
    console.log(this.renderer, "this.renderer");
    this.isDark = !this.isDark;

    if (this.isDark) {
      this.renderer.addClass(document.documentElement, 'dark');
      this.renderer.setStyle(document.documentElement, 'background-color', 'black');
      this.renderer.setStyle(document.body, 'color', 'purple');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
      this.renderer.setStyle(document.body, 'background-color', 'white');
      this.renderer.setStyle(document.body, 'color', 'black');
    }
  }
}
