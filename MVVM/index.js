
/**
 * 创建MVVM数据绑定对象
 * @param {*} id 传dom结构id
 * @param {*} data 显示的数据
 */
function myMVVM(id, data) {
    this.id = id;
    this.data = data;
    this.el = document.getElementById(id);
    this.originTemplate = this.el.innerHTML;
    this.templates = analysisTemplate(this.el.innerHTML);
    this.cloneObj = deepClone(this.data)
    this.mapping = new Map()
    proxyObj.call(this, this.data, this.cloneObj)
    this.vNodeRoot = buildVirtualNode.call(this, this.el)
    render(this.el, this.originTemplate, this.templates, this.data);

}
/**
 * 匹配dom结构中{{xx}}模板
 * @param {*} html 
 */
function analysisTemplate(html) {
    return html.match(/{{[a-zA-Z]+[a-zA-Z0-9_]*}}/g);
}
/**
 * 替换{{xx}}里面数据
 * @param {*} text 
 */
function dropBorder(text) {
    return text.substring(2, text.length - 2)
}
/**
 * 重新渲染结构
 * @param {*} el dom结构的id 
 * @param {*} originTemplate 旧模板 
 * @param {*} templates  dom里面数据结构
 * @param {*} data 数据
 */
function render(el, originTemplate, templates, data) {
    var result = originTemplate;
    for (var i = 0; i < templates.length; i++) {
        var tempValue = data[dropBorder(templates[i])];
        if (tempValue) {
            result = result.replace(templates[i], tempValue)
        }
    }
    el.innerHTML = result
}
/**
 * 对数据进行深度克隆操作
 * @param {*} obj 
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj))
}
/**
 * 实时进行监听操作
 * @param {*} obj 
 * @param {*} newObj 
 */
function proxyObj(obj, newObj) {
    var _this = this;
    for (let temp in obj) {
        if (obj[temp] instanceof Object) {
            proxyObj(obj[temp], newObj[temp])
        } else {
            Object.defineProperty(obj, temp, {
                get: function () {
                    return newObj[temp]
                },
                set: function (value) {
                    newObj[temp] = value
                    render(_this.el, _this.originTemplate, _this.templates, _this.data);

                }
            })
        }
    }
}

function VNode(dom, type, value) {
    this.dom = dom;
    this.type = type;
    this.value = value;
    this.childNodes = [];

    this.appendChild = function (vnode) {
        if (!(vnode instanceof VNode)) {
            throw new Error('node is not instanceof VNode')
        }
        this.childNodes.push(vnode)
    }
}

function buildVirtualNode(node) {
    var tmep = new VNode(node, node.nodeType, node.nodeValue)
    for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType == 1) {
            var child = buildVirtualNode.call(this, node.childNodes[i])
            tmep.appendChild(child)
        } else if (node.childNodes[i].nodeType === 3) {
            var arr = analysisTemplate(node.childNodes[i].nodeValue)
            for (let j = 0; arr && j < arr.length; j++) {
                if (this.mapping.get(arr[i])) {
                    let templateArr = this.mapping.get(arr[j])
                    templateArr.push(node.childNodes[i])
                    this.mapping.set(arr[i], templateArr)
                } else {
                    this.mapping.set(arr[i], [node.childNodes[i]])
                }
            }
            var child = buildVirtualNode.call(this, node.childNodes[i])
            tmep.appendChild(child)
        } else {
            continue;
        }
    }
    return tmep
}