import { Injectable } from '@angular/core';
import { ExternFilesProvider } from '../extern-files/extern-files';
import { Storage } from '@ionic/storage';
import { EventsProvider, EventNames } from '../events/events';

const suffixes = ['.md', '.txt'];
const storageKey = 'TagMap'

export interface ITagMap { [key: string]: Set<string>}

@Injectable()
export class TagParserProvider {

  TagMap: ITagMap = {}
  
  constructor(
    private files: ExternFilesProvider,
    private storage: Storage,
    private events: EventsProvider) {
    // this.events.once(EventNames.configLoaded, () => this.initTagMap())
    this.events.once(EventNames.fileToSave, () => this.saveTagMap())
  }

  parseContent(content: string, path: string) {
    const regex = /#(\w+)/g
    let matches

    // provided you don't have a million tags this should be ok
    // else save both [tag]:Set<path> and [path]:Set<tag>
    let currentFileInTags = []
    Object.keys(this.TagMap).forEach(key => {
      const set = this.TagMap[key]
      if(set.has(path)) currentFileInTags.push(key)
    })
    let tagsInFile = []
    while ((matches = regex.exec(content)) !== null) {
      const key = matches[1];
      this.TagMap[key] = this.TagMap[key] ?
       this.TagMap[key].add(path) :
       new Set([path])
       tagsInFile.push(key)
    }
    
    if(currentFileInTags.length === 0) return
    const difs = currentFileInTags.filter((tag) => { return tagsInFile.indexOf(tag) < 0; });
    for (const dif of difs){
      this.TagMap[dif].delete(path)
      if( this.TagMap[dif].size === 0 )
        delete this.TagMap[dif]
    }
    this.events.publish(EventNames.tagsCollected)
  }

  searchFilesFromFolders(folders: Array<string>){
    for (const folder of folders){
      this.files.listFiles(suffixes, folder).forEach(name => {
        const filePath = `${folder}/${name}`;
        const args:any = {
          content: this.files.openFile(filePath, true, false)
        }
        this.parseContent(args.content, filePath)
      })
    }
  }

  initTagMap() {
    this.storage.get(storageKey).then(res => {
      res = JSON.parse(res, this.ArraytoSet);
      this.TagMap = res ? res : this.TagMap
    })
  }
  saveTagMap() {
    this.storage.set(storageKey, JSON.stringify(this.TagMap, this.SettoJSON))
  }

  private SettoJSON(key, value) {
    if (typeof value === 'object' && value instanceof Set) {
      return Array.from(value);
    }
    return value;
  }

  private ArraytoSet(key, value){
    if (typeof value === 'object' && value instanceof Array) {
      return new Set(value);
    }
    return value
  }

}
