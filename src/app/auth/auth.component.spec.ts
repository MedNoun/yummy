import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AuthComponent } from './auth.component';
import { TranslateModule } from '@ngx-translate/core';

import { RouterTestingModule } from '@angular/router/testing';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title in a h1 tag', waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(
      'PAGES.Auth.TITLE'
    );
  }));
});
