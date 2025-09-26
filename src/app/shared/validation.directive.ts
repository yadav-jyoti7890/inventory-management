import { AfterViewInit, Directive, DoCheck, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appValidation]'
})
export class ValidationDirective implements OnInit, DoCheck, AfterViewInit {
  @Input('appValidation') control!: AbstractControl | null

  private errorElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private render: Renderer2) { }
  ngOnInit(): void {
    if (this.control) {
      this.control?.statusChanges.subscribe(() => {
        this.disPlayErrorMessage();
      }
      );
    }
  }

  ngDoCheck(): void {
    if (this.control && this.errorElement) {
      this.disPlayErrorMessage();
    }
  }

  ngAfterViewInit(): void {
    this.createContainer();
  }

  private createContainer() {
    if (this.control) {
      this.errorElement = this.render.createElement('div');
      this.render.addClass(this.errorElement, 'error');
      this.render.setStyle(this.errorElement, 'color', 'red');
      this.render.setStyle(this.errorElement, 'font-size', '12px');
      this.render.setStyle(this.errorElement, 'margin-top', '5px');
      this.render.setStyle(this.errorElement, 'display', 'none');
      this.render.appendChild(this.el.nativeElement.parentNode, this.errorElement);
    }

  }

  private disPlayErrorMessage() {
    if (this.control) {
      const control = this.control;
      const isValid = control.invalid && (control.dirty || control.touched);
      if (isValid) {
        const errMsg = this.getMessage(this.control)
        if (errMsg) {
          this.render?.setStyle(this.errorElement, 'display', 'block');
          this.render?.setProperty(this.errorElement, 'textContent', errMsg);
        }
      }
      else {
        this.render?.setStyle(this.errorElement, 'display', 'none');
      }
    }
  }

  private getMessage(control: AbstractControl): any {
    let msg = '';
    if (this.control) {
      const control = this.control;
      for (const errorKey in control.errors) {
        if (control.errors.hasOwnProperty(errorKey)) {
          switch (errorKey) {
            case 'required':
              msg = 'This field is required';
              break;
            case 'priceInvalid':
              msg = 'price should be greater than 0';
              break;
            case 'quantityInvalid':
              msg = 'quantity should be greater than 0';
              break;
            default:
              msg = 'Invalid input';
              break;
          }
        }
      }
    }
    return msg;
  }
}