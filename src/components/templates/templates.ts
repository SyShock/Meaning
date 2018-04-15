import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';

@Component({
  selector: 'templates',
  templateUrl: 'templates.html'
})
export class TemplatesComponent {

  template: Array<string> = ['crisp']

  constructor(private storage: Storage, private alertCtrl: AlertController) {
    console.log('Hello TemplatesComponent Component');
  }

  initTemplates(obj){
    this.template = obj 
  }

  loadTemplate(name){
    return this.storage.get(name)
  }

  getTemplates(){
    this.storage.keys()
      .then((res) => this.template = res)
  }

  addTemplate(name, data){
    this.template.push(name)
    this.storage.set(name, data)
  }
  
  removeTemplate(index){
    const name = this.template.splice(index, 1)[0]
    this.storage.remove(name)
  }

  setTemplate(index, data){
    const name = this.template[index]
    this.storage.set(name, data)
  }

  renameTemplate(index, name){
    const _name = this.template[index]
    this.storage.get(_name).then((res) => {
      this.storage.set(name, res)
    })
  }

  doPrompt() {
    let prompt = this.alertCtrl.create({
      inputs: [
        {
          name: 'templateName',
          placeholder: 'Enter name of new template:'
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
      if (r.templateName) {
        this.addTemplate(r.templateName, document.getElementById('first-screen').innerHTML)
      }
    })    
  }


}
