import BaseProperty from "./BaseProperty";
import { LOAD, CLICK, DEBOUNCE } from "@core/Event";
import { EVENT } from "@core/UIElement";
import { registElement } from "@core/registerElement";

export default class TransformOriginProperty extends BaseProperty {

  getTitle() {
    return this.$i18n('transform.origin.property.title');  
  }

  hasKeyframe () {
    return true; 
  }

  getKeyframeProperty () {
    return 'transform-origin'
  }  

  [CLICK('$remove')] () {
    this.trigger('changeTransformOrigin', '');
  }

  getBody() {
    return /*html*/`
      <div class="property-item full transform-origin-item" ref='$body'></div>
    `;
  }

  [LOAD('$body')] () {
    var current = this.$selection.current || {}; 
    var value = current['transform-origin'] || ''

    return /*html*/`<object refClass="TransformOriginEditor" ref='$1' value='${value}' onchange='changeTransformOrigin' />`
  }


  [EVENT('refreshSelection', 'refreshRect') + DEBOUNCE(100)]() {
    this.refreshShowIsNot(['project', 'artboard']);
  }

  [EVENT('changeTransformOrigin')] (key, value) {

    this.command('setAttribute', 'change transform-origin', { 
      'transform-origin': value 
    })
  }

}

registElement({ TransformOriginProperty })
