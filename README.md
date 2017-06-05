# Live-require

A module which allows you to require and try out npm modules directly without `npm install`-ing them first.

# Examples

```javascript
const validUrl = lrequire('valid-url');
```
----
```javascript
const validUrl = lrequire('github.com/ogt/valid-url');
```
----
```javascript
const validUrl = lrequire('npmjs.com/package/valid-url');
```