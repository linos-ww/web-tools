
//检测类
export class Check{
    static israw(obj:object):boolean{
        let T =typeof obj
        if(T==="object" && obj===null)return true;
        else return T!=='function'
    }
    
    static isobj(obj:object):boolean{
        if(obj===null)return false
        else return typeof obj ==='object' || typeof obj==='function'
    }
    
    static istype(obj:any, ...types:any[]):boolean{
        let T
        if(obj===null || obj===undefined)T=obj
        else T=(obj).constructor
        if(types.includes(T))return true;
        return types.some(e=>{return e.isPrototypeOf(T)});
    }
    
    static isroot(obj:object):boolean{return Object.isExtensible(obj)}
    
    static validate<U,T>(obj:U,candidate:T,...types:any[]):U|T{
        if(this.istype(obj,...types))return obj
        else return candidate
    }
}
