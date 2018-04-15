import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FolderBrowserPage } from './folder-browser';

@NgModule({
  declarations: [
    FolderBrowserPage,
  ],
  imports: [
    IonicPageModule.forChild(FolderBrowserPage),
  ],
})
export class FolderBrowserModule {}
