import { eventToPromise, on, once } from '../src/index';
import { EventEmitter } from 'events';

class FakeDOMEventEmitter {
  private listeners: any[] = [];
  emit(name: string) {
    this.listeners
      .filter(el => el.name === name)
      .forEach(el => el.fn());
  }
  addEventListener(name: string, fn: (...args: any[]) => void) {
    this.listeners.push({ name, fn });
  }
  removeEventListener(name: string, fn: (...args: any[]) => void) {
    const index = this.listeners.findIndex(el => el.name === name && el.fn === fn);
    if(index !== -1) {
      this.listeners.splice(index, 1);
    }
  }
  listenerCount() {
    return this.listeners.length;
  }
}

test('#on', () => {
  const domThing = new FakeDOMEventEmitter();
  let called1 = false;

  const off = on(domThing, 'test', () => {
    called1 = true;
  });

  expect(domThing.listenerCount()).toEqual(1);
  domThing.emit('test');
  expect(called1).toEqual(true);
  off();
  expect(domThing.listenerCount()).toEqual(0);
});

test('#once', () => {
  const domThing = new FakeDOMEventEmitter();
  let called1 = false;

  const off = once(domThing, 'test', () => {
    called1 = true;
  });

  expect(domThing.listenerCount()).toEqual(1);
  domThing.emit('test');
  expect(called1).toEqual(true);
  expect(domThing.listenerCount()).toEqual(0);
});

// TODO test timeout functionality
test('#eventToPromise', () => {
  const domThing = new FakeDOMEventEmitter();
  let called1 = false;

  const promise = eventToPromise(domThing, 'test', () => {
    called1 = true;
  });

  expect(domThing.listenerCount()).toEqual(1);

  setImmediate(() => {
    domThing.emit('test');
  });

  return promise.then(() => {
    expect(called1).toEqual(true);
    expect(domThing.listenerCount()).toEqual(0);
  });
});

test('#eventToPromise again', () => {
  const domThing = new FakeDOMEventEmitter();
  let called1 = false;

  const promise = eventToPromise(domThing, 'test', () => {
    return new Promise(res => {
      setTimeout(() => {
        called1 = true;
        res();
      }, 2);
    })
  });

  expect(domThing.listenerCount()).toEqual(1);

  setImmediate(() => {
    domThing.emit('test');
  });

  return promise.then(() => {
    expect(called1).toEqual(true);
    expect(domThing.listenerCount()).toEqual(0);
  });
});

test('node.js EventEmitter compatibility', () => {
  const emitter = new EventEmitter();
  let called1 = false;

  const off = on(emitter, 'test', () => {
    called1 = true;
  });

  expect(emitter.listenerCount('test')).toEqual(1);
  emitter.emit('test');
  expect(called1).toEqual(true);
  off();
  expect(emitter.listenerCount('test')).toEqual(0);
});
