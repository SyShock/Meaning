import { Component } from '@angular/core';

/**
 * Generated class for the NarrowViewComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'narrow-view',
  templateUrl: 'narrow-view.html'
})
export class NarrowViewComponent {

  text: string;

  constructor() {
    console.log('Hello NarrowViewComponent Component');
    this.text = 'Hello World';
  }

}
