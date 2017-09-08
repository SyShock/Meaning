import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Entry as IEntry, FileEntry, IFile, IWriteOptions } from '@ionic-native/file'

@Injectable()
export class ExternFilesProvider {

  fileCalls: any;
  base: Array<string> = [];
  selectedDirPath: string;

  errorMessenger: any
  successMessenger: any

  openedFile: string;


  constructor(private platform: Platform,
     private events: Events) {
    console.log('Hello ExternFilesProvider Provider');

    this.checkPlatform()
  }

  setErrorMessender(dep){
    this.errorMessenger = dep
  }

  setSuccessMessenger(dep){
    this.successMessenger = dep
  }


  checkPlatform(){
    console.log(this.platform.platforms())
    if (this.platform.is('electron')) this.initElectronFileCalls();
    if (this.platform.is('cordova')) this.initCordovaFileCalls();
  }

  private initElectronFileCalls(){
    console.log('Setting up for electron.');

    const process = require('electron').remote.require('process')
    const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE 
    console.log(home);
    
    this.fileCalls =  require('electron').remote.require('fs')
    this.base = [home];
    this.listDirs = this._electronListDirs
    this.listFiles = this._electronListFiles
    this.makeDir = this._electronMakeDir
    this.openFile = this._electronRead
    this.saveFile = this._electronWrite
    this.deleteFile = this._electronDeleteFile
    this.getMetadata = this._electronGetMetadata
  }

  private initCordovaFileCalls(){
    console.log('Setting up for cordova.');

    const native = require('@ionic-native/file')
    this.fileCalls = new native.File()
    this.base = ['file:///sdcard'];
    this.listDirs = this._cordovaListDirs
    this.listFiles = this._cordovaListFiles
    this.makeDir = this._cordovaMakeDir
    this.openFile = this._cordovaRead
    this.saveFile = this._cordovaWrite
    this.deleteFile = this._cordovaDelecteFile
    this.getMetadata = this._cordovaGetMetadata
  }


  /**
   * ================================================================
   * Electron/Node.js file calls
   * ================================================================
   */

  private _electronWrite(fileName, data){
    let baseURL = this.base.join('/')
    this.fileCalls.writeFileSync(baseURL + '/' + fileName, data)
  }

  private _electronRead(fileName){
    let baseURL = this.base.join('/')

    this.onAfterOpenFile(fileName)
    
    return this.fileCalls.readFileSync(baseURL + '/' + fileName, 'utf-8')
  }

  private _electronListDirs(){
     let baseURL = this.base.join('/')
     console.log(baseURL)
     let res:Array<string> = this.fileCalls.readdirSync(baseURL)
     return res.filter((en) => {return this.fileCalls.statSync(baseURL + '/' + en).isDirectory()})
  }

  private _electronListFiles() {
     let baseURL = this.base.join('/')
     console.log(baseURL)
     let res: Array<string> = this.fileCalls.readdirSync(baseURL)
     return res.filter((en) => { return this.fileCalls.statSync(baseURL + '/' + en).isFile() })
   }

   private _electronGetMetadata(fileNames){
    let baseURL = this.base.join('/')
    console.log(baseURL)
    return fileNames.map((en) => { 
      let w = this.fileCalls.statSync(baseURL + '/' + en);
      return {
        time: w.mtime.getTime(),
        name: en }
      })
   }

   private _electronMakeDir(dirName){
    let baseURL = this.base.join('/')
    this.fileCalls.mkdirSync(baseURL, dirName)
  }

  private _electronDeleteFile(fileName){
    let baseURL = this.base.join('/')
    this.fileCalls.unlinkSync(baseURL+ '/' + fileName)    
  }

  private _electronMoveFile(){

  }

  private _electronRenameFile(){

  }


  /**
   * ================================================================
   * Cordova file calls
   * ================================================================
   */

  private _cordovaWrite(fileName, data){
    let baseURL = this.base.join('/')
    console.log(baseURL, fileName)
    let options: IWriteOptions = {
      replace: true,
    }
    this.fileCalls.writeFile(baseURL, fileName, data, options)
      .then(() => this.onAfterSaveFile())
      .catch((e)=>console.log(e));
  }

  private async _cordovaRead(fileName){
    let baseURL = this.base.join('/')
    console.log(fileName);
    
    let res = await this.fileCalls.readAsText(baseURL, fileName)
    console.log(res);

    this.onAfterOpenFile(fileName)

    return res
  }

  private async _cordovaListDirs(){
    // let dirEntry = await this.file.resolveLocalFilesystemUrl('/storage');
    let baseURL = this.base.join('/')
    console.log('ULR: ' ,baseURL)
    let res:Array<IEntry> = await this.fileCalls.listDir(baseURL, '.')
    let ret = res.filter((en) => {return en.isDirectory}).map((en)=> {return en.name})
    console.log(ret)
    return ret
  }

  private async _cordovaListFiles() {
    // let dirEntry = await this.file.resolveLocalFilesystemUrl('/storage');
    let baseURL = this.base.join('/')
    console.log('ULR: ', baseURL)
    let res: Array<IEntry> = await this.fileCalls.listDir(baseURL, '.');
    let ret = res.filter((en) => { return en.isFile }).map((en) => {return en.name})
    return ret
  }

  private async _cordovaGetMetadata(fileNames){
    let baseURL = this.base.join('/')
    
    // let fileNames: Array<IEntry> = await this.file.listDir(baseURL, '.'); 
    let res: Array<IEntry> = await this.fileCalls.listDir(baseURL, '.');
    let ret = res.filter((en) => { return en.isFile })

    let promises = []
    ret.forEach((el)=>{
      promises.push(new Promise((resolve, reject) => {
        el.getMetadata((ez) => 
        resolve ({time: ez.modificationTime.getTime(), name: el.name}),
        (e) => reject(e))
      })
    )})
    return Promise.all(promises)
  }

  private _cordovaMakeDir(dirName){
    let baseURL = this.base.join('/')
    this.fileCalls.createDir(baseURL, dirName, false)
  }

  private _cordovaDelecteFile(fileName){
    let baseURL = this.base.join('/')
    let file:FileEntry = this.fileCalls.getFile(baseURL, fileName)
      .remove((r)=>console.log(r),(e)=>console.log(e))
  }

  private _cordovaMoveFile(){

  }

  private _cordovaRenameFile(){

  }

  /**
   * ================================================================
   * Public file calls
   * ================================================================
   */

  listDirs(): any {}
  listFiles(suffixes?: Array<string>): any{}
  goToDir(dirName) {
    this.base.push(dirName);
    return this.base.join('/')
  }
  prevDir() {
    if(this.base.length > 1){
      this.base.pop();
    }
    return this.base.join('/')
  }
  selectDir(){
    this.selectedDirPath = this.base.join('/')
    this.events.publish('folder-selected')
  }
  selectFile(){}
  makeDir(dirName){}
  openFile(fileName){}
  saveFile(fileName, data){}
  deleteFile(fileName){}
  getMetadata(fileName): any{}
  moveFile(){}
  renameFile(){}

  clearPath(){
    this.base.splice(0, this.base.length)
  }
  onAfterSaveFile(){
    this.events.publish('file-saved')    
  }

  onAfterOpenFile(fileName: string){
    this.openedFile = fileName.replace(/\.\w+$/g,'')
  }
}