import { CLICK, LOAD } from 'el/sapa/Event';
import { EditorElement } from '../common/EditorElement';
import { TabPanel } from './TabPanel';

import './Tabs.scss';

export class Tabs extends EditorElement {
    afterRender() {
      setTimeout(() => {
        this.setValue(this.state.selectedValue);
      }, 0)
  
    }
  
    initState() {
      return {
        type: this.props.type || 'number',
        selectedValue: this.props.selectedValue || '',
      }
    }
  
    template() {
      return /*html*/`
        <div class="tab" ref="$tab"></div>
      `
    }
  
    [LOAD('$tab')]() {
      const { content, contentChildren } = this.props;
      const children = contentChildren.filter(it => it.component === TabPanel);

      return [
        <div class="tab-header" ref="$header">
          {children.map(it => (
            <div class="tab-item" data-value={it.props.value} title={it.props.title}>
                <label class="title">{it.props.title}</label>
            </div>         
          ))}
        </div>,
        <div class="tab-body" ref="$body">
          {content}
        </div>
      ];
      
    }
  
    [CLICK("$header .tab-item:not(.empty-item)")](e) {
  
      var selectedValue = e.$dt.attr('data-value')
  
      this.setValue(selectedValue);
    }

    updateData(data) {
      this.setState(data, false);
      this.parent.trigger(this.props.onchange, this.getValue());
    }

    getValue() {
      return this.state.selectedValue;
    }
  
    setValue(selectedValue) {
      this.$el.$(`* > .tab-item[data-value="${selectedValue}"]`)?.onlyOneClass('selected');
      this.$el.$(`* > .tab-content[data-value="${selectedValue}"]`)?.onlyOneClass('selected');

      this.updateData({ selectedValue })
    }
  
  }