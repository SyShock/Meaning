import { EventsProvider, EventNames } from './../../providers/events/events';
import { Component, Input } from '@angular/core';
import { Text } from '@angular/compiler';
import { MarkjaxProvider, AppendModes, WrapModes } from '../../providers/markjax/markjax';

// on animation end
// on component load animation
// on component unload animation

@Component({
  selector: 'toolbar',
  templateUrl: 'toolbar.html'
})
export class ToolbarComponent {

  @Input('inSelection') inSelection: boolean;

  constructor(
    private events: EventsProvider,
    private parser: MarkjaxProvider
  ) {
    console.log('Hello ToolbarComponent Component');
  }

  private _getFocused(){
    return window.getSelection().focusNode;
  }

  addToStartOfLine(append: string){
    let focusNode = this._getFocused()
    focusNode.textContent = append + focusNode.textContent;
    this.events.publish(EventNames.textChanged)
  }

  replaceTextWith(searchText, replaceText){
    const focusNode = this._getFocused()
    focusNode.textContent = focusNode.textContent.replace(searchText, replaceText)
  }
  
  increaseHeader() {
    // this.parser.append(AppendModes.HEADER)
    
    const focusNode = this._getFocused();
    const matched = focusNode.textContent.match(/^#+/)
    if (matched !== null) {
      const text = matched[0]+'#'
      this.replaceTextWith(matched[0], text)
    } else this.addToStartOfLine('# ')
    
  }

  decreaseHeader() {
    
    const focusNode = this._getFocused();
    const matched = focusNode.textContent.match(/^#+/)
    if (matched !== null) {
      const text = matched[0].substring(0, matched[0].length - 1)
      this.replaceTextWith(matched[0], text)
    }
    
  }

  bold(){
    this.parser.wrap(WrapModes.BOLD)
  }
  italic(){
    this.parser.wrap(WrapModes.ITALIC);
  } 
  code(){
    this.parser.wrap(WrapModes.CODE);
  }
  strikeout(){
    this.parser.wrap(WrapModes.STRIKEOUT);
  }
  bullet(){
    this.parser.append(AppendModes.BULLET);
  }
  bulletNumber(){
    this.parser.append(AppendModes.BULLET_NUM);
  }
  quote(){
    this.parser.append(AppendModes.QUOTE);
  }
  line(){
    this.parser.append(AppendModes.LINE);
  }
}
