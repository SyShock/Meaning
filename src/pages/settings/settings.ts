import { FolderBrowserPage } from './../folder-browser/folder-browser';
import { SettingsProvider } from './../../providers/settings/settings';

import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  paths: Array<any>
  headerFontOptions: Array<{name: string, value: string}>
  textFontOptions: Array<{name: string, value: string}>
  fontSizeList: Array<{name: string, value: string}>
  themes: Array<{name: string, value: string}>

  headerFont: string;
  textFont: string;
  textSize: string;
  theme: string;
  headerColor: string;
  textColor: string;
  textFocus: boolean;


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private settings: SettingsProvider){ 

      this.paths = this.settings.getPaths()
      this.textFont = this.settings.getTextFont()
      this.textColor = this.settings.getTextColor()
      this.headerColor = this.settings.getHeaderColor()
      this.textFont = this.settings.getTextFont()
      this.textSize = this.settings.getTextSize()
      this.headerFont = this.settings.getHeaderFont()
      this.theme = this.settings.getActiveTheme()

      this.headerFontOptions = [
        { name: 'Roboto', value: 'roboto' },
        { name: 'Monospace', value: 'monospace' },
        { name: 'Cloister Black', value: 'CloisterBlack' }
      ]

      this.textFontOptions = [
        { name: 'Roboto', value: 'roboto' },
        { name: 'Monospace', value: 'monospace' },
        { name: 'Cloister Black', value: 'CloisterBlack' }
      ]
  
      this.themes = [
        { name: 'Light', value: 'light-theme' },
        { name: 'Night', value: 'dark-theme' },
        { name: 'Hackerman', value: 'hackerman-theme' }
      ]

      this.fontSizeList = [
        { name: 'Smaller', value: 'smaller' },
        { name: 'Small', value: 'small' },
        { name: 'Medium', value: 'medium' },
        { name: 'Large', value: 'large' },
        { name: 'Larger', value: 'larger' },
      ]
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  onFocus(el){
  //   var picker = new ColorPicker({
  //     space: 'rgb',
  //   });
  //   console.log(picker);
    

  // el.nativeElement.appendChild(picker.element);
  }

  onThemeChange(){
      this.settings.setTheme(this.theme)
  }

  addProjectPath(){
    this.navCtrl.push(FolderBrowserPage)
  }

  removeProjectPath(name){
    this.settings.removePath(name)
    this.paths = this.settings.getPaths()    
  }

  doPromptSync(){

  }
  
  goBack(){
    this.navCtrl.pop()
  }

  onHeaderFontChange(value){
    this.settings.setHeaderFont(value)
  }

  onTextFontChange(value){
    this.settings.setTextFont(value)
  }

  onTextSizeChange(value){
    this.settings.setTextSize(value)    
  }

  onFontSizeChange(value){
    this.settings.setTextSize(value)        
  }

  onHeaderColorChange(value){
    this.settings.setHeaderColor(value)            
  }

  onTextColorChange(value){
    this.settings.setTextColor(value)            
  }

  onTextfocusChange(value){
    this.settings.setTextColor(value)            
  }
}
