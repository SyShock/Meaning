import { SettingsProvider } from "./../../providers/settings/settings";
import { MarkjaxProvider, AppendModes, WrapModes } from "./../../providers/markjax/markjax";
import { Component, ViewChild, ChangeDetectorRef } from "@angular/core";
import {
  AlertController,
  IonicPage,
  NavController,
  PopoverController,
  ToastController,
  MenuController,
  Popover
} from "ionic-angular";
import { PopUp, ViewModes } from "./home-view-popup";
import { ExternFilesProvider } from "../../providers/extern-files/extern-files";
import { TagParserProvider } from "../../providers/tag-parser/tag-parser";
import { EventsProvider, EventNames } from "../../providers/events/events";
import { Slides, Platform } from 'ionic-angular';
import { Keyboard } from "@ionic-native/keyboard";
import { SearchbarComponent } from "../../components/searchbar/searchbar";


@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  @ViewChild("input") input: any;
  @ViewChild(PopUp) popup: PopUp;
  @ViewChild(SearchbarComponent) searchBar: SearchbarComponent;
  @ViewChild("output") output: any;
  @ViewChild("slider") slider: Slides;

  smallScreen: boolean;
  wideScreen: boolean;
  textAreaContent: string = ``;
  wordCounter: boolean;
  textFocused: boolean;
  textFont: string;
  headerColor: string;
  headerFont: string;
  textColor: string;
  textSize: string;
  textSelected: boolean = false;
  wordCount: number;
  percentViewing: number;
  previewMode: string;
  mobilePreviewMode: boolean = false;
  changed: boolean;
  parsedContent: string;
  isTemplate: boolean;
  matches: number = -1;
  matchIndex: number = -1;
  searchMode: boolean = false;
  findInPage: any;
  viewChanged: boolean = false;
  hasChanged: boolean = false;

  constructor(
    public navCtrl: NavController,
    private files: ExternFilesProvider,
    private tags: TagParserProvider,
    private events: EventsProvider,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private parser: MarkjaxProvider,
    private settings: SettingsProvider,
    private popoverCtrl: PopoverController,
    private keyboard: Keyboard,
    private menuCtrl: MenuController,
    private changeDetector: ChangeDetectorRef
  ) {
    this.events.once(EventNames.fileOpened, ret => this.onFileOpened(ret));
    this.events.once(EventNames.fileToSave, ret => this._saveFile(ret));
    this.events.once(EventNames.fileToSaveAs, () => this.presentPrompt());
    this.events.once(EventNames.configLoaded, () => this.ionViewDidEnter());
    this.events.once(EventNames.fileNew, () => this.onNewFile());
    this.events.once(EventNames.textChanged, () => this.render());
    this.events.once(EventNames.settingsChanged, () => this.getSettingsConfig());

    // this.findInPage = new FindInPage();
  }

  ionViewDidEnter() {
    this.getSettingsConfig();
    this.searchBar.config({ input: this.input.nativeElement });
    if (this.slider) {
      this.slider.ionSlideDidChange.subscribe(() => {
        if (this.slider.getActiveIndex() === 0) {
          this.keyboard.show();
          this.mobilePreviewMode = false;
        } else {
          this.keyboard.close();
          this.mobilePreviewMode = true;
          this.textSelected = false;
        }
      });
      this.keyboard.onKeyboardHide().subscribe(() => {
        // this.slider.slideTo(1);
      });
    }

    window.addEventListener('native.keyboardhide', (e) => {
      e.preventDefault();
    })
      
    this.colorViewScreen();
    this.onResize();
    // this.render();
  }

  ngAfterContentChecked() {
    if (this.viewChanged && this.input && this.searchBar) {
      this.searchBar.config({ input: this.input.nativeElement });
      this.viewChanged = false;
    }
  }

  getSettingsConfig(){
    this.headerColor = this.settings.getHeaderColor();
    this.headerFont = this.settings.getHeaderFont();
    this.textSize = this.settings.getTextSize();
    this.textFont = this.settings.getTextFont();
    this.textColor = this.settings.getTextColor();
    this.textFocused = this.settings.getTextFocus();
  }

  onBlur() {
    if (!this.mobilePreviewMode && !this.searchMode &&
      (!this.menuCtrl.isAnimating() || !this.menuCtrl.isOpen()) ) {
      this.input.nativeElement.focus();
    }   
  }

  /**
   * ===================================
   * Page Functions
   * ===================================
   */

  wrapInParagraph(r: string) {
    let string: string;
    string = "<p>" + r.replace(/\n/g, "</p><p>");
    return string;
  }

  getWordCount(text: string) {
    this.wordCount = text.length !== 0 ? text.match(/([a-zA-Z])+/g).length : 0;
  }

  adjustHeight(elInput: HTMLElement, elOutput: HTMLElement) {
    let currentHeight =
      elInput.scrollHeight > elOutput.scrollHeight
        ? elInput.scrollHeight
        : elOutput.scrollHeight;
    currentHeight =
      currentHeight > document.body.clientHeight
        ? currentHeight
        : document.body.clientHeight;
    //@ts-ignore
    elInput.style = "height: " + currentHeight + "px";

    // a bit overboard but works for now
    let temp: Array<HTMLElement> = Array.from(document.querySelectorAll("ion-slides"));
    //@ts-ignore
    for (let el of temp) el.style = "height: " + currentHeight + "px";
  }

  colorViewScreen() {
    document.getElementById("second-screen").style.color = this.textColor;
    for (let i = 0; i < 7; i++) {
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
    // console.log(e);
    let popover = this.popoverCtrl.create(
      PopUp,
      {
        // posX: e.pointers[0].pageX,
        // posY: e.pointers[0].pageY
      },
      { cssClass: this.settings.getActiveTheme() }
    );
    this.events.once(EventNames.viewChanged, (mode) => this.switchViews(mode, popover));


    popover.present({ direction: "down", ev: e });
  }

  showToast(message: string) {
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
    window.close()
  }

  undo(e) {
    e.preventDefault();
    document.execCommand("undo");
  }

  redo(e) {
    e.preventDefault();
    document.execCommand("redo");
  }

  presentPrompt() {
    const theme = this.settings.getActiveTheme()
    this.events.lock(EventNames.fileToSaveAs)
    this.events.lock(EventNames.fileToSave)
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
            this.events.publish(EventNames.fileToSaveCanceled);
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
            if (data.fileName) {
              this.events.publish(EventNames.fileToSaveCanceled)
              this.saveFile(data.fileName);
              this.files.openedFile = data.fileName;
            }
          } 
        }
      ],
    });
    prompt.present();
    prompt.onDidDismiss(ret => {
      // if (ret.fileName) {
      // }
    });
  }

  switchViews(value, popover: Popover) {
    switch (value) {
      case ViewModes.NARROW_EDIT:
        this.previewMode = "narrowEditView";
        break;
      case ViewModes.WIDE_EDIT:
        this.previewMode = "wideEditView";
        break;
      case ViewModes.NARROW_PREVIEW:
        this.previewMode = "narrowPreview";
        break;
      case ViewModes.WIDE_PREVIEW:
        this.previewMode = "widePreview";
        break;
      default:
        this.previewMode = "";
        break;
    }
    popover.dismiss();
  }

  _saveFile(ret = null) { //Note: the way it is like now, it will save on exit always!
    const fileName = this.files.openedFile || ret;
    if (fileName && fileName !== "") this.saveFile(fileName);
    else this.events.publish(EventNames.fileToSaveAs);
  }

  saveFile(r) {
    //requires dialogue
    if (this.hasChanged) {
      this.hasChanged = false;
      this.files.saveFile(r + ".md", this.input.nativeElement.innerText);
      if (this.files.customPath)
        this.tags.parseContent(this.input.nativeElement.innerText, `${this.files.openedFile}.md`);
      else 
        this.tags.parseContent(this.input.nativeElement.innerText, `${this.files.base}/${this.files.openedFile}.md`); //not sure about this
      this.showToast("File Saved");
    }
  }

  /**
   * =============================================
   * Page Events
   * =============================================
   */
  onNewFile() {
    this.textAreaContent = '';
    this.input.nativeElement.innerHTML = "";
    this.files.openedFile = "";
    this.files.clearPath();
    this.render();
  }

  onKeyUp(e: KeyboardEvent) {
    // console.log(e);
    const range = document.getSelection();
    if (!range.focusNode && !range.focusNode.parentNode) return;
    const el: any = range.focusNode.parentNode;
    if (el.classList && el.classList[0] === "match" && e.code.includes("Key")) {
      const parent = el.parentNode;
      parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    } // best separate this block into a function
    // rerun to return highlight?
    if (e.key == "F3") {
      if (e.shiftKey) this.searchBar.goTo(null, { forward: false });
      else this.searchBar.goTo(null, { forward: true });
    }
    if (e.ctrlKey) {
      if (e.key === "S") this.presentPrompt();
      else if (e.key === "s") this._saveFile();

      if (e.key === "f") this.searchBar.toggleSearch(null);
      if (e.key === "i") this.parser.wrap(WrapModes.ITALIC);
      if (e.key === "j") this.parser.wrap(WrapModes.BOLD);
      if (e.key === "q") this.parser.append(AppendModes.QUOTE);
      if (e.key === "l") this.parser.append(AppendModes.BULLET);
      if (e.key === "h") this.parser.append(AppendModes.HEADER);
    }
    if (e.ctrlKey && e.altKey && e.key === "u") this.parser.wrap(WrapModes.UNDERLINE);
    if (e.ctrlKey && e.key === "k") this.parser.wrap(WrapModes.CODE);
    if (e.ctrlKey && e.key === "K") this.parser.wrap(WrapModes.CODE_BLOCK);
    if (e.key === "Escape" && this.searchMode) {
      this.searchBar.toggleSearch(null);
    } 
  }


  onResize(e?) {
    const elInput = this.input.nativeElement;

    let t;
    if (e) t = e.target;
    else t = window;

    elInput.innerHTML = this.textAreaContent; //on smallScreen flag update and rerender would be best
    if (t.innerWidth < 600 && !this.smallScreen) {
      this.smallScreen = true;
      this.render();
      this.viewChanged = true;
    } else if (t.innerWidth > 600 && this.smallScreen){
      this.smallScreen = false;
      this.render();
      this.viewChanged = true;
    }

  }

  onEditInput() {
    if (this.searchMode) this.searchBar.toggleSearch(null);
    this.searchBar.searchClear();
    this.hasChanged = true;
    this.render()
  }

  onFileOpened(r) {
    if (this.slider) this.slider.slideTo(1);
    this.isTemplate = r.isTemplate;
    this.input.nativeElement.innerHTML = this.wrapInParagraph(r.content);
    this.render();
  }

  selectTemplate() {
    this.files.base = this.files._base + "/Meaning";
    this.files.openedFile = "";
    this.isTemplate = false;
    this.showToast("Template Selected.");
  }
  onSelectionChange(e) {
    if (window.getSelection().toString().length <= 0)
      this.textSelected = false
    this.changeDetector.detectChanges();
    this.focusCurrentLine();
  }
  
  onContextMenu(e) {
    this.textSelected = true
    return true;
  }
}
