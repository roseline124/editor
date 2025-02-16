import MenuItem from "./MenuItem";
   
export default class OrderDown extends MenuItem {
  getIconString() {
    return 'to_back';
  }

  getTitle() {
    return "To Back";
  }

  clickButton(e) {
    this.emit('item.move.depth.down');
  }
}