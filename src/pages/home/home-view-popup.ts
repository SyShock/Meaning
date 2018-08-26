import { NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { EventsProvider, EventNames } from '../../providers/events/events';

enum ViewModes {
  NARROW_EDIT,
  WIDE_EDIT,
  NARROW_PREVIEW,
  WIDE_PREVIEW,
  NORMAL
}

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

  constructor(
    private navParams: NavParams,
    private events: EventsProvider
  ) {
    this.modes = [
      { num: ViewModes.NARROW_EDIT, name: 'Narrow Edit' },
      { num: ViewModes.WIDE_EDIT, name: 'Wide Edit' },
      { num: ViewModes.NARROW_PREVIEW, name: 'Narrow View' },
      { num: ViewModes.WIDE_PREVIEW, name: 'Wide View' },
      { num: ViewModes.NORMAL, name: 'Normal' }
    ]

  }

  set(value){
    this.state = value
    this.events.publish(EventNames.viewChanged, value)
  }
}

export { ViewModes };
