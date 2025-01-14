import {
  LOAD, CLICK, DOUBLECLICK, PREVENT, STOP,
  FOCUSOUT, DOMDIFF, DRAGSTART, KEYDOWN,
  DRAGOVER, DROP, BIND, DRAGEND,
  SUBSCRIBE, SUBSCRIBE_SELF, THROTTLE, CONFIG
} from "el/sapa/Event";
import { iconUse, iconUseForPath } from "el/editor/icon/icon";
import { Length } from "el/editor/unit/Length";
import { KEY_CODE } from "el/editor/types/key";
import BaseProperty from "el/editor/ui/property/BaseProperty";

import './LayerTreeProperty.scss';
import Dom from 'el/sapa/functions/Dom';
import PathParser from 'el/editor/parser/PathParser';

const DRAG_START_CLASS = 'drag-start'

export default class LayerTreeProperty extends BaseProperty {

  getTitle() {
    return this.$i18n('layer.tree.property.title')
  }

  getClassName() {
    return 'full'
  }

  initState() {
    return {
      hideDragPointer: true,
      lastDragOverPosition: 0,
      lastDragOverOffset: 0,
      rootRect: { top: 0 },
      itemRect: { height: 0 }
    }
  }

  getBody() {
    return /*html*/`
      <div class="elf--layer-list scrollbar" ref="$layerList"></div>
      <div class='drag-point' ref='$dragPointer'></div>
    `;
  }

  [BIND('$dragPointer')]() {


    var offset = this.state.lastDragOverOffset
    var dist = this.state.itemRect.height / 3;
    var bound = {}

    if (this.state.lastDragOverOffset < dist) {
      offset = 0;

      var top = this.state.lastDragOverPosition + offset - this.state.rootRect.top

      bound = {
        top: top,
        height: '1px',
        width: '100%',
        left: '0px'
      }

      this.state.lastDragOverItemDirection = 'before';
    } else if (this.state.lastDragOverOffset > this.state.itemRect.height - dist) {
      offset = this.state.itemRect.height;

      var top = this.state.lastDragOverPosition + offset - this.state.rootRect.top

      bound = {
        top: top,
        height: '1px',
        width: '100%',
        left: '0px'
      }
      this.state.lastDragOverItemDirection = 'after';
    } else {
      const targetItem = this.$model.get(this.state.lastDragOverItemId)
      // 자식을 가지지 못하는 컴포넌트는 예외처리 
      if (targetItem?.enableHasChildren()) {

        offset = 0;

        var top = this.state.lastDragOverPosition + offset - this.state.rootRect.top

        bound = {
          top: top,
          height: this.state.itemRect.height,
          width: '100%',
          left: '0px'
        }
        this.state.lastDragOverItemDirection = 'self';
      }

    }

    bound.display = this.state.hideDragPointer ? 'none' : 'block';

    return {
      style: bound
    }
  }

  //FIXME: 개별 객체가 아이콘을 리턴 할 수 있도록 구조를 맞춰보자. 
  getIcon(item) {
    // return '';

    if (item.d) {
      const path = PathParser.fromSVGString(item.absolutePath().d)

      return iconUseForPath(path.scaleWith(24, 24).d, { width: 24, height: 24, fill: 'currentColor', stroke: 'currentColor' });
    }

    if (item.hasChildren()) {
      if (item.isLayout('flex')) {
        return iconUse("layout_flex");
      } else if (item.isLayout('grid')) {
        return iconUse("layout_grid");
      } 

      return iconUse("layout_default");
    }

    return this.$icon.get(item.itemType, item);
  }

  makeLayerList(parentObject, depth = 0) {
    if (!parentObject.layers) return '';

    const layers = parentObject.layers
    const data = []

    for (var last = layers.length - 1; last > -1; last--) {
      var layer = layers[last];

      var selectedPathClass = this.$selection.hasPathOf(layer) ? 'selected-path' : '';
      var selectedClass = this.$selection.check(layer) ? 'selected' : '';
      var hovered = this.$selection.checkHover(layer) ? 'hovered' : '';
      var name = layer.is('boolean-path') ? layer['boolean-operation'] : layer.name;

      if (layer.is('text')) {
        name = layer.text || layer.name
      }
      var title = '';

      if (layer.hasLayout()) {
        title = this.$i18n('layer.tree.property.layout.title.' + layer.layout)
      }

      const isHide = layer.isTreeItemHide()
      const depthPadding = depth * 20;
      const hasChildren = layer.hasChildren()
      const lock = this.$lockManager.get(layer.id);
      const visible = this.$visibleManager.get(layer.id);

      data[data.length] = /*html*/`        
        <div class='layer-item ${selectedClass} ${selectedPathClass} ${hovered}' data-is-group="${hasChildren}" data-depth="${depth}" data-layout='${layer.layout}' data-layer-id='${layer.id}' data-is-hide="${isHide}"  draggable="true">
          <div class='detail'>
            <label data-layout-title='${title}' style='padding-left: ${Length.px(depthPadding)}' > 
              <div class='folder ${layer.collapsed ? 'collapsed' : ''}'>${hasChildren ? iconUse('arrow_right') : ''}</div>
              <span class='icon' data-item-type="${layer.itemType}">${this.getIcon(layer)}</span> 
              <span class='name'>${name}</span>
            </label>
            <div class="tools">
              <button type="button" class="lock" data-lock="${lock}" title='Lock'>${lock ? iconUse('lock') : iconUse('lock_open')}</button>
              <button type="button" class="visible" data-visible="${visible}" title='Visible'>${iconUse('visible')}</button>
              <button type="button" class="remove" title='Remove'>${iconUse('remove2')}</button>                          
            </div>
          </div>
        </div>

        ${this.makeLayerList(layer, depth + 1)}
      `;
    }

    return data.join(' ');
  }

  [SUBSCRIBE('refreshContent')](arr) {
    this.refresh();
  }

  [LOAD("$layerList") + DOMDIFF]() {

    var project = this.$selection.currentProject;
    if (!project) return ''

    return [
      this.makeLayerList(project, 0), 
      /*html*/`
        <div class='layer-item ' data-depth="0" data-is-last="true">
        </div>
      `
    ]
  }

  [DRAGSTART('$layerList .layer-item')](e) {
    var layerId = e.$dt.attr('data-layer-id');
    e.$dt.addClass(DRAG_START_CLASS);
    e.dataTransfer.setData('layer/id', layerId);
    this.state.rootRect = this.refs.$layerList.rect()
    this.state.itemRect = e.$dt.rect();
    this.setState({
      hideDragPointer: false
    }, false)

    this.bindData('$dragPointer');
  }

  [DRAGEND('$layerList .layer-item')](e) {
    this.setState({
      hideDragPointer: true
    }, false)

    this.bindData('$dragPointer');

    this.refs.$layerList.$$(`.${DRAG_START_CLASS}`).forEach(it => {
      it.removeClass(DRAG_START_CLASS);
    })
  }

  [DRAGOVER(`$layerList .layer-item:not(.${DRAG_START_CLASS})`) + PREVENT](e) {
    var targetLayerId = e.$dt.attr('data-layer-id')
    // console.log({targetLayerId, x: e.offsetX, y: e.offsetY});

    this.state.lastDragOverItemId = targetLayerId;
    this.state.lastDragOverPosition = e.$dt.rect().top;
    this.state.lastDragOverOffset = e.offsetY;

    this.bindData('$dragPointer')

  }
  [DROP(`$layerList .layer-item:not(.${DRAG_START_CLASS})`)](e) {
    var targetLayerId = e.$dt.attr('data-layer-id')
    var sourceLayerId = e.dataTransfer.getData('layer/id');

    if (targetLayerId === sourceLayerId) return;

    var targetItem = this.$model.get(targetLayerId);
    var sourceItem = this.$model.get(sourceLayerId);

    // 자식을 가지지 못하는 컴포넌트는 예외처리 
    if (targetItem?.enableHasChildren() === false) return;
    if (targetItem && targetItem.hasParent(sourceItem.id)) return;

    switch (this.state.lastDragOverItemDirection) {
      case 'self':
        targetItem.appendChild(sourceItem);
        break;
      case 'before':
        targetItem.appendBefore(sourceItem);
        break;
      case 'after':
        targetItem.appendAfter(sourceItem);
        break;
    }

    this.$selection.select(sourceItem);

    this.setState({
      hideDragPointer: true
    })

    this.emit('refreshAll')

    this.nextTick(() => {
      this.emit('recoverBooleanPath');
    }, 10)

  }

  [DOUBLECLICK('$layerList .layer-item')](e) {
    this.startInputEditing(e.$dt.$('.name'))
  }



  modifyDoneInputEditing(input, event) {
    if (KEY_CODE.enter === event.keyCode) {
      this.endInputEditing(input, () => {
        var id = input.closest('layer-item').attr('data-layer-id');
        var text = input.text();

        this.emit('refreshItemName', id, text)
      });
    } else {
      var id = input.closest('layer-item').attr('data-layer-id');
      var text = input.text();

      this.emit('refreshItemName', id, text)
    }

  }

  [KEYDOWN('$layerList .layer-item .name') + STOP](e) {
    this.modifyDoneInputEditing(e.$dt, e);
  }

  [FOCUSOUT('$layerList .layer-item .name') + PREVENT + STOP](e) {
    this.modifyDoneInputEditing(e.$dt, { keyCode: KEY_CODE.enter });
  }

  selectLayer(layer) {

    if (layer) {
      this.$selection.select(layer)
    }

    this.refresh()
    this.emit('refreshSelection');
  }

  addLayer(layer) {
    if (layer) {
      this.$selection.select(layer);

      this.emit('refreshArtboard')
    }
  }

  [CLICK('$add')](e) {

    this.emit('newComponent', 'rect', {
      'background-color': '#ececec',
      width: 200,
      height: 100
    });
  }

  [CLICK('$layerList .layer-item label .name')](e) {

    var $item = e.$dt.closest('layer-item')
    $item.onlyOneClass('selected');

    var id = $item.attr('data-layer-id');
    this.$selection.select(id)

    this.command('refreshSelection');
  }

  [CLICK('$layerList .layer-item label .folder')](e) {
    var $item = e.$dt.closest('layer-item')
    var id = $item.attr('data-layer-id');
    var item = this.$model.get(id);

    item.reset({
      collapsed: !item.collapsed
    })

    this.refresh();

  }

  [CLICK('$layerList .layer-item .visible')](e) {
    var $item = e.$dt.closest('layer-item')
    var id = $item.attr('data-layer-id');

    this.$visibleManager.toggle(id);

    var visible = this.$visibleManager.get(id);
    e.$dt.attr('data-visible', visible);

    this.emit('refreshVisibleView');

  }

  [CLICK('$layerList .layer-item .remove')](e) {
    var $item = e.$dt.closest('layer-item')
    var id = $item.attr('data-layer-id');

    this.command('removeLayer', 'remove a layer', [id]);

    this.nextTick(() => {
      this.refresh();
    }, 1000)


    // this.emit('refreshArtboard');
  }


  [CLICK('$layerList .layer-item .lock')](e) {
    var $item = e.$dt.closest('layer-item')
    var id = $item.attr('data-layer-id');

    this.$lockManager.toggle(id);
    var lastLock = this.$lockManager.get(id);
    e.$dt.attr('data-lock', lastLock);

    // 클릭한게 lock 이고, selection 에 포함 되어 있으면 selection 영역에서 제외한다. 
    if (lastLock) {
      this.$selection.removeById(id);
      this.emit('refreshSelection');
    }
  }


  [SUBSCRIBE('changeHoverItem')]() {
    this.refs.$layerList.$$('.hovered').forEach(it => {
      it.removeClass('hovered')
    })


    if (this.$selection.hoverItems.length) {
      var selector = this.$selection.hoverItems.map(it => {
        return `[data-layer-id="${it.id}"]`
      }).join(',')
      this.refs.$layerList.$$(selector).forEach(it => {
        it.addClass('hovered')
      })
    }
  }


  [SUBSCRIBE_SELF('changeSelection')](isSelection = false) {
    if (isSelection && this.refs.$layerList) {
      this.refs.$layerList.$$('.selected').forEach(it => {
        it.removeClass('selected')
      })

      this.refs.$layerList.$$('.selected-path').forEach(it => {
        it.removeClass('selected-path')
      })

      var selector = this.$selection.items.map(it => {
        return `[data-layer-id="${it.id}"]`
      }).join(',')

      if (selector) {
        this.refs.$layerList.$$(selector).forEach(it => {

          it.addClass('selected')

          var item = this.$selection.itemKeys[it.attr('data-layer-id')]
          if (item.is('svg-path', 'svg-polygon')) {
            it.$('.icon').html(this.getIcon(item));
          }



        })
      }
    }
  }

  [SUBSCRIBE('refreshSelection')]() {
    this.refresh();
  }

  [SUBSCRIBE('refreshStylePosition')]() {
    this.trigger('changeSelection')
  }

  [SUBSCRIBE('refreshLayerTreeView') + THROTTLE(100)]() {
    this.refresh();
  }

  [SUBSCRIBE('changeItemLayout')]() {
    this.refresh();
  }

  [CONFIG('bodyEvent')]() {
    const $target = Dom.create(this.$config.get('bodyEvent').target);
    const $layerItem = $target.closest('layer-item');

    if ($layerItem) {
      this.emit('refreshHoverView', $layerItem.data('layer-id'));
    }
  }


}
