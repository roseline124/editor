
import { CLICK, BIND, SUBSCRIBE } from "el/sapa/Event";
import { Pattern } from "el/editor/property-parser/Pattern";
import { EditorElement } from "el/editor/ui/common/EditorElement";
import { Length } from "el/editor/unit/Length";

import './PatternSizeEditor.scss';

export default class PatternSizeEditor extends EditorElement {

    initState() { 

        return {
            index: this.props.index,
            x: Length.parse(this.props.x),
            y: Length.parse(this.props.y),
            width: Length.parse(this.props.width),
            height: Length.parse(this.props.height),
            lineWidth: Length.parse(this.props.lineWidth),
            lineHeight: Length.parse(this.props.lineHeight),            
            backColor: this.props.backColor,
            foreColor: this.props.foreColor,
            blendMode: this.props.blendMode,
            type: this.props.type,
        }
    }

    updateData(opt = {}) {
        this.setState(opt, false);
        this.modifyValue(opt);
    }

    modifyValue(value) {
        this.parent.trigger(this.props.onchange, this.props.key, value, this.state.index);
    }

    setValue (obj) {
        this.setState({
            ...obj 
        })
    }

    [BIND('$miniView')] () {

        const {
            type, x, y, width, height, lineWidth, lineHeight, backColor, foreColor, blendMode
        } = this.state;

        let obj = {
            type,
            x, 
            y,
            width,
            height,
            lineWidth,
            lineHeight,
            backColor,
            foreColor,
            blendMode
        }        

        if (this.state.width > 80) {
            obj.width = 80;
            obj.x = obj.x.value / this.state.width/80
        }

        if (this.state.height > 80) {
            obj.height = 80;
            obj.y = this.state.y.value / this.state.height/80
        }        

        const pattern = Pattern.parse(obj);

        return {
            cssText: pattern.toCSS()
        }
    }

    template() {

        return /*html*/`
            <div class='elf--pattern-size-editor'>
                <div class='preview' ref='$preview'>
                    <div class='mini-view'>
                        <div class='color-view' style="background-color: ${this.state.color}" ref='$miniView'></div>
                    </div>
                </div>
            </div>
        `
    }


    [CLICK("$preview")](e) {
        this.viewBackgroundPositionPopup();
    }

    viewBackgroundPositionPopup() {

        this.emit('getLayoutElement', (layoutElement) => {
            const bodyRect = layoutElement.$bodyPanel.rect();
            const rect = this.$el.rect();

            const newRect = {
                left: bodyRect.left + bodyRect.width - 240,
                top: rect.top,
                width: 240,
                height: 300,
            }         

            this.emit("showPatternInfoPopup", {
                changeEvent: (pattern) => {
                    this.updateData({ ...pattern })                
                },
                data: this.state,
                instance: this
            }, newRect);

        });
    }
}