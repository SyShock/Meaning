import { SettingsProvider } from './../../providers/settings/settings';
import { HomePage } from './../home/home';
import { Component, HostListener } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Events } from 'ionic-angular';
import { ExternFilesProvider } from '../../providers/extern-files/extern-files'

@IonicPage()
@Component({
  selector: 'page-folder-browser',
  templateUrl: 'folder-browser.html',
  host: {
    '(document:keyup)': 'onKeyUp($event)'
  }
})
export class FolderBrowserPage {


  searchWords: string;
  fileSelect: boolean;

  folders: Array<any> = [];
  files: Array<any> = [];
  foldersBackup: Array<any> = [];
  path: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private extFiles: ExternFilesProvider,
    private alertCtrl: AlertController,
    private events: Events,
    private settings: SettingsProvider) {

  }

  ionViewDidLoad() {
    this.fileSelect = this.navParams.get('fileSelect')
    if (this.fileSelect) this.loadFilesAndDirs()
    else this.loadList()
    console.log('ionViewDidLoad FolderBrowserPage');
    this.path = this.extFiles.base[0]
  }

  async loadList(){
    this.folders.splice(0, this.folders.length)
    this.folders = this.folders.concat(await this.extFiles.listDirs())
    this.initBackUp(this.folders)
  }

  async loadFilesAndDirs(){
    this.folders.splice(0, this.folders.length)
    this.files.splice(0, this.files.length)
    this.folders = this.folders.concat(await this.extFiles.listDirs())
    this.files = this.files.concat(await this.extFiles.listFiles(['.md', '.txt']))
    this.initBackUp(this.folders)
  }

  initBackUp(arr){
    this.foldersBackup.splice(0, this.folders.length)
    this.foldersBackup.concat(arr)
  }

  async select(){
    this.extFiles.selectDir()
    let r = await this.extFiles.listFiles()
    let dirName = this.path.match(/\/\w+$/g)
    this.settings.addPath(dirName, this.path)     
    this.getMetadata(r)
    this.navCtrl.setRoot(HomePage)    
    this.events.publish('menu-toggle')
  }

  async openFile(fileName){
    let ret = await this.extFiles.openFile(fileName)
    this.events.publish('file-opened', ret)
    this.navCtrl.pop()
  }

  async goTo(dirName){
    this.path = await this.extFiles.goToDir(dirName)
    this.loadList()
  }

  prevDir(){
    this.path = this.extFiles.prevDir()
    this.loadList()
  }

  makeDir(dirName){
    this.extFiles.makeDir(dirName)
  }

  async getMetadata(fileNames){
    let a = await this.extFiles.getMetadata(fileNames)
    console.log(
      Math.max.apply(Math, a.map((obj) => {return obj.time;}))
    );
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
    console.log(e)
    if(e.key === 'Escape') this.navCtrl.pop()
    
  }

  goBack(){
    this.navCtrl.pop()
  }

  search(){
    console.log(this.foldersBackup)    
    this.folders = this.foldersBackup.filter((el)=>{
      return el.search(this.searchWords) > 0
    })
    console.log(this.folders)
    if (this.folders.length === 0) this.folders = this.foldersBackup 
  }

}
