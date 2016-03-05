/**
 * 一个微型Model模块
 * @author  margox
 * @version 1.1.5
 * @date    2015/06
 */

(function(root, factory){

    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root.badModel = factory();
    }

})(window,function() {

    "use strict";

    var _badModel = {},
        _data = {},
        _originData = {},
        _events = {};

    /**
     * 基于现有数据来初始化
     * @param {object} data 需要传入的JSON数据
     * @return {object} [description]
     */
    function _init(data) {

        var _item;

        data = typeof data === "object" ? data : {};
        _originData = _clone(data);

        for (_item in data) {

            if (data.hasOwnProperty(_item)) {
                _nestedSet(_item, data[_item]);
            }

        }

        return _badModel;

    }

    /**
     * 设置一个属性的值,如果没有,则新增属性
     * @param {string} property 属性名称
     * @param {*} value       属性值,可以是任何合法的类型
     * @return {object}         返回_badModel对象以便于链式操作
     * @uses _nestedSet("object-name","name")/_nestedSet("object.name","name");
     */
    function _nestedSet(property, value) {

        var propNames, propLength, tempObj, tempProp, _item;

        if (typeof property === "string") {

            propNames = property.split('.');
            propLength = propNames.length - 1;
            tempObj = _data;

            for (var i = 0; i <= propLength; i++) {

                if (i !== propLength) {
                    tempObj = tempObj[propNames[i]] = tempObj[propNames[i]] || {}
                } else {
                    tempObj = tempObj[propNames[i]] = value;
                }

                tempProp = propNames.slice(0, i).join(".");
                _trigger("change", tempProp, _nestedGet(tempProp));

            }

            _trigger("change", property, value);

        } else if (typeof property === "object") {

            for (_item in property) {

                if (property.hasOwnProperty(_item)) {
                    _nestedSet(_item, property[_item]);
                }

            }

        }

        return _badModel;

    }

    /**
     * 往一个数组类型的值中push一个元素
     * @param property
     * @param value
     * @returns {{}}
     * @private
     */
    function _push(property, value) {

        var _item = _nestedGet(property);

        if (_item instanceof Array) {

            _item.push(value);
            _nestedSet(property, value);

        }

        return _badModel;

    }

    /**
     * 交替改变一个值的属性(非布尔值将被转换为布尔值)
     * @param property
     * @returns {Object}
     * @private
     */
    function _toggle(property) {

        return _nestedSet(property, !_nestedGet(property));

    }

    /**
     * 获取属性值
     * @param  {string} property      属性名称
     * @return {object}               可以是任意合法的数据
     * @uses _nestedGet("object-name")//_nestedGet("object.name")
     */
    function _nestedGet(property) {

        var _path = property.split(".");
        var _pathDepth = _path.length;
        var _objTemp = arguments[1] ? _originData : _data;

        for (var _i = 0; _i <= _pathDepth; _i++) {

            if (_i === _pathDepth) {
                return _objTemp;
            } else {

                if (typeof _objTemp[_path[_i]] === "undefined") {
                    return null;
                }

                _objTemp = _objTemp[_path[_i]];

            }

        }

    }

    /**
     * 重置所有或指定属性
     * @param  {string} property 属性名称,不填写则重置所有
     * @return {object}          返回_badModel对象以便于链式操作
     */
    function _reset(property) {

        if (_trigger("beforereset", "__self__", property) === false) {
            return false;
        }

        if (typeof property === "undefined") {

            //_data = _clone(_originData);
            _init(_originData);
            _trigger("reset", "__self__");

        } else if (typeof property === "string") {

            _nestedSet(property, _nestedGet(property, true));
            _trigger("reset", property);

        }

        return _badModel;

    }

    /**
     * 执行注册在一个对象上的事件
     * @param  {string} eventName   事件名称
     * @param  {string} eventTarget 对象名称
     * @return {object}             返回_badModel对象以便于链式操作
     */
    function _trigger(eventName, eventTarget) {


        var _arguments = typeof arguments[2] !== "undefined" ? arguments[2] : null;
        var _returnFalse = false,
            _return;

        if (_events.hasOwnProperty(eventTarget) && _events[eventTarget].hasOwnProperty(eventName) && (_events[eventTarget][eventName] instanceof Array)) {

            _events[eventTarget][eventName].forEach(function (callback) {

                _return = (callback)(_arguments);
                _return === false && (_returnFalse = true);

            });

        }

        return _returnFalse ? false : _badModel;

    }

    /**
     * 注册一个事件到指定标识上
     * @param  {string}   eventName   事件名称
     * @param  {string}   eventTarget 标识名称
     * @param  {Function} callback    回调函数
     * @return {object}               返回_badModel对象以便于链式操作
     */
    function _on(eventName, eventTarget, callback) {

        if (typeof eventName === "object") {

            _renderEvents(eventName);

        } else if (typeof eventTarget === "string" && typeof eventName === "string" && typeof callback === "function") {

            _events[eventTarget] || (_events[eventTarget] = {});
            _events[eventTarget][eventName] || (_events[eventTarget][eventName] = []);
            _events[eventTarget][eventName].push(callback);

        }

        return _badModel;

    }

    /**
     * 注销一个标识上绑定的所有事件或指定事件
     * @param  {string} eventTarget 标识名称
     * @param  {string} eventName   事件名称,不填写则注销所有事件
     * @return {object}             返回_badModel对象以便于链式操作
     */
    function _off(eventTarget, eventName) {

        if (typeof eventTarget === "string") {

            if (typeof eventName !== "undefined") {
                _events.hasOwnProperty(eventTarget) && _events[eventTarget].hasOwnProperty(eventName) && (delete _events[eventTarget][eventName]);
            } else {
                _events.hasOwnProperty(eventTarget) && (delete _events[eventTarget]);
            }

        }

        return _badModel;

    }

    /**
     * 清除所有事件
     */
    function _offAll() {

        var _selfEvents = _events.__self__;

        _events = {};
        _events.__self__ = _selfEvents;

    }

    /**
     * 指定当重置全部属性后的回调
     * @param  {Function} callback 回调函数
     * @return {object}            返回_badModel对象以便于链式操作
     */
    function _onResetAll(callback) {

        _on("reset", "__self__", callback);

        return _badModel;

    }

    /**
     * 内部方法,用于批量处理事件注册
     * @param  {object} events 包含批量事件/回调键值对的对象
     * @return {object}        返回_badModel对象以便于链式操作
     * @uses   .__renderEvents({
     *                 "change:property"     : function(value){alert(value)},
     *               "change:property.sub" : testfunc,
     *             });
     */
    function _renderEvents(events) {

        var _event, _target, _callback;

        if (typeof events === "object") {

            for (_event in events) {

                if (events.hasOwnProperty(_event)) {

                    _callback = events[_event];
                    _event = _event.split(":");
                    _target = _event[1];
                    _event = _event[0];

                    if (typeof _callback === "function") {
                        _on(_event, _target, _callback);
                    }

                }
            }
        }

        return _badModel;

    }

    /**
     * 内部方法,克隆一个JSON对象
     * @param  {object} data 待克隆的JSON
     * @return {object}      新JSON
     */
    function _clone(data) {

        if (typeof data === "object") {
            return JSON.parse(JSON.stringify(data));
        }

        return {};

    }

    /**
     * 返回被处理后的数据
     * @return {object}
     */
    function _jsonData() {

        return arguments[0] ? _originData : _clone(_data);

    }

    /**
     * 返回被处理的数据字符串
     * @return {string}
     */
    function _stringData() {

        return JSON.stringify(_data);

    }

    _badModel = {
        __events__: _events,
        init: _init,
        on: _on,
        off: _off,
        offAll: _offAll,
        trigger: _trigger,
        get: _nestedGet,
        set: _nestedSet,
        toggle: _toggle,
        push: _push,
        reset: _reset,
        onResetAll: _onResetAll,
        jsonData: _jsonData,
        stringData: _stringData,
        isModel: true
    };

    return _badModel;

});
