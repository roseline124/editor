import { MovableModel } from './MovableModel';
import { Length } from 'el/editor/unit/Length';
import { ModelManager } from 'el/editor/manager/ModelManager';
import { vertiesToRectangle } from 'el/utils/collision';
import { beforeAll, expect, test, vi } from 'vitest';

let modelManager;

const registerModel = (model) => {
    modelManager.set(model.id, model);
}

beforeAll(() => {

    const editor = {
        emit: vi.fn(() => true)
    }

    modelManager = new ModelManager(editor);
});

test("create MovableModel", () => {
    expect(new MovableModel()).toBeInstanceOf(MovableModel);
})

test("create MovableModel with size", () => {
    const model = new MovableModel({
        width: Length.px(100),
        height: Length.px(200)
    });
    expect(model.width).toEqual(Length.px(100));
    expect(model.height).toEqual(Length.px(200));
})

test("create MovableModel with position", () => {
    const model = new MovableModel({
        x: Length.percent(100),
        y: Length.px(200)
    });
    expect(model.x).toEqual(Length.percent(100));
    expect(model.y).toEqual(Length.px(200));
})

test("create project", () => {
    const model = new MovableModel({
        itemType: 'project'
    });

    expect(model.itemType).toEqual('project');
    expect(model.screenWidth).toEqual(Length.px(0));
    expect(model.screenHeight).toEqual(Length.px(0));
})

test("create artboard", () => {

    const project = new MovableModel({
        itemType: 'project'
    }, modelManager);

    const model = new MovableModel({
        itemType: 'artboard'
    }, modelManager);

    project.appendChild(model);


    expect(model.itemType).toEqual('artboard');
    expect(model.screenWidth).toEqual(Length.px(0));
    expect(model.screenHeight).toEqual(Length.px(0));
    expect(model.parentId).toEqual(project.id);
})

test("create movable in artboard", () => {

    const project = new MovableModel({
        itemType: 'project',
        x: Length.px(0),
        y: Length.px(0),
        width: Length.px(0),
        height: Length.px(0)
    }, modelManager);

    registerModel(project);    
    // console.log(project);

    const artboard = new MovableModel({
        itemType: 'artboard',
        x: Length.px(100),
        y: Length.px(200),
        width: Length.px(300),
        height: Length.px(400)
    }, modelManager);

    registerModel(artboard);

    project.appendChild(artboard);


    const model = new MovableModel({
        itemType: 'rect',
        x: Length.px(300),
        y: Length.px(300),
        width: Length.px(300),
        height: Length.px(400)   
    }, modelManager)

    registerModel(model);    

    artboard.appendChild(model);

    expect(model.parentId).toEqual(artboard.id);    
    // appendChild 하는 시점에 artboard 의 상대 좌표로 변경 
    expect(model.offsetX).toEqual(Length.px(200));      
    expect(model.screenWidth).toEqual(Length.px(300));
    expect(model.screenHeight).toEqual(Length.px(400));

    // world 좌표 기준으로 바꿔서 체크 
    const rect = vertiesToRectangle(model.verties)
    expect(rect.left).toEqual(Length.px(300));
    expect(rect.top).toEqual(Length.px(300));
})

