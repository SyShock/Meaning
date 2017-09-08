import { Storage } from '@ionic/storage';
import { SettingsProvider } from './../providers/settings/settings';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events, MenuToggle, ToastController, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ExternFilesProvider } from '../providers/extern-files/extern-files';
import { HomePage } from '../pages/home/home';
import { FolderBrowserPage } from '../pages/folder-browser/folder-browser';
import { SettingsPage } from './../pages/settings/settings';

@Component({
  templateUrl: 'app.html',
  host: {
    '(document:keyup)': 'onKeyUp($event)'
  }
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  files: Array<string>;
  filesBackUp: Array<string>;
  searchWords: string;

  main:Array<{title: string, do: Function}>

  pages: Array<{title: string, component: any, params?: Object}>;

  constructor(public platform: Platform,
     public statusBar: StatusBar,
     public splashScreen: SplashScreen,
     private extFiles: ExternFilesProvider,
     private events: Events,
     private menu: MenuToggle,
     public settings: SettingsProvider,
     private toastCtrl: ToastController,
     private modalCtrl: ModalController,
     private storage: Storage
   ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Settings', component: SettingsPage },
      //about as alert message
    ];

    this.main = [
      { title: 'New', do: () => {this.nav.setRoot(HomePage,{newStart: true}); }},
      { title: 'Open File', do: () => {this.nav.push(FolderBrowserPage, {'fileSelect': true})} },
      { title: 'Save', do: () => {this.nav.setRoot(HomePage); this.events.publish('to-save-file')} },
      { title: 'Save As', do: () => {this.nav.setRoot(HomePage); this.events.publish('to-save-file-as')} },
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.storage.get('config').then((res) => {
        if(res) this.settings.initConfig(JSON.parse(res))      

      })
      if(this.platform.is('electron'))
        window.addEventListener('beforeunload', () => {
          this.onExit();
        });
      this.platform.registerBackButtonAction(() => {
        this.onExit()                
      });
      this.events.subscribe('folder-selected', ()=>{
        this.loadFiles();
      })
      this.events.subscribe('menu-toggle', ()=>{
        this.menu.toggle()
      })
    });
  }

  searchFiles(){
    this.files = this.filesBackUp.filter((el)=>{
      return el.match(this.searchWords)
    })
    if (!this.searchWords) this.files = this.filesBackUp 
  }

  openPage(page) {
    this.nav.push(page.component, page.params);
  }

  async openFile(val){
    let ret = await this.extFiles.openFile(val)
    this.events.publish('file-opened', ret)
  }

  async loadFiles(){
    this.files = await this.extFiles.listFiles(['.md','.txt'])
    this.filesBackUp = this.files.concat()
    console.log('Backing up: ' ,this.filesBackUp);
    
  }

  async loadProjectFiles(pathUrl: string){
    console.log(pathUrl)
    console.log(this.extFiles.base[0]);
    this.extFiles.clearPath()
    this.extFiles.goToDir(pathUrl.replace(this.extFiles.base[0], ''))
    this.files = await this.extFiles.listFiles()
    this.filesBackUp = this.files.concat()
    
  }

  async deleteFile(r){
    this.extFiles.deleteFile(r)
  }

  onKeyUp(e){
      if(e.ctrlKey){
        if(e.key === 'b'){
          this.events.publish('menu-toggle')
        }
        if(e.key === 'o'){
          this.nav.push(FolderBrowserPage, {'fileSelect': true})
        }
        if(e.key === 'f') this.focusOnSearchbar()
      }
  }

  onExit(){
    this.events.publish('to-save-file')
    this.events.subscribe('file-saved', () => {})

    const config = JSON.stringify(this.settings.config)
    this.storage.set('config', config)
  }

  focusOnSearchbar(){
    if(this.menu.menuToggle) document.getElementById("title").focus()
  }

  presentAboutModal() {
    // let profileModal = this.modalCtrl.create(AboutComponent);
    // profileModal.present();
  }
  
  showMenu(){

  }
  showFiles(){
    
  }
}