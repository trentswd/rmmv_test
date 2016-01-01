//=============================================================================
// Game_Picture updateRotation Patch
// GamePictureRotationPatch.js
// Version: 1.00
//=============================================================================

var Imported = Imported || {};
Imported.GamePictureRotationPatch = true;

//=============================================================================
 /*:
 * @plugindesc v1.00 A patch to Game_Picture to fix the rotation glitch: the rotation speed less than 0 is invalid.
 */
//=============================================================================

Game_Picture.prototype.updateRotation = function() {
    if (this._rotationSpeed != 0) {
        this._angle += this._rotationSpeed / 2;
    }
}
