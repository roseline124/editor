
import { Length } from 'el/editor/unit/Length';
import PathParser from 'el/editor/parser/PathParser';
export default {
    command: 'convert.stroke.to.path',
    execute: async (editor, text) => {
        const current = editor.selection.current;

        if (!current) return;

        const attrs = current.attrs('d', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linejoin', 'stroke-linecap');
        const pathAttrs = current.convertStrokeToPath()
  
        let newD = editor.pathKitManager.stroke(current.d || attrs.d, {
          'stroke-width': Length.parse(attrs['stroke-width']).value,
          'stroke-linejoin': attrs['stroke-linejoin'],
          'stroke-linecap': attrs['stroke-linecap'],
          'stroke-dasharray': attrs['stroke-dasharray'],
          'stroke-dashoffset': attrs['stroke-dashoffset'],        
          'fill-rule': 'nonezero',
        });
  
        pathAttrs['fill-rule'] = 'nonzero';
  

        // 중간단계 포인트를 역순으로 저장
        newD = PathParser.fromSVGString(newD).reversePathStringByFunc((_, index) => index % 2 === 0);

  
        editor.command('addLayer', `add layer - path`, editor.createModel({
          ...pathAttrs,
          ...current.updatePath(newD),
        }), true, current.parent)      
    }
}