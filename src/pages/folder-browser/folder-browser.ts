import { ViewChildren } from '@angular/core';
import { SettingsProvider } from './../../providers/settings/settings';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events, MenuController } from 'ionic-angular';
import { ExternFilesProvider } from '../../providers/extern-files/extern-files'
import { EventsProvider, EventNames } from '../../providers/events/events';

interface IBackup {
  folders?: any,
  files?: any
}

@IonicPage()
@Component({
  selector: 'page-folder-browser',
  templateUrl: 'folder-browser.html',
  host: {
    '(document:keyup)': 'onKeyUp($event)'
  }
})
export class FolderBrowserPage {
  @ViewChildren('searchbar') searchbar: any;


  searchWords: string;
  fileSelectMode: boolean;

  searchMode: boolean = false;

  fileSelected:boolean;
  templateMode: boolean;

  folders: Array<any> = [];
  files: Array<any> = [];
  foldersBackup: Array<any> = [];
  filesBackup: Array<any> = [];
  path: string;
  basePath: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private extFiles: ExternFilesProvider,
    private alertCtrl: AlertController,
    private events: EventsProvider,
    private menuCtrl: MenuController,    
    private settings: SettingsProvider) {
  
    }

  ionViewDidLoad() {
    this.menuCtrl.close();
    this.fileSelectMode = this.navParams.get('fileSelect')
    if (this.fileSelectMode) {
      this.templateMode = this.navParams.get('templates')
      if (this.templateMode) {
        this.extFiles.jumpToDir(this.extFiles._base + '/Meaning/templates')
        this.events.publish(EventNames.templatesLoaded)
      }
      this.loadFilesAndDirs()
    }
    else this.loadList()
    console.log('ionViewDidLoad FolderBrowserPage');
    this.path = this.extFiles.base;
    this.basePath = this.extFiles._base;
    this.fileSelected = false;
  }

  ionViewDidEnter() {
    this.searchbar.changes.subscribe((input) => {
      if (input.length > 0) {
        input.first.setFocus();
      }
    });
  }
  
  ionViewWillLeave(){
    if(this.fileSelectMode && !this.fileSelected) this.events.publish(EventNames.menuToggled)
    if(this.templateMode) this.events.publish(EventNames.templatesClosed)
  }

  async loadList(){
    this.folders.splice(0, this.folders.length)
    this.folders = this.folders.concat(await this.extFiles.listDirs())
    this.initBackUp({
      folders: this.folders
    })
  }

  async loadFilesAndDirs(){
    this.folders.splice(0, this.folders.length)
    this.files.splice(0, this.files.length)
    this.folders = this.folders.concat(await this.extFiles.listDirs())
    this.files = this.files.concat(await this.extFiles.listFiles(['.md', '.txt']))
    this.initBackUp({
      folders: this.folders,
      files: this.files
    })
  }

  initBackUp({ folders = null, files = null }: IBackup){
    if (folders){
      this.foldersBackup.splice(0, this.folders.length)
      this.foldersBackup = [...folders]
    }
    if (files){
      this.filesBackup.splice(0, this.files.length)
      this.filesBackup = [...files]
    }
  }

  async select(){
    this.extFiles.selectDir()
    let r = await this.extFiles.listFiles(['.md','.txt'])
    let dirName = this.path.match(/(\w+)$/g)
    this.settings.addPath(dirName, this.path)
    this.getMetadata(r)
    this.navCtrl.setRoot(HomePage)
    this.events.publish(EventNames.bookmarkSelected)
    this.events.publish(EventNames.menuToggled)
  }

  async openFile(fileName){
    let ret = {content: null, isTemplate: false}
    if (this.path.includes(`${this.extFiles.defaultAppLocation}/templates`)) ret.isTemplate = true;
    ret.content = await this.extFiles.openFile(fileName)
    this.fileSelected = true
    this.events.publish(EventNames.fileOpened, ret)
    this.navCtrl.pop()
  }

  async goTo(dirName){
    this.path = await this.extFiles.goToDir(dirName)
    this.loadFilesAndDirs()
  }

  prevDir(){
    this.path = this.extFiles.prevDir()
    this.loadFilesAndDirs()
  }

  makeDir(dirName){
    this.extFiles.makeDir(dirName)
  }

  async getMetadata(fileNames){
    let a = await this.extFiles.getMetadata(fileNames)
    console.log(
      Math.max.apply(Math, a.map((obj) => {return obj.time;}))
    );3
  }

  doPrompt() {
    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'dirName',
          placeholder: 'Enter new folder name:'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
    prompt.onDidDismiss((r)=>{
      this.makeDir(r.dirName)
    })
  }


  onKeyUp(e: KeyboardEvent){
    // console.log(e)
    if(e.key === 'Escape') this.navCtrl.pop()

  }

  goBack(){
    this.navCtrl.pop()
  }

  openModal(){

  }

  search(e){
    this.searchWords = e.target.value.toLowerCase()
    this.folders = this.foldersBackup.filter((el)=>{
      el = el.toLowerCase()
      return el.includes(this.searchWords)
    })
    this.files = this.filesBackup.filter((el) => {
      el = el.toLowerCase()
      return el.includes(this.searchWords)
    })
    if (!this.searchWords){
      this.files = this.filesBackup
      this.folders = this.foldersBackup
    } 
  }
  clearSearch(){
    this.searchWords = ""
    this.files = this.filesBackup
    this.folders = this.foldersBackup
  }

  toggleSearch(){
    this.searchMode = !this.searchMode
    this.clearSearch()
  }
}
