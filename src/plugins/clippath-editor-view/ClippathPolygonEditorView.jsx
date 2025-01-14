import {
  CLICK,
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
import PathParser from "el/editor/parser/PathParser";
import { toRectVerties, vertiesToRectangle } from "el/utils/collision";
import { clone } from "el/sapa/functions/func";

/**
 * Gradient Editor View
 *
 * 모든 좌표 계산은 matrix 를 기준으로 한다.
 *
 * current.createBackgroundImageMatrix(index) 를 통해서 matrix 를 생성한 값을 캐쉬로 잡고 처리한다.
 *
 */

export default class ClippathPolygonEditorView extends EditorElement {

  initializePolygon() {

    const current = this.$selection.current;

    this.state.current;
    this.state.width = current.screenWidth;
    this.state.height = current.screenHeight;
    this.state.clippath = ClipPath.parseStyle(current['clip-path']);
    this.state.clippath.value = ClipPath.parseStyleForPolygon(this.state.clippath.value);


    this.screenPoints = this.$viewport.applyVerties(
      vertiesMap(
        this.state.clippath.value.map(point => {
          const {x, y} = point

          const newX = x.toPx(this.state.width);
          const newY = y.toPx(this.state.height);

          return vec3.fromValues(newX, newY, 0);
        }),
        current.absoluteMatrix
      )
    );

    this.clonedScreenPoints = clone(this.screenPoints);
  }


  [POINTERSTART("$el .polygon .polygon-pointer") + LEFT_BUTTON + MOVE('movePolygonPointer') + END('moveEndPolygonPointer')](e) {
    this.initializePolygon();

    this.polygonTargetIndex = +e.$dt.data('index');
  }


  movePolygonPointer(dx, dy) {
    
    this.clonedScreenPoints[this.polygonTargetIndex] = vec3.add([], this.screenPoints[this.polygonTargetIndex], [dx, dy, 0]);


    this.updatePolygon(this.clonedScreenPoints);

  }

  moveEndPolygonPointer() {
    const value = ClipPath.toCSS(this.state.clippath)

    this.command('setAttributeForMulti', 'change clippath', this.$selection.packByValue(value)) 
  }

  [POINTERSTART('$el .polygon .polygon-line') + LEFT_BUTTON](e) {
    this.initializePolygon();

    const index = +e.$dt.data('index');    

    this.polygonTargetIndex = index;

    console.log(index);

    const current = this.screenPoints[this.polygonTargetIndex];
    const next = this.screenPoints[(this.polygonTargetIndex + 1) % this.screenPoints.length];

    const newPoint = vec3.lerp([], current, next, 0.5);

    this.screenPoints.splice(this.polygonTargetIndex + 1, 0, newPoint);

    this.updatePolygon(this.screenPoints);

  }

  updatePolygon (screenPoints) {
    // global world 좌표로 바꾸고 
    const newWorldPoints = this.$viewport.applyVertiesInverse(screenPoints);

    // relative 좌표로 바꾸고 
    const inverseMatrix = this.$selection.current.absoluteMatrixInverse;

    const newLocalPoints = vertiesMap(newWorldPoints, inverseMatrix);

    this.state.clippath.value = newLocalPoints.map(p => {
      return [
        Length.percent(p[0]/this.state.width * 100), 
        Length.percent(p[1]/this.state.height * 100)
      ].join(' ');
    }).join(',');

    const value = ClipPath.toCSS(this.state.clippath)

    this.emit('setAttributeForMulti', this.$selection.packByValue(value))     
  }

  [POINTERSTART("$el .polygon .polygon-center") + LEFT_BUTTON + MOVE('movePolygonCenter') + END('moveEndPolygonCenter')](e) {
    this.initializePolygon();
  }

  movePolygonCenter(dx, dy) {
    const newScreenPoints = this.screenPoints.map(p => {
      return vec3.add([], p, [dx, dy, 0]);
    });

    this.updatePolygon(newScreenPoints);    

  }

  moveEndPolygonCenter(dx, dy) {

    if (dx == 0 && dy == 0) {
      switch (this.state.clippath.type) {
        case ClipPathType.POLYGON:
          const value = ClipPath.toCSS({
            type: ClipPathType.CIRCLE,
            value: `50% at 50% 50%`
          })

          this.command('setAttributeForMulti', 'change clippath', this.$selection.packByValue(value))           
          break;
      }
      return;
    }

    const value = ClipPath.toCSS(this.state.clippath)

    this.command('setAttributeForMulti', 'change clippath', this.$selection.packByValue(value)) 
  }

  templatePolygon(clippath) {
    const current = this.$selection.current;
    const points = ClipPath.parseStyleForPolygon(clippath.value).map(point => [
      point.x.toPx(current.screenWidth).value, 
      point.y.toPx(current.screenHeight).value, 
      0
    ]);
    const centerPoint = toRectVerties(points)[4]

    const screenPoints = this.$viewport.applyVerties(vertiesMap(points, current.absoluteMatrix));
    const screenCenter = this.$viewport.applyVerties(vertiesMap([centerPoint], current.absoluteMatrix))[0];


    return <div class="polygon">
      <div class="polygon-back">
        <svg style="position:absolute;width:100%;height:100%;">
          <polygon points={`${screenPoints.map(it => [it[0], it[1]].join(',')).join(' ')}`}></polygon>
          {screenPoints.map((it, index) => {
            const nextIndex = (index + 1) % screenPoints.length;
            const nextPoint = screenPoints[nextIndex];

            return <line x1={it[0]} y1={it[1]} x2={nextPoint[0]} y2={nextPoint[1]} class="polygon-line" data-index={index}></line>
          })}          
          {screenPoints.map((it, index) => {
            return <circle cx={it[0]} cy={it[1]} r={3} class="polygon-pointer" data-index={index}></circle>
          })}          
        </svg>  
      </div>       
      <div class="polygon-center" style={{ left: Length.px(screenCenter[0]), top: Length.px(screenCenter[1])}}></div>
    </div>
  }

}
