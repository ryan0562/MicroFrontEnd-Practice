export const dataTransform = (options,keys,root = null) => {
    if(!options || options.length == 0) return []
    options = JSON.parse(JSON.stringify(options)).reverse()
    for(let i = 0;i<options.length;i++){
      for(let prop in keys){
        options[i][keys[prop]] = options[i][prop]
      }
    }
    let isComplete = false
    let result = []
    let needMounted = []
    let remains = JSON.parse(JSON.stringify(options))
    let remainsCopy = []
    let orgRemainsLength1
    let orgRemainsLength2 = null
    for(let i = 0;i<remains.length;i++){
      remainsCopy[i] = remains[i]
    }
    while(remains.length && orgRemainsLength1 !== orgRemainsLength2){
    		orgRemainsLength1 = remains.length
        if(!needMounted.length){
            //第一次加载root层
            for(let i = remains.length-1; i >= 0; i--){
                if(remains[i].pid === root){
                    result.push(remains[i])
                    needMounted.push(remains[i])
                    remains.splice(i,1)
                }
            }
        }
        else{
            let temmpNeedMounted = []
            for(let i1 = needMounted.length-1; i1 >= 0; i1--){
                needMounted[i1].children = []
                for(let i2 = remains.length-1; i2 >= 0; i2--){
                    if(remains[i2].pid === needMounted[i1].id){
                        needMounted[i1].children.push(remains[i2])
                        temmpNeedMounted.push(remains[i2])
                        remains.splice(i2,1)
                    }
                }
                if(!needMounted[i1].children.length){
                    delete needMounted[i1].children
                }
            }
            needMounted = temmpNeedMounted
        }
        orgRemainsLength2 = remains.length
    }
    for(let i = 0;i<remainsCopy.length;i++){
        let temp = remainsCopy[i]
        delete temp.id
        delete temp.name
        delete temp.pid
    }
    //垃圾回收
    remainsCopy = needMounted = remains = options = null
    return result
}
