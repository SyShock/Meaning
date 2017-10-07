import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Entry as IEntry, FileEntry, IFile, IWriteOptions } from '@ionic-native/file'

@Injectable()
export class ExternFilesProvider {
  private fileCalls: any;
  base: Array<string> = [];
  _base: string;
  selectedDirPath: string;

  private _errorMessenger: any
  private _successMessenger: any

  openedFile: string;
  defaultAppLocation: string = "Meaning"


  constructor(private platform: Platform,
    private events: Events) {
    console.log('Hello ExternFilesProvider Provider');
    this.checkPlatform()
  }

  setErrorMessender(dep){
    this._errorMessenger = dep
  }

  setSuccessMessenger(dep){
    this._successMessenger = dep
  }


  private _electronHasAppFolder() {
    const res:any = this._electronListDirs()
    
    if (res.indexOf(this.defaultAppLocation) < 0) { 
      this._electronMakeDir(this.defaultAppLocation)
      this.goToDir(this.defaultAppLocation)
    }
    else  
      this.goToDir(this.defaultAppLocation)      
  }
  
  private async _cordovaHasAppFolder() {
    const res = await this._cordovaListDirs()

    if (res.indexOf(this.defaultAppLocation) < 0) { 
      this._cordovaMakeDir(this.defaultAppLocation)
      this.goToDir(this.defaultAppLocation)
    }
    else
      this.goToDir(this.defaultAppLocation)
  }



  checkPlatform(){
    if (this.platform.is('electron')) this.initElectronFileCalls();
    if (this.platform.is('cordova')) this.initCordovaFileCalls();
  }

  private initElectronFileCalls(){
    console.log('Setting up for electron.');
    const _window: any = window
    const process = _window.require('process')
    const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

    this.fileCalls = _window.require('fs')
    this.base = [home];
    this._base = home;
    this.listDirs = this._electronListDirs
    this.listFiles = this._electronListFiles
    // this.listFilesAsync = this._electronListFilesAsync
    this.makeDir = this._electronMakeDir
    this.openFile = this._electronRead
    this.saveFile = this._electronWrite
    this.deleteFile = this._electronDeleteFile
    this.getMetadata = this._electronGetMetadata

    // this._electronHasAppFolder()
  }

  private initCordovaFileCalls(){
    console.log('Setting up for cordova.');

    const native = require('@ionic-native/file')
    this.fileCalls = new native.File()
    this.base = ['file:///sdcard'];
    this._base = 'file:///sdcard'
    this.listDirs = this._cordovaListDirs
    this.listFiles = this._cordovaListFiles
    this.makeDir = this._cordovaMakeDir
    this.openFile = this._cordovaRead
    this.saveFile = this._cordovaWrite
    this.deleteFile = this._cordovaDelecteFile
    this.getMetadata = this._cordovaGetMetadata

    // this._cordovaHasAppFolder()
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

  private _electronListFiles( suffixes: Array<string> ) {
    let baseURL = this.base[0]
    let res: Array<string> = this.fileCalls.readdirSync(baseURL)
    let ret = res.filter((en) => { return this.fileCalls.statSync(baseURL + '/' + en).isFile() })
    let _ret = []
    // ret.forEach((el)=>{
    //   for (let suffix of suffixes){
    //     if(el.includes(suffix)) _ret.push(el)
    //   }
    // })
    return _ret
  }

  private _electronListFilesAsync(suffixes: Array<string>, callback: Function) {
    let baseURL = this.base[0]
    this.fileCalls.readdir(baseURL, (err, res) => {
      res.forEach(el => {
        this.fileCalls.stat(baseURL + '/' + el, (err, ret) =>  {
          if (ret.isFile()) {
            for (let suffix of suffixes){
              if (el.includes(suffix)) callback(el)
            }
          }
        })
      });
    })
  }

  private _electronGetMetadata(fileNames){
    let baseURL = this.base.join('/')
    console.log(baseURL)
    return fileNames.map((en) => {
      let w = this.fileCalls.statSync(baseURL + '/' + en);
      return {
        time: w.mtime.getTime(),
        name: en
      }
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
    let baseURL = this.base.join('/')
    console.log('ULR: ' ,baseURL)
    let res:Array<IEntry> = await this.fileCalls.listDir(baseURL, '.')
    let ret = res.filter((en) => {return en.isDirectory}).map((en)=> {return en.name})
    console.log(ret)
    return ret
  }

  private async _cordovaListFiles(suffixes?: Array<string>) {
    let baseURL = this.base.join('/')
    console.log('ULR: ', baseURL)
    let res: Array<IEntry> = await this.fileCalls.listDir(baseURL, '.');
    let ret = res.filter((en) => { return en.isFile }).map((en) => {return en.name})
    let _ret = []
    for (let suffix of suffixes){
      _ret.concat(ret.filter((el)=> {return el.includes(suffix)}))
    }
    return _ret
  }

  private async _cordovaGetMetadata(fileNames){
    let baseURL = this.base.join('/')

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
  listFiles(suffixes: Array<string>): any {}
  listFilesAsync(suffixes: Array<string>, callback: Function): any {}

  jumpToDir(path){
    this.base[0] = path
    return this.base[0]
  }
  goToDir(dirName) {
    this.base[0] = this.base[0] + '/' + dirName + '/'
    return this.base[0]
  }
  prevDir() {
    if(this.base[0] !== this._base || '/')
    this.base[0] = this.base[0].replace(/\/([^\/]+)\/?$/g, '')
    return this.base[0]
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
  moveFile(fileName, pathUrl){}
  renameFile(fileName){}

  clearPath(){
    this.base[0] = this._base
  }
  onAfterSaveFile(){
    this.events.publish('file-saved')
  }

  onAfterOpenFile(fileName: string){
    this.openedFile = fileName.replace(/\.\w+$/g,'')
  }
}
