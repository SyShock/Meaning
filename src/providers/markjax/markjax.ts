import { Injectable } from '@angular/core';
import markjax from 'markjax'
/*
  Generated class for the MarkjaxProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class MarkjaxProvider {

  content: string;

  constructor() {
    console.log('Hello MarkjaxProvider Provider');
  }

  parse(source, dest){
    markjax()
  }

  render(){
    
  }

}
