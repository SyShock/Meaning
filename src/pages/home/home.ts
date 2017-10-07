import { SettingsProvider } from './../../providers/settings/settings';
import { TemplatesComponent } from './../../components/templates/templates';
import { MarkjaxProvider } from './../../providers/markjax/markjax';
import { Component, ViewChild } from '@angular/core';
import {
  AlertController,
  Events,
  IonicPage,
  NavController,
  NavParams,
  PopoverController,
  ToastController,
} from 'ionic-angular';
import { PopUp } from './home-view-popup'
import { ExternFilesProvider } from '../../providers/extern-files/extern-files'

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',

})
export class HomePage {

  @ViewChild('input') input: any;
  @ViewChild(PopUp) popup: PopUp;
  @ViewChild('output') output: any;
  smallScreen: boolean;
  wideScreen: boolean;

  wordCounter: boolean;
  textFocused: boolean;

  textFont: string;
  headerColor: string;
  headerFont: string;
  textColor: string;

  wordCount: number;
  percentViewing: number;

  previewMode: string;
  searchText: string;
  changed: boolean;
  parsedContent: string;

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private files: ExternFilesProvider,
    private events: Events,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private parser: MarkjaxProvider,
    private settings: SettingsProvider,
    private popoverCtrl: PopoverController) {
    this.events.unsubscribe('file-opened')
    this.events.unsubscribe('to-save-file')
    this.events.unsubscribe('to-save-file-as')
    this.events.subscribe('file-opened', (r) => this.onFileOpened(r))
    this.events.subscribe('to-save-file', () => this._saveFile())
    this.events.subscribe('to-save-file-as', () => this.showPrompt())
  }

  ionViewDidEnter() {
    if (this.navParams.get('newStart')) this.onNewFile()
    this.headerColor = this.settings.getHeaderColor()
    this.headerFont = this.settings.getHeaderFont()
    this.textFont = this.settings.getTextFont()
    this.textColor = this.settings.getTextColor()
    this.textFocused = this.settings.getTextFocus()

    this.onResize()
    this.colorViewScreen()
    this.render()
  }


  /**
   * ===================================
   * Page Functions
   * ===================================
   */

  wrapInDivs(r) {
    let string: string
    string = '<div>' + r.replace(/\n/g, '<br></div><div>')
    return string
  }

  getWordCount(text: string) {
    this.wordCount = text.match(/\S+/g).length
  }

  adjustHeight(elInput, elOutput) {
    let currentHeight = elInput.scrollHeight > elOutput.scrollHeight ? elInput.scrollHeight : elOutput.scrollHeight
    currentHeight = currentHeight > document.body.clientHeight ? currentHeight : document.body.clientHeight

    elInput.style = 'height: ' + currentHeight + 'px'

    // a bit overboard but works for now
    let temp: any = Array.from(document.querySelectorAll('ion-slides'))
    for (let el of temp) el.style = 'height: ' + currentHeight + 'px'
  }

  colorViewScreen() {
    document.getElementById('second-screen').style.color = this.textColor;
    for (let i = 0; i < 3; i++) {
      const headers: any = document.getElementById('second-screen').querySelectorAll('h' + i);
      const lines: any = document.getElementById('second-screen').querySelectorAll('hr');
      if (headers.length > 0) {
        for (let el = 0; el < headers.length; el++) {
          headers[el].style.color = this.headerColor;
          headers[el].style.fontFamily = this.headerFont;
        }
      }
      for (let el = 0; el < lines.length; el++) 
        lines[el].style.color = this.headerColor;
    }
  }

  render() {
    const elInput = this.input.nativeElement
    const elOutput = this.output.nativeElement

    this.parser.parse(elInput.innerText, elOutput)
    this.adjustHeight(elInput, elOutput)
    this.colorViewScreen()
    this.getWordCount(elOutput.innerText)
  }

  focusCurrentLine() {
    let focusNode = window.getSelection().focusNode
    let parent = focusNode ? focusNode.parentElement : null
    let prevs = Array.from(document.querySelectorAll('.focused'))
    for (let prev of prevs) prev.classList.remove('focused')
    if (parent) parent.classList.add('focused')
  }

  appendIn(mode) {
    let text = window.getSelection().toString()
    let wrap
    switch (mode) {
      case 1:
        wrap = `>`
        break;
      case 2:
        wrap = `-`
        break;
      case 3:
        wrap = `#`
        break;
      default:
        break;
    }
    text = `${wrap} ${text}`
    document.execCommand('insertText', false, text)
  }

  wrapIn(mode) {
    let text = window.getSelection().toString()
    let wrap
    switch (mode) {
      case 1:
        wrap = `*`
        break;
      case 2:
        wrap = `**`
        break;
      case 3:
        wrap = `~~`
        break;
      case 4:
        wrap = '`'
        break;
      case 5:
        wrap = '```'
        break;
      default:
        break;
    }
    text = `${wrap}${text}${wrap}`
    document.execCommand('insertText', false, text)
  }

  wrapInCode() {
    let text = window.getSelection().toString()
    let wrap = '```'
    text = `\n${wrap}\n${text}\n${wrap}`
    document.execCommand('insertText', false, text)

  }

  findText() {

  }

  /**
   * ===================================
   * Page Actions
   * ===================================
   */

  scrollTo(element: string) {
    let yOffset = document.getElementById(element).offsetTop;
    // this.content.scrollTo(0, yOffset, 4000)
  }

  showPopover(ev) {
    let popover = this.popoverCtrl.create(
      PopUp,
      { callback: this.switchViews.bind(this) },
      { cssClass: this.settings.getActiveTheme() }
    );

    popover.present({ direction: 'up', ev: ev })
  }

  showToast() {
    const toast = this.toastCtrl.create({
      message: 'File Saved',
      position: 'top',
      duration: 3000
    });

    toast.present();
  }

  exitApp() {
    const _window:any = window
    const electron = _window.require('electron')
    electron.remote.app.exit()
  }

  undo() {
    document.execCommand('undo')
  }

  redo() {
    document.execCommand('redo')
  }

  showPrompt() {
    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'fileName',
          placeholder: 'Enter new file name:'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
            this.events.publish('to-save-file-canceled')
          }
        },
        {
          text: 'Save',
          handler: data => { console.log('Saved clicked'); }
        }
      ],
      cssClass: this.settings.getActiveTheme()
    });
    prompt.present();
    prompt.onDidDismiss((r) => {
      if (r.fileName) {
        this.saveFile(r.fileName)
        this.files.openedFile = r.fileName
      }
    })
  }

  switchViews(value?) {
    switch (value) {
      case 1:
        this.previewMode = 'narrowEditView'
        break;
      case 2:
        this.previewMode = 'wideEditView'
        break;
      case 3:
        this.previewMode = 'narrowPreview'
        break;
      case 4:
        this.previewMode = 'widePreview'
        break;
      default:
        this.previewMode = ''
        break;
    }
  }

  _saveFile() {
    const fileName = this.files.openedFile
    if (fileName && fileName !== '') this.saveFile(fileName)
    else this.showPrompt()
  }

  saveFile(r) { //requires dialogue
    this.files.saveFile(r + '.md', this.input.nativeElement.innerText)
    this.showToast()
  }


  /**
   * =============================================
   * Page Events
   * =============================================
   */

  onKeyUp(e: KeyboardEvent) {
    e.preventDefault()
    if (e.ctrlKey) {
      if (e.key === 'S') this.showPrompt()
      else if (e.key === 's') this._saveFile()

      if (e.key === 'f') this.findText()
      if (e.key === 'i') this.wrapIn(1)
      if (e.key === 'j') this.wrapIn(2)
      if (e.key === 'q') this.appendIn(1)
      if (e.key === 'l') this.appendIn(2)
      if (e.key === 'h') this.appendIn(3)
    }
    if (e.ctrlKey && e.altKey && e.key === 'u') this.wrapIn(3)
    if (e.ctrlKey && e.key === 'k') this.wrapIn(4)
    if (e.ctrlKey && e.key === 'K') this.wrapInCode()
  }

  onTextInput() {
    const input: HTMLElement = this.input.nativeElement
    const regex = new RegExp(`/(${this.searchText})+/g`)
    const array = input.innerHTML.match(regex)
  }

  onResize(e?) {
    let t;
    if (e) t = e.target
    else t = window

    if (t.innerWidth < 600) this.smallScreen = true
    else this.smallScreen = false
    this.render()
  }

  onFileOpened(r) {
    this.input.nativeElement.innerHTML = this.wrapInDivs(r)
    this.render()
  }

  onNewFile() {
    this.input.nativeElement.innerHTML = '<div>Content</div>'
    this.files.clearPath();
    this.files.openedFile = ''
    this.render();
  }

  onSelectionChange(e) {
    this.focusCurrentLine()
  }

}
