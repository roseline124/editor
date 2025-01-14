import { EditingMode } from "el/editor/types/editor";

/**
 * 객체 추가 모드로 변경 
 * 
 * @param {*} editor 
 * @param {*} type 
 */
export default async function addLayerView (editor, type, data = {}) {
    // editor.emit('hideSubEditor');
    editor.selection.empty();
    await editor.emit('refreshSelectionTool');        
    await editor.emit('hideAddViewLayer');
    await editor.emit('removeGuideLine');

    if (type === 'select') {
        // NOOP
        // select 는 아무것도 하지 않는다. 
        editor.config.set("editing.mode", EditingMode.SELECT);                
    } else if (type === 'brush') {
        editor.config.set("editing.mode", EditingMode.DRAW);        
        await editor.emit('showPathDrawEditor');
    } else if (type === 'path') {
        editor.config.set("editing.mode", EditingMode.PATH);        
        await editor.emit('showPathEditor', 'path' );
    } else  {
        editor.config.set("editing.mode", EditingMode.APPEND);
        editor.config.set("editing.mode.itemType", type);
        await editor.emit('showLayerAppendView', type, data );
    }
}