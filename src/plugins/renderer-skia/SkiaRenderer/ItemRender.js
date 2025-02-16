import { Item } from "el/editor/items/Item";
import { mat4 } from "gl-matrix";

export default class ItemRender {

  /**
   * id 기반 문자열 id 생성
   * 
   * @param {Item} item
   * @param {string} postfix 
   */
  getInnerId(item, postfix = '') {
    return item.id + postfix;
  }

}