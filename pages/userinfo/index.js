import { supabase } from '../../lib/supabaseClient'
import { DownloadImage } from '../../utils/commonApi'
const app = getApp();
Page({
  data: {
    username: app.globalData.userInfo?.user_metadata.username ? app.globalData.userInfo.user_metadata.username : '',
    avatar: app.globalData.userInfo?.user_metadata.avatar ? app.globalData.userInfo.user_metadata.avatar : '',
    introduction: app.globalData.userInfo?.user_metadata.introduction ? app.globalData.userInfo.user_metadata.introduction : '',
    filePath:'',
  },
   onLoad: async function () {
    if(app.globalData.userInfo){
      if (JSON.stringify(app.globalData.userInfo.user_metadata) !== '{}') {
        if(app.globalData.userInfo.user_metadata.avatar){
          this.setData({avatar: await DownloadImage(app.globalData.userInfo.user_metadata.avatar)})
        }
      }
      this.setData({
        username:app.globalData.userInfo?.user_metadata.username ? app.globalData.userInfo.user_metadata.username : '',
        introduction:app.globalData.userInfo?.user_metadata.introduction ? app.globalData.userInfo.user_metadata.introduction : ''
      })
    }
  },
  // 更新用户名
  updateUsername: function (e) {
    this.setData({
      username: e.detail.value
    });
  },

  // 更新头像
  async onChooseAvatar(e) {
    let { avatarUrl } = e.detail;
    let that = this;
    wx.getImageInfo({
      src: avatarUrl, // 图片路径，必须是本地路径，可以相对路径或绝对路径
      success: async function (res) {
        const file = { fileType: "image", width: res.width, height: res.height, tempFilePath: avatarUrl }
        const fileExt = avatarUrl.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`
        that.setData({filePath:filePath})
        let { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file)
        if (uploadError) {
          throw uploadError
        }
        that.setData({ avatar: await DownloadImage(filePath) })
      }
    })
  },

  // 更新简介
  updateIntro: function (e) {
    this.setData({
      introduction: e.detail.value
    });
  },

  // 提交用户信息
  submit: async function () {
    const that = this;
    let path = '';
    if(that.data.filePath){
      path = that.data.filePath
    }else{
      path =  app.globalData.userInfo.user_metadata.avatar
    }
    const { data, error } = await supabase.auth.updateUser({
      data: { avatar: path, username: that.data.username, introduction: that.data.introduction }
    })
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        duration: 1500,
        icon:'none'
      });
    } else {
      app.globalData.userInfo = data.user.data
      wx.showToast({
        title: '修改成功',
        duration: 1500
      });
      wx.switchTab({
        url: '/pages/me/index',
      })
    }

  },
});
