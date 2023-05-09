import { supabase } from '../../lib/supabaseClient'
const app = getApp();
Page({
  data: {
    todoList: [],
    inputValue: '',
    showModal: false,
    completeCheck: false,
    user_id: null,
    todo_id: null,
  },

  async onLoad() {
    this.setData({ user_id: app.globalData.userInfo.id })
    this.fetchTodo()
  },
  search(e) {
    this.setData({ inputValue: e.detail.value });
  },
  async handerSearch(){
    const { data, error } = await supabase
            .from('todo_list')
            .select('*').order('created_at', { ascending: false }).filter('todo', 'ilike', `%${this.data.inputValue ? this.data.inputValue : ''}%`)
        if (error) {
          wx.showToast({
            title: error.message || error.error_description,
            icon: "none",
            duration: 2000
          })
        } else {
            this.setData({todoList:data.data})
        }
  },
  addItem() {
    this.setData({ showModal: true, todo_id: null,inputValue:'',completeCheck:false })
  },
  async fetchTodo() {
    const that = this;
    const { data, error } = await supabase
      .from('todo_list')
      .select('*')
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      that.setData({ todoList: data.data })
    }
  },
  async deleteItem(e) {
    const itemId = e.currentTarget.dataset.id;
    const { error } = await supabase
    .from('todo_list')
    .delete()
    .eq('id', itemId);
    if(error){
      wx.showToast({
        title: error.message || error.error_description,
        icon: "none",
        duration: 2000
      })
    }else{
      wx.showToast({
        title: '删除成功！',
        icon: "none",
        duration: 2000
      })
      this.fetchTodo()
    }
  },
  async confirm() {
    if (!this.data.todo_id) {
      var { error } = await supabase
        .from('todo_list')
        .insert({ todo: this.data.inputValue, completed: this.data.completeCheck, user_id: this.data.user_id })
    } else {
      var { error } = await supabase
        .from('todo_list')
        .update({ todo: this.data.inputValue, completed: this.data.completeCheck })
        .eq('id', this.data.todo_id)
    }
    if (error) {
      wx.showToast({
        title: error.message || error.error_description,
        icon: "none",
        duration: 2000
      })
    } else {
      wx.showToast({
        title: this.data.todo_id ? '修改成功' : '添加成功',
        icon: "none",
        duration: 2000
      });
      this.setData({ showModal: false })
      this.fetchTodo()
    }
  },
  updateItem(e) {
    const item = e.currentTarget.dataset['item'];
    this.setData({ inputValue: item.todo, completeCheck: item.completed, todo_id: item.id, showModal: true });
  },
  cancel() {
    this.setData({ showModal: false })
  },
  handerTodo(e) {
    this.setData({ inputValue: e.detail.value })
  },
  handerComplete(e) {
    this.setData({ completeCheck: e.detail.value })
  }
});
