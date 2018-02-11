import { NavParams } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: "pop-over",
  templateUrl: "pop-over.html"
})
export class PopOver {
  callback: Function;
  state: string;
  modes: Array<any>;

  constructor(private navParams: NavParams) {
    this.modes = this.navParams.get("modes");
    this.callback = this.navParams.get("callback");
  }

  set(opt) {
    this.state = opt.name;
    this.callback(opt);
  }

}
