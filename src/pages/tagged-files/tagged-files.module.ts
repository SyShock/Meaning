import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaggedFilesPage } from './tagged-files';
import { UniversalSearchbarComponent } from '../../components/universal-searchbar/universal-searchbar';

@NgModule({
  declarations: [
    TaggedFilesPage,
    UniversalSearchbarComponent
  ],
  imports: [
    IonicPageModule.forChild(TaggedFilesPage),
  ],
})
export class TaggedFilesPageModule {}
