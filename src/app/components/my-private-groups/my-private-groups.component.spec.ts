import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPrivateGroupsComponent } from './my-private-groups.component';

describe('MyPrivateGroupsComponent', () => {
  let component: MyPrivateGroupsComponent;
  let fixture: ComponentFixture<MyPrivateGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyPrivateGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyPrivateGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
