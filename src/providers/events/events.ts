import { Injectable } from '@angular/core';
import {Events} from 'ionic-angular';

const EventNames = {
  configLoaded: 'config-loaded',
  headingLoaded: 'heading-loaded',
  templatesLoaded: 'templates-loaded',
  templatesClosed: 'templates-closed',
  fileSaved: 'file-saved',
  fileToSave: 'file-to-save',
  fileToSaveAs: 'file-to-save-as',
  fileToSaveCanceled: 'file-to-save-canceled',
  folderSelected: 'folder-selected',
  bookmarkSelected: 'bookmark-selected',
  menuToggled: 'menu-toggled',
  fileOpened: 'file-opened',
  fileNew: 'file-new',
  fileSelected: 'file-selected',
  textChanged: 'text-changed',
  viewChanged: 'view-changed',
  settingsChanged: 'settings-changed',
  minimizeApp: 'minimize-app',
  tagsCollected: 'tags-collected'
};

@Injectable()
export class EventsProvider {
  private locked: Array<string> = []

  constructor(private events: Events) {
  }

  once(eventName, callback){
    this.events.unsubscribe(eventName, callback)
    this.events.subscribe(eventName, callback)
  }

  publish(eventName, payload?){
    if (this.locked.indexOf(eventName) === -1)
      this.events.publish(eventName, payload)
  }

  lock(eventName, callback?){
    this.locked.push(eventName)
  }
  unlock(eventName, callback?){
    this.locked.splice(this.locked.indexOf(eventName), 1)
  }

}

export { EventNames };
