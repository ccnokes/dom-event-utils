export type Callback = (...args: any[]) => void

// minimal representation of methods we need from an event emitter
export interface IEmitter {
  addEventListener?(type: string, listener: any): void
  removeEventListener?(type: string, listener: any): void
  addListener?(type: string, listener: any): void
  removeListener?(type: string, listener: any): void
  on?(type: string, listener: any): void
  off?(type: string, listener: any): void
}

// The "Promise executor" function, copied from the DOM types lib
export type Executor<T> = (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void



// must resolve by `timeout` or it's rejected
export function timedPromise<T>(fn: Executor<T>, timeout: number) {
  return new Promise<T>((resolve, reject) => {
    let timerId = setTimeout(() => {
      reject(`Timed out after ${timeout}ms`);
    }, timeout);

    fn((val) => {
      clearTimeout(timerId);
      resolve(val);
    }, (msg) => {
      clearTimeout(timerId);
      reject(msg);
    });
  });
}

function makeTimedOrNormalPromise<T>(fn: Executor<T>, timeout?: number) {
  if (timeout != null) {
    return timedPromise<T>(fn, timeout);
  } else {
    return new Promise<T>(fn);
  }
}

export function eventToPromise<T>(target: IEmitter, eventName: string, fn: Callback, timeout?: number): Promise<T> {
  return makeTimedOrNormalPromise<T>((resolve) => {
    once(target, eventName, (...args) => {
      const ret = fn.apply(null, args);
      if (ret && ret.then) {
        return ret.then(resolve);
      } else {
        resolve();
      }
    });
  }, timeout);
}

export function on(target: IEmitter, eventName: string, fn: Callback): VoidFunction {
  callOn(target, eventName, fn);
  return () => {
    callOff(target, eventName, fn);
  };
}

export function once(target: IEmitter, eventName: string, fn: Callback): VoidFunction {
  const off = on(target, eventName, (...args) => {
    fn.apply(null, args);
    off();
  });
  return off;
}

// adapt eventemitter3 and node.js style event emitters too
function callOn(target: IEmitter, eventName: string, fn: Callback) {
  if (target.on) {
    target.on(eventName, fn);
  }
  else if (target.addEventListener) {
    target.addEventListener(eventName, fn);
  }
  else if (target.addListener) {
    target.addListener(eventName, fn);
  }
  else {
    throw new TypeError(`Cannot find "on"-like method on event emitter, emitting event "${eventName}"`);
  }
}

function callOff(target: IEmitter, eventName: string, fn: Callback) {
  if (target.off) {
    target.off(eventName, fn);
  }
  else if (target.removeEventListener) {
    target.removeEventListener(eventName, fn);
  }
  else if (target.removeListener) {
    target.removeListener(eventName, fn);
  }
  else {
    throw new TypeError(`Cannot find "off"-like method on event emitter, emitting event "${eventName}"`);
  }
}
