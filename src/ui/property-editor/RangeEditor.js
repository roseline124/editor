import UIElement, { EVENT } from "@core/UIElement";
import { Length } from "@unit/Length";
import { LOAD, INPUT, CLICK, FOCUS, BLUR, POINTERSTART, MOVE, END, THROTTLE } from "@core/Event";
import icon from "@icon/icon";
import SelectEditor from "./SelectEditor";
import { OBJECT_TO_CLASS } from "@core/functions/func";

export default class RangeEditor extends UIElement {

    components() {
        return {
            SelectEditor
        }
    }

    initState() {
        var units = this.props.units || 'px,em,%';
        var value = Length.parse(this.props.value || Length.z());

        return {
            removable: this.props.removable === 'true',
            calc:  this.props.calc === 'true'  ? true : false,
            label: this.props.label || '',
            min: +this.props.min || 0,
            max: +this.props.max || 100,
            step: +this.props.step || 1,
            key: this.props.key,
            params: this.props.params || '',
            layout: this.props.layout || '',
            units,
            value
        }
    }

    template () {
        return /*html*/`<div class='small-editor' ref='$body'></div>`
    }

    refresh() {
        this.load();
    }

    [LOAD('$body')] () {

        var { min, max, step, label, removable, layout } = this.state

        var value = +this.state.value.value.toString()

        if (isNaN(value)) {
            value = 0
        }

        var layoutClass = layout;

        var realValue = (+value).toString();

        var units = this.state.units.split(',').map(it => {
            let description = it; 
            if (description === 'number')  {
                description = '';
            }
            return `${it}:${description}`
        }).join(',');

        return /*html*/`
        <div 
            ref="$range"
            class="${OBJECT_TO_CLASS({
                'range-editor': true,
                'has-label': !!label,
                'is-removable': removable,
                [layoutClass] : true 
            })}"
        >
            ${label ? `<label title="${label}">${label}</label>` : '' }
            <div class='range-editor-type' data-type='range'>
                <input type='range' ref='$property' value="${realValue}" min="${min}" max="${max}" step="${step}" /> 
                <div class='area' ref='$rangeArea'>
                    <input type='number' ref='$propertyNumber' value="${realValue}" min="${min}" max="${max}" step="${step}" tabIndex="1" />
                    <SelectEditor ref='$unit' key='unit' value="${this.state.selectedUnit || this.state.value.unit}" options="${units}" onchange='changeUnit' />
                </div>
            </div>
            <button type='button' class='remove thin' ref='$remove' title='Remove'>${icon.remove}</button>
        </div>
    `
    }

    getValue() {
        return this.state.value.clone(); 
    }

    setValue (value) {
        this.setState({
            value: Length.parse(value)
        })
    }

    [FOCUS('$propertyNumber')] (e) {
        this.refs.$rangeArea.addClass('focused');
    }

    [BLUR('$propertyNumber')] (e) {
        this.refs.$rangeArea.removeClass('focused');
    }    

    [CLICK('$remove')] (e) {
        this.updateData({
            value: ''
        })
    }

    updateData (data) {
        this.setState(data, false)
        this.parent.trigger(this.props.onchange, this.props.key, this.state.value, this.props.params)
    }

    initValue () {
        if (this.state.value == '') {
            this.state.value = new Length(0, this.children.$unit.getValue())
        }
        
    }

    [INPUT('$propertyNumber')] (e) {

        var value = +this.getRef('$propertyNumber').value; 
        this.getRef('$property').val(value);
        
        this.initValue()

        this.updateData({ 
            value: new Length(value, this.children.$unit.getValue())
        });

    }


    [POINTERSTART('$property') + MOVE('moveRange') + END('moveRange')] () {

    }

    moveRange () {
        this.trigger('changeValue');
    }

    [EVENT('changeValue') + THROTTLE(100)] () {
        var value = +this.getRef('$property').value; 
        this.refs.$propertyNumber.val(value);

        this.initValue();

        this.updateData({ 
            value: new Length(value, this.children.$unit.getValue())
        });
    }

    [EVENT('changeUnit')] (key, value) {

        this.initValue();

        this.updateData({
            value: this.state.value.toUnit(value)
        })
    }
}