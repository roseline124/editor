/*
refer to https://skia.org/docs/user/modules/pathkit/#constants


PathOp (enum)
The following enum values are exposed. They are essentially constant objects, differentiated by their .value property.

PathKit.PathOp.DIFFERENCE
PathKit.PathOp.INTERSECT
PathKit.PathOp.REVERSE_DIFFERENCE
PathKit.PathOp.UNION
PathKit.PathOp.XOR
These are used in PathKit.MakeFromOp() and SkPath.op().

FillType (enum)
The following enum values are exposed. They are essentially constant objects, differentiated by their .value property.

PathKit.FillType.WINDING (also known as nonzero)
PathKit.FillType.EVENODD
PathKit.FillType.INVERSE_WINDING
PathKit.FillType.INVERSE_EVENODD
These are used by SkPath.getFillType() and SkPath.setFillType(), but generally clients will want SkPath.getFillTypeString().

StrokeJoin (enum)
The following enum values are exposed. They are essentially constant objects, differentiated by their .value property.

PathKit.StrokeJoin.MITER
PathKit.StrokeJoin.ROUND
PathKit.StrokeJoin.BEVEL
See SkPaint reference for more details.

StrokeCap (enum)
The following enum values are exposed. They are essentially constant objects, differentiated by their .value property.

PathKit.StrokeCap.BUTT
PathKit.StrokeCap.ROUND
PathKit.StrokeCap.SQUARE
See SkPaint reference for more details.

Constants
The following constants are exposed:

PathKit.MOVE_VERB = 0
PathKit.LINE_VERB = 1
PathKit.QUAD_VERB = 2
PathKit.CONIC_VERB = 3
PathKit.CUBIC_VERB = 4
PathKit.CLOSE_VERB = 5
These are only needed for PathKit.FromCmds().

*/


export class PathKitManager {
  constructor(editor) {
    this.editor = editor;
    this.pathkit = null; 
  }

  registerPathKit (pathkit) {
    this.pathkit = pathkit;
    this.editor.emit("updatePathKit");
  }

  has() {
    return !!this.pathkit;
  }

  booleanOperation (first, second, pathOp) {
    const PathKit = this.pathkit;

    return PathKit.MakeFromOp(
      PathKit.FromSVGString(first),
      PathKit.FromSVGString(second),
      pathOp
    ).toSVGString();
  }

  intersection(first, second) {
    const PathKit = this.pathkit;
    if (!PathKit) return;    
    return this.booleanOperation(first, second, PathKit.PathOp.INTERSECT);
  }

  union(first, second) {
    const PathKit = this.pathkit;
    if (!PathKit) return;    
    return this.booleanOperation(first, second, PathKit.PathOp.UNION);
  }

  difference(first, second) {
    const PathKit = this.pathkit;
    if (!PathKit) return;    
    return this.booleanOperation(first, second, PathKit.PathOp.DIFFERENCE);
  }

  reverseDifference(first, second) {
    const PathKit = this.pathkit;
    if (!PathKit) return;    
    return this.booleanOperation(first, second, PathKit.PathOp.REVERSE_DIFFERENCE);
  }

  xor(first, second) {
    const PathKit = this.pathkit;
    if (!PathKit) return;
    return this.booleanOperation(first, second, PathKit.PathOp.XOR);
  }

  isValidPath(path) {
    const PathKit = this.pathkit;

    let pathKitPath = PathKit.FromSVGString(path);

    return pathKitPath.isValid();
  }

  /**
   * 2d Path 내부의 segment 를 합쳐준다. 
   * 
   * @param {string} path 
   * @returns 
   */
  simplify(path) {
    const PathKit = this.pathkit;    
    const pathObject = PathKit.FromSVGString(path);

    return pathObject.simplify().toSVGString();
  }

  stroke (path, opt = {width: 1, miter_limit: 4}) {
    const PathKit = this.pathkit;    
    const pathObject = PathKit.FromSVGString(path);

    return pathObject.stroke({ opt }).toSVGString();
  }

  round(path, opt = {width: 1, miter_limit: 4}) {
    return this.stroke(path, {
      ...opt,
      join: PathKit.StrokeJoin.ROUND
    });
  }

  grow(path, opt = {width: 1, miter_limit: 4}) {
    const PathKit = this.pathkit;   
    const pathObject = PathKit.FromSVGString(path);

    return pathObject.copy().stroke(opt).op(pathObject, PathKit.PathOp.DIFFERENCE).toSVGString();
  }

  shrink(path, opt = {width: 1, miter_limit: 4}) {
    const PathKit = this.pathkit;   
    const pathObject = PathKit.FromSVGString(path);

    const simplifyPath = pathObject.copy().simplify();
    return pathObject.copy().stroke(opt).op(simplifyPath, PathKit.PathOp.DIFFERENCE).toSVGString();
  }

  dash (path, on, off, phase = 1) {
    const PathKit = this.pathkit;   
    const pathObject = PathKit.FromSVGString(path);

    return pathObject.dash(on, off, phase).toSVGString();
  }

  trim(path, startT, stopT, isComplement = false) {
    const PathKit = this.pathkit;   
    const pathObject = PathKit.FromSVGString(path);

    console.log(pathObject.contains);

    return pathObject.trim(startT, stopT, isComplement).toSVGString();
  }
};