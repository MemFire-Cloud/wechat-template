// pages/filestorage/index.js
import { supabase } from '../../lib/supabaseClient'
import { formatTime } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileName: '',
    fileList: [],
    show:false,
    itemFileName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.ListFile()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  onClosePop(){
    this.setData({ show: false });
  },
  onOpenPop(e){
    this.setData({ show: true,itemFileName: e.currentTarget.dataset.name});
  },
  async onChangeTab(e) {
    const name = e.detail.name;
    const { data: { data }, error } = await supabase
      .storage.from('files')
      .list()
    if (error) {
      throw error.message || error.error_description
    } else {
      let res = []
      if (data.length > 0) {
        data.map((item, index) => {
          // .doc,.xml,.docx,
          if (name === '文档') {
            if (item.name.slice(item.name.lastIndexOf('.') + 1) === 'doc' || item.name.slice(item.name.lastIndexOf('.') + 1) === 'xml' || item.name.slice(item.name.lastIndexOf('.') + 1) === 'docx') {
              item.created_at = formatTime(item.created_at)
              item.size = item.metadata.size;
              delete item.metadata;
              res.push(item)
            }
          } else if (name === '图片') {
            if (item.name.slice(item.name.lastIndexOf('.') + 1) === 'jpg' || item.name.slice(item.name.lastIndexOf('.') + 1) === 'png') {
              item.created_at = formatTime(item.created_at)
              item.size = item.metadata.size;
              delete item.metadata;
              res.push(item)
            }
          } else if (name === '视频') {
            if (item.name.slice(item.name.lastIndexOf('.') + 1) === 'mp4') {
              item.created_at = formatTime(item.created_at)
              item.size = item.metadata.size;
              delete item.metadata;
              res.push(item)
            }
          } else if (name === '全部') {
            item.created_at = formatTime(item.created_at)
            item.size = item.metadata.size;
            delete item.metadata;
            res.push(item)
          }

        })
      }
      this.setData({ fileList: res })
    }
  },
  onUpload() {
    var that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      async success(res) {
        res.tempFiles[0].tempFilePath = res.tempFiles[0].path;
        delete res.tempFiles[0].path;
        const file = res.tempFiles[0]
        const filePath = res.tempFiles[0].name
        that.setData({ fileName: filePath })
        const { data, error } = await supabase
          .storage
          .from('files')
          .upload(filePath, file, {
            cacheControl: '3600',
          })
        if (error) {
          wx.showToast({
            title: error.data.message || error.data.error_description,
            icon: "none",
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '上传成功',
            icon: "none",
            duration: 2000
          })
          that.ListFile()
        }
      }
    })
  },
  async ListFile() {
    const { data: { data }, error } = await supabase
      .storage.from('files')
      .list()
    if (error) {
      wx.showToast({
        title: error.data.message || error.data.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      if (data.length > 0) {
        data.map(item => {
          item.created_at = formatTime(item.created_at)
          item.size = item.metadata.size;
          delete item.metadata;
        })
      }
      this.setData({ fileList: data })
    }
  },
  async downloadFile() {
    const name = this.data.itemFileName;
    const { data, error } = await supabase
      .storage
      .from('files')
      .createSignedUrl(name, 60)
    wx.downloadFile({
      url: data.signedUrl,
      success(res) {
        if (name.slice(name.lastIndexOf('.')+1) === 'png' || name.slice(name.lastIndexOf('.')+1) === 'jpg' || name.slice(name.lastIndexOf('.')+1) === 'mp4') {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath, //图片文件路径
            success: function (data) {
              wx.hideLoading(); //隐藏 loading 提示框
              wx.showModal({
                title: '提示',
                content: '保存成功',
                modalType: false,
              })
            },
            // 接口调用失败的回调函数
            fail: function (err) {
              if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存相册',
                  modalType: false,
                  success: modalSuccess => {
                    wx.openSetting({
                      success(settingdata) {
                        console.log("settingdata", settingdata)
                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                          wx.showModal({
                            title: '提示',
                            content: '获取权限成功,再次点击图片即可保存',
                            modalType: false,
                          })
                        } else {
                          wx.showModal({
                            title: '提示',
                            content: '获取权限失败，将无法保存到相册哦~',
                            modalType: false,
                          })
                        }
                      },
                      fail(failData) {
                        console.log("failData", failData)
                      },
                      complete(finishData) {
                        console.log("finishData", finishData)
                      }
                    })
                  }
                })
              }
            },
            complete(res) {
              wx.hideLoading(); //隐藏 loading 提示框
            }
          })
        } else {
          wx.openDocument({
            filePath: res.tempFilePath,
            showMenu: true, //关键点
            success: function (res) {
              console.log('打开文档成功')
            },
            fail: function (err) {
              wx.showToast({
                title: err.errMsg,
                icon: "none",
                duration: 2000
              })
            }
          })
        }
      }
    })
  },
  async removeFile() {
    const name = this.data.itemFileName;
    const { data, error } = await supabase
      .storage.from('files')
      .remove(name)
    if (error) {
      wx.showToast({
        title: error.data.message || error.data.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '删除成功',
        icon: "none",
        duration: 2000
      })
      this.ListFile()
      this.setData({ show: false });
    }
  },
})