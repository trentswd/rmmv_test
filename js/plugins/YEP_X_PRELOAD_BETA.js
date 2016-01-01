//=============================================================================
// Yanfly Engine Plugins - Battle Animation Preloader
// YEP_X_PRELOAD_BETA.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_X_PRELOAD_BETA = true;

//=============================================================================
 /*:
 * @plugindesc vBETA
 * @author Yanfly Engine Plugins
 *
 * @help
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version BETA
 */
//=============================================================================

if (Imported.YEP_BattleEngineCore) {

//=============================================================================
// BattleManager
//=============================================================================

BattleManager.preloadAllBattleAnimations = function() {
    $gameParty._inBattle = true;
    this.preloadBattleAnimationMembers($gameParty.allMembers());
    this.preloadBattleAnimationMembers($gameTroop.members());
    this.preloadBattleAnimationItems();
};

BattleManager.preloadBattleAnimationMembers = function(members) {
    for (var i = 0; i < members.length; ++i) {
      var member = members[i];
      if (member) member.preloadBattleAnimations();
    }
};

BattleManager.preloadBattleAnimationItems = function() {
    for (var i = 0; i < $gameParty.items().length; ++i) {
      var item = $gameParty.items()[i];
      if (item) this.preloadBattleAnimationFrom(item);
    }
};

BattleManager.preloadBattleAnimation = function(animation) {
		if (!animation) return;
		var name1 = animation.animation1Name;
		var name2 = animation.animation2Name;
		var hue1 = animation.animation1Hue;
		var hue2 = animation.animation2Hue;
		ImageManager.loadAnimation(name1, hue1);
		ImageManager.loadAnimation(name2, hue2);
};

BattleManager.preloadBattleAnimationFrom = function(item) {
    if (!item) return;
    if (item.occassion === 2 || item.occassion === 3) return;
    var animationId;
    var animation;
    // Regular Animation
    animationId = item.animationId;
    animation = $dataAnimations[animationId];
    this.preloadBattleAnimation(animation);
    // Cast Animation
    animationId = item.castAnimation;
    animation = $dataAnimations[animationId];
    this.preloadBattleAnimation(animation);
    // Action Sequence Animations
    this.preloadBattleAnimationSequence(item.setupActions);
    this.preloadBattleAnimationSequence(item.wholeActions);
    this.preloadBattleAnimationSequence(item.targetActions);
    this.preloadBattleAnimationSequence(item.followActions);
    this.preloadBattleAnimationSequence(item.finishActions);
};

BattleManager.preloadBattleAnimationSequence = function(array) {
    if (!array) return;
    for (var i = 0; i < array.length; ++i) {
      var line = array[i][0];
      if (line.match(/ANIMATION[ ](\d+)/i)) {
        var animationId = parseInt(RegExp.$1);
        var animation = $dataAnimations[animationId];
        this.preloadBattleAnimation(animation);
      }
    }
};

//=============================================================================
// Game_Battler
//=============================================================================

Game_Battler.prototype.preloadBattleAnimations = function() {
		this.preloadSkillAnimations();
};

Game_Battler.prototype.preloadSkillAnimations = function() {
		for (var i = 0; i < this.skills().length; ++i) {
      var skill = this.skills()[i];
      if (skill) BattleManager.preloadBattleAnimationFrom(skill);
    }
};

//=============================================================================
// Game_Enemy
//=============================================================================

if (!Game_Enemy.prototype.skills) {
		Game_Enemy.prototype.skills = function() {
			var skills = []
			for (var i = 0; i < this.enemy().actions.length; ++i) {
				var skill = $dataSkills[this.enemy().actions[i].skillId]
				if (skill) skills.push(skill);
			}
			return skills;
		}
};

//=============================================================================
// Scene_Battle
//=============================================================================

Yanfly.BEC.Scene_Battle_createDisplayObjects =
		Scene_Battle.prototype.createDisplayObjects;
Scene_Battle.prototype.createDisplayObjects = function() {
		Yanfly.BEC.Scene_Battle_createDisplayObjects.call(this);
		BattleManager.preloadAllBattleAnimations();
};

//=============================================================================
// End of File
//=============================================================================
};
