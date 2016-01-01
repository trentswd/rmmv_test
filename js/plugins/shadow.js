 var Dora = Dora || {};
 Dora.shadow = Dora.shadow || {};


 //enemy shadow, need to solve the z axis issue to continue
 Dora.shadow._sprite_enemy_initMembers_ = Sprite_Enemy.prototype.initMembers;
 Sprite_Enemy.prototype.initMembers = function() {
   this.createShadowSprite();
   Dora.shadow._sprite_enemy_initMembers_.call(this);
   this.hasShadow = false;
 };

 Dora.shadow._sprite_enemy_sprite_updateBitmap_d = Sprite_Enemy.prototype.updateBitmap;
 Sprite_Enemy.prototype.updateBitmap = function() {
   Dora.shadow._sprite_enemy_sprite_updateBitmap_d.call(this);
   this._shadowSprite.scale.x = this.bitmap.width / 80; //doranikofu edit
   this._shadowSprite.scale.y = this.bitmap.height / 100; //doranikofu edit
   if (this.parent && !this.hasShadow) {
     var index = this.parent.getChildIndex(this);
     if (index >= 0) {
       this.parent.addChildAt(this._shadowSprite, index);
       this.updateShadowPosition();
       this.hasShadow = true;
     }
   }
 };

 Sprite_Enemy.prototype.createShadowSprite = function() {
   this._shadowSprite = new Sprite();
   this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow2');
   this._shadowSprite.anchor.x = 0.5;
   this._shadowSprite.anchor.y = 0.5;
   this._shadowSprite.y = -7;
   this._shadowSprite.z = -1;
   this._shadowSprite.bitmap.smooth = true;
 };

 Sprite_Enemy.prototype.updateShadowPosition = function() {
   this._shadowSprite.x = this.x;
   this._shadowSprite.y = this.y;
 };

 Dora.shadow.Sprite_Enemy_updatePosition = Sprite_Enemy.prototype.updatePosition;
 Sprite_Enemy.prototype.updatePosition = function() {
   Dora.shadow.Sprite_Enemy_updatePosition.call(this);
   this.updateShadowPosition();
 };
