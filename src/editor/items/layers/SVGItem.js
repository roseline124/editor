import { Layer } from "../Layer";

export class SVGItem extends Layer {
  getDefaultObject(obj = {}) {
    return super.getDefaultObject({
      itemType: 'svg',
      name: "New SVG",
      elementType: 'svg',
      overflow: 'visible',         
      stroke: 'black',
      'stroke-width': 1,
      fill: 'transparent',
      'fill-rule': '',
      'fill-opacity': '',
      'stroke-linecap': '',
      'stroke-linejoin': '',      
      'stroke-dashoffset': '',
      'stroke-dasharray': [],      
      ...obj
    });
  }


  toCloneObject() {
    var json = this.json; 
    return {
      ...super.toCloneObject(),
      overflow: json.overflow,
      stroke: json.stroke,
      'stroke-width': json['stroke-width'],
      fill: json.fill,
      'fill-rule': json['fill-rule'],
      'fill-opacity': json['fill-opacity'],
      'stroke-linecap': json['stroke-linecap'],
      'stroke-linejoin': json['stroke-linejoin'],
      'stroke-dashoffset': json['stroke-dashoffset'],
      'stroke-dasharray': json['stroke-dasharray']
    }
  }

  toSVGDefaultCSS () {
    var json = this.json; 
    return {
      'stroke-dasharray': json['stroke-dasharray'].join(' '),
      ...this.toKeyListCSS(
        'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dashoffset',
        'fill', 'fill-opacity', 'fill-rule')
    }
  }

  getDefaultTitle() {
    return "SVG";
  }
}