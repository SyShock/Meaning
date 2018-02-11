import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'expandable',
  templateUrl: 'expandable.html'
})
export class ExpandableComponent {

  @Input('expanded') expanded: boolean;
  @Input('title') title: string;
  @Output('state') onExpand: EventEmitter<any> = new EventEmitter();//intended for animations

  constructor() {
    console.log('Hello ExpandableComponent Component');
  }

  toggleMenu(){
    this.expanded = !this.expanded
    this.onExpand.emit(this.expanded);
  }

}
