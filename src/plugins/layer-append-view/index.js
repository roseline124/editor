import { Editor } from "el/editor/manager/Editor";
import LayerAppendView from "./LayerAppendView";

/**
 * 
 * @param {Editor} editor 
 */
export default function (editor) {
    editor.registerMenuItem('canvas.view', {
        LayerAppendView         
    })
}