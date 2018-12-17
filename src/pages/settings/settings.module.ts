import { PopOver } from './../../components/pop-over/pop-over';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingsPage } from './settings';

@NgModule({
  declarations: [
    SettingsPage,
    PopOver
  ],
  imports: [
    IonicPageModule.forChild(SettingsPage),
  ],
  entryComponents: [PopOver]
})
export class SettingsPageModule {}
