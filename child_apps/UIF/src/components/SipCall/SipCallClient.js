import messenger from './mti-messenger'

class SipCallClient {
  /** 版本 */
  static version = '1.1.6'
  /**
   * 构造函数
   * @author 高金斌 <gaojb@mti-sh.cn>
   */
  constructor() {
    /**
     * 初始化信使
     * 
    messenger.listen(msg => {
      let _msg = JSON.parse(msg)
      if (_msg.type == 'firstHandle') {
        messenger.targets['parent'].send(JSON.stringify({
          type: 'ready',
          system: 'telephone'
        }))
      }
    })
    */
  }

  /**
   * 拨打电话 SDK
   * @author 高金斌 <gaojb@mti-sh.cn>
   * @param {Array} numbers 对象数组
   * @param {String} args 号码字段
   */
  call(numbers, args) {
    let clone = JSON.parse(JSON.stringify(numbers))
    if(args) {
      /** 如果有参数，传的是对象数组 */
      clone.forEach(item => {
        /** 电话号码 */
        item.number = item[args]
        /** 用户唯一 code */
        item.usercode = item.objKey || item.personId || item.id
        /** 单位 ID */
        item.orgId = item.orgId
        /** 单位名称 */
        item.orgName = item.orgName || item.department
        /** 人员 ID */
        item.personId = item.personId
        /** 人员名称 */
        item.personName = item.name
        /** 职位名称 */
        item.duty = item.dutyName
        /** 类型：1主叫、2被叫 */
        item.type = 2
      })
    }
    /** 像 UIF 发送信使消息 */
    messenger.targets['parent'].send(JSON.stringify({
      type: 'SipCall',
      data: clone
    }))
  }
}
export default new SipCallClient()
