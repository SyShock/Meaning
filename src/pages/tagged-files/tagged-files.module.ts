import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaggedFilesPage } from './tagged-files';

@NgModule({
  declarations: [
    TaggedFilesPage,
  ],
  imports: [
    IonicPageModule.forChild(TaggedFilesPage),
  ],
})
export class TaggedFilesPageModule {}
