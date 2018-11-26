import { Injectable } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';

interface IConfig{
  theme: string,
  paths: [{name: string, url: string}],
  headerFont: string,
  headerColor: string,
  textFont: string,
  textColor: string,
  textSize: string,
  textFocus: boolean,
  autoSaveEnabled: boolean
}


@Injectable()
export class SettingsProvider {

  config: IConfig

  constructor(private statusBar: StatusBar) {
    console.log('Hello SettingsProvider Provider');
    this.config = {
      theme:'light-theme',
      paths: [{ name: '', url: '' }],
      headerFont: 'roboto',
      headerColor: 'grey',
      textFont: 'roboto',
      textColor: '',
      textSize: 'normal',
      textFocus: true,
      autoSaveEnabled: true
    }
    this.config.paths.pop()
  }

  initConfig(obj: IConfig){
    this.config = obj
  }

  isAutoSaveEnabled(): boolean {
    return this.config.autoSaveEnabled
  }

  toggleAutoSave(state) {
    return this.config.autoSaveEnabled = state
  }

  setTheme(themeName: string){
    if (themeName.includes('light')){
      this.statusBar.backgroundColorByName('white')
      this.statusBar.styleDefault()
    }
    else {
      this.statusBar.backgroundColorByName('black');
      this.statusBar.styleLightContent()
    }
    this.config.theme = themeName
  }

  setTextFont(fontName){
    this.config.textFont = fontName
  }

  setTextColor(color){
    this.config.textColor = color
  }

  setHeaderFont(fontName){
    this.config.headerFont = fontName
  }

  setHeaderColor(color){
    this.config.headerColor = color
  }

  setTextSize(value){
    this.config.textSize = value
  }

  getPaths(){
    return this.config.paths.concat()
  }

  getHeaderFont(){
    return this.config.headerFont
  }

  getTextFont(){
    return this.config.textFont
  }

  getTextColor(){
    return this.config.textColor
  }

  getHeaderColor(){
    return this.config.headerColor
  }

  getTextSize(){
    return this.config.textSize
  }

  getActiveTheme(){
    return this.config.theme
  }

  addPath(name, pathUrl){
    const paths = this.config.paths
    paths.push({'name': name, 'url': pathUrl})
    console.log(name,pathUrl)
  }

  removePath(name){
    const paths = this.config.paths
    const index = paths.findIndex( (el) => el.name === name)
    console.log(paths, index);

    paths.splice(index, 1)
  }

  setTextFocus(value: boolean){
    this.config.textFocus = value
  }

  getTextFocus(){
    return this.config.textFocus
  }
}
