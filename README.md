# dom-event-utils

Very small library that makes working with DOM event emitters API a little easier to work with. These are all common utilities that I find myself reaching for, regardless of the framework I'm in.

### Methods

`eventToPromise` - convert an event to a promise that resolves once it's called.
For example:

```javascript
import { eventToPromise } from 'dom-event-utils';

function createPopup() {
  const popup = window.open('/my-popup');
  return eventToPromise(popup, 'load', () => {
    // do stuff here
    return popup;
  }, 10000); //timeout is optional. If reached, it'll reject the promise
}
```

`on` - just like `addEventListener`, but returns an unsubscribe function.
```javascript
import { on } from 'dom-event-utils';

const off = on(document.querySelector('.btn'), 'click', () => { /* click handler */ });
//...later, somewhere else...
off();
```

`once` - only called once and then unsubscribed from the event source
```javascript
import { once } from 'event-utils';

once(document, 'DOMContentLoaded', () => {
  //...do things here
});
```
