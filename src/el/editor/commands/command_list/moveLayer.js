import { Editor } from "el/editor/manager/Editor";
import { Length } from "el/editor/unit/Length";
import _doForceRefreshSelection from "./_doForceRefreshSelection";

export default {
    command : 'moveLayer',

    description: 'move layer by keydown with matrix ',
    /**
     * 
     * @param {Editor} editor 
     * @param {number} dx
     * @param {number} dy
     */
    execute: function (editor, dx = 0, dy = 0) {

        editor.command('setAttributeForMulti', 'item move down', editor.selection.packByValue({
            x: (item) => item.offsetX + dx,
            y: (item) => item.offsetY + dy,
        }));     

        editor.nextTick(() =>{
            editor.selection.reselect();
            editor.emit('refreshAll')
        })
    }
}