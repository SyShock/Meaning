import { Component } from '@angular/core';

/**
 * Generated class for the WideViewComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'wide-view',
  templateUrl: 'wide-view.html'
})
export class WideViewComponent {

  text: string;

  constructor() {
    console.log('Hello WideViewComponent Component');
    this.text = 'Hello World';
  }

}
