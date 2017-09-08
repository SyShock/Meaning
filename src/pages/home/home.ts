import { SettingsProvider } from './../../providers/settings/settings';
import { TemplatesComponent } from './../../components/templates/templates';
import { MarkjaxProvider } from './../../providers/markjax/markjax';
import { Component, ViewChild } from '@angular/core';
import { NavController, IonicPage, Events, AlertController, ToastController, NavParams } from 'ionic-angular';
import markjax from 'markjax';
import { ExternFilesProvider } from '../../providers/extern-files/extern-files'

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  host: {
    '(document:keyup)': 'onKeyUp($event)',
    '(document:selectionchange)': 'textElementFocused($event)'
  }
})
export class HomePage {

  @ViewChild('input') input: any;
  @ViewChild('output') output: any;
  @ViewChild('templates') templates: TemplatesComponent
  smallScreen: boolean;
  wideScreen: boolean;

  wordCounter: boolean;

  tempMode: number = 0;

  textFont: string;
  headerColor: string;
  headerFont: string;
  textColor: string;

  wordCount: number;
  percentViewing: number;

  previewMode: string;

  changed: boolean;
  parsedContent: string;
  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private files: ExternFilesProvider,
    private events: Events,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public renderer: MarkjaxProvider,
    private settings: SettingsProvider) {
      this.events.subscribe('file-opened', (r) => this.onFileOpened(r))
      this.events.subscribe('to-save-file', () => this._saveFile())
      this.events.subscribe('to-save-file-as', () => this.doPrompt())

  }

  ionViewDidEnter(){
    if(this.navParams.get('newStart')) this.onNewFile()
    this.headerColor = this.settings.getHeaderColor()
    this.headerFont = this.settings.getHeaderFont()
    this.textFont = this.settings.getTextFont()
    this.textColor = this.settings.getTextColor()
    console.log('text ',this.textColor);
    console.log('header ',this.headerColor);

    this.onResize()
    this.initColor()
  }


  wrapInDivs(r){
    let string: string
    string = '<div>' + r.replace(/\n/g, '</div><div>')
    return string
  }

  getWordCount(text: string){
    return text.match(/(\w+\W)+/g).length
  }


  render(){
    //render with regex on input-page
    // this.textElementFocused()

    const elInput = this.input.nativeElement
    const elOutput = this.output.nativeElement
    const currentHeight = elInput.scrollHeight > elOutput.scrollHeight ? elInput.scrollHeight : elOutput.scrollHeight

    this.input.nativeElement.style = 'height: ' + currentHeight + 'px'

    this.renderer.content = this.input.nativeElement.innerHTML;
    markjax(this.input.nativeElement.innerText, this.output.nativeElement, {'sanitize': false})
    this.wordCount = this.getWordCount(this.renderer.content)
    this.initColor()
  }

  switchViews(value?){
    if (!value){this.tempMode++; if(this.tempMode > 4) this.tempMode = 0}
    
    switch (this.tempMode) {
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

  saveFile(r){ //requires dialogue
    this.files.saveFile(r + '.md', this.input.nativeElement.innerText)
    this.showToast()
  }

  textElementFocused(e) {
    console.log(e);
    let focusNode = window.getSelection().focusNode
    let el = focusNode ? focusNode.parentElement : null
    let prev = document.querySelector('.focused')
    if (prev) prev.classList.remove('focused')
    if (el) el.classList.add('focused')
  }


  showToast() {
    const toast = this.toastCtrl.create({
      message: 'File Saved',
      position: 'top',
      duration: 3000
    });

    // toast.onDidDismiss(this.dismissHandler);
    toast.present();
  }

  closeApp(){
    const electron = require('electron')
    electron.remote.app.exit()
  }

  undo(){
    document.execCommand('undo')
  }

  redo(){
    document.execCommand('redo')
  }

  doPrompt() {
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
    prompt.onDidDismiss((r) => {
      if (r.fileName) {
        this.saveFile(r.fileName)
        this.files.openedFile = r.fileName
      }
    })
  }

  initColor(){
    document.getElementById('second-screen').style.color = this.textColor;
    for (let i = 0; i < 6; i++){
      const elements:any = document.getElementById('second-screen').querySelectorAll('h' + i);
      if (elements.length > 0){
        for (let el = 0; el < elements.length; el++){

          elements[el].style.color = this.headerColor;
          elements[el].style.fontFamily = this.headerFont;
        }
      }
    }
  }

  _saveFile(){
    const fileName = this.files.openedFile
    if (fileName && fileName !== '') this.saveFile(fileName)
    else this.doPrompt()
  }

  /**
   * =============================================
   * Events
   * =============================================
   */

  onKeyUp(e: KeyboardEvent){
    if(e.ctrlKey){
      if (e.key === 'S') this.doPrompt()
      else if(e.key === 's') this._saveFile()
    }
  }

  onResize(e?){
    let t;
    if(e) t = e.target
    else t = window

    if (t.innerWidth < 600){
      this.smallScreen = true
    }
    else {
      this.smallScreen = false
    }
    if(this.renderer.content){
      this.input.nativeElement.innerHTML = this.renderer.content
      this.render()
    }
  }

  onFileOpened(r){
    this.input.nativeElement.innerHTML = this.wrapInDivs(r)
    this.render()
  }

  onNewFile(){
    this.input.nativeElement.innerHTML = '<div>Content</div>'
    this.files.clearPath();
    this.files.openedFile = ''
    this.render();
  }

}
