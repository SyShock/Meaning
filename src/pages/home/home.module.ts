import { TemplatesComponent } from './../../components/templates/templates';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
@NgModule({
    declarations: [HomePage],
    imports: [IonicPageModule.forChild(HomePage)],
})
export class HomePageModule { }