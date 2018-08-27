import { ToolbarComponent } from './../../components/toolbar/toolbar';
import { SearchbarComponent } from '../../components/searchbar/searchbar';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { PopUp } from './home-view-popup';

@NgModule({
  declarations: [HomePage, PopUp, ToolbarComponent, SearchbarComponent],
  imports: [IonicPageModule.forChild(HomePage)],
  entryComponents: [PopUp]
})
export class HomePageModule {}
