import { supabase } from '../../lib/supabaseClient'
const app = getApp();
var mySubscription
Page({
  data: {
    userInfo: null,
    totalPeoples: [],
    messages: null,
    message: null,
    inputTxt: '',
    bgColor: null
  },
  onLoad: async function (options) {
    let mySubscriptions = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          this.getInitialMessages()
            .then((res) => {
              this.setData({messages:res})
            })
            .catch((err) => {
              wx.showToast({
                title: err,
                duration: 1500,
                icon:'none'
              });
            });
        }
      )
      .subscribe();
    //查询个人信息
    if (app.globalData.userInfo.id) {
      this.setData({userInfo:app.globalData.userInfo})
    } else {
      wx.showToast({
        title: '请先登录',
        duration: 1500,
        icon:'none'
      });
    }
    //获取聊天数据
    this.getInitialMessages()
      .then((res) => {
        this.setData({messages:res})
      })
      .catch((err) => {
        wx.showToast({
          title: err,
          duration: 1500,
          icon:'none'
        });
      });
      mySubscription = mySubscriptions
  },
  onUnload: function () {
    // 页面关闭
    supabase.removeChannel(mySubscription);
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
  },
  getUserInfo: function (cb) {

  },
  addmessage(e) {
    this.setData({
      message: e.detail.value
    })
  },
  async send() {
    const { error } = await supabase.from("messages").insert([
      {user_id: this.data.userInfo.id,
        message:this.data.message,
        avatar: this.data.userInfo.user_metadata.avatar ? this.data.userInfo.user_metadata.avatar :'',
        user_name: this.data.userInfo.user_metadata.username ? this.data.userInfo.user_metadata.username :'微信用户',
      },
    ]);
    this.setData({ inputTxt: '' })
  },
  async getInitialMessages() {
    const { data:{data}, error } = await supabase
      .from('messages')
      .select()
    if (error) {
      throw error.message || error.error_description
    } else {
      if (data.length > 0) {
        const responses = [];
        for (const item of data) {
          item.imgUrl = await this.downloadImage(item.avatar);
          responses.push(item);
        }
      }
      return data
    }
  },
  async downloadImage(path) {
    const { data } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(path)
      return data.publicUrl

  },
})