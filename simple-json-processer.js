/**
 * JSON数据处理器
 * @author 王刚
 * @version 1.0.0
 * @date 2015/03
 */

var SimpleModel = (function(){

    "use strict";

    var _simpleModel = {},
        _data        = {},
        _originData  = {},
        _events      = {};

    /**
     * 基于现有数据来初始化
     * @param {object} data 需要传入的JSON数据
     * @return {object} 返回_simpleModel对象以便于链式操作
     */
    function _init (data) {

        var _item;

        data = typeof data === "object" ? data : {};
        _originData = _clone(data);

        for (_item in data) {

            if (data.hasOwnProperty(_item)) {
                _nestedSet(_item, data[_item]);
            }

        }

        return _simpleModel;

    }

    /**
     * 设置一个属性的值,如果没有,则新增属性
     * @param {string} property 属性名称
     * @param {all} value       属性值,可以是任何合法的类型
     * @return {object}         返回_simpleModel对象以便于链式操作
     * @uses _nestedSet("object-name","name")/_nestedSet("object.name","name");
     */
    function _nestedSet(property, value) {

        var propNames,propLength,tempObj,tempProp,_item;

        if (typeof property === "string") {

            propNames = property.split('.');
            propLength = propNames.length - 1;
            tempObj = _data;

            for (var i = 0; i <= propLength ; i++) {

                if (i !== propLength) {
                    tempObj = tempObj[propNames[i]] =  tempObj[propNames[i]] || {}
                } else {
                    tempObj = tempObj[propNames[i]] = value;
                }

                tempProp = propNames.slice(0,i).join(".");
                _trigger("change", tempProp, _nestedGet(tempProp));
            }
            _trigger("change", property, value);

        } else if (typeof property === "object") {

            for (_item in property) {

                //if (property.hasOwnProperty(_item)) {
                    _nestedSet(_item, property[_item]);
                //}

            }

        }

        return _simpleModel;

    }


    //遗弃方法
    function _set (property, value) {

        var _prop,_propN,_propI,_item;


        if (typeof property === "string") {

            if ( _trigger("beforechange", property, value) === false) {
                return false;
            }

            if (property.indexOf(".") > 0) {

                _prop  = property.split(".");
                _propN = _prop[0];
                _propI = _prop[1];

                typeof _data[_propN] !== "object" && (_data[_propN] = {});
                _data[_propN][_propI] = value;
                _trigger("change", _propN, _nestedGet(_propN));

            } else {

                _data[property] = value;

            }

            _trigger("change", property, value);

        } else if (typeof property === "object") {

            for (_item in property) {

                if (property.hasOwnProperty(_item)) {
                    _set(_item, property[_item]);
                }

            }

        }

        return _simpleModel;

    };

    /**
     * 获取属性值
     * @param  {string} property      属性名称
     * @param  {boolean} [originData] 是否是从源数据中获取
     * @return {all}                  可以是任意合法的数据
     * @uses _nestedGet("object-name")//_nestedGet("object.name")
     */
    function _nestedGet (property) {

        var _path = property.split(".");
        var _pathDepth = _path.length;
        var _objTemp = arguments[1] ? _originData : _data;

        for (var _i = 0; _i <= _pathDepth; _i ++) {

            if (_i === _pathDepth ) {
                return _objTemp;
            } else {

                if (typeof _objTemp[_path[_i]] === "undefined") {
                    return null;
                }

                _objTemp = _objTemp[_path[_i]];

            }

        }

    }

    //遗弃方法
    function _get (property) {

        var _tempData,_prop,_propN,_propI;

        _tempData = arguments[1] ? _originData : _data;

        if (typeof property === "string" ) {

            if (_tempData.hasOwnProperty(property)) {
                return _tempData[property];
            } else if (property.indexOf(".") > 0) {

                _prop  = property.split(".");
                _propN = _prop[0];
                _propI = _prop[1];

                if (_tempData.hasOwnProperty(_propN) && _tempData[_propN].hasOwnProperty(_propI)) {
                    return _tempData[_propN][_propI];
                } else {
                    return null;
                }

            } else {
                return null;
            }
                
        } else {
            return null;
        }

    };

    /**
     * 重置所有或指定属性
     * @param  {string} property 属性名称,不填写则重置所有
     * @return {object}          返回_simpleModel对象以便于链式操作
     */
    function _reset (property) {

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

        return _simpleModel;

    }

    /**
     * 执行注册在一个对象上的事件
     * @param  {string} eventName   事件名称
     * @param  {string} eventTarget 对象名称
     * @return {object}             返回_simpleModel对象以便于链式操作
     */
    function _trigger (eventName, eventTarget) {

        //console.log(eventName, eventTarget);

        var _arguments = typeof arguments[2] !== "undefined" ? arguments[2] : null;
        var _returnFalse = false,
            _return;

        if (_events.hasOwnProperty(eventTarget) && _events[eventTarget].hasOwnProperty(eventName) && (_events[eventTarget][eventName] instanceof Array)) {
             
            _events[eventTarget][eventName].forEach(function(callback){

                _return = (callback)(_arguments);
                _return === false && (_returnFalse = true);

             });

        }

        return _returnFalse ? false : _simpleModel;

    };

    /**
     * 注册一个事件到指定标识上
     * @param  {string}   eventName   事件名称
     * @param  {string}   eventTarget 标识名称
     * @param  {Function} callback    回调函数
     * @return {object}               返回_simpleModel对象以便于链式操作
     */
    function _on (eventName, eventTarget, callback) {

        //console.log(eventName,eventTarget,callback);

        if (typeof eventName === "object") {

            _renderEvents(eventName);

        } else if (typeof eventTarget === "string" && typeof eventName === "string" && typeof callback === "function") {
        
            _events[eventTarget] || (_events[eventTarget] = {});
            _events[eventTarget][eventName] || (_events[eventTarget][eventName] = []);
            _events[eventTarget][eventName].push(callback);

        }

        return _simpleModel;

    }

    /**
     * 注销一个标识上绑定的所有事件或指定事件
     * @param  {string} eventTarget 标识名称
     * @param  {string} eventName   事件名称,不填写则注销所有事件
     * @return {object}             返回_simpleModel对象以便于链式操作
     */
    function _off (eventTarget, eventName) {

        if (typeof eventTarget === "string") {

            if (typeof eventName !== "undefined") {
                _events.hasOwnProperty(eventTarget) && _events[eventTarget].hasOwnProperty(eventName) && (delete _events[eventTarget][eventName]);
            } else {
                _events.hasOwnProperty(eventTarget) && (delete _events[eventTarget]);
            }

        }

        return _simpleModel;

    }

    /**
     * 清除所有事件
     */
    function _offAll () {

        var _selfEvents = _events.__self__;

        _events = {};
        _events.__self__ = _selfEvents;

    }

    /**
     * 指定当重置全部属性后的回调
     * @param  {Function} callback 回调函数
     * @return {object}            返回_simpleModel对象以便于链式操作
     */
     function _onResetAll (callback) {

        _on("reset", "__self__", callback);

        return _simpleModel;

    }

    /**
     * 内部方法,用于批量处理事件注册
     * @param  {object} events 包含批量事件/回调键值对的对象
     * @return {object}        返回_simpleModel对象以便于链式操作
     * @uses   .__renderEvents({
     *                 "change:property"     : function(value){alert(value)},
     *               "change:property.sub" : testfunc,
     *             });
     */
    function _renderEvents (events) {

        var _event,_target,_callback;

        if (typeof events === "object") {

            for (_event in events) {

                if (events.hasOwnProperty(_event)) {

                    _callback = events[_event];
                    _event    = _event.split(":");
                    _target   = _event[1];
                    _event    = _event[0];

                    if (typeof _callback === "function") {
                        _on(_event, _target, _callback);
                    }

                }
            }
        }

        return _simpleModel;

    }

    /**
     * 内部方法,克隆一个JSON对象
     * @param  {object} data 待克隆的JSON
     * @return {object}      新JSON
     */
    function _clone (data) {

        if (typeof data === "object") {
            return JSON.parse(JSON.stringify(data));
        }

        return {};

    }

    /**
     * 判断数组是否包含指定元素
     * @param  {all} find    需要检查的元素
     * @param  {array} array 需要检查的数组
     * @return {boolean}
     */
    function _inArray (find, array) {

        var _l;

        if (typeof Array.prototype.contains === "function") {
            return array.contains(find);
        }

        _l = array.length;

        while (_l--) {

            if (array[_l] === find) {
                return true;
            }

        }

        return false;

    }

    /**
     * 返回被处理后的数据
     * @return {object}
     */
    function _jsonData () {

        return arguments[0] ? _originData : _clone(_data);

    }

    /**
     * 返回被处理的数据字符串
     * @return {string}
     */
    function _stringData () {

        return JSON.stringify(_data);

    }

    _simpleModel = {
        __events__ : _events,
        init       : _init,
        on         : _on,
        off        : _off,
        trigger    : _trigger,
        get        : _nestedGet,
        set        : _nestedSet,
        reset      : _reset,
        onResetAll : _onResetAll,
        inArray    : _inArray,
        jsonData   : _jsonData,
        stringData : _stringData,
        isModel    : true,
    };

    return _simpleModel;

}());
