import { Events } from 'ionic-angular';
import { Injectable } from "@angular/core";
import markjax from "markjax";
import marked from "marked";
import { EventsProvider, EventNames } from '../events/events';
/*
  Generated class for the MarkjaxProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/

interface IHeading {
  id: string,
  content: string,
  level: string
}

enum AppendModes {
  QUOTE,
  HEADER,
  BULLET,
  BULLET_NUM
}

enum WrapModes {
  ITALIC,
  BOLD,
  UNDERLINE,
  STRIKEOUT,
  CODE,
  CODE_BLOCK
}

@Injectable()
export class MarkjaxProvider {
  settings: Object;
  headers : Array<IHeading> = [];

  constructor(private events: EventsProvider) {
    console.log("Hello MarkjaxProvider Provider");
    var renderer = new marked.Renderer();
    renderer.listitem = text => {
      if (/^\s*\[[x ]\]\s*/.test(text)) {
        text = text
          .replace(
            /^\s*\[ \]\s*/,
            '<ion-icon name="square-outline"></ion-icon>'
          )
          .replace(
            /^\s*\[x\]\s*/,
            '<ion-icon name="checkbox-outline"></ion-icon> '
          );
        return '<li style="list-style: none">' + text + "</li>";
      } else {
        return "<li>" + text + "</li>";
      }
    };
    renderer.heading = (text, level) => {
      this.headers.push({id:`H${this.headers.length+1}`, content: text, level})
      return `<h${level} id=H${this.headers.length}> ${text} </h${level}>`;
    };
    this.settings = {
      renderer,
      gfm: true,
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: true
    };
  }

  parse(source, dest) {
    markjax(source, dest, this.settings);
    this.events.publish(EventNames.headingLoaded, this.headers.concat())
    this.headers = [];
  }

  append(mode) {
    let text = window.getSelection().toString();
    let wrap;
    switch (mode) {
      case AppendModes.QUOTE:
        wrap = `>`;
        break;
      case AppendModes.BULLET:
        wrap = `-`;
        break;
      case AppendModes.HEADER:
        wrap = `#`;
        break;
      case AppendModes.BULLET_NUM:
        wrap = `.`;
        break;
      default:
        break;
    }
    text = `${wrap} ${text}`;
    document.execCommand("insertText", false, text);
  }

  wrap(mode) {
    let text = window.getSelection().toString();
    let wrap;
    switch (mode) {
      case WrapModes.ITALIC:
        wrap = `*`;
        break;
      case WrapModes.BOLD:
        wrap = `**`;
        break;
      case WrapModes.STRIKEOUT:
        wrap = `~~`;
        break;
      case WrapModes.CODE:
        wrap = "`";
        break;
      case WrapModes.CODE_BLOCK:
        // wrap = "```";
        this._wrapInCode();
        return;
      default:
        break;
    }
    text = `${wrap}${text}${wrap}`;
    document.execCommand("insertText", false, text);
  }

  private _wrapInCode() {
    let text = window.getSelection().toString();
    let wrap = "```";
    text = `\n${wrap}\n${text}\n${wrap}`;
    document.execCommand("insertText", false, text);
  }
}



export { WrapModes, AppendModes };