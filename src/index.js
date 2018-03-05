"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// must resolve by `timeout` or it's rejected
function timedPromise(fn, timeout) {
    return new Promise(function (resolve, reject) {
        var timerId = setTimeout(function () {
            reject("Timed out after " + timeout + "ms");
        }, timeout);
        fn(function (val) {
            clearTimeout(timerId);
            resolve(val);
        }, function (msg) {
            clearTimeout(timerId);
            reject(msg);
        });
    });
}
exports.timedPromise = timedPromise;
function makeTimedOrNormalPromise(fn, timeout) {
    if (timeout != null) {
        return timedPromise(fn, timeout);
    }
    else {
        return new Promise(fn);
    }
}
;
function eventToPromise(target, eventName, fn, timeout) {
    return makeTimedOrNormalPromise(function (resolve) {
        once(target, eventName, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            fn.apply(null, args);
            resolve();
        });
    }, timeout);
}
exports.eventToPromise = eventToPromise;
function on(target, eventName, fn) {
    target.addEventListener(eventName, fn);
    return function () {
        target.removeEventListener(eventName, fn);
    };
}
exports.on = on;
function once(target, eventName, fn) {
    var off = on(target, eventName, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        fn.apply(null, args);
        off();
    });
    return off;
}
exports.once = once;
