import {
  CHECK_SAPARATOR,
  CHECK_LOAD_PATTERN,
  LOAD_SAPARATOR,
  DOMDIFF,
  MAGIC_METHOD,
} from "./Event";
import Dom from "./functions/Dom";
import {
  isFunction,
  // Array.isArray,
  html,
  keyEach,
  collectProps,
} from "./functions/func";

import DomEventHandler from "./handler/DomEventHandler";
import BindHandler from "./handler/BindHandler";
import { getVariable, hasVariable, recoverVariable, retriveElement, spreadVariable, variable } from "./functions/registElement";
import { uuid } from "./functions/uuid";
import { isObject } from 'el/sapa/functions/func';
import CallbackHandler from "./handler/CallbackHandler";

const REFERENCE_PROPERTY = "ref";
const TEMP_DIV = Dom.create("div");
const QUERY_PROPERTY = `[${REFERENCE_PROPERTY}]`;
const REF_CLASS = 'refclass';
const REF_CLASS_PROPERTY = `[${REF_CLASS}]`




export default class EventMachine {
  constructor(opt, props) {

    this.state = {};
    this.prevState = {};
    this.refs = {};
    this.children = {};
    this._bindings = [];
    this.id = uuid();    
    this.handlers = this.initializeHandler()
    this._localTimestamp = 0;

    this.initializeProperty(opt, props);

    this.initComponents();
  }

  get _timestamp() {
    return this._localTimestamp++;
  }

  /**
   * for svelte variable 
   */
  get target() {
    return this.$el.el;
  }

  /**
   * UIElement instance 에 필요한 기본 속성 설정 
   */
  initializeProperty (opt, props = {}) {

    this.opt = opt || {};
    this.parent = this.opt;
    this.props = props;
    this.source = uuid();
    this.sourceName = this.constructor.name;  
  }

  initComponents() {
    this.childComponents = this.components() 
  }

  initializeHandler () {
    return [
      new BindHandler(this),
      new DomEventHandler(this),
      new CallbackHandler(this)
    ]
  }

  /**
   * state 를 초기화 한것을 리턴한다. 
   * 
   * @protected
   * @returns {Object} 
   */
  initState() {
    return {};
  }

  /**
   * state 를 변경한다. 
   * 
   * @param {Object} state  새로운 state 
   * @param {Boolean} isLoad  다시 로드 할 것인지 체크 , true 면 state 변경후 다시 로드 
   */
  setState(state = {}, isLoad = true) {
    this.prevState = this.state;
    this.state = Object.assign({}, this.state, state );
    if (isLoad) {
      this.load();
    }
  }

  /**
   * state 에 있는 key 필드의 값을 토글한다. 
   * Boolean 형태의 값만 동작한다. 
   * 
   * @param {string} key 
   * @param {Boolean} isLoad 
   */
  toggleState(key, isLoad = true) {
    this.setState({
      [key]: !(this.state[key])
    }, isLoad)
  }

  /**
   * object 값을 그대로 key, value 형태로 넘기기 위한 함수
   * 
   * @param {Object} obj
   * @returns {string} `key=value` 형태의 문자열 리스트 
   */ 
  apply(obj) {
    return spreadVariable(obj);
  }


  /**
   * 객체를 다시 그릴 때 사용한다. 
   * 
   * @param {KeyValue} props 
   * @param {Dom} [$container=null] $container 가 존재하면 render 를 같이 한다. 
   * @protected
   */
  _reload(props, $container = null) {

    if ($container) {
      this.render($container);
    }

    this.props = props;
    this.state = {}; 
    this.setState(this.initState(), false);
    this.refresh(true);
  }

  /**
   * template 을 렌더링 한다. 
   * 
   * @param {Dom|undefined} $container  컴포넌트가 그려질 대상 
   */
  render($container) {
    this.$el = this.parseTemplate(
      html`
        ${this.template()}
      `
    );
    this.refs.$el = this.$el;

    if ($container) {
      $container.append(this.$el);
    }

    // LOAD 로 정의된 것들을 수행한다. 
    this.load();

    // render 이후에 실행될 콜백을 정의한다. 
    this.afterRender();
  }

  initialize() {
    this.state = this.initState();
  }

  /**
   * render 이후에 실행될 함수 
   * dom 이 실제로 생성된 이후에 수행할 작업들을 정의한다. 
   * 
   * @protected
   */
  afterRender() {}

  /**
   * 하위에 연결될 객체들을 정의한다 
   * 
   * @protected
   * @returns {Object}
   */
  components() {
    return {};
  }

  /**
   * ref 이름을 가진 Component 를 가지고 온다. 
   * 
   * @param  {any[]} args 
   * @returns {EventMachine}
   */
  getRef(...args) {
    const key = args.join('')
    return this.refs[key];
  }

  /**
   * template() 함수의 결과물을 파싱해서 dom element 를 생성한다. 
   * 
   * @param {string} html 
   * @param {Boolean} [isLoad=false] 
   */
  parseTemplate(html, isLoad) {
    /////////////////////////////////////////////////////////////////
    //FIXME: html string, element 형태 모두 array 로 받을 수 있도록 해보자. 
    if (Array.isArray(html)) {
      html = html.join('');
    }

    html = html.trim();
    const list = TEMP_DIV.html(html).children();
    ///////////////////////////////////////////////////////////////

    for(var i = 0, len = list.length; i < len; i++) {
      const $el = list[i];

      var ref = $el.attr(REFERENCE_PROPERTY)
      if (ref) {
        this.refs[ref] = $el;
      }

      var refs = $el.$$(QUERY_PROPERTY);
      var temp = {} 

      for(var refsIndex = 0, refsLen = refs.length; refsIndex < refsLen; refsIndex++) {
        const $dom = refs[refsIndex];

        const name = $dom.attr(REFERENCE_PROPERTY);
        if (temp[name]) {
          console.warn(`${ref} is duplicated. - ${this.sourceName}`, this)
        } else {
          temp[name] = true; 
        }

        this.refs[name] = $dom;             
      }
    }

    if (!isLoad) {
      return list[0];
    }

    return TEMP_DIV.createChildrenFragment();
  }

  /**
   * $dom 에 있는 props, children 정보만 가지고 온다. 
   * 
   * 이것을 가지고 오는 이유는  중첩된 컴포넌트 내에서 하위 컴포넌트를 찾기 위해서이다.
   * 
   * ps.
   * 
   * 조회만 하기 때문에 getVariable()로 값만 조회한다. 
   * 
   * @param {Dom} $dom 
   * @returns 
   */
  parsePropertyInfo ($dom) {
    let props = {};

    // parse properties 
    for(var t of $dom.el.attributes) {

      // 속성값이 없고, 속성 이름이 참조 변수 일 때는  그대로 보여준다. 
      if (hasVariable(t.nodeName)) {
        const recoveredValue = getVariable(t.nodeName);
        if (isObject(recoveredValue)) {
          props = Object.assign(props, recoveredValue)     
        } else {
          props[t.nodeName] = getVariable(t.nodeValue);                    
        }

      } else {
        props[t.nodeName] = getVariable(t.nodeValue);          
      }
    }

    // 하위 html 문자열을 props.content 로 저장한다. 
    const content = $dom.html()
    if (content) {
      props.content = content;
      props.contentChildren = this.parseContent(props.content)
    }

    return props;
  }

  parseSourceName(obj) {

    if (obj.parent) {
      return [obj.sourceName, ...this.parseSourceName(obj.parent)]
    }

    return [obj.sourceName]
  }

  getEventMachineComponent (refClassName) {
    var EventMachineComponent = retriveElement(refClassName) || this.childComponents[refClassName];

    return EventMachineComponent;
  }


  createInstanceForComponent (EventMachineComponent, targetElement, props) {
    // external component 
    if (EventMachineComponent.__proto__.name === 'ProxyComponent') {
      return new EventMachineComponent({target: targetElement, props});
    }

    // return sapa component 
    return new EventMachineComponent(this, props);
  }  

  renderComponent({ $dom, refName, component, props }) {
    var instance = null; 

    // 동일한 refName 의 EventMachine 이 존재하면  해당 컴포넌트는 다시 그려진다. 
    // 루트 element 는 변경되지 않는다. 
    if (this.children[refName]) {

      // FIXME: svelte 컴포넌트를 어떻게 재로드 할지 고민해야함 
      instance = this.children[refName] 
      instance.__timestamp = this._localTimestamp;
      instance._reload(props);
    } else {
      instance = this.createInstanceForComponent(component, $dom.$parent.el, props);
      instance.__timestamp = this._localTimestamp;

      this.children[refName || instance.id] = instance;

      if (isFunction(instance.render)) {
        instance.render();

      } else {
        // NOOP
        // console.log(instance);
      }

    }
    

    if (instance.renderTarget) {
      instance.$el?.appendTo(instance.renderTarget);
      $dom.remove();
    } else if (instance.$el) {
      $dom.replace(instance.$el);     
    } else {
      // EventMachine 의 renderTarget 또는 $el 이 없으면
      // renderTarget 과 유사하지만 appendTo 를 하지 않는다.
      $dom.remove();
    }
  }

  /**
   * 특정 html 의 자식 컴포넌트(EventMachine)의 정보를 가지고 온다. 
   * 
   * @param {string} html 
   * @param {string[]} filteredRefClass 
   * @returns {object[]}  - { refName, EventMachineComponent, props, $dom, refClass }
   */
  parseContent(html, filteredRefClass = []) {
    return Dom.create('div').html(html).children().map($dom => {
      return this._getComponentInfo($dom)
    }).filter(it => filteredRefClass.length === 0 ? true : filteredRefClass.includes(it.refClass))
  }

  /**
   * component 정보 얻어오기 
   * 
   * @param {Dom} $dom 
   * @returns {Object}
   */
  _getComponentInfo ($dom) {

    const refClass = $dom.attr(REF_CLASS);
    const EventMachineComponent = this.getEventMachineComponent(refClass)

    if (EventMachineComponent) {
      let props = this.parsePropertyInfo($dom);

      // get component class name
      let refName = $dom.attr(REFERENCE_PROPERTY);

      return { 
        $dom,
        refClass,
        props,
        // variable 로 props 를 지정했을 수도 있기 때문에 props.ref 도 같이 사용한다. 
        refName: refName || props.ref, 
        component: EventMachineComponent
      }
    } else {
      return {
        notUsed: true, 
        $dom,
      }
    }
  }

  /**
   * element 를 기준으로 내부 component 리스트를 생성한다. 
   * 
   * @return {object[]}
   */ 
   getComponentInfoList($el) {

    if (!$el) return [];

    const children = []

    // 하위에 refclass 를 가진 element 중에 마지막 지점인 컴포넌트만 조회한다. 
    // 부모에 refclass 를 가지고 있는 경우는 그 다음 컴포넌트로 넘겨서 생성한다. 
    // 이렇게 하지 않으면 최상위 부모에서 모든 하위 refclass 를 컴포넌트로 생성해버리는 문제가 생긴다. 
    let targets = $el.$$(REF_CLASS_PROPERTY).filter(it => {
      return it.path().filter(a =>{
        return a.attr(REF_CLASS)
      }).length === 1
    })

    targets.forEach($dom => {
      children.push(this._getComponentInfo($dom));
    })

    return children; 
  }

  parseComponent() {
    const $el = this.$el;

    const componentList = this.getComponentInfoList($el);

    componentList.forEach(comp => {
      if (comp.notUsed) {
        comp.$dom.remove();
      } else {
        this.renderComponent(comp);
      }  
    })

    keyEach(this.children, (key, child) => {
      if (child.__timestamp !== this._localTimestamp) {
        child.clean();
      }
    })
  }

  clean () {
    if (this.$el && !this.$el.hasParent()) {

      keyEach(this.children, (key, child) => {
        if (isFunction(child?.clean)) {
          child.clean();
        }
      })

      this.destroy();  

      this.$el = null;
      return true; 
    }
  }

  /**
   * refresh 는 load 함수들을 실행한다. 
   */
  refresh() {
    this.load()
  }

  _afterLoad () {

    // timestamp 기록 
    this._timestamp;

    this.runHandlers('initialize');

    this.bindData();

    this.parseComponent();
  }

  async load(...args) {
    if (!this._loadMethods) {
      this._loadMethods = this.filterProps(CHECK_LOAD_PATTERN);
    }

    // loop 가 비동기라 await 로 대기를 시켜줘야 나머지 html 업데이트에 대한 순서를 맞출 수 있다. 
    const localLoadMethods = this._loadMethods.filter(callbackName => {
        const elName = callbackName.split(LOAD_SAPARATOR)[1]
                                  .split(CHECK_SAPARATOR)
                                  .map(it => it.trim())[0];
        if (!args.length) return true; 
        return args.indexOf(elName) > -1
      })



    await localLoadMethods.forEach(async (callbackName) => {
      let methodName = callbackName.split(LOAD_SAPARATOR)[1];
      var [elName, ...checker] = methodName.split(CHECK_SAPARATOR).map(it => it.trim())

      checker = checker.map(it => it.trim())
      
      const isDomDiff = Boolean(checker.filter(it => DOMDIFF.includes(it)).length);
      const refTarget = this.refs[elName];
      if (refTarget) {        
        var newTemplate = await this[callbackName].apply(this, args);

        if (Array.isArray(newTemplate)) {
          newTemplate = newTemplate.join('');
        }

        // create fragment 
        const fragment = this.parseTemplate(html`${newTemplate}`, true);
        if (isDomDiff) {
          refTarget.htmlDiff(fragment);
        } else {
          if (refTarget) { 
            refTarget.html(fragment);
          }
        }

      }
    });

    this._afterLoad();

  }

  runHandlers(func = 'run', ...args) {
    this.handlers.forEach(h => h[func](...args));
  }

  bindData (...args) {
    this.runHandlers('load', ...args);
  }

  // 기본 템플릿 지정
  template() {
    return `<div></div>`;
  }

  eachChildren(callback) {
    if (!isFunction(callback)) return;

    keyEach(this.children, (_, Component) => {
      callback(Component);
    });
  }

  rerender () {
    var $parent = this.$el.parent();
    this.destroy();
    this.render($parent);  
  }

  /**
   * 자원을 해제한다.
   * 이것도 역시 자식 컴포넌트까지 제어하기 때문에 가장 최상위 부모에서 한번만 호출되도 된다.
   * 
   */
  destroy() {
    this.eachChildren(childComponent => {
      childComponent.destroy();
    });

    this.runHandlers('destroy');
    if (this.$el) {
      this.$el.remove();
    }

    this.$el = null; 
    this.refs = {} 
    this.children = {} 
  }

  /**
   * property 수집하기
   * 상위 클래스의 모든 property 를 수집해서 리턴한다.
   * 
   * @returns {string[]} 나의 상위 모든 메소드를 수집해서 리턴한다. 
   */
  collectProps() {

    if (!this.__cachedMethodList){
      this.__cachedMethodList = collectProps(this, (name) => {
        return name.indexOf(MAGIC_METHOD) === 0; 
      });
    }

    return this.__cachedMethodList;
  }

  filterProps(pattern) {
    return this.collectProps().filter(key => {
      return key.match(pattern);
    });
  }

  /* magic check method  */

  self(e) {
    return e && e.$dt && e.$dt.is(e.target);
  }
  isAltKey(e) {
    return e.altKey;
  }
  isCtrlKey(e) {
    return e.ctrlKey;
  }
  isShiftKey(e) {
    return e.shiftKey;
  }
  isMetaKey(e) {
    return e.metaKey || e.key == 'Meta' || e.code.indexOf('Meta') > -1 ;
  }
  isMouseLeftButton(e) {
    return e.buttons === 1;     // 1 is left button 
  }

  isMouseRightButton(e) {
    return e.buttons === 2;     // 2 is right button 
  }  

  hasMouse(e) { 
    return e.pointerType === 'mouse';
  }

  hasTouch(e) {
    return e.pointerType === 'touch';
  }

  hasPen(e) {
    return e.pointerType === 'pen';
  }  

  /** before check method */

  /* after check method */

  preventDefault(e) {
    e.preventDefault();
    return true;
  }

  stopPropagation(e) {
    e.stopPropagation();
    return true;
  }
}
