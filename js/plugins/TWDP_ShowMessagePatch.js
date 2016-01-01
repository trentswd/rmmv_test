Window_NumberInput.prototype.placeButtons = function() {
    var numButtons = this._buttons.length;
    var spacing = 16;
    var totalWidth = -spacing;
    for (var i = 0; i < numButtons; i++) {
        totalWidth += this._buttons[i].width + spacing;
    }
    var x = (this.width - totalWidth) / 2;
    for (var j = 0; j < numButtons; j++) {
        var button = this._buttons[j];
        button.x = x;
        button.y = this.buttonY();
        x += button.width + spacing;
    }
};

Window_NumberInput.prototype.windowWidth = function() {
    var width = this.maxCols() * this.itemWidth() + this.paddingLeft() + this.paddingRight();
    if (width < 200) {
      width = 200;
    }
    return 200;
};

Window_NumberInput.prototype.buttonY = function() {
    var spacing = 24;
    if (this._messageWindow.y >= Graphics.boxHeight / 2) {
        return 0 - this._buttons[0].height - spacing;
    } else {
        return this.height + spacing;
    }
};
// 
// Scene_Map.prototype.start = function() {
//     Scene_Base.prototype.start.call(this);
//     SceneManager.clearStack();
//     if (this._transfer) {
//         //this.fadeInForTransfer();
//         this._mapNameWindow.open();
//         $gameMap.autoplay();
//     } else if (this.needsFadeIn()) {
//         this.startFadeIn(this.fadeSpeed(), false);
//     }
//     this.menuCalling = false;
// };
//
// Scene_Map.prototype.stop = function() {
//     Scene_Base.prototype.stop.call(this);
//     $gamePlayer.straighten();
//     this._mapNameWindow.close();
//     if (this.needsSlowFadeOut()) {
//         this.startFadeOut(this.slowFadeSpeed(), false);
//     } else if (SceneManager.isNextScene(Scene_Map)) {
//         //this.fadeOutForTransfer();
//     } else if (SceneManager.isNextScene(Scene_Battle)) {
//         this.launchBattle();
//     }
// };
