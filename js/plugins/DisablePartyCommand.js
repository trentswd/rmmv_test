Scene_Battle.prototype.createActorCommandWindow = function() {
  this._actorCommandWindow = new Window_ActorCommand();
  this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
  this._actorCommandWindow.setHandler('skill', this.commandSkill.bind(this));
  this._actorCommandWindow.setHandler('guard', this.commandGuard.bind(this));
  this._actorCommandWindow.setHandler('item', this.commandItem.bind(this));
  //    this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
  // 加入逃跑选项
  this._actorCommandWindow.setHandler('escape', this.commandEscapeActor.bind(this));
  this.addWindow(this._actorCommandWindow);
  //this._actorCommandWindow.opacity = 150;

};

Scene_Battle.prototype.commandEscapeActor = function() {
  var actorIndex = BattleManager._actorIndex;
  BattleManager.selectNextCommand();
  BattleManager._actorIndex = actorIndex;
  this.commandEscape();
}

Window_ActorCommand.prototype.makeCommandList = function() {
  if (this._actor) {
    this.addAttackCommand();
    this.addSkillCommands();
    this.addGuardCommand();
    this.addItemCommand();
    //加入逃跑选项
    this.addCommand(TextManager.escape, 'escape', BattleManager.canEscape());
  }
};
