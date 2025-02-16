export class CommandMaker {
    constructor(editor) {
        this.editor = editor;
        this.commands = []
    }

    emit (...args) {
        this.commands.push(args);
    }

    run () {
        this.editor.emit(this.commands);
    }
}