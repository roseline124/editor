
import { DEBOUNCE, LOAD, SUBSCRIBE, SUBSCRIBE_SELF } from "el/sapa/Event";

import { CSS_TO_STRING } from "el/utils/func";
import BaseProperty from "el/editor/ui/property/BaseProperty";

import './FlexLayoutItemProperty.scss';
import { variable } from 'el/sapa/functions/registElement';
import { createComponent } from "el/sapa/functions/jsx";

export default class FlexLayoutItemProperty extends BaseProperty {

  getTitle() {
    return this.$i18n('flex.layout.item.property.title');
  }

  getClassName() {
    return 'elf--flex-layout-item-property';
  }

  getLayoutOptions () {
    return ['none', 'auto', 'value'].map(it => {
        return {value: it, text: this.$i18n(`flex.layout.item.property.${it}`) }
    });
  }

  getBody() {
    return /*html*/`
        <div class='property-item' ref='$body'></div>
      `;
  }  

  [LOAD('$body')] () {
    var current = this.$selection.current || { 'flex-layout-item' : 'none' }

    const valueType = 'value';

    return /*html*/`
      <div class='layout-select'>
        ${createComponent('SelectIconEditor', {
          ref: '$layout',
          key: 'layout',
          icon: true,
          value: valueType,
          options: this.getLayoutOptions(),
          onchange: "changeLayoutType"
        })}
      </div>
      <div class='layout-list' ref='$layoutList' data-selected-value='${valueType}'>
        <div data-value='none'></div>
        <div data-value='auto'></div>
        <div data-value='value'>
          <div class='value-item'>
            ${createComponent({
              ref: '$grow',
              label: this.$i18n('flex.layout.item.property.grow'),
              key: "flex-grow",
              value: current['flex-grow'],
              min: 0,
              max: 1,
              step: 0.01,
              units: ['', 'auto'],
              onchange: 'changeFlexItem'
            })}
          </div>
          <div class='value-item'>
            ${createComponent({
              ref: '$shrink',
              label: this.$i18n('flex.layout.item.property.shrink'),
              key: "flex-shrink",
              value: current['flex-shrink'],
              min: 0,
              max: 1,
              step: 0.01,
              units: ['', 'auto'],
              onchange: 'changeFlexItem'
            })}
          </div>
          <div class='value-item'>
            ${createComponent('RangeEditor', {
              ref: '$basis',
              label: this.$i18n('flex.layout.item.property.basis'),
              key: "flex-basis",
              value: current['flex-basis'],
              min: 0,
              max: 1,
              step: 0.01,
              units: ['px','em',"%",'auto'],
              onchange: 'changeFlexItem'
            })}          
          </div>                    
        </div>
      </div>
    `
  }

  getFlexItemValue  (value) {

    if (value?.isString() && value.unit === '' &&  value.value !== 'auto') {
      return 0;
    }

    return value.unit === 'auto' ? 'auto' : value;
  }

  getFlexValue () {

    var grow = this.children.$grow.getValue();
    var shrink = this.children.$shrink.getValue();
    var basis = this.children.$basis.getValue();

    grow = this.getFlexItemValue(grow);
    shrink = this.getFlexItemValue(shrink);
    basis = this.getFlexItemValue(basis);

    return {
      'flex-grow': grow,
      'flex-shrink': shrink,
      'flex-basis': basis
    }
  }

  [SUBSCRIBE_SELF('changeFlexItem')] (key, value) {

    this.command('setAttributeForMulti', 'change flex layout', this.$selection.packByValue({ 
      [key]: value
    }))

    this.nextTick(() => {
      this.emit('refreshAllElementBoundSize')    
      this.emit('refreshSelectionTool', true);      
    })
  }

  [SUBSCRIBE_SELF('changeLayoutType')] (key, value) {
    this.command('setAttributeForMulti', 'change flex layout', this.$selection.packByValue({ 
      'flex': value
    }))

    // 타입 변화에 따른 하위 아이템들의 설정을 바꿔야 한다. 
    this.refs.$layoutList.attr('data-selected-value', valueType);

    this.nextTick(() => {
      this.emit('refreshAllElementBoundSize')    
    })

  }

  [SUBSCRIBE('refreshSelection') + DEBOUNCE(100)]() {
    this.refreshShow(() => {
      var current = this.$selection.current; 
      return  current && current.isInFlex()
    });
  }
}