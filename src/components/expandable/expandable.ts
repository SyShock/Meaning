import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'expandable',
  templateUrl: 'expandable.html'
})
export class ExpandableComponent {

  @Input('expanded') expanded: boolean;
  @Input('title') title: string;
  @Output('state') state: string; //intended for animations
  

  constructor() {
    console.log('Hello ExpandableComponent Component');
  }

}
