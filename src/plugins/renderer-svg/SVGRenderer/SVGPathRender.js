import Dom from "el/sapa/functions/Dom";
import { CSS_TO_STRING, OBJECT_TO_PROPERTY } from "el/utils/func";
import { Item } from "el/editor/items/Item";
import SVGItemRender from "./SVGItemRender";

export default class SVGPathRender extends SVGItemRender {
    
  /**
   * @param {Item} item
   * @param {Dom} currentElement 
   */
  update (item, currentElement) {

    if (!currentElement) return; 

    var $path = currentElement.$('path');

    if ($path) {
      $path.setAttr({
        'd':  item.d,
        'filter': this.toFilterValue(item),
        'fill': this.toFillValue(item),
        'stroke': this.toStrokeValue(item)
      })  
      item.totalLength = $path.totalLength
    }

    this.updateDefString(item, currentElement)

  }    


  render (item) {
    var {d} = item;

    return this.wrappedRender(item, () => {
      return /*html*/`
<path ${OBJECT_TO_PROPERTY({
  'class': 'svg-path-item', 
  d, 
  filter: this.toFilterValue(item),
  fill: this.toFillValue(item),
  stroke: this.toStrokeValue(item),
  ...this.toSVGAttribute(item),
  style: CSS_TO_STRING(this.toCSS(item))      
})} />
    `
    }) 
  }

}