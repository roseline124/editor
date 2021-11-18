import { Editor } from "el/editor/manager/Editor";
import DepthProperty from "./DepthProperty";


/**
 * 
 * @param {Editor} editor 
 */
export default function (editor) {
    editor.registerElement({
        DepthProperty
    })
}