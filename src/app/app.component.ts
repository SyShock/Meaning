import { Storage } from '@ionic/storage';
import { SettingsProvider } from './../providers/settings/settings';
import { Component, Renderer2, ViewChild } from '@angular/core';
import { Nav, Platform, Events, MenuToggle, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ExternFilesProvider } from '../providers/extern-files/extern-files';
import { HomePage } from '../pages/home/home';
import { FolderBrowserPage } from '../pages/folder-browser/folder-browser';
import { SettingsPage } from './../pages/settings/settings';

interface IElement{
  title: string,
  element: any
}

interface IState{
  files: Array<IElement>,
  headers: Array<IElement>,
  markdown: Array<IElement>,
  katex: Array<IElement>,
  bookmark: Array<IElement>,
  main: Array<IElement>
}

interface IKeyWord {
  long: string,
  short: string
}

//short and long in an object, instead of keywords or keyword as hash to the 'path' in backups

@Component({
  templateUrl: 'app.html',
  host: {
    '(document:keyup)': 'onKeyUp($event)'
  }
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('searchbar') searchbar: any;
  rootPage: any = HomePage;

  backupState: IState = {
    files: [],
    headers: [],
    bookmark: [],
    katex : [],
    markdown: [],
    main: []
  }
  state : IState = {
    files: [],
    headers: [],
    bookmark: [],
    katex : [],
    markdown: [],
    main: []
  }

  searchWords: string;
  showedAlert: boolean = false;

  keywords:Array<IKeyWord> = [
    // {short:'t', long: 'katex'},
    {short:'md ', long: 'markdown'},
    {short:'? ', long: 'main'},
    {short:'b ', long: 'bookmark'},
    // {short:'f ', long: 'files'},
    {short:'h ', long: 'headers'},
  ];
  keyword: IKeyWord = null;

  main:Array<{title: string, do?: Function, component?: any, params?: Object}>
  pages: Array<{title: string, component: any, params?: Object}> = [];

  constructor(public platform: Platform,
     public statusBar: StatusBar,
     public splashScreen: SplashScreen,
     private extFiles: ExternFilesProvider,
     private events: Events,
     private menu: MenuToggle,
     public settings: SettingsProvider,
     private storage: Storage,
     private renderer: Renderer2,
     public menuCtrl: MenuController
  ) {
    this.initializeApp();
    this.storage.get("config").then(res => {
      if (res) this.settings.initConfig(JSON.parse(res));
      this.events.publish("config-loaded")
    });

    // used for an example of ngFor and navigation
      //about as an alert message
      this.events.subscribe("config-loaded", (data)=>{
        this.state.main = [
          { title: 'New', element: {do: () => {this.nav.setRoot(HomePage); this.events.publish('new-file') }}},
          { title: 'Open File', element: {do: () => { this.nav.push(FolderBrowserPage, {'fileSelect': true})} } },
          { title: 'Save', element: {do: () => { this.menuCtrl.close(); this.events.publish('to-save-file')} } },
          { title: 'Save As', element: {do: () => { this.menuCtrl.close(); this.events.publish('to-save-file-as')} } },
          { title: 'Open Template', element: {do: () => { this.nav.push(FolderBrowserPage, {'fileSelect': true, 'templates':true})} } },
          { title: 'Save As Template', element: {do: () => { this.menuCtrl.close(); this.events.publish('to-save-file-as')} } },
          { title: "Settings", element: {do: ()=> { this.menuCtrl.close(); this.openPage({component: SettingsPage }) }} },
          { title: "Export", element: {component: SettingsPage }},
          { title: "About", element: {do: () => {} } }
        ];
        this.backupState.main = this.state.main.concat();

        const bookmark = this.settings.getPaths();
        this.state.bookmark = bookmark.map((el)=> { return {title: el.name[0], element:el} });
        this.backupState.bookmark = this.state.bookmark.concat();
      })
      this.events.subscribe('created-heading', (data)=>{
        this.backupState.headers = data.map((el)=> {return {title: el.content, element: el}})
        this.state.headers = this.backupState.headers.concat();
      })
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      this.splashScreen.hide();
      if(this.platform.is('electron')){
        window.addEventListener('beforeunload', () => {
          this.onExit();
        });
      }
      if(this.platform.is('cordova')){
        this.events.subscribe('file-saved', () => this.showedAlert = false)
        this.events.subscribe('to-save-file-canceled', () => this.showedAlert = false)

        const _navigator:any = navigator
        _navigator.app.overrideButton("menubutton", true);
        document.addEventListener('menubutton', (e) => {
          this.menu.toggle()
        }, false)

        this.platform.registerBackButtonAction((e) =>{
          if (this.nav.length() === 1) {
            if (!this.showedAlert) {
              console.log('prompting')
              this.events.publish('to-save-file')
            } else {
              this.platform.exitApp()
            }
          } else this.nav.pop()
          this.showedAlert = true;
        });
      }

      this.events.subscribe('folder-selected', ()=>{
        this.loadFiles()
      })
      this.events.subscribe('bookmark-selected', ()=>{
        this.getBookmarks()
      })
      this.events.subscribe('menu-toggle', ()=>{
        this.menu.toggle()
        setTimeout(() => {
          this.searchbar.setFocus();
        }, 150);
      })
    });
  }

  getBookmarks(){
    const bookmark = this.settings.getPaths();
    this.state.bookmark = bookmark.map((el)=> { return {title: el.name[0], element:el} });
    this.backupState.bookmark = this.state.bookmark.concat();
  }

  //needs to have backup and normal state
  searchKeywords(word = null){
    let keyword = this.keywords.filter((el)=>{
      return this.searchWords === el.short
    })[0]
    if (word) keyword = this.keywords.filter(el => {
      return el.long === word
    })[0]
    // if (!this.searchWords) this.files = this.filesBackUp    //do in one line using structs? backups[keyword] ; as an if prevention, instead of checking which word is
    this.keyword = keyword
    if (keyword) this.searchWords = ' ';
    else this.clearKeyword();
  }
  searchFiles(){
    if (!this.searchWords) {
      this.clearKeyword();
    }
    if (!this.keyword) this.searchKeywords()
    else this.state[`${this.keyword.long}`] = this.backupState[this.keyword.long].filter((el)=>{
      return el.title.toLowerCase().match(this.searchWords.trim())
    })
  }
  openPage(page) {
    this.nav.push(page.component, page.params);
  }
  async openFile(fileName){
    let ret = {content: null, isTemplate: false}
    if (this.extFiles.base.includes(`${this.extFiles.defaultAppLocation}/templates`)) ret.isTemplate = true;
    ret.content = await this.extFiles.openFile(fileName.title)
    this.events.publish('file-opened', ret)
    // this.navCtrl.pop()
  }
  async loadFiles(){
      const files = await this.extFiles.listFiles([".md", ".txt"]);
      this.state.files = files.map(el => { return {title: el, element: ''} })
      this.backupState.files = this.state.files.concat()
  }
  async loadProjectFiles(pathUrl: string){
    this.extFiles.clearPath()
    this.extFiles.jumpToDir(pathUrl)
    this.nav.push(FolderBrowserPage, {'fileSelect': true}) 
    // this.state.files.splice(0, this.state.files.length)
    // const files = await this.extFiles.listFiles(['.md', '.txt'])
    // this.state.files = files.map((el) => {return {title: el, element: ''}})
    // this.backupState.files = this.state.files.concat()
    // this.extFiles.listFilesAsync(['.md', '.txt'], this._testLoad.bind(this))
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
  }

  clearKeyword(){
    if (this.keyword) this.state[`${this.keyword.long}`] = this.backupState[`${this.keyword.long}`].concat()
    this.keyword = null;
    this.searchWords = this.searchWords ? this.searchWords.trim() : '';
  }
  focusOnSearchbar(){
    if(this.menu.menuToggle) document.getElementById("title").focus()
  }
  presentAboutModal() {
    // let profileModal = this.modalCtrl.create(AboutComponent);
    // profileModal.present();
  }
  goToElement(ID){
    const element = document.getElementById(ID)
    element.scrollIntoView({behavior:'smooth', block:'center', inline:'end'});
  }
  showMenu(){
  }
  showFiles(){
  }
}
