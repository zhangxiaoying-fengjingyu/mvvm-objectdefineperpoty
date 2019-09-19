class Dep{
    constructor() {
        this.events = []
    }
    pushEvent(watch) {
        this.events.push(watch)
    }
    startEvents() {
        this.events.forEach(item => {
            item.sendValue()
        })
    }
}
Dep.target = null;

let dep = new Dep()

class Observer{
    constructor(data){
        if (typeof data !== 'object' || data === '') {
            return
        }
        this.data = data
        this.initServer()
    }
    initServer() {
        //console.log(this.data, '===============this.data')//{defaultValue: "Tom", obj: {…}}
        //console.log(Object.keys(this.data), '================')//["defaultValue", "obj"]属性名
        Object.keys(this.data).forEach(key => {//Object.keys(this.$data)结果是个数组，每个对象的属性名
            this.observer(this.data, key, this.data[key])
        })
    }
    observer(target, key, value) {
        new Observer(target[key])
        Object.defineProperty(target, key, {
            get() {
                if (Dep.target) {
                    dep.pushEvent(Dep.target)
                }
                return value
            },
            set(newValue) {
                if ( value !== newValue) {
                    value = newValue
                }
                new Observer(value)
                dep.startEvents()
            }
        })
    }
}
//赋值
const utils = {
    setValue(node, key, data, types) {
        node[types] = this.getDataValue(key, data)
    },
    getDataValue(key, data) {
        if(key.indexOf('.') > -1){
            let arr = key.split('.')
            arr.forEach(item => {
                data = data[item]
            })
            return data
        }else{
            return data[key]
        }
    },
    changeDataValue(data, key, value) {
        if(key.indexOf('.') > -1){
            let arr = key.split('.')
            for(let i = 0; i < arr.length - 1; i++) {
              data = data[arr[i]]
            }
            data[arr[arr.length -1]] = value
        }else{
            data[key] = value
        }
    }
}

class Watcher{
    constructor(cbk, data, key){
        this.cbk = cbk
        this.data = data
        this.key = key
        Dep.target = this
        this.init()
    }
    init() {
        let res = utils.getDataValue(this.key, this.data)
        Dep.target = null
        return res
    }
    sendValue() {
        let newVal = this.init()
        this.cbk(newVal)
    }
}

class Mvvm{
    constructor({el, data}){//必须记得要解构，如果要是一个值的话就是html中new出来的实例el,data
       this.$el = document.getElementById(el);//节点
       this.$data = data//html中new出来的实例中的data的内容
       this.initServer()
       this.initDom()
    }
    //把data上的属性绑定到this实例上
    initServer() {
        Object.keys(this.$data).forEach(key => {//Object.keys(this.$data)结果是个数组，每个对象的属性名
            this.observer(this, key, this.$data[key])
        })
        new Observer(this.$data)
    }
    //节点属性转换
    initDom() {
        //碎片流
        let newFragment = this.appendDc()
        this.setDomVal(newFragment)
        //往碎片流中添加值
        this.$el.appendChild(newFragment)
    }
    //添加节点
    appendDc() {
        let fargument = document.createDocumentFragment()
        let firstChild;
        while(firstChild = this.$el.firstChild) {
            fargument.appendChild(firstChild)
        }
        return fargument
    }
    //设置节点的内容
    setDomVal(fargument) {
        if (fargument.nodeType === 1) {
            let attribute = fargument.attributes
            let isInput = attribute && attribute.length > 0 && [...attribute].filter(item => {
                return item.nodeName === 'v-model'
            })
            if(isInput.length > 0){
                let value = isInput[0].nodeValue
                //判断节点是input，然后添加事件
                fargument.addEventListener('input', (e) => {
                    console.log('e', e.target.value)
                    //将改变的值赋给实例上的data的值
                    utils.changeDataValue(this.$data, value, e.target.value)
                })
                utils.setValue(fargument, value, this.$data, 'value')
            }
        }else if (fargument.nodeType === 3) {
            if(fargument.textContent.indexOf('{{') > -1){
                let value = fargument.textContent.split('{{')[1].split('}}')[0]
                //如果不是input，则修改值,用回调函数
                new Watcher((newVal) => {
                    fargument.textContent = newVal
                }, this.$data, value)
                utils.setValue(fargument, value, this.$data, 'textContent')
            }
        }
        if (fargument.childNodes && fargument.childNodes.length > 0) {
            fargument.childNodes.forEach(node => {
                this.setDomVal(node)
            })
        }
    }
    //绑定属性的方法
    observer(target, key, value) {
        Object.defineProperty(target, key, {
            get() {
                return value
            },
            set(newValue) {
                value = newValue
            }
        })
    }
}