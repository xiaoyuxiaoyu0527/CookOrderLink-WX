Component({
  properties: {
    status: { type: String, value: 'pending' },
  },
  data: {
    label: '待做',
    cssClass: 'tag-pending',
  },
  observers: {
    status(val) {
      const map = {
        pending: { label: '待做', cssClass: 'tag-pending' },
        cooking: { label: '做菜中', cssClass: 'tag-cooking' },
        done: { label: '已完成', cssClass: 'tag-done' },
        cancelled: { label: '已取消', cssClass: 'tag-cancelled' },
      };
      const info = map[val] || map.pending;
      this.setData(info);
    },
  },
});
