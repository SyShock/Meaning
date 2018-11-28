import { Component } from '@angular/core';

/**
 * Generated class for the AboutComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'about',
  templateUrl: 'about.html'
})
export class AboutComponent {

  text: string;

  constructor() {
    this.text = 'Hello World';
  }

}
