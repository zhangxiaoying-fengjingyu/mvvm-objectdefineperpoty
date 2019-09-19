class Observe{
    constructor(data){
        if (typeof data !== 'object' || data ==='') {
            return
        }
        this.data = data
        this.initServer()
    }
    initServer(){
        Object.keys(this.data).forEach(key => {//Object.keys(this.$data)结果是个数组，每个对象的属性名
            this.observe(this.data, key, this.data[key])
        })
    }
    observe(target, key, value) {
        new Observe(target[key]) //---------------------------------------??????
        Object.defineProperty(target, key, {
            get() {
                return value
            },
            set(newValue) {
                if (value !== newValue) {
                    value = newValue
                }
                new Observe(value)//-------------------------------------------????????
            }
        })
    }
}

class Mvvm{
    constructor({el, data}){//必须记得要解构，如果要是一个值的话就是html中new出来的实例el,data
        this.$el = document.getElementById(el)//节点
        this.$data = data//html中new出来的实例中的data的内容
        this.initServer()
        this.initDom()
    }
    //把data上的属性绑定到this实例上
    initServer(){
        Object.keys(this.$data).forEach(key => {//Object.keys(this.$data)结果是个数组，每个对象的属性名
            this.observe(this, key, this.$data[key])
        })
        new Observe(this.$data)
    }
    initDom() {
        //创建碎片流
        let fragment = document.createDocumentFragment()
        //往碎片流中添加值
        this.appendDm(fragment)
        // this.$el.appendChild(fragment)
    }
    //添加节点
    appendDm(fragment) {
        let firstChild;
        while (firstChild = this.$el.firstChild) {
             fragment.appendChild(firstChild)
        }
        this.setDomVal(fragment)
    }
    //设置节点内容
    setDomVal (fragment) {
        if (fragment.nodeType === 1) {
            console.dir(fragment)
        }
        if (fragment.childNodes && fragment.childNodes.length > 0){
            fragment.childNodes.forEach(node => {
                this.setDomVal(node)
            })
        }
    }
    //数据劫持，绑定属性
    observe(target, key, value) {
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



//访问器属性  灰色的，但也是实例上的属性 点击展开的时候会触发get方法