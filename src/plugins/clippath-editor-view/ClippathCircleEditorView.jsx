import {
  LEFT_BUTTON,
  POINTERSTART,
} from "el/sapa/Event";
import { EditorElement } from "el/editor/ui/common/EditorElement";
import { END, MOVE } from "el/editor/types/event";
import "./ClippathEditorView.scss";
import {
  vertiesMap,
} from "el/utils/math";
import { Length } from "el/editor/unit/Length";
import { ClipPathType } from "el/editor/types/model";
import { ClipPath } from "el/editor/property-parser/ClipPath";
import { vec3 } from "gl-matrix";
import ClippathInsetEditorView from "./ClippathInsetEditorView";

/**
 * Gradient Editor View
 *
 * 모든 좌표 계산은 matrix 를 기준으로 한다.
 *
 * current.createBackgroundImageMatrix(index) 를 통해서 matrix 를 생성한 값을 캐쉬로 잡고 처리한다.
 *
 */

export default class ClippathCircleEditorView extends ClippathInsetEditorView {

  [POINTERSTART("$el .circle .circle-radius") + LEFT_BUTTON + MOVE('moveCircleRadius') + END('moveEndCircleRadius')](e) {
    const current = this.$selection.current;

    this.state.current;
    this.state.width = current.screenWidth;
    this.state.height = current.screenHeight;
    this.state.clippath = ClipPath.parseStyle(current['clip-path']);
    this.state.circle = ClipPath.parseStyleForCircle(this.state.clippath.value);
  }


  moveCircleRadius(dx, dy) {
    const current = this.$selection.current;    
    const {radius, x, y} = this.state.circle;

    const oldX = x.toPx(current.screenWidth);
    const oldY = y.toPx(current.screenHeight);

    const r = Math.sqrt(Math.pow(current.screenWidth, 2) + Math.pow(current.screenHeight, 2))/Math.sqrt(2)
    const oldRadius = radius.toPx(current.screenWidth);    

    const verties = this.$viewport.applyVerties(vertiesMap([ 
      [oldX.value + oldRadius.value, oldY, 0 ],
    ],current.absoluteMatrix));

    const newRadius = verties[0];

    const newX = newRadius[0] + dx;
    const newY = newRadius[1] + dy;

    const localPosition = this.$viewport.applyVertexInverse([newX, newY, 0]);

    const relativePosition = vertiesMap([ localPosition ], this.$selection.current.absoluteMatrixInverse)[0];
      
    const distX = Math.abs(relativePosition[0] - oldX)

    const result = [
      radius.isPercent() ? Length.percent((distX)/r * 100) : Length.px(distX),
      x,
      y
    ]

    this.state.clippath.value = `${result[0]} at ${result[1]} ${result[2]}`;

    const value = ClipPath.toCSS(this.state.clippath)

    this.emit('setAttributeForMulti', this.$selection.packByValue(value)) 

  }

  moveEndCircleRadius() {
    const value = ClipPath.toCSS(this.state.clippath)

    this.command('setAttributeForMulti', 'change clippath', this.$selection.packByValue(value)) 
  }

  [POINTERSTART("$el .circle .circle-center") + LEFT_BUTTON + MOVE('moveCircleCenter') + END('moveEndCircleCenter')](e) {

    const current = this.$selection.current;

    this.state.current;
    this.state.width = current.screenWidth;
    this.state.height = current.screenHeight;
    this.state.clippath = ClipPath.parseStyle(current['clip-path']);
    this.state.circle = ClipPath.parseStyleForCircle(this.state.clippath.value);
  }

  moveCircleCenter(dx, dy) {
    const current = this.$selection.current;    
    const {radius, x, y} = this.state.circle;

    const oldX = x.toPx(current.screenWidth);
    const oldY = y.toPx(current.screenHeight);

    const verties = this.$viewport.applyVerties(vertiesMap([ 
      [oldX, oldY, 0],
    ],current.absoluteMatrix));

    const center = verties[0];

    const newX = center[0] + dx;
    const newY = center[1] + dy;

    const localPosition = this.$viewport.applyVertexInverse([newX, newY, 0]);

    const relativePosition = vertiesMap([ localPosition ], this.$selection.current.absoluteMatrixInverse)[0];
      
    const result = [
      radius, 
      x.isPercent() ? Length.percent(relativePosition[0]/this.state.width * 100) : Length.px(relativePosition[0]),
      y.isPercent() ? Length.percent(relativePosition[1]/this.state.height * 100) : Length.px(relativePosition[1])
    ]

    this.state.clippath.value = `${radius} at ${result[1]} ${result[2]}`;

    const value = ClipPath.toCSS(this.state.clippath)

    this.emit('setAttributeForMulti', this.$selection.packByValue(value)) 

  }

  moveEndCircleCenter(dx, dy) {

    if (dx == 0 && dy == 0) {
      switch (this.state.clippath.type) {
        case ClipPathType.CIRCLE:
          const value = ClipPath.toCSS({
            type: ClipPathType.ELLIPSE,
            value: `${this.state.circle.radius} ${this.state.circle.radius} at ${this.state.circle.x} ${this.state.circle.y}`
          })

          this.command('setAttributeForMulti', 'change clippath', this.$selection.packByValue(value))           
          break;
      }
      return;
    }

    const value = ClipPath.toCSS(this.state.clippath)

    this.command('setAttributeForMulti', 'change clippath', this.$selection.packByValue(value)) 
  }

  templateCircle(clippath) {
    const current = this.$selection.current;

    const r = Math.sqrt(Math.pow(current.screenWidth, 2) + Math.pow(current.screenHeight, 2))/Math.sqrt(2)
    const radius = clippath.value.radius.toPx(r);
    const x = clippath.value.x.toPx(current.screenWidth);
    const y = clippath.value.y.toPx(current.screenHeight);

    const verties = this.$viewport.applyVerties(vertiesMap([ 
      [x, y, 0],
      [x.value + radius.value, y, 0] 
    ],current.absoluteMatrix));

    const center = verties[0];
    const radiusPos = verties[1];

    const dist = vec3.dist(center, radiusPos);

    return <div class="circle">
      <div class="circle-back" style={{
        left: Length.px(center[0]),
        top: Length.px(center[1]),
        width: Length.px(dist * 2),
        height: Length.px(dist * 2)
      }}></div>      
      <div class="circle-center" style={{
        left: center[0] + "px",
        top: center[1] + "px",
      }}></div>
      <div class="circle-radius" style={{
        left: radiusPos[0] + "px",
        top: radiusPos[1] + "px",
      }}></div>      
    </div>
  }

}
