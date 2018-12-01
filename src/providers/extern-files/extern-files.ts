import { Injectable } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Entry as IEntry, FileEntry, IFile, IWriteOptions } from '@ionic-native/file'
import { EventsProvider, EventNames } from '../events/events';

@Injectable()
export class ExternFilesProvider {
  private fileCalls: any;
  base: string;
  _base: string;
  selectedDirPath: string;

  customPath: boolean;

  private _errorMessenger: any;
  private _successMessenger: any;

  openedFile: string;
  defaultAppLocation: string = "Meaning";
  

  constructor(private platform: Platform, private events: EventsProvider) {
    this.checkPlatform();
  }

  setErrorMessenger(dep) {
    this._errorMessenger = dep;
  }

  setSuccessMessenger(dep) {
    this._successMessenger = dep;
  }

  private _electronHasAppFolder() {
    const res: any = this._electronListDirs();

    if (res.indexOf(this.defaultAppLocation) < 0) {
      this._electronMakeDir(this.defaultAppLocation);
      this.goToDir(this.defaultAppLocation);
    } else this.goToDir(this.defaultAppLocation);
  }

  private async _cordovaHasAppFolder() {
    const res = await this._cordovaListDirs();

    if (res.indexOf(this.defaultAppLocation) < 0) {
      this._cordovaMakeDir(this.defaultAppLocation);
      this.goToDir(this.defaultAppLocation);
    } else this.goToDir(this.defaultAppLocation);
  }

  checkPlatform() {
    if (this.platform.is("electron")) this.initElectronFileCalls();
    if (this.platform.is("cordova")) this.initCordovaFileCalls();
  }

  private initElectronFileCalls() {
    console.log("Setting up for electron.");

    const _window: any = window;
    const process = _window.require("process");
    const home =
      process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

    this.fileCalls = _window.require("fs");
    this.base = home;
    this._base = home;
    this.listDirs = this._electronListDirs;
    this.listFiles = this._electronListFiles;
    // this.listFilesAsync = this._electronListFilesAsync
    this.makeDir = this._electronMakeDir;
    this.openFile = this._electronRead;
    this.saveFile = this._electronWrite;
    this.deleteFile = this._electronDeleteFile;
    this.getMetadata = this._electronGetMetadata;

    this._electronHasAppFolder()
  }

  private initCordovaFileCalls() {
    console.log("Setting up for cordova.");

    const native = require("@ionic-native/file");
    this.fileCalls = new native.File();
    this.base = "file:///sdcard";
    this._base = "file:///sdcard" + '/' + this.defaultAppLocation;
    this.listDirs = this._cordovaListDirs;
    this.listFiles = this._cordovaListFiles;
    this.makeDir = this._cordovaMakeDir;
    this.openFile = this._cordovaRead;
    this.saveFile = this._cordovaWrite;
    this.deleteFile = this._cordovaDelecteFile;
    this.getMetadata = this._cordovaGetMetadata;

  this._cordovaHasAppFolder()
  }

  /**
   * ================================================================
   * Electron/Node.js file calls
   * ================================================================
   */

  private _electronWrite(fileName, data) {
    const baseURL = this.customPath ? '' : this.base + '/';
    this.fileCalls.writeFileSync(baseURL + fileName, data);
    this.onAfterSaveFile()
  }

  private _electronRead(fileName, customPath?: boolean, setAsOpenedFile?: boolean) {
    const baseURL = customPath ? '' : this.base + '/';
    this.customPath = customPath;
    if(setAsOpenedFile) this.onBeforeOpenFile(fileName);
    return this.fileCalls.readFileSync(baseURL + fileName, "utf-8"); //"read as"
  }

  private _electronListDirs() {
    let baseURL = this.base;
    let res: Array<string> = this.fileCalls.readdirSync(baseURL);
    return res.filter(en => {
      return this.fileCalls.statSync(baseURL + "/" + en).isDirectory();
    });
  }

  private _electronListFiles(suffixes?: Array<string>, customPath?: string) {
    let baseURL = customPath ? customPath : this.base;
    let res: Array<string> = this.fileCalls.readdirSync(baseURL);
    let ret = res.filter(en => {
      return this.fileCalls.statSync(baseURL + "/" + en).isFile();
    });
    let _ret = [];
    ret.forEach(el => {
      for (let suffix of suffixes) {
        if (el.includes(suffix)) _ret.push(el);
      }
    });
    return _ret;
  }

  private _electronListFilesAsync(suffixes: Array<string>, callback: Function) {
    let baseURL = this.base;
    this.fileCalls.readdir(baseURL, (err, res) => {
      res.forEach(el => {
        this.fileCalls.stat(baseURL + "/" + el, (err, ret) => {
          if (ret.isFile()) {
            for (let suffix of suffixes) {
              if (el.includes(suffix)) callback(el);
            }
          }
        });
      });
    });
  }

  private _electronGetMetadata(fileNames) {
    let baseURL = this.base;
    console.log(baseURL);
    return fileNames.map(en => {
      let w = this.fileCalls.statSync(baseURL + "/" + en);
      return {
        time: w.mtime.getTime(),
        name: en
      };
    });
  }

  private _electronMakeDir(dirName) {
    let baseURL = this.base;
    this.fileCalls.mkdirSync(`${baseURL}/${dirName}`);
  }

  private _electronDeleteFile(fileName) {
    let baseURL = this.base;
    this.fileCalls.unlinkSync(baseURL + "/" + fileName);
  }

  private _electronMoveFile() {}

  private _electronRenameFile() {}

  /**
   * ================================================================
   * Cordova file calls
   * ================================================================
   */

  private _cordovaWrite(fileName, data) {
    let baseURL = this.base;
    if (this.customPath) {
      baseURL = fileName.replace(/\/([^/]+)$/g, '') //the issue is that the call demands a path
      fileName = fileName.slice(baseURL.length + 1, fileName.length)
    }
    let options: IWriteOptions = {
      replace: true
    };
    this.fileCalls
      .writeFile(baseURL, fileName, data, options)
      .then(() => this.onAfterSaveFile())
      .catch(e => console.log(e));
  }

  private async _cordovaRead(fileName: string, customPath?: boolean, setAsOpenedFile?: boolean) {
    let baseURL:any = this.base;
    if (setAsOpenedFile) this.onBeforeOpenFile(fileName);
    if (customPath) {
      baseURL = fileName.replace(/\/([^/]+)$/g, '') //the issue is that the call demands a path
      fileName = fileName.slice(baseURL.length+1, fileName.length)
    }
    this.customPath = customPath
    let res = await this.fileCalls.readAsText(baseURL, fileName);
    return res;
  }

  private async _cordovaListDirs() {
    let baseURL = this.base;
    let res: Array<IEntry> = await this.fileCalls.listDir(baseURL, ".");
    let ret = res
      .filter(en => {
        return en.isDirectory;
      })
      .map(en => {
        return en.name;
      });
    return ret;
  }

  private async _cordovaListFiles(suffixes?: Array<string>, customPath?: string) {
    const baseURL = customPath ? customPath : this.base;
    let res: Array<IEntry> = await this.fileCalls.listDir(baseURL, ".");
    let ret = res
      .filter(en => {
        return en.isFile;
      })
      .map(en => {
        return en.name;
      });
    let _ret = [];
    for (let suffix of suffixes) {
      _ret = _ret.concat(
        ret.filter(el => {
          return el.includes(suffix);
        })
      );
    }
    return _ret;
  }

  private async _cordovaGetMetadata(fileNames) {
    let baseURL = this.base;

    let res: Array<IEntry> = await this.fileCalls.listDir(baseURL, ".");
    let ret = res.filter(en => {
      return en.isFile;
    });

    let promises = [];
    ret.forEach(el => {
      promises.push(
        new Promise((resolve, reject) => {
          el.getMetadata(
            ez =>
              resolve({ time: ez.modificationTime.getTime(), name: el.name }),
            e => reject(e)
          );
        })
      );
    });
    return Promise.all(promises);
  }

  private _cordovaMakeDir(dirName) {
    let baseURL = this.base;
    this.fileCalls.createDir(baseURL, dirName, false);
  }

  private _cordovaDelecteFile(fileName) {
    let baseURL = this.base;
    let file: FileEntry = this.fileCalls
      .getFile(baseURL, fileName)
      .remove(r => console.log(r), e => console.log(e));
  }

  private _cordovaMoveFile() {}

  private _cordovaRenameFile() {}

  /**
   * ================================================================
   * Public extern-file calls
   * ================================================================
   */

  jumpToDir(path) {
    this.base = path;
    return this.base;
  }
  goToDir(dirName) {
    this.base = this.base + "/" + dirName;
    return this.base;
  }
  prevDir() {
    if (this.base !== this._base)
      this.base = this.base.replace(/\/([^\/]+)\/?$/g, "");
    return this.base;
  }
  selectDir() {
    this.selectedDirPath = this.base;
    this.events.publish(EventNames.fileSelected);
  }

  clearPath() {
    this.base = this._base;
  }

  // Abstract methods
  /**
   * Select files to rename, rewrite, move, etc
   */
  selectFile() {}
  /**
   * Create new directory
   * @param dirName
   */
  makeDir(dirName) {}
  /**
   * Open file with specified name,
   * returns data as string (utf-8)
   * @param fileName
   * @param withoutBasePath
   */
  openFile(fileName, withoutBasePath?, setAsOpenedFile?: boolean):string | Promise<any> {return}
  /**
   * Save to specified file name (will overwrite if found)
   * data as a string (utf-8)
   * @param fileName
   * @param data
   */
  saveFile(fileName, data) {}
  deleteFile(fileName) {}
  moveFile(fileName, pathURL) {}
  renameFile(fileName, newFileName) {}
  /**
   * Get from file specific meta-data requested in metaData object
   * @param fileName
   * @param metaData
   */
  getMetadata(fileName: string /**, metaData: Object*/): any {}
  /**
   * List directories in dir
   */
  listDirs(): any {}
  /**
   * Async directories in dir
   */
  listDirsAsync(callback) {}
  /**
   *  List all files in directory,
   *  filtered by suffix
   *  and may include specific meta-data requested in metaData object
   *
   * @param suffixes
   * @param metaData
   */
  listFiles(suffixes?: Array<string> /**, metaData: Object */, path?: string): any {}
  /**
   *  Async listing of files (in case of sync reading being too slow and seemingly inactive)
   *  callback: Func handles each file
   *
   * @param suffixes
   * @param metaData
   * @param callback
   */
  listFilesAsync(
    suffixes: Array<string>,
    callback: Function /**,
     metaData: Object*/
  ): any {}

  onAfterSaveFile() {
    this.events.publish(EventNames.fileSaved);
  }
  onBeforeOpenFile(fileName: string) {
    this.openedFile = fileName.replace(/\.\w+$/g, ""); //remove suffix
  }
}
