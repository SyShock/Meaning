import { FolderBrowserPage } from "./../folder-browser/folder-browser";
import { SettingsProvider } from "./../../providers/settings/settings";
import { PopOver } from "./../../components/pop-over/pop-over";

import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  PopoverController
} from "ionic-angular";
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: "page-settings",
  templateUrl: "settings.html"
})
export class SettingsPage {
  paths: Array<any>;
  headerFontOptions: Array<{ name: string; value: string }>;
  textFontOptions: Array<{ name: string; value: string }>;
  fontSizeList: Array<{ name: string; value: string }>;
  themes: Array<{ name: string; value: string }>;
  colors: Array<{ value: string }>;

  headerFont: string;
  textFont: string;
  textSize: string;
  theme: string;
  headerColor: string;
  textColor: string;
  textFocus: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private popoverCtrl: PopoverController,
    private settings: SettingsProvider,
    private storage: Storage
  ) {
    this.paths = this.settings.getPaths();
    this.textFont = this.settings.getTextFont();
    this.textColor = this.settings.getTextColor();
    this.headerColor = this.settings.getHeaderColor();

    this.textSize = this.settings.getTextSize();
    this.textFocus = this.settings.getTextFocus();
    this.headerFont = this.settings.getHeaderFont();

    this.theme = this.settings.getActiveTheme();

    this.headerFontOptions = [
      { name: "Roboto", value: "roboto" },
      { name: "Monospace", value: "monospace" },
      { name: "Cloister Black", value: "CloisterBlack" }
    ];

    this.textFontOptions = [
      { name: "Roboto", value: "roboto" },
      { name: "Monospace", value: "monospace" },
      { name: "Cloister Black", value: "CloisterBlack" }
    ];

    this.themes = [
      { name: "Light", value: "light-theme" },
      { name: "Night", value: "dark-theme" },
      { name: "Hackerman", value: "hackerman-theme" }
    ];

    this.fontSizeList = [
      { name: "Smaller", value: "smaller" },
      { name: "Small", value: "small" },
      { name: "Medium", value: "medium" },
      { name: "Large", value: "large" },
      { name: "Larger", value: "larger" }
    ];

    this.colors = [
      { value: "#1abc9c" },
      { value: "#16a085" },
      { value: "#2ecc71" },
      { value: "#27ae60" },
      { value: "#3498db" },
      { value: "#2980b9" },
      { value: "#f1c40f" },
      { value: "#f39c12" },
      { value: "#e67e22" },
      { value: "#d35400" },
      { value: "#e74c3c" },
      { value: "#c0392b" },
      { value: "#ecf0f1" },
      { value: "#bdc3c7" },
      { value: "#34495e" },
      { value: "#2c3e50" }
    ];
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SettingsPage");
  }

  onFocus(el) {
    //   var picker = new ColorPicker({
    //     space: 'rgb',
    //   });
    //   console.log(picker);
    // el.nativeElement.appendChild(picker.element);
  }

  onThemeChange = ({value}) => {
    this.theme = value;
    this.settings.setTheme(value);
  }

  addProjectPath() {
    this.navCtrl.push(FolderBrowserPage);
  }

  removeProjectPath(name) {
    this.settings.removePath(name);
    this.paths = this.settings.getPaths();
  }

  doPromptSync() {}

  goBack() {
    this.navCtrl.pop();
  }

  onHeaderFontChange = ({ value }) => {
    this.headerFont = value;
    this.settings.setHeaderFont(value);
  };

  onTextFontChange = ({ value }) => {
    this.textFont = value;
    this.settings.setTextFont(value);
  }

  onTextSizeChange = ({ value }) => {
    this.textSize = value;
    this.settings.setTextSize(value);
  }

  onFontSizeChange = ({ value }) => {
    this.textSize = value;
    this.settings.setTextSize(value);
  }

  onHeaderColorChange(value) {
    this.headerColor = value;
    this.settings.setHeaderColor(value);
  }

  onTextColorChange(value) {
    this.textColor = value;
    this.settings.setTextColor(value);
  }

  onTextFocusChange(value) {
    console.log("giving ", value);

    this.settings.setTextFocus(value);
  }

  showPopOver(e, data, callback) {
    let popover = this.popoverCtrl.create(
      PopOver,
      {
        modes: data,
        callback
      },
      {
        cssClass: this.settings.getActiveTheme()
      }
    );

    const ev = {
      target: {
        getBoundingClientRect: () => {
          return {
            left: e.target.offsetWidth,
            top: e.target.getBoundingClientRect().top
          };
        }
      }
    };

    popover.present({ direction: "right", ev: ev });
  }

  ionViewWillUnload() {
    const config = JSON.stringify(this.settings.config);
    this.storage.set("config", config);
  }
}
