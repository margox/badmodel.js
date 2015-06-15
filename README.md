# simple-json-processer
自用的一个Model模块,极限阉割版的backbone ⊙﹏⊙‖∣°
##特性
- 支持链式操作
- 支持nested属性访问(data.a.b.c)
- 使用set方法设置属性时,会触发属性对应的change回调函数.
- 可以使用本模块来绑定任何事件到任意合法字符串标志符上

##范例
```javascript
var Model = SimpleModel,
    data  = {"name":"Jack","age":"25","sex":"male"};

// 依据data来初始化模块,同时指定name属性改变时候的回调
Model.init(data).on("change", "name", function (name) {
    console.log("New name is " + name);
});

// 更改name为Tom
Model.set("name", "Tom");
// 输出"New name is Tom"

// 批量绑定回调
Model.on({
    "change:age" : function (age) {console.log("Age changed to " + age);},
    "change:sex" : function (sex) {console.log("Sex changed to " + sex);}
});

// 设置新的属性
Model.set("father", "Margox").set("mother", "Undefined");

// 批量设置新的属性
Model.set({
    "brother" : "null",
    "sister"  : "null"
});

Model.set({
    "children" : {
        "child1" : "Jim",
        "child2" : "Rose",
        "child3" : "Pual"
    }
});
Model.on("change", "children", function () {
    console.log("children has been changed");
}).on("change", "children.child1", function (child1) {
    console.log("children.child1 changed to " + child1);
});

// nested方式属性访问
Model.set("children.child1", "Lucy");
// 输出 "children has been changed"
// 输出 "children.child1 changed to Lucy" 

console.log(Model.get("children.child1"));
// 输出"Lucy"

console.log(Model.jsonData());
// 输出{"name":"Tom","age":"25","sex":"male","brother":"null","sister":"null","children":{"child1":"Lucy","child2":"Rose","child3":"Pual"}};

// toggle方法
Model.set("status","aaa").toggle("status");
console.log(Model.get("status"));
//输出false

Model.toggle("status");
console.log(Model.get("status"));
//输出true

// push方法，用于将一个元素追加到数组类型的数据里面
Model.set("data_array",["a","b","c"]).push("data_array","d");
console.log(Model.get("data_array"));
// 输出["a","b","c","d"]

// 绑定事件回调到任意标志符的任意事件
Model.on("hungry", "baby", function (food) {
    console.log("baby feeded with " + food);
});

// 触发事件
Model.trigger("hungry", "baby", "milk");
// 输出"baby feeded with milk"
```
