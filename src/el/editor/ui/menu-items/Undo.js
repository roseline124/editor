import MenuItem from "./MenuItem";
   
export default class Undo extends MenuItem {
  getIconString() {
    return 'undo';
  }
  getTitle() {
    return "Undo";
  }

  isHideTitle() {
    return true;
  }

  clickButton(e) {
    this.emit('history.undo');
  }
}