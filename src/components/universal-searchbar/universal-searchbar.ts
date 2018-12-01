import { Component, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar';

@Component({
  selector: 'universal-searchbar',
  templateUrl: 'universal-searchbar.html'
})
export class UniversalSearchbarComponent {

  @Output('toOutput') toOutput: EventEmitter<Array<string>> = new EventEmitter();
  @Input('toFilter') toFilter: Array<string> = [];
  @Input('showSearchButton') showSearchButton: boolean = false;
  @Input('searchMode') searchMode: boolean = false;
  input: string;
  @ViewChild('searchbar') searchBar: any

  constructor() {}

  onInput() {
    let result = [];
    for (const item of this.toFilter) {
      if (item.indexOf(this.input) > 0) {
        result = result.concat([item])
      }
    }
    console.log(result, this.toFilter, this.input)
    this.toOutput.emit(result)
  }

  clickedSearch(){
    this.searchMode = !this.searchMode
    this.searchBar.nativeElement.focus()
  }

}
