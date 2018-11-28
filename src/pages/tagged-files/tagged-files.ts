import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';
import { ExternFilesProvider } from '../../providers/extern-files/extern-files';
import { EventsProvider, EventNames } from '../../providers/events/events';

@IonicPage()
@Component({
  selector: 'page-tagged-files',
  templateUrl: 'tagged-files.html',
})
export class TaggedFilesPage {

  files: Array<string>
  fileOpened: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private extFiles: ExternFilesProvider,
    private events: EventsProvider) {
  }

  ionViewDidLoad() {
    this.files = this.navParams.get('filePaths')
  }

  async openFile(fileName) {
    let ret = { content: null, isTemplate: false }
    this.fileOpened = true;
    ret.content = await this.extFiles.openFile(fileName, true, true)
    this.events.publish(EventNames.fileOpened, ret)
    this.navCtrl.pop()
  }

  ionViewWillLeave() {
    if (!this.fileOpened) this.events.publish(EventNames.menuToggled)
  }

}
