import { ExpandableComponent } from './../components/expandable/expandable';
import { IonicStorageModule } from '@ionic/storage';
import { SettingsPageModule } from './../pages/settings/settings.module';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, MenuToggle } from 'ionic-angular';

import { HomePageModule } from '../pages/home/home.module';

import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { File } from '@ionic-native/file';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ExternFilesProvider } from '../providers/extern-files/extern-files';
import { FolderBrowserModule } from "../pages/folder-browser/folder-browser.module";
import { MarkjaxProvider } from '../providers/markjax/markjax';
import { SettingsProvider } from '../providers/settings/settings';

@NgModule({
  declarations: [
    MyApp,
    ExpandableComponent,
    ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HomePageModule,
    FolderBrowserModule,
    SettingsPageModule,
    IonicStorageModule.forRoot()    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ExternFilesProvider,
    File,
    MarkjaxProvider,
    MenuToggle,
    SettingsProvider,
    MarkjaxProvider,
  ]
})
export class AppModule {}
