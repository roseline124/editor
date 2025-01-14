import EventMachine from "./EventMachine";
import { debounce, ifCheck, isArray, isFunction, isNotUndefined, makeRequestAnimationFrame, throttle } from "./functions/func";
import { uuidShort } from 'el/utils/math';

/**
 * @class BaseStore
 * @description BaseStore is the base class for all stores.
 * 
 */
export default class BaseStore {
  constructor(editor) {
    this.id = uuidShort();
    this.cachedCallback = {};
    this.callbacks = {};
    this.editor = editor;
    this.promiseProxy = new Proxy(this, {
      get: (target, key) => {
        return this.makePromiseEvent(key);
      }
    })
  }

  getCallbacks(event) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }

    return this.callbacks[event]
  }

  setCallbacks(event, list = []) {
    this.callbacks[event] = list;
  }

  debug(...args) {
    // if (this.editor && this.editor.config.get('debug')) {
    //   console.debug(...args);
    // }

  }

  /**
   * 메세지 등록 
   * 
   * @param {string} event 
   * @param {Function} originalCallback 
   * @param {EventMachine} context 
   * @param {number} debounceDelay 
   * @param {number} throttleDelay 
   * @param {boolean} enableAllTrigger
   * @param {boolean} enableSelfTrigger
   * @param {string[]} [beforeMethods=[]]
   * @returns {Function} off callback 
   */
  on(event, originalCallback, context, debounceDelay = 0, throttleDelay = 0, enableAllTrigger = false, enableSelfTrigger = false, beforeMethods = [], frame = false) {

    var callback = originalCallback;

    if (debounceDelay > 0) callback = debounce(originalCallback, debounceDelay);
    else if (throttleDelay > 0) callback = throttle(originalCallback, throttleDelay);

    if (beforeMethods.length) {
      callback = ifCheck(callback, context, beforeMethods);
    }

    if (frame) {
      // 모든 이벤트는 requestAnimationFrame 을 통과하도록 한다.
      callback = makeRequestAnimationFrame(callback, context);
    }

    this.getCallbacks(event).push({ event, callback, context, originalCallback, enableAllTrigger, enableSelfTrigger });

    this.debug('add message event', event, context.sourceName);

    return () => {
      this.off(event, originalCallback);
    }
  }

  /**
   * 메세지 해제
   * 
   * @param {string} event 
   * @param {*} originalCallback 
   */
  off(event, originalCallback) {

    this.debug('off message event', event);

    if (arguments.length == 1) {
      this.setCallbacks(event);
    } else if (arguments.length == 2) {
      this.setCallbacks(event, this.getCallbacks(event).filter(f => {
        return f.originalCallback !== originalCallback
      }));
    }
  }

  offAll(context) {

    Object.keys(this.callbacks).forEach(event => {
      this.setCallbacks(event, this.getCallbacks(event).filter(f => {
        return f.context !== context;
      }))
    })
    this.debug('off all message', context.sourceName);
  }

  getCachedCallbacks(event) {
    return this.getCallbacks(event);
  }

  /**
   * 메세지를 promise 형태로 쓸 수 있도록 proxy 객체를 리턴한다. 
   * 
   * @returns {Proxy}
   */
  get promise() {
    return this.promiseProxy;
  }

  get p () {
    return this.promise;
  }

  /**
   * 등록된 메세지를 Promise 로 만들어준다. 
   * 
   * this.emit("message", 1, 2, 3); 
   * 
   * 형태로 사용하던 것을 
   * 
   * this.promise.message(1, 2, 3).then(() => { })
   * 
   * 또는 
   * 
   * var a = await this.promise.message(1, 2, 3);
   * 
   * 형태로 사용할 수 있다. 
   * 
   * 몇가지 상황에서 유용하다. 
   * 
   * 1. message 가 리턴 값을 가지고 있을 때 
   * 2. message 가 동작 완료 후 다른 동작을 하고 싶을 때 
   * 
   * @param {string} event 
   * @returns {Promise}
   */
  makePromiseEvent(event) {

    var list = this.getCachedCallbacks(event);
    const source = this.source;

    return (...args) => Promise.all(
      list.filter(f => {
        return !f.enableSelfTrigger
      }).filter(f => {
        return f.enableAllTrigger || f.originalCallback.source !== source
      }).map(f => {
        return new Promise((resolve, reject) => {
          resolve(f.callback.apply(f.context, args));
        })
      })
    )
  }

  sendMessage(source, event, ...args) {
    this.sendMessageList(source, [
      [event, ...args]
    ]);
  }

  /**
   * 
   * run multi messages
   * 
   * message.callback can has a return value.  
   * 
   * if return value is false then message will be skip.
   * if return value is function then message will be skip after run return function.
   * 
   * @param {string} source 
   * @param {Command[]} messages 
   */
  sendMessageList(source, messages = []) {
    Promise.resolve().then(() => {
      messages.forEach(([event, ...args]) => {
        var list = this.getCachedCallbacks(event);
        if (list && list.length) {

          const runnableFunctions = list
            .filter(f => !f.enableSelfTrigger)
            .filter(f => f.enableAllTrigger || f.originalCallback.source !== source)

          for (const f of runnableFunctions) {
            const result = f.callback.apply(f.context, args)

            if (isNotUndefined(result)) {
              if (result === false) {
                return;
              } else if (isFunction(result)) {
                result();
                return;
              }
            }
          }
        } else {
          console.warn(`message event ${event} is not exist.`)
        }
      });
    });
  }

  nextSendMessage(source, callback, ...args) {
    Promise.resolve().then(() => {
      callback(...args)
    });
  }

  triggerMessage(source, event, ...args) {
    Promise.resolve().then(() => {
      var list = this.getCachedCallbacks(event);

      if (list) {

        const runnableFunctions = list.filter(f => f.originalCallback.source === source)

        runnableFunctions.forEach(f => {
            f.callback.apply(f.context, args)
        });
      } else {
        console.warn(event, ' is not valid event');
      }
    });
  }

  emit(event, ...args) {

    if (isFunction(event)) {
      event(...args);
    } else if (isArray(event)) {
      this.sendMessageList(this.source, event);
    } else {
      this.sendMessage(this.source, event, ...args);
    }

  }

  /**
   * 마이크로 Task 를 실행 
   * 
   * @param {Function} callback  마이크로Task 형식으로 실행될 함수 
   */
  nextTick(callback) {
    this.nextSendMessage(this.source, callback);
  }

  trigger(event, ...args) {

    if (isFunction(event)) {
      event(...args);
    } else {
      this.triggerMessage(this.source, event, ...args);
    }

  }
}
