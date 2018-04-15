import { SettingsProvider } from "./../../providers/settings/settings";
import { TemplatesComponent } from "./../../components/templates/templates";
import { MarkjaxProvider } from "./../../providers/markjax/markjax";
import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  Events,
  IonicPage,
  NavController,
  NavParams,
  PopoverController,
  ToastController
} from "ionic-angular";
import { PopUp } from "./home-view-popup";
import { ExternFilesProvider } from "../../providers/extern-files/extern-files";
import { Slides } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";


@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  @ViewChild("input") input: any;
  @ViewChild(PopUp) popup: PopUp;
  @ViewChild("output") output: any;
  @ViewChild("slider") slider: Slides;
  @ViewChild('searchBar') searchbar: any;
  
  smallScreen: boolean;
  wideScreen: boolean;

  textAreaContent: string = `<div data-text="Content"></div>`;

  wordCounter: boolean;
  textFocused: boolean;

  textFont: string;
  headerColor: string;
  headerFont: string;
  textColor: string;
  textSize: string;

  wordCount: number;
  percentViewing: number;

  previewMode: string;
  changed: boolean;
  parsedContent: string;
  isTemplate: boolean;

  matches: number;
  matchIndex: number = -1;
  searchMode: boolean = false;

  findInPage: any;

  hasChanged: boolean = false;

  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    private files: ExternFilesProvider,
    private events: Events,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private parser: MarkjaxProvider,
    private settings: SettingsProvider,
    private popoverCtrl: PopoverController,
    private keyboard: Keyboard
  ) {
    
    this.events.unsubscribe("file-opened", r => this.onFileOpened(r));
    this.events.unsubscribe("to-save-file", () => this._saveFile());
    this.events.unsubscribe("to-save-file-as", () => this.showPrompt());
    this.events.unsubscribe("config-loaded", () => this.ionViewDidEnter());
    this.events.unsubscribe("new-file", () => this.onNewFile());

    this.events.subscribe("file-opened", r => this.onFileOpened(r));
    this.events.subscribe("to-save-file", () => this._saveFile());
    this.events.subscribe("to-save-file-as", () => this.showPrompt());
    this.events.subscribe("config-loaded", () => this.ionViewDidEnter());
    this.events.subscribe("new-file", () => this.onNewFile());
    // this.findInPage = new FindInPage();
    // console.log(this.findInPage)
  }

  ionViewDidEnter() {
    this.headerColor = this.settings.getHeaderColor();
    this.headerFont = this.settings.getHeaderFont();
    this.textSize = this.settings.getTextSize();
    this.textFont = this.settings.getTextFont();
    this.textColor = this.settings.getTextColor();
    this.textFocused = this.settings.getTextFocus();

    //experiment which input is best
    if (this.slider) {
      this.slider.ionSlideDidChange.subscribe(() => {
        if (this.slider.getActiveIndex() === 0) this.keyboard.show();
        else this.keyboard.close();
      });

      this.keyboard.onKeyboardHide().subscribe(() => {
        this.slider.slideTo(1);
      });
    }

    this.onResize();
    this.colorViewScreen();
    this.render();
  }

  /**
   * ===================================
   * Page Functions
   * ===================================
   */

  wrapInDivs(r) {
    let string: string;
    string = "<div>" + r.replace(/\n/g, "<br></div><div>");
    return string;
  }

  _wrapInDivs(r) {
    let string: string;
    string = r.replace(/\n/g, "<br></div><div>");
    return string;
  }

  getWordCount(text: string) {
    this.wordCount = text.length !== 0 ? text.match(/([a-zA-Z])+/g).length : 0;
  }

  adjustHeight(elInput, elOutput) {
    let currentHeight =
      elInput.scrollHeight > elOutput.scrollHeight
        ? elInput.scrollHeight
        : elOutput.scrollHeight;
    currentHeight =
      currentHeight > document.body.clientHeight
        ? currentHeight
        : document.body.clientHeight;

    elInput.style = "height: " + currentHeight + "px";

    // a bit overboard but works for now
    let temp: any = Array.from(document.querySelectorAll("ion-slides"));
    for (let el of temp) el.style = "height: " + currentHeight + "px";
  }

  colorViewScreen() {
    document.getElementById("second-screen").style.color = this.textColor;
    for (let i = 0; i < 3; i++) {
      const headers: any = document
        .getElementById("second-screen")
        .querySelectorAll("h" + i);
      const lines: any = document
        .getElementById("second-screen")
        .querySelectorAll("hr");
      if (headers.length > 0) {
        for (let el = 0; el < headers.length; el++) {
          headers[el].style.color = this.headerColor;
          headers[el].style.fontFamily = this.headerFont;
        }
      }
      for (let el = 0; el < lines.length; el++)
        lines[el].style.color = this.headerColor;
    }
  }

  render() {
    const elInput = this.input.nativeElement;
    const elOutput = this.output.nativeElement;

    this.textAreaContent = elInput.innerHTML;
    this.parser.parse(elInput.innerText, elOutput);
    this.adjustHeight(elInput, elOutput);
    this.colorViewScreen();
    this.getWordCount(elOutput.innerText);
  }

  focusCurrentLine() {
    let focusNode = window.getSelection().focusNode;
    let parent = focusNode ? focusNode.parentElement : null;
    let prevs = Array.from(document.querySelectorAll(".focused"));
    for (let prev of prevs) prev.classList.remove("focused");
    if (parent) parent.classList.add("focused");
  }

  appendIn(mode) {
    let text = window.getSelection().toString();
    let wrap;
    switch (mode) {
      case 1:
        wrap = `>`;
        break;
      case 2:
        wrap = `-`;
        break;
      case 3:
        wrap = `#`;
        break;
      default:
        break;
    }
    text = `${wrap} ${text}`;
    document.execCommand("insertText", false, text);
  }

  wrapIn(mode) {
    let text = window.getSelection().toString();
    let wrap;
    switch (mode) {
      case 1:
        wrap = `*`;
        break;
      case 2:
        wrap = `**`;
        break;
      case 3:
        wrap = `~~`;
        break;
      case 4:
        wrap = "`";
        break;
      case 5:
        wrap = "```";
        break;
      default:
        break;
    }
    text = `${wrap}${text}${wrap}`;
    document.execCommand("insertText", false, text);
  }

  wrapInCode() {
    let text = window.getSelection().toString();
    let wrap = "```";
    text = `\n${wrap}\n${text}\n${wrap}`;
    document.execCommand("insertText", false, text);
  }

  toggleSearch() {
    this.searchMode = !this.searchMode;
    if (this.searchMode) {
      this.searchbar.setFocus();
      const length = this.searchbar.value.length;
      //@ts-ignore
      document.getElementById('search-bar').children[0].setSelectionRange(length, length);
      this.searchText();
    } else {
      this.searchClear();
    }
  }
  // document or specific el
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
    this.matchIndex = -1;
    this.matches = -1;
    const pattern = new RegExp(`>(.*?)<`, "gi");
    this.input.nativeElement.innerHTML = this.input.nativeElement.innerHTML.replace(
      pattern,
      (match, ptr) => {
        ptr = new RegExp(`${this.searchbar.value}`, "gi");
        return match.replace(ptr, _match => {
          this.matches++;
          return `<span style="background: yellow" class="match ${
            this.matches
          }">${_match}</span>`;
        });
      }
    );
    // console.log(a, e, pattern)
  }
  onSearchInput(e) {
    console.log(e);
    if (e.key == "F3") this.goTo({ forward: true });
    else this.searchText();
  }
  goTo({ forward }) {
    if (forward && this.matches > this.matchIndex) this.matchIndex++;
    else if (!forward && this.matchIndex > 0) this.matchIndex--;
    else this.matchIndex = 0;

    const matches = document.getElementsByClassName("match");
    const range = document.createRange();
    const selector = document.getSelection();
    const el: any = matches[this.matchIndex];
    range.selectNode(el);
    selector.removeAllRanges();
    selector.addRange(range);
    el.scrollIntoView(false);
    el.focus();
  }

  /**
   * ===================================
   * Page Actions
   * ===================================
   */

  scrollTo(element: string) {
    let yOffset = document.getElementById(element).offsetTop;
    // this.content.scrollTo(0, yOffset, 4000)
  }

  showPopover(e) {
    console.log(e);
    let popover = this.popoverCtrl.create(
      PopUp,
      {
        callback: this.switchViews.bind(this)
        // posX: e.pointers[0].pageX,
        // posY: e.pointers[0].pageY
      },
      { cssClass: this.settings.getActiveTheme() }
    );

    popover.present({ direction: "down", ev: e });
  }

  showToast(message) {
    const toast = this.toastCtrl.create({
      message: message,
      position: "top",
      duration: 3000
    });

    toast.present();
  }

  exitApp() {
    const _window: any = window;
    const electron = _window.require("electron");
    electron.remote.app.exit();
  }

  undo() {
    document.execCommand("undo");
  }

  redo() {
    document.execCommand("redo");
  }

  showPrompt() {
    const theme = this.settings.getActiveTheme()
    console.log(theme)
    let prompt = this.alertCtrl.create({
      cssClass: theme,      
      title: `File will be saved at:`,
      subTitle: `${this.files.base}`,
      inputs: [
        {
          name: "fileName",
          placeholder: "Enter new file name:"
        }
      ],
      buttons: [
        {
          text: "Cancel",
          handler: data => {
            this.events.publish("to-save-file-canceled");
          }
        },
        // {
        //   text: "Select path",
        //   handler: data => {
        //     this.events.publish("to-save-file-canceled");
        //   }
        // },
        {
          text: "Save",
          handler: data => {
            console.log("Saved clicked");
          }
        }
      ],
    });
    prompt.present();
    prompt.onDidDismiss(r => {
      if (r.fileName) {
        this.saveFile(r.fileName);
        this.files.openedFile = r.fileName;
      }
    });
  }

  switchViews(value?) {
    switch (value) {
      case 1:
        this.previewMode = "narrowEditView";
        break;
      case 2:
        this.previewMode = "wideEditView";
        break;
      case 3:
        this.previewMode = "narrowPreview";
        break;
      case 4:
        this.previewMode = "widePreview";
        break;
      default:
        this.previewMode = "";
        break;
    }
  }

  _saveFile() {
    const fileName = this.files.openedFile;
    if (fileName && fileName !== "") this.saveFile(fileName);
    else this.showPrompt();
  }

  saveFile(r) {
    //requires dialogue
    if (this.hasChanged) {
      this.hasChanged = false;
      this.files.saveFile(r + ".md", this.input.nativeElement.innerText);
      this.showToast("File Saved");
    }
  }

  /**
   * =============================================
   * Page Events
   * =============================================
   */
  onNewFile() {
    this.input.nativeElement.innerHTML = `<div data-text="Content"></div>`;
    this.files.clearPath();
    this.files.openedFile = "";
    this.render();
  }

  onKeyUp(e: KeyboardEvent) {
    console.log(e);
    const range = document.getSelection();
    const el: any = range.focusNode.parentNode;
    if (el.classList && el.classList[0] === "match" && e.code.includes("Key")) {
      const parent = el.parentNode;
      parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    } // best separate this block into a function
    // rerun to return hightlight?
    if (e.key == "F3") {
      if (e.shiftKey) this.goTo({ forward: false });
      else this.goTo({ forward: true });
    }
    if (e.ctrlKey) {
      if (e.key === "S") this.showPrompt();
      else if (e.key === "s") this._saveFile();

      if (e.key === "f") this.toggleSearch();
      if (e.key === "i") this.wrapIn(1);
      if (e.key === "j") this.wrapIn(2);
      if (e.key === "q") this.appendIn(1);
      if (e.key === "l") this.appendIn(2);
      if (e.key === "h") this.appendIn(3);
    }
    if (e.ctrlKey && e.altKey && e.key === "u") this.wrapIn(3);
    if (e.ctrlKey && e.key === "k") this.wrapIn(4);
    if (e.ctrlKey && e.key === "K") this.wrapInCode();
  }

  onTextInput() {

    const input: HTMLElement = this.input.nativeElement;
    const regex = new RegExp(`/(${this.searchText})+/g`);
    const array = input.innerHTML.match(regex);
  }

  onResize(e?) {
    const elInput = this.input.nativeElement;

    let t;
    if (e) t = e.target;
    else t = window;

    this.input.nativeElement.innerHTML = this.textAreaContent; //on smallScreen flag update and rerender would be best
    if (t.innerWidth < 600) {
      this.smallScreen = true;
    } else this.smallScreen = false;
    this.render();
  }

  onEditInput() {
    if(this.searchMode) this.toggleSearch();
    this.searchClear();
    this.hasChanged = true;
    this.render()
  }

  onFileOpened(r) {

    if (this.slider) this.slider.slideTo(1);

    this.isTemplate = r.isTemplate;
    this.input.nativeElement.innerHTML = this.wrapInDivs(r.content);
    this.render();
  }

  selectTemplate() {
    this.files.base = this.files._base + "/Meaning";
    this.files.openedFile = "";
    this.isTemplate = false;
    this.showToast("Template Selected.");
  }
  onSelectionChange(e) {
    this.focusCurrentLine();
  }
}
