import CryptoJS from 'crypto-js'

// global config-----------------------
const dbname = 'dbname' //数据库名字
const storename = 'storename' //对象仓库名
const version = 1
const dbupgrade = dbupgrade1  //当前数据库升级事件
const keyPath='id'              //主键
// indexname--attr--config
const indexs={
  // userid:{
  //   attr:'userid',
  //   config:{unique:true}
  // },
  // date:{
  //   attr:"date",
  //   config:{unique:false}
  // }
}

// 版本1数据库升级事件-建立索引
function dbupgrade1(e) {
  let db = e.target.result
  let table
  if (storename && !db.objectStoreNames.contains(storename)) {
    table = db.createObjectStore(storename, { keyPath: keyPath })
    for (let key in indexs){
      let item=indexs[key]
      table.createIndex(key,item.attr,item.config)
    }
    console.log(`对象仓库${storename}创建成功`)
  }
}

// 获取指定的对象仓库对象,若不存在,会新建数据库和仓库
export function get_store() {
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(dbname, version)
    request.onsuccess = (e) => {
      if (e.target.result) {
        let db = e.target.result
        let store = db
          .transaction(storename, 'readwrite')
          .objectStore(storename)
        resolve(store)
      } else resolve(null)
    }
    // 如果数据库还不存在
    request.onupgradeneeded = dbupgrade
  })
}
// 根据文件保存路径生成哈希,
export function hash(path) {
  return CryptoJS.SHA1(path).toString()
}

// ----增
export class Add {
  // 增加一条数据
  static async add(data) {
    let store = await get_store()
    store.add(data)
  }

  // 批量增加
  static async add_group(iterable) {
    let store = await get_store()
    for (let item of iterable) {
      store.add(item)
    }
  }
}

// ----删
export class Remove {
  // 根据id删除一条数据
  static async remove(key) {
    let store = await get_store()
    store.delete(key)
  }
  // 根据索引和选区对象遍历删除,filter为过滤函数,range可以为空,为空则遍历全部
  static async remove_by_range(indexname,range,filter=()=>true){
    let index = store.index(indexname)
    let request = index.openCursor(range)
    request.onsuccess = function (e) {
      let cursor = e.target.result
      if (cursor) {
        if (filter(cursor)) Remove.remove(cursor.key)
        cursor.continue()
      }
    }
  }
}

// ----改
export class Update {
  // 更新单个数据
  static async update(data) {
    let store = await get_store()
    store.put(data)
  }
  // 批量更新
  static async update_group(iterable){
    let store = await get_store()
    for (let item of iterable) {
      store.put(item)
    }
  } 
  // 更新数据,如果没有则添加
  static async find_and_update(data) {
    Find.get(data[keyPath]).then((item) => {
      if (item) this.update(data)
      else Add.add(data)
    }).catch(e=>{
     throw Error(`the keyPath may isn't exist`) 
    })
  }
}

// ----查
export class Find {
  // 根据主键获取一条数据
  static async get(key) {
    return new Promise(async (resolve, reject) => {
      let store = await get_store()
      if (store) {
        let request = store.get(key)
        request.onsuccess = (e) => {
          let result = e.target.result
          resolve(result)
        }
      } else throw Error(`can't get objectStore`)
    })
  }
  // 获取所有数据
  static async getAll() {
    return new Promise(async (resolve, reject) => {
      let store = await get_store()
      if (store) {
        let request = store.getAll()
        request.onsuccess = (e) => {
          let result = e.target.result
          resolve(result)
        }
      } else throw Error(`can't get objectStore`)
    })
  }
  // 查询记录数量
  static async count() {
    return new Promise(async (resolve, reject) => {
      let store = await get_store()
      let request = store.count()
      request.onsuccess = (e) => {
        resolve(e.target.result)
      }
    })
  }
  // 根据选区查询
  static async get_by_range(indexname,range,filter=()>true){
    return new Promise((resolve,reject)=>{
      let index = store.index(indexname)
      let request = index.openCursor(range)
      let result=[]
      request.onsuccess = function (e) {
        let cursor = e.target.result
        if (cursor) {
          if (filter(cursor)) result.push(cursor.value)
          cursor.continue()
        }
        else resolve(result)
      }
    })
    
  }
}

// ----全量遍历
export function each_item(func) {
  return new Promise(async (resolve, reject) => {
    let store = await get_store()
    let request = store.openCursor()
    request.onsuccess = (e) => {
      let cursor = e.target.result
      if (cursor) func(cursor)
    }
    request.onerror = (e) => {
      throw e
    }
  })
}
