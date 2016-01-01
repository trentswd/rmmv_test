//=============================================================================
// Yanfly Engine Plugins - Battle Engine Extension - Action Sequence Pack 2 Patch
// YEP_XX_ActSeqPack2_patch.js
//=============================================================================

var Imported = Imported || {};
Imported.YEP_XX_ActSeqPack2_patch = true;

var Yanfly = Yanfly || {};
Yanfly.ASP2P = Yanfly.ASP2P || {};

//=============================================================================
/*:
* @plugindesc v1.02 (Requires YEP_X_ActSeqPack2.js v1.05) Small
* fixs for YEP_X_ActSeqPack2.js.
* @author trentswd
*
* @help
* ============================================================================
* Introduction
* ============================================================================
*
* Alter move action to:
*   move user: target, type, frames, x offest, y offset, speed
*   move user: RETURN/HOME/ORIGIN, frames, speed
*   note:   
*     y offest not implemented yet.
*     consider the normal speed is 20 (pixels per frame)
*
* ============================================================================
* Default Action
* ============================================================================
*
*<setup action>
*CLEAR BATTLE LOG
*DISPLAY ACTION
*IMMORTAL: TARGETS, TRUE
*PERFORM START
*WAIT FOR MOVEMENT
*CAST ANIMATION
*WAIT FOR ANIMATION
*</setup action>
*
*<whole action>
*PERFORM ACTION
*if Yanfly.Param.BECMotionWait
*	motion wait: user
*else
*	WAIT: 10
*end
*ACTION ANIMATION
*WAIT FOR ANIMATION
*ACTION EFFECT
*DEATH BREAK
*</whole action>
*
*<target action>
*PERFORM ACTION
*if Yanfly.Param.BECMotionWait
*	motion wait: user
*else
*	WAIT: 10
*end
*ACTION ANIMATION
*WAIT FOR ANIMATION
*ACTION EFFECT
*DEATH BREAK
*</target action>
*
*<follow action>
*
*</follow action>
*
*<finish action>
*IMMORTAL: TARGETS, FALSE
*WAIT FOR NEW LINE
*CLEAR BATTLE LOG
*PERFORM FINISH
*WAIT FOR MOVEMENT
*WAIT FOR EFFECT
*ACTION COMMON EVENT
*</finish action>
*
* ============================================================================
* Changelog
* ============================================================================
*
* Version 1.00:
* - Finished plugin!
* Version 1.01:
* - Try to fix the face problem when move to same points.
* Version 1.02:
* - Update to fit the new methods.
* - Change the parameter split of origin yep plugin.
* - No longer support 'Far Front'
* - Support moving a x offset.
* - Support moving forward and backward with a speed rather than frames.
*/
//=============================================================================

if (Imported.YEP_BattleEngineCore && Imported.YEP_X_ActSeqPack2) {

    //=============================================================================
    // Parameters
    //=============================================================================

    Yanfly.Parameters = PluginManager.parameters('YEP_XX_ActSeqPack2_patch');
    Yanfly.Param = Yanfly.Param || {};

    Game_Battler.prototype.spriteFacePoint = function (pointX, pointY) {
        if (this.spritePosX() > pointX) {
            this.spriteFaceBackward();
        } else if (this.spritePosX() === pointX) {
        } else {
            this.spriteFaceForward();
        }
    };

    Game_Battler.prototype.spriteFaceAwayPoint = function (pointX, pointY) {
        if (this.spritePosX() === pointX) return;
        if (this.spritePosX() > pointX) {
            this.spriteFaceForward();
        } else {
            this.spriteFaceBackward();
        }
    };

    Game_Actor.prototype.spriteFacePoint = function (pointX, pointY) {
        if (this.spritePosX() === pointX) return;
        if (this.spritePosX() > pointX) {
            this.spriteFaceForward();
        } else {
            this.spriteFaceBackward();
        }
    };

    Game_Actor.prototype.spriteFaceAwayPoint = function (pointX, pointY) {
        if (this.spritePosX() === pointX) return;
        if (this.spritePosX() > pointX) {
            this.spriteFaceBackward();
        } else {
            this.spriteFaceForward();
        }
    };


    BattleManager.actionMove = function(name, actionArgs) {
        if (!$gameSystem.isSideView()) return true;
        var movers = this.makeActionTargets(name);
        if (movers.length < 1) return true;
        var cmd = actionArgs[0].toUpperCase();
        if (['HOME', 'ORIGIN'].contains(cmd)) {
          var frames = actionArgs[1] || 12;
          var speed = actionArgs[2] || 0;
          movers.forEach(function(mover) {
            if(speed > 0){
                var distance = Math.sqrt(Math.pow(mover.spritePosX() - mover.battler()._homeX, 2) + Math.pow(mover.spritePosY() - mover.battler()._homeX, 2));
                if(distance <= 0)
                {
                    distance = 1;
                }
                frames = Math.round(distance / speed);
            }
            mover.battler().startMove(0, 0, frames);
            mover.requestMotion('walk');
            mover.spriteFaceHome();
          });
        } else if (['RETURN'].contains(cmd)) {
          var frames = actionArgs[1] || 12;
          var speed = actionArgs[2] || 0;
          movers.forEach(function(mover) {
            if(speed > 0 ){
                var distance = Math.sqrt(Math.pow(mover.spritePosX() - mover.battler()._homeX, 2) + Math.pow(mover.spritePosY() - mover.battler()._homeX, 2));
                if(distance <= 0)
                {
                    distance = 1;
                }
                frames = Math.round(distance / speed);
            }
            mover.battler().startMove(0, 0, frames);
            mover.requestMotion('evade');
            mover.spriteFaceForward();
          });
        } else if (['FORWARD', 'FORWARDS', 'BACKWARD',
        'BACKWARDS'].contains(cmd)) {
          var distance = actionArgs[1] || Yanfly.Param.BECStepDist;
          if (['BACKWARD', 'BACKWARDS'].contains(cmd)) distance *= -1;
          var frames = actionArgs[2] || 12;
          movers.forEach(function(mover) {
            mover.battler().moveForward(distance, frames);
            mover.requestMotion('walk');
            if (['FORWARD', 'FORWARDS'].contains(cmd)) {
              mover.spriteFaceForward();
            } else {
              mover.spriteFaceBackward();
            }
          });
        } else if (['POINT', 'POSITION', 'COORDINATE', 'SCREEN', 'SCREEN POS',
        'COORDINATES'].contains(cmd)) {
          var destX = eval(actionArgs[1]) || 0;
          var destY = eval(actionArgs[2]) || 0;
          var frames = actionArgs[3] || 12;
          movers.forEach(function(mover) {
            mover.battler().moveToPoint(destX, destY, frames);
            mover.requestMotion('walk');
            mover.spriteFacePoint(destX, destY);
          });
        } else {
          var targets = this.makeActionTargets(actionArgs[0]);
          var frames = actionArgs[2] || 12;
          var type = actionArgs[1].toUpperCase();
          var offsetX = actionArgs[3] || 0;
          var offsetY = actionArgs[4] || 0;
          var speed = actionArgs[5] || 0;
          if (targets.length < 1) return false;
          for (var i = 0; i < movers.length; ++i) {
          	var mover = movers[i];
          	if (!mover) continue;
          	if (['BASE', 'FOOT', 'FEET'].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'center', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'foot');
    	      } else if (['CENTER', 'MIDDLE'].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'center', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'center');
    	      } else if (['HEAD', 'TOP'].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'center', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'head');
    	      } else if (['FRONT BASE', 'FRONT FOOT', 'FRONT FEET',
    	      'FRONT'].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'front', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'foot');
    	      } else if (['BACK BASE', 'BACK FOOT', 'BACK FEET',
    	      'BACK'].contains(type)) {
    	      	var destX = this.actionMoveX(mover, targets, 'back', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'foot');
    	      } else if (['FRONT CENTER', 'FRONT MIDDLE'].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'front', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'center');
    	      } else if (['BACK CENTER', 'BACK MIDDLE',].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'back', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'center');
    	      } else if (['FRONT HEAD', 'FRONT TOP'].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'front', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'head');
    	      } else if (['BACK HEAD', 'BACK TOP'].contains(type)) {
    	        var destX = this.actionMoveX(mover, targets, 'back', offsetX);
    	        var destY = this.actionMoveY(mover, targets, 'head');
    	      }
            if(speed > 0){
                var distance = Math.sqrt(Math.pow(mover.spritePosX() - destX, 2) + Math.pow(mover.spritePosY() - destY, 2));
                console.log(mover.spritePosX(), mover.spritePosY(), destX, destY, distance);
                if(distance <= 0)
                {
                    distance = 1;
                }
                frames = Math.round(distance / speed);
            }
    	    mover.battler().moveToPoint(destX, destY, frames);
            mover.spriteFacePoint(destX, destY);
          }
        }
        return true;
    };
}


BattleManager.actionMoveX = function(mover, targets, value, offset) {
        offset = offset || 0;
		value = this.actionMoveXLocation(mover, targets, value);
		var max = targets.length;
		var moverWidth = mover.spriteWidth();
		if (value === 'center') {
			var destX = null;
		} else {
			var destX = (value === 'left') ? Graphics.boxWidth : 0;
		}
		for (var i = 0; i < max; ++i) {
			var target = targets[i];
			if (!target) continue;
			var targetWidth = target.spriteWidth();
			var point = target.spritePosX();
			if (value === 'center') {
				destX = (destX === null) ? 0 : destX;
				destX += point + offset;
			} else if (value === 'left') {
				point -= targetWidth / 2;
				point -= (mover.isActor() ? 1 : 1) * moverWidth / 2;
				destX = Math.min(point, destX) - offset;
			} else {
				point += targetWidth / 2;
				point += (mover.isActor() ? 1 : 1) * moverWidth / 2;
				destX = Math.max(point, destX) + offset;
			}
		}
		if (value === 'center') destX /= max;
		return destX;
};

DataManager.convertSequenceLine = function(obj, line, actionType) {
  if (actionType <= 0 || actionType > 5) return;
  Yanfly.BEC.SeqType;
  var seqArgs;
 if (line.match(Yanfly.BEC.SeqType1)) {
    Yanfly.BEC.SeqType = RegExp.$1;
    argStr = RegExp.$2;
    seqArgs = argStr.split(",");
    for(var i = seqArgs.length - 1; i >= 0; i --){
      seqArgs[i] =  seqArgs[i].trim();
      if(seqArgs[i] === ""){
        seqArgs[i] = "0";
      }
      if(!isNaN(seqArgs[i])){
          seqArgs[i] = parseFloat(seqArgs[i]);
      }
    }
  } else if (line.match(Yanfly.BEC.SeqType0)) {
    Yanfly.BEC.SeqType = RegExp.$1;
    seqArgs = [];
  } else {
    return;
  }
  var array = [Yanfly.BEC.SeqType, seqArgs];
  if (actionType === 1) obj.setupActions[obj.setupActions.length] = array;
  if (actionType === 2) obj.wholeActions[obj.wholeActions.length] = array;
  if (actionType === 3) obj.targetActions[obj.targetActions.length] = array;
  if (actionType === 4) obj.followActions[obj.followActions.length] = array;
  if (actionType === 5) obj.finishActions[obj.finishActions.length] = array;
};
