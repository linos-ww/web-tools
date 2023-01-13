
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

