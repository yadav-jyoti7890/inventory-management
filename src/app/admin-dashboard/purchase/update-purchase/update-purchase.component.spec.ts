import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePurchaseComponent } from './update-purchase.component';

describe('UpdatePurchaseComponent', () => {
  let component: UpdatePurchaseComponent;
  let fixture: ComponentFixture<UpdatePurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
