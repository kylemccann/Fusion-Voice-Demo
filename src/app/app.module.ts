import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import { ReadMoreDirective } from '../assets/ngx-read-more';
import {
  MatButtonModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule
} from '@angular/material';









@NgModule({
  declarations: [
    AppComponent,
    ReadMoreDirective

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
    // Recorder,
    // RecordRTC
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
