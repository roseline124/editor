import { Editor } from "el/editor/manager/Editor";

export default {
    command : 'history.removeProject',
    description: 'remove project',

    /**
     * 객체를 삭제 한다. 삭제 할 때 history 도 남긴다. 
     * 
     * @param {Editor} editor 
     * @param {string} message 
     * @param {string|undefined} projectId 프로젝트 id
     */
    execute: function (editor, message, projectId) {

        // 삭제 할 때는 modelManager 에서 mark 를 한다. 
        const index = editor.modelManager.markRemoveProject(projectId);        

        editor.history.add(message, this, {
            currentValues: [projectId],
            undoValues: [projectId, index],
        })

        editor.nextTick(() =>  {
            editor.selection.selectProject(editor.modelManager.projects[0]);
            editor.emit('refreshAll')
            editor.emit('removeGuideLine');
            editor.nextTick(() => {
                editor.history.saveSelection()  
            })
        })        
    },

    redo: function (editor, {currentValues: [projectId]}) {

        // 삭제 할 때는 modelManager 에서 mark 를 한다. 
        editor.modelManager.markRemoveProject(projectId);        

        editor.nextTick(() => {
            editor.emit('refreshAll');
        })
    },

    /**
     * 생성된 undoValues 를 복구한다. 
     * 복구 할 때는 해당 객체의 부모와 위치를 같이 복구한다. 
     * 
     * @param {Editor} editor 
     * @param {Object} param1 
     * @param {string} param1.undoValues  JSON serialize 된 문자열 
     */
    undo: function (editor, { undoValues: [projectId, index] }) {

        editor.modelManager.unmarkRemoveProject(projectId, index);

        editor.nextTick(() => {
            editor.selection.selectProject(projectId);
            editor.emit('refreshAll');
        })
    }
}