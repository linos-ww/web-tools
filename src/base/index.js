
//检测类
export class Check{
    static israw(obj){
        let T =typeof obj
        if(T==="object" && obj===null)return true;
        else return T!=='function'
    }
    
    static isobj(obj){
        if(obj===null)return false
        else typeof obj ==='object' || typeof obj==='function'
    }
    
    static istype(obj, ...types){
        let T
        if(obj===null || obj===undefined)T=obj
        else T=(obj).constructor
        if(types.includes(T))return true;
        return types.some(e=>{return e.isPrototypeOf(T)});
    }
    
    static isroot(obj){return Object.isExtensible(obj)}
    
    static validate(obj,candidate,...types){
        if(this.istype(obj,...types))return obj
        else return candidate
    }
}


export class Net{
    static HTTP(obj){
        if(Check.istype(obj,Object)){
            let URL=obj.url
            let method=obj.method.toUpperCase()
            let datatype=obj.datatype?obj.datatype.toUpperCase():""
            delete obj.url
            delete obj.method
            delete obj.datatype
            let D={...obj}
            D.method=method
            // 如果是不带参数的GET请求
            if(method=='GET' && !datatype)return fetch(URL,D)
            // 如果是携带URL参数的GET请求
            else if(method=="GET" && datatype=='URL'){
                let args=Object.entries(obj.data).map((e)=>e.join('=')).join('&')
                let url=`${URL}?${args}`
                return fetch(url,D)
            }
            // 如果是不带参数的POST请求
            else if(method=='POST' && !datatype){
                return fetch(URL,D)
            }
            // 如果是携带JSON数据的POST请求
            else if(method=="POST" && datatype=='JSON'){
                let body=JSON.stringify(obj.data)
                D.body=body
                return fetch(URL,D)
            }
            // 如果是携带formdata数据的POST请求
            else if(method=="POST" && datatype=="FORMDATA"){
                let F=new FormData()
                for (let key in obj.data)F.append(key,obj.data[key])
                D.body=F
                return fetch(URL,D)
            }
        }
        else{
            throw Error('参数类型不合法,应提供一个JavaScript对象')
        }
    }
}

// 函数通知器,包装一个函数,返回新的函数,返回的函数可以通过首参数得知自己是否是最新被调用的
export function Rope(func){
    let pointer
    function f(...args){
        let tag=Symbol()
        pointer=tag
        func(()=>tag===pointer,...args)
    }
    return f
}

// 数组迭代并行,类似于python的zip函数
export function* zip(...args){
    let list=args.map(e=>{
        if(Array.isArray(e))return e
        else return [e]
    })
    let lens=list.map(e=>e.length)
    let min=Math.min(...lens)
    for(let index=0;index<min;index++){
        let L=[]
        for(let pos=0;pos<list.length;pos++){
            L.push(list[pos][index])
        }
        yield L
    }
}

