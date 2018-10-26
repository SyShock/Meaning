import { Storage } from '@ionic/storage';
import { SettingsProvider } from './../providers/settings/settings';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuToggle, MenuController, AlertController, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ExternFilesProvider } from '../providers/extern-files/extern-files';
import { HomePage } from '../pages/home/home';
import { FolderBrowserPage } from '../pages/folder-browser/folder-browser';
import { SettingsPage } from './../pages/settings/settings';
import { EventsProvider, EventNames } from '../providers/events/events';
import jsPDF from 'jspdf'

interface IMenuElement {
  title: string,
  element: any
}

interface ISearchbarState {
  files: Array<IMenuElement>,
  headers: Array<IMenuElement>,
  markdown: Array<IMenuElement>,
  katex: Array<IMenuElement>,
  bookmark: Array<IMenuElement>,
  main: Array<IMenuElement>
}

interface IKeyWord {
  long: string,
  short: string
}

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  @ViewChild('searchbar') searchbar: any;

  backupState: ISearchbarState = {
    files: [],
    headers: [],
    bookmark: [],
    katex: [],
    markdown: [],
    main: []
  }
  state: ISearchbarState = {
    files: [],
    headers: [],
    bookmark: [],
    katex: [],
    markdown: [],
    main: []
  }

  searchWords: string;
  keywords: Array<IKeyWord> = [
    // {short:'t', long: 'katex'},
    { short: 'md ', long: 'markdown' },
    { short: '? ', long: 'main' },
    { short: 'b ', long: 'bookmark' },
    // {short:'f ', long: 'files'},
    { short: 'h ', long: 'headers' },
  ];
  currentKeyword: IKeyWord = null;

  main: Array<{ title: string, do?: Function, component?: any, params?: Object }>
  pages: Array<{ title: string, component: any, params?: Object }> = [];

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private extFiles: ExternFilesProvider,
    private events: EventsProvider,
    private menu: MenuToggle,
    private alertCtrl: AlertController,
    public settings: SettingsProvider,
    private storage: Storage,
    private modalCtrl: ModalController,
    public menuCtrl: MenuController,
  ) {
    this.platform.ready().then( () => this.initAppGlobalEvents())
    
    this.events.once(EventNames.configLoaded, (data) => this.onAppConfigLoaded(data))
    this.storage.get("config").then(res => {
      if (res) this.settings.initConfig(JSON.parse(res));
      this.events.publish(EventNames.configLoaded)
    });
  }

  onAppConfigLoaded(data) {
    this.nav.setRoot(HomePage);
    this.state.main = [
      {
        title: 'New',
        element: { do: () => { this.events.publish(EventNames.fileNew) } }
      },
      {
        title: 'Open File',
        element: { do: () => { this.openPage({ component: FolderBrowserPage, params: { 'fileSelect': true } }) } }
      },
      {
        title: 'Save',
        element: { do: () => { this.menuCtrl.close(); this.events.publish(EventNames.fileToSave) } }
      },
      {
        title: 'Save As',
        element: { do: () => { this.menuCtrl.close(); this.events.publish(EventNames.fileToSaveAs) } }
      },
      {
        title: 'Open Templates',
        element: { do: () => { this.openPage({ component: FolderBrowserPage, params: { 'fileSelect': true, 'templates': true } }) } }
      },
      {
        title: "Settings",
        element: { do: () => { this.menuCtrl.close(); this.openPage({ component: SettingsPage }) } }
      },
      {
        title: "Export",
        element: { do: () => this.presentExportMenu() }
      },
      {
        title: "About",
        element: { do: () => this.presentAbout() }
      }
    ];
    this.backupState.main = this.state.main.concat();

    const bookmark = this.settings.getPaths();
    this.state.bookmark = bookmark.map((el) => { return { title: el.name[0], element: el } });
    this.backupState.bookmark = this.state.bookmark.concat();
  }

  initCordovaEvents() {
    // Cordova Global Events
    this.events.once(EventNames.fileSaved, () => {
      // this.events.unlock(EventNames.fileToSaveAs)
    })
    this.events.once(EventNames.fileToSaveCanceled, () => {
      this.events.unlock(EventNames.fileToSaveAs)
      this.events.unlock(EventNames.fileToSave)
    })
    //@ts-ignore
    navigator.app.overrideButton("menubutton", true);
    document.addEventListener('menubutton', (e) => {
      this.menu.toggle()
    }, false)

    this.platform.registerBackButtonAction((e) => {
      let activeView = this.nav.getActive();
      if (activeView != null) {
        if (this.nav.canGoBack()) { //when app is at another page
          this.nav.pop();
        } else if (activeView.isOverlay) { // when app is at root and has alert
          this.onExit()
          this.platform.exitApp()
        } else { // when app is at root
          this.events.publish(EventNames.fileToSave)
        }
      }
    });
  }

  initAppGlobalEvents() {
      if (this.platform.is('electron')) {
        // Electron Global Events
        window.addEventListener('beforeunload', () => this.onExit())
      }
      if (this.platform.is('cordova')) {
        this.splashScreen.hide();
        this.initCordovaEvents()
      }
      this.events.once(EventNames.headingLoaded, (data) => {
        this.backupState.headers = data.map((el) => { return { title: el.content, element: el } })
        this.state.headers = this.backupState.headers.concat();
      })

      this.events.once(EventNames.templatesLoaded, () => {
        const index = this.state.main.findIndex(el => el.title === 'Open Templates')
        this.state.main.splice(index + 1, 0, {
          title: 'Save As Template', element: { do: () => { this.menuCtrl.close(); this.events.publish(EventNames.fileToSaveAs) } }
        })
      })
      this.events.once(EventNames.templatesClosed, () => {
        const index = this.state.main.findIndex(el => el.title === 'Save As Template')
        this.state.main.splice(index, 1);
      })

      this.events.once(EventNames.fileToSaveCanceled, () => {
        this.events.unlock(EventNames.fileToSaveAs)
        this.loadFiles()
      })
      this.events.once(EventNames.bookmarkSelected, () => {
        this.getBookmarks()
      })
      this.events.once(EventNames.menuToggled, () => {
        this.menu.toggle()
        setTimeout(() => {
          this.searchbar.setFocus();
        }, 150);
      })
    };

  getBookmarks() {
    const bookmark = this.settings.getPaths();
    this.state.bookmark = bookmark.map((el) => { return { title: el.name[0], element: el } });
    this.backupState.bookmark = this.state.bookmark.concat();
  }

  //needs to have backup and normal state
  searchKeywords(word = null) {
    let keyword = this.keywords.filter((el) => {
      return this.searchWords === el.short
    })[0]
    if (word) keyword = this.keywords.filter(el => {
      return el.long === word
    })[0]
    // if (!this.searchWords) this.files = this.filesBackUp    //do in one line using structs? backups[keyword] ; as an if prevention, instead of checking which word is
    this.currentKeyword = keyword
    if (keyword) this.searchWords = ' ';
    else this.clearKeyword();
  }
  searchFiles() {
    if (!this.searchWords) {
      this.clearKeyword();
    }
    if (!this.currentKeyword) this.searchKeywords()
    else this.state[`${this.currentKeyword.long}`] = this.backupState[this.currentKeyword.long].filter((el) => {
      return el.title.toLowerCase().match(this.searchWords.trim())
    })
  }
  openPage(page) {
    const theme = this.settings.getActiveTheme()
    const modal = this.modalCtrl.create(page.component, page.params, { cssClass: theme });
    modal.present();
  }
  async openFile(fileName) {
    let ret = { content: null, isTemplate: false }
    if (this.extFiles.base.includes(`${this.extFiles.defaultAppLocation}/templates`)) ret.isTemplate = true;
    ret.content = await this.extFiles.openFile(fileName.title)
    this.events.publish(EventNames.fileOpened, ret)
    // this.navCtrl.pop()
  }
  async loadFiles() {
    const files = await this.extFiles.listFiles([".md", ".txt"]);
    this.state.files = files.map(el => { return { title: el, element: '' } })
    this.backupState.files = this.state.files.concat()
  }
  async loadProjectFiles(pathUrl: string) {
    this.extFiles.clearPath()
    this.extFiles.jumpToDir(pathUrl)
    const modal = this.modalCtrl.create(FolderBrowserPage, { 'fileSelect': true })
    modal.present();
    // this.state.files.splice(0, this.state.files.length)
    // const files = await this.extFiles.listFiles(['.md', '.txt'])
    // this.state.files = files.map((el) => {return {title: el, element: ''}})
    // this.backupState.files = this.state.files.concat()
    // this.extFiles.listFilesAsync(['.md', '.txt'], this._testLoad.bind(this))
  }
  async deleteFile(r) {
    this.extFiles.deleteFile(r)
  }
  onKeyUp(e) {
    if (e.ctrlKey) {
      if (e.key === 'b') {
        this.events.publish(EventNames.menuToggled)
      }
      if (e.key === 'o') {
        this.nav.push(FolderBrowserPage, { 'fileSelect': true })
      }
      if (e.key === 'f') this.focusOnSearchbar()
    }
  }
  onExit() {
    const filename = this._getDateAsString()
    if(this.settings.isAutoSaveEnabled()){
      this.events.publish(EventNames.fileToSave, filename)
    }
  }

  clearKeyword() {
    if (this.currentKeyword) this.state[`${this.currentKeyword.long}`] = this.backupState[`${this.currentKeyword.long}`].concat()
    this.currentKeyword = null;
    this.searchWords = this.searchWords ? this.searchWords.trim() : '';
  }

  focusOnSearchbar() {
    if (this.menu.menuToggle) document.getElementById("title").focus()
  }

  goToElement(ID) {
    const element = document.getElementById(ID)
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'end' });
  }

  presentAbout() {
    const theme = this.settings.getActiveTheme()
    let prompt = this.alertCtrl.create({
      cssClass: theme,
      title: `Created by SyShock`,
      subTitle: `Github: https://github.com/syshock`
    });
    prompt.present();
  }

  presentExportMenu() {
    const jspdf = new jsPDF();
    const theme = this.settings.getActiveTheme()
    let prompt = this.alertCtrl.create({
      cssClass: theme,
      title: `Export`,
      subTitle: `Please select a file type...`,
      message: ``,
      inputs: [{
        type: 'radio',
        name: `html`,
        id: 'html',
        label: 'HTML',
        value: 'html',
        checked: false
      }, {
        type: 'radio',
        name: `type`,
        id: 'png',
        label: 'PNG',
        value: 'png',
        checked: false
      }, {
        type: 'radio',
        name: `pdf`,
        id: 'pdf',
        label: 'PDF',
        value: 'pdf',
        checked: false
      }],
      buttons: [{
        text: "Close",
        handler: data => {
          prompt.dismiss();
        }
      }, {
        text: "Export",
        handler: data => {
          const el = document.getElementById('second-screen');
          switch (data) {
            case 'pdf':
              jspdf.fromHTML(el, 15, 15, { width: 170 })
              this.extFiles.saveFile(`${this.extFiles.openedFile}.pdf`, jspdf.output())
              break
            case `html`:
              this.extFiles.saveFile(`${this.extFiles.openedFile}.html`, el.innerHTML)
              break
            case `png`:
              break
          }
          prompt.dismiss();
        }
      }],
    });
    prompt.present();
    prompt.onDidDismiss(r => {
    });
  }

  private _getDateAsString() {
    const now = new Date()
    const date = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    return `${date} ${time}`
  }
}
