import _currentProject from "./_currentProject";
import { isArrayEquals } from "el/utils/func";

export default {
    command: 'history.refreshSelectionPorject',
    description: `save project selection in history `,
    description_ko: 'Project Selection 정보를 갱신하면서 History 에 저장한다',
    execute: function (editor, message = 'selection', projectId) {
        const currentValues = [projectId]; 
        const undoValues = [editor.selection.currentProject?.id]

        // 이전 프로젝트와 현재 프로젝트가 같으면 selection 을 갱신하지 않는다.
        if (isArrayEquals(currentValues, undoValues)) {
            return;
        }

        editor.selection.selectProject(projectId);

        editor.history.add(message, this, {
            currentValues,
            undoValues
        })

        this.nextAction(editor);
    },

    nextAction (editor) {
        editor.nextTick(() => {
            editor.emit("refreshAll");
            editor.emit("refreshProjectList");
        })
    },

    redo : function (editor, { currentValues: [projectId] }) {
        editor.selection.selectProject(projectId)

        this.nextAction(editor);
    },
    undo: function (editor, { undoValues: [projectId] }) {
        editor.selection.selectProject(projectId)

        this.nextAction(editor);      
    }
}