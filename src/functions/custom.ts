
export class F{
    // 函数通知器,包装一个函数,返回新的函数,返回的函数可以通过首参数得知自己是否是最新被调用的
    static rope(func:Function){
        let pointer:symbol
        function f(...args:any[]){
            let tag=Symbol()
            pointer=tag
            func(()=>tag===pointer,...args)
        }
        return f
    }

    // 数组迭代并行,类似于python的zip函数
    static* zip(...args:any[]){
        let list:any[]=args.map(e=>{
            if(Array.isArray(e))return e
            else return [e]
        })
        let lens=list.map(e=>e.length)
        let min=Math.min(...lens)
        for(let index=0;index<min;index++){
            let L:any[]=[]
            for(let pos=0;pos<list.length;pos++){
                L.push(list[pos][index])
            }
            yield L
        }
    }
}



