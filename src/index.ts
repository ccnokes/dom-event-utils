export type Callback = (...args: any[]) => void

// just alias it for nicer type hints
export type UnsubscribeFunction = VoidFunction

// minimal representation of an event emitter
export interface ITarget {
  addEventListener(type: string, listener: any): void
  removeEventListener(type: string, listener: any): void
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

export function eventToPromise<T>(target: ITarget, eventName: string, fn: Callback, timeout?: number): Promise<T> {
  return makeTimedOrNormalPromise<T>((resolve) => {
    once(target, eventName, (...args) => {
      fn.apply(null, args);
      resolve();
    });
  }, timeout);
}

export function on(target: ITarget, eventName: string, fn: Callback): UnsubscribeFunction {
  target.addEventListener(eventName, fn);
  return () => {
    target.removeEventListener(eventName, fn);
  };
}

export function once(target: ITarget, eventName: string, fn: Callback): UnsubscribeFunction {
  const off = on(target, eventName, (...args) => {
    fn.apply(null, args);
    off();
  });
  return off;
}
