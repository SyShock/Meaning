import { NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'view-popup',
  template: `
    <button *ngFor='let mode of modes' ion-item (click)="set(mode.num)">
      <ion-label >{{mode.name}}</ion-label>
      <ion-icon *ngIf="state === mode.num" name="add"></ion-icon>
    </button>
  `
})

export class PopUp{
  callback: Function;
  state: number;

  modes:Array<{num: number, name:string}>

  constructor(private navParams: NavParams) {
    this.modes = [
      { num: 1, name: 'Narrow Edit' },
      { num: 2, name: 'Wide Edit' },
      { num: 3, name: 'Narrow View' },
      { num: 4, name: 'Wide View' },
      { num: 5, name: 'Normal' }
    ]

    this.setCallback()
  }

  setCallback(callback?){
    callback = this.navParams.get('callback')
    console.log(callback)
    this.callback = callback
  }

  set(value){
    this.state = value
    this.callback(value)
  }
}
