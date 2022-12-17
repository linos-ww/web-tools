// DOM相关
export class DOM{
    //可以滚动垂直的内容,但是没有滚动条
    static scroll(selector,step=20){
        // 获取DOM元素
        let dom=[];
        if(Check.istype(selector,String)) dom=dom.concat(...document.querySelectorAll(selector))
        else if(Check.istype(selector,HTMLElement)) dom=dom.concat(selector)
        // 添加滚动条
        for(let item of dom)if(item) scroll(item)
        //代理滚动
        function agent(E,x,y){
            //根据scrollTop值更新滚动条
            E.scrollLeft+=x
            E.scrollTop+=y
        }
        function scroll(E){
            E.addEventListener('wheel',function(e){
                //判断滚动方向
                if(e.deltaY>0)agent(E,0,+step)
                else if(e.deltaY<0)agent(E,0,-step)
            }, {passive:true})
        }
    }
    /****************************************************************************
     * color: string=black|Array --滚动条颜色,可以用渐变色,传递一个颜色数组即可
     * step: number=20 --滚动条滚动步长
     * desc: 给指定DOM添加滚动条,注意:谁的滚动条给谁使用scrollbar
     *
    * 思路:
    *       [1] 封装一个函数scroll用于生成滚动条,余下内容均在此函数内完成,
    *           --  首先定义需要计算的属性,然后封装一个函数init来初始化关键数据,把定义和计算分开
    *           --  获取一个元素的定位方式,如果是非static定位,那么可以把绝对定位的滚动条插入其DOM中,如果是static定位,则给其添加relative定位,并且overflow设置为hidden
    *           --  获取元素内容的实际高度height_context和可视高度height_visible,如果前者大于后者则需要滚动条,横向同理
    *           --  创建一个滚动条元素,并设置好滚动条的样式,添加滚动条到指定的DOM元素中
    *           --  植入一个<style>让鼠标悬浮时显示滚动条,不悬浮消失
    *       [2] 判断鼠标滚动方向,滑动垂直方向的滚动条,为滚动条元素的的style.top属性设置一个代理器agent,使得滚动条滑动时,内容自动联动,思路如下
    *           --  tip0: 元素的scrollTop属性值是内容顶部距离视口容器顶部的距离,单位px,改变这个值可以控制内容的上下滚动,scrollLeft同理控制左右滚动
    *           --  tip1: overflow:hidden的容器,其position:absolute的滚动条的top样式,表示相对于实际内容的顶部,而不是视口容器的顶部
    *           --  tip2: 纵向滚动条距离可视区域顶部的距离s/(s能够到达的最大值max_s)==内容顶部距离可视区域顶部的距离y/(y能够到达的最大值max_y)
    *                     这一点可以简单理解为滚动条滑槽控制容器顶部溢出多少内容,而这两个比例是相同的,
    *           --  得到的top和scrollTop的函数关系式如下:
    *               公式1:    滚动条距离内容顶部的距离top=滚动条距离容器顶部的距离s+scrollTop
    *               公式2:    s=scrollTop/(scrollTop能达到的最大值)*(容器可视区域高度-滚动条高度)
    *               根据以上2条公式能够得到top和scrollTop的关系,我们需要一个代理函数agent,对一个值更新的时候自动根据函数关系去更新另一个值,之后我们应当专注于修改其中的一个值
    *           --  需要注意的是,在垂直滚动的时候,横向滚动条的css属性top也要变化,在水平滚动的时候,垂直滚动条的css属性left也要变化,这样滚动条才不会造成偏移
    *           --  设置scrollTop如果小于0,内容并不会与容器顶部拉开一段空白距离,
    *               设置scrollTop如果超级大,内容并不会与容器底部拉开一段距离,所以我们最好根据scrollTop来反向搞定滚动条的偏移量top和left
    *               所以这需要一个agent(x,y)函数,参数传入偏移量,对scrollTop和scrollLeft改变的同时,对2个滚动条的css样式top和left做出改变
    *       [3] 在鼠标拖动滚动条的时候,滑动内容,包括水平和垂直滚动条,思路如下
    *           --  tip1: click事件会在mousemove事件之后触发
    *           --  设置一个flag_x=false,flag_y=false,给body注册mousemove事件，当鼠标按钮按下的时候，检测e.target是不是我们的滚动条，如果是的话使用两个全局变量px和py记录这个落点坐标,同时设置2个flag=true
    *               如果flag=true则在滑动的时候,使用e.clientX和e.clientY减去初始落点得到偏移量,传入agent(x,y)滚动内容,然后把px,py更新
    *               注意,e.clientX-px和e.clientY-py得到的差值可以直接赋值在scrolTop上滚动内容,但是在滚动条的偏移量top和left上,就是(溢出部分内容距离滚动条顶部或左侧的距离)来定
    *       [4] 为了防止添加滚动条的时候,目标元素是未展开状态,比如高度为0,或者宽度为0,这里要注册两种DOM尺寸变化事件
    *           --  给DOM添加transitionend事件,在过度结束后重新计算滚动条数据,执行init()
    *           --  给DOM添加animationend事件,在动画结束后重新计算滚动条数据,执行init()
    *
    * ******************************************************************************************************/
    static scrollbar(selector,{color='black',step=20}={}){
        // 获取DOM元素
        let dom=[];
        if(Check.istype(selector,String)) dom=dom.concat(...document.querySelectorAll(selector))
        else if(Check.istype(selector,HTMLElement)) dom=dom.concat(selector)
        else if(Check.istype(selector,Array))
            for(let item of selector){
                if(Check.istype(selector,String))dom=dom.concat(...document.querySelectorAll(item))
                else if(Check.istype(item,HTMLElement))dom=dom.concat(item)
            }
        // 添加滚动条
        for(let item of dom)if(item) scroll(item)
        // E:HTMLElement
        function scroll(E){
            //预定义滚动条<div>和<style>
            let data_css=`css${Math.random().toString().slice(2)}`
            E.setAttribute('data-css',data_css)
            E.style.overflow='hidden'
            let position=window.getComputedStyle(E).position
            if(position=='static') E.style.position='relative'
            let div_y=document.createElement('div'),
                div_x=document.createElement('div'),
                style=document.createElement('style'),
                id_y=Math.random().toString().replace('0.','y'),
                id_x=Math.random().toString().replace('0.','x'),
                style_id=Math.random().toString().replace('0.','s')
            div_y.id=id_y
            div_x.id=id_x
            div_y.setAttribute('data-scroll','y')
            div_x.setAttribute('data-scroll','x')
            style.id=style_id
            document.head.appendChild(style)

            //定义数据部分
            let height_context,                     //容器内容高度
                height_visible,                     //容器可视高度
                width_context,                      //容器内容宽度
                width_visible,                      //容器可视宽度
                need_y,                             //是否需要纵向滚动条
                need_x,                             //是否需要横向滚动条
                scrollbar_width,                    //横向滚动条宽度
                scrollbar_height,                   //纵向滚动条高度
                scrollbar_size=5,                   //横向滚动条高度，或纵向滚动条的宽度
                gap=2,                              //滚动条外边距
                bg,                                 //滚动条背景
                scrollbar_hover_size=6,             //悬浮时的宽度
                max_y_s,                            //滚动条在可视区域内的垂直最大滑动范围
                max_x_s,                            //滚动条在可视区域内水平最淡滑动距离
                max_y,                              //纵向溢出内容长度.
                max_x                               //横向溢出内容长度.
            if(Array.isArray(color)) bg=`linear-gradient(45deg,${color.join(',')})`
            else if (typeof color=='string')bg=color
            else bg='black'

            function init(){
                height_context=E.scrollHeight,
                height_visible=E.clientHeight,
                width_context=E.scrollWidth,
                width_visible=E.clientWidth,
                need_y=height_context-height_visible>5 ? true : false,
                need_x=width_context-width_visible>10 ? true : false,
                scrollbar_width=width_visible/width_context*width_visible,                                      //滚动条宽度
                scrollbar_height=height_visible/height_context*height_visible,                                  //滚动条高度
                max_y_s=height_visible-scrollbar_height-scrollbar_size-2*gap,                        //滚动条在可视区域内的垂直最大滑动距离
                max_x_s=width_visible-scrollbar_width-scrollbar_size-2*gap,                          //滚动条在可视区域内水平最淡滑动距离
                max_y=height_context-height_visible,                                                            //溢出内容的纵向最大值.
                max_x=width_context-width_visible                                                             //溢出内容的横向最大值.

                E.appendChild(div_y)
                if(need_x)E.appendChild(div_x)
                // transition:0.3s opacity;
                style.textContent=`
                    #${id_y}{position:absolute;display:none;background:${bg}!important;right:${gap}px;top:${gap}px;width:${scrollbar_size+'px'};height:${scrollbar_height+'px'};border-radius:5px;z-index:auto;min-height:4px;padding:0px!important;margin:0px!important;cursor:pointer}
                    #${id_x}{position:absolute;display:none;background:${bg}!important;bottom:${gap}px;left:${gap}px;height:${scrollbar_size+'px'};width:${scrollbar_width+'px'};border-radius:5px;z-index:auto;min-width:4px;padding:0px!important;margin:0px!important;cursor:pointer}
                `
                div_x.style.top=(E.scrollTop+height_visible-scrollbar_size-gap)+'px'
                div_y.style.top=(E.scrollTop*(max_y_s+max_y)/max_y+gap)+'px'
                div_x.style.left=(E.scrollLeft*(max_x_s+max_x)/max_x+gap)+'px'
                div_y.style.left=(E.scrollLeft+width_visible-scrollbar_size-gap)+'px'
            }
            init()
            // x,y:number--表示水平和垂直滚动条的偏移量
            function agent(x,y){
                //根据scrollTop值更新滚动条
                E.scrollLeft+=x
                E.scrollTop+=y
                div_x.style.top=(E.scrollTop+height_visible-scrollbar_size-gap)+'px'
                div_y.style.top=(E.scrollTop*(max_y_s+max_y)/max_y+gap)+'px'
                div_x.style.left=(E.scrollLeft*(max_x_s+max_x)/max_x+gap)+'px'
                div_y.style.left=(E.scrollLeft+width_visible-scrollbar_size-gap)+'px'
            }
            E.addEventListener('wheel',function(e){
                //判断滚动方向
                if(e.deltaY>0)agent(0,+step)
                else if(e.deltaY<0)agent(0,-step)
                init()
            }, {passive:true})

            let flag_y=false,
                flag_x=false,
                py=null,        //上一次落点的y坐标
                px=null         //上一次落点的x坐标
            document.body.addEventListener('mousemove',function(e){
                if(e.buttons==1){
                    //如果落点在纵向滚动条上
                    if(!flag_y && e.target==div_y)flag_y=true,document.body.style.userSelect='none'
                    if(flag_y && py){
                        div_y.style.display="inline-block"
                        let offset_y=e.clientY-py,
                            y=offset_y*max_y/max_y_s
                        agent(0,y)
                    }
                    //如果落点在横向滚动条上
                    if(!flag_x && e.target==div_x)flag_x=true,document.body.style.userSelect='none'
                    if(flag_x && px){
                        let offset_x=e.clientX-px,
                            x=offset_x*max_x/max_x_s
                        agent(x,0)
                    }
                    py=e.clientY,px=e.clientX
                }
                if(e.buttons==0){
                    flag_y=flag_x=false, py=px=null
                    document.body.style.userSelect='unset'
                }
            })

            E.addEventListener('mousemove',function(){init()})
            E.addEventListener('transitionend',function(){init()})      //容器伸缩后的自适应
            E.addEventListener('animationend',function(){init()})       //容器伸缩后的自适应
            E.addEventListener('mouseenter',function(){
                div_x.style.display="none"
                div_y.style.display="none"
                setTimeout(()=>{
                    div_x.style.display="inline-block"
                    div_y.style.display="inline-block"
                },0)
            })
            E.addEventListener('mouseleave',function(){
                div_x.style.display="none"
                div_y.style.display="none"
            })
        }
    }
}
