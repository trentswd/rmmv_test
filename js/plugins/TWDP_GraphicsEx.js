//=============================================================================
// Trentswd Plugins - Graphics Extend
// TWDP_GraphicsEx.js
//=============================================================================

var Imported = Imported || {};
Imported.TWDP_GraphicsEx = true;

var TWDP = TWDP || {};
TWDP.GE = TWDP.GE || {};

//=============================================================================
/*:
 * @plugindesc v1.00 Extend the Graphics
 * @author Trentswd
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * Don't have time to write this right now, sorry.
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * Don't have time to write this right now, sorry.
 *
 */
//=============================================================================

//=============================================================================
// Parameter Variables
//=============================================================================

TWDP.parameters = PluginManager.parameters('TWDP_GraphicsEx');
TWDP.GE.param = TWDP.GE.param || {};

(function($) {
  Graphics.initialize = function(width, height, type) {
    this._width = width || 800;
    this._height = height || 600;
    this._rendererType = type || 'auto';
    this._boxWidth = this._width;
    this._boxHeight = this._height;

    this._scale = 1;
    this._realScale = 1;

    this._errorPrinter = null;
    this._canvas = null;
    this._video = null;
    this._upperCanvas = null;
    this._renderer = null;
    this._fpsMeter = null;
    this._modeBox = null;
    this._skipCount = 0;
    this._maxSkip = 3;
    this._rendered = false;
    this._loadingImage = null;
    this._loadingCount = 0;
    this._fpsMeterToggled = false;
    this._stretchEnabled = this._defaultStretchMode();

    this._canUseDifferenceBlend = false;
    this._canUseSaturationBlend = false;
    this._hiddenCanvas = null;

    this._testCanvasBlendModes();
    this._modifyExistingElements();
    this._updateRealScale();

    this._rendererType = 'webgl';
    
    this._createAllElements();
    this._disableTextSelection();
    this._disableContextMenu();
    this._setupEventHandlers();

    this.showFps();
    this._requestFullScreen();

  };
})(TWDP.GE);
