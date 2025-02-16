import Dom from "el/sapa/functions/Dom";
import { Item } from "el/editor/items/Item";
import SVGItemRender from "./SVGItemRender";
import { SVGFill } from 'el/editor/property-parser/SVGFill';
import Color from "el/utils/Color";
import { BooleanOperation } from "el/editor/types/model";

export default class BooleanPathRender extends SVGItemRender {
    

  toFillSVG (item) {

    const layers = item.layers;
    const op = item['boolean-operation']

    switch(op) {
      case BooleanOperation.DIFFERENCE: return SVGFill.parseImage(layers[1].fill || 'transparent').toSVGString(this.fillId(item));      
      default: break;
    }

    return SVGFill.parseImage(layers[0].fill || 'transparent').toSVGString(this.fillId(item));
  }

  toStrokeSVG (item) {
    const layers = item.layers;
    const op = item['boolean-operation']

    switch(op) {
      case BooleanOperation.DIFFERENCE: return SVGFill.parseImage(layers[1].stroke || 'transparent').toSVGString(this.strokeId(item));      
      default: break;
    }

    return SVGFill.parseImage(layers[0].stroke || 'black').toSVGString(this.strokeId(item));
  }  

  toFillValue (item) {

    const layers = item.layers;
    const op = item['boolean-operation']

    switch(op) {
      case BooleanOperation.DIFFERENCE: return SVGFill.parseImage(layers[1].fill || 'transparent').toSVGString(this.fillId(item));      
      default: break;
    }

    return SVGFill.parseImage(layers[0].fill || 'transparent').toFillValue?.(this.fillId(item)); 
  }

  toFillOpacityValue (item) {
      return  Color.parse(item.fill || 'transparent').a;
  }  

  toStrokeValue (item) {
    const layers = item.layers;
    const op = item['boolean-operation']

    switch(op) {
      case BooleanOperation.DIFFERENCE: return SVGFill.parseImage(layers[1].stroke || 'transparent').toFillValue?.(this.strokeId(item)); 
      default: break;
    }

    return SVGFill.parseImage(layers[0].stroke || 'black').toFillValue?.(this.strokeId(item)); 
  }  

  /**
   * @param {Item} item
   * @param {Dom} currentElement 
   */
  update (item, currentElement) {

    if (!currentElement) return; 

    const $path = currentElement.$(`[data-boolean-path-id="${item.id}"]`);

    if ($path) {
      if (item.hasChangedField('changedChildren', 'd', 'boolean-operation', 'width', 'height')) {
        $path.setAttrNS({
          'd':  item.d,
        })  
      } 
      if (item.hasChangedField('fill')){
        $path.setAttrNS({
          'fill': this.toFillValue(item),
        })  

      } 
      
      if (item.hasChangedField('stroke')){
        $path.setAttrNS({
          'stroke': this.toStrokeValue(item)
        })  
        
      } 
      
      if (item.hasChangedField('filter')){
        $path.setAttrNS({
          'filter': this.toFilterValue(item),
        })          
      }

      if (item.hasChangedField('fill-rule')){
        $path.setAttrNS({
          'fill-rule': item['fill-rule'] || 'nonezero',
        })          
      }

      if (item.hasChangedField('stroke-linejoin')){
        $path.setAttrNS({
          'stroke-linejoin': item['stroke-linejoin'],
        })          
      }

      if (item.hasChangedField('stroke-linecap')){
        $path.setAttrNS({
          'stroke-linecap': item['stroke-linecap'],
        })          
      }
    }

    super.update(item, currentElement)

  }    

  updateElementCache (item, currentElement) {
    // element 를 캐쉬 해두기 
    if (item.getCache("element") !== currentElement) {
        item.addCache("element", currentElement);

        const $path = currentElement.$(`[data-boolean-path-id="${item.id}"]`);
        item.addCache("svgElement", $path.parent().el)
        item.addCache("pathElement", $path.el);
    }    
  } 


  render (item, renderer) {
    var {id, name, itemType} = item;
  
    return /*html*/`    
<div class="element-item ${itemType}" data-id="${id}" data-title="${name}">
  ${this.toDefString(item)}
  ${item.layers.map(it => {
    return renderer.render(it, renderer)
  }).join('')}
  <svg xmlns="http://www.w3.org/2000/svg" class="boolean-path-item" width="100%" height="100%" overflow="visible">
    <path 
      class="svg-path-item"
      d="${item.d}"
      data-boolean-path-id="${id}" 
      fill-rule="${item['fill-rule']}"
      filter="${this.toFilterValue(item)}"
      fill="${this.toFillValue(item)}"
      stroke="${this.toStrokeValue(item)}"
      stroke-linejoin="${item['stroke-linejoin']}"
      stroke-linecap="${item['stroke-linecap']}"
    />
  </svg>
</div>
    `
  }

}