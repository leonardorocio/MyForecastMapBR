import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PoModule } from '@po-ui/ng-components';
import { RouterModule } from '@angular/router';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { DtsBackofficeUtilsModule } from 'dts-backoffice-util';
import { CityService } from './services/city.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    PoModule,
    RouterModule.forRoot([]),
    PoTemplatesModule,
    DtsBackofficeUtilsModule.forRoot(),
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
