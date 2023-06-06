//获取应用实例
const app = getApp();
import {
  supabase
} from '../../lib/supabaseClient'
import {
  DownloadImage
} from '../../utils/commonApi'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    menuitems: [{
      text: '完善信息',
      url: '../userinfo/index',
      icon: '../../images/icon-index.png',
      tips: ''
    }, ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    var that = this;
    if (app.globalData.userInfo) {
      that.setUserInfo(app.globalData.userInfo);
    } else {
      wx.redirectTo({
        url: '/pages/login/index',
      })
    }
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: [current] // 需要预览的图片http链接列表
    })
  },
  getUserInfo: function (e) {
    this.setUserInfo(e.detail.userInfo);
  },
  
  setUserInfo: async function (userInfo) {
    if (userInfo != null) {
      if (userInfo.user_metadata.avatar) {
        var avatar = await DownloadImage(userInfo.user_metadata.avatar)
      }
      this.setData({
        userInfo: userInfo,
        ['userInfo.avatar']: avatar,
        hasUserInfo: true
      })
    }
  },
  async loginOut() {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        duration: 1500,
        icon: 'none'
      });
    } else {
      app.globalData.userInfo = null;
      this.setData({
        userInfo: null,
        hasUserInfo: false
      })
      wx.showToast({
        title: '退出成功',
        duration: 1500
      });
      wx.redirectTo({
        url: '/pages/login/index',
      })
    }
  }
})