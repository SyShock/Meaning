import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
// import { Searchbar } from 'ionic-angular/umd';

@Component({
  selector: "searchbar",
  templateUrl: "searchbar.html"
})
export class SearchbarComponent {
  @ViewChild("searchBar")
  searchbar: any;
  /*@Input('searchMode')*/ _searchMode: boolean;

  @Output() searchModeChange = new EventEmitter<boolean>();

  @Input()
  get searchMode() {
    return this._searchMode;
  }
  set searchMode(val) {
    this._searchMode = val;
    this.searchModeChange.emit(this._searchMode);
  }

  matches: number = -1;
  currentMatchIndex: number = -1;
  input: HTMLElement;
  output: HTMLElement;

  constructor() {
    console.log("Hello SearchbarComponent Component");
  }

  config({ input, output }: { input: HTMLElement; output?: HTMLElement }) {
    this.input = input;
    this.output = output;
  }

  toggleSearch(e?) {
    if (e) e.preventDefault();
    this.searchMode = !this.searchMode;
    if (this.searchMode) {
      this.searchbar.setFocus();
      const length = this.searchbar.value.length || 0;
      //@ts-ignore
      document.getElementById("search-bar").children[0].setSelectionRange(length, length);
      this.searchText();
    } else {
      this.searchClear();
    }
  }

  searchClear() {
    let spans: any = document.getElementsByClassName("match");
    spans = Array.from(spans);
    for (let span of spans) {
      const parent = span.parentNode;
      parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    }
  }

  searchText() {
    this.searchClear();
    if (this.searchbar.value.length === 0) return;
    this.currentMatchIndex = -1;
    this.matches = -1;
    const pattern = new RegExp(`>(.*?)<`, "gi");
    this.input.innerHTML = this.input.innerHTML.replace(
      pattern,
      (match, ptr) => {
        ptr = new RegExp(`${this.searchbar.value}`, "gi");
        return match.replace(ptr, _match => {
          this.matches++;
          return `<span class="match" ${this.matches}">${_match}</span>`;
        });
      }
    );
  }

  onSearchInput(e, input: HTMLElement) {
    if (e.key == "F3") this.goTo(null, { forward: true });
    else {
      this.searchText();
    }
  }

  goTo(e, { forward }) {
    if (e) e.preventDefault();
    if (forward && this.matches > this.currentMatchIndex)
      this.currentMatchIndex++;
    else if (!forward && this.currentMatchIndex > 0) this.currentMatchIndex--;
    else this.currentMatchIndex = 0;

    const matches = document.querySelectorAll(".match");
    const range = document.createRange();
    const selector = document.getSelection();
    const el: Element = matches[this.currentMatchIndex];
    range.selectNode(el);
    selector.removeAllRanges();
    selector.addRange(range);
    el.scrollIntoView(false);
    //@ts-ignore
    el.focus();
  }
}
