// Object
Object.values = Object.values || (obj => Object.keys(obj).map(key => obj[key]));

// RegExp
RegExp.escape = RegExp.escape || (str => { //$& means the whole matched string
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

// Assert
import { default as asst } from 'assert';
const _assert = asst || ((val, err) => {
    if (!val) { throw Error.isError(err) ? err : new Error(err); }
});
const _extErr = (err, status, opt = {}) => Object.assign(err, { status }, opt);
if (!globalThis.assert) {
    globalThis.assert = (value, message, status, options) => {
        try { return _assert(value, message); }
        catch (error) { throw _extErr(error, status, options); }
    };
    for (let i in _assert || {}) { assert[i] = _assert[i]; }
}

// Buffer
import { Buffer } from 'node:buffer';
globalThis.Buffer = globalThis.Buffer || Buffer;

// Is
const _is = (type, value) => value?.constructor === type;
const _type = (any) => typeof any === 'undefined' ? 'Undefined'
    : Object.prototype.toString.call(any).replace(/^\[[^\ ]*\ (.*)\]$/, '$1');
[ArrayBuffer, Boolean, Error, Number, Object, Set, String, BigInt].map(type => {
    const name = `is${type.name}`;
    type[name] = type[name] || (value => _is(type, value));
});
Date.isDate = Date.isDate || ((value, strict) => _is(Date, value) ? (
    strict ? value.toTimeString().toLowerCase() !== 'invalid date' : true
) : false);
Function.isFunction = Function.isFunction
    || (value => ['Function', 'AsyncFunction'].includes(_type(value)));

export default {};
