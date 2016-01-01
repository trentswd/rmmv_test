//=============================================================================
// Kaus Ultimate Overlay
// Kaus_Ultimate_Overlay.js
// Version: 1.07
// Date Created: October 31, 2015
// Scripted By: Kaus
//=============================================================================

var Imported = Imported || {};
Imported.Kaus_Ultimate_Overlay = 1.07;

//=============================================================================
/*:
 * @plugindesc v1.07 Adds Overlay Images on the Map. (Ground,Parallax,Shadow,Light,Fog)
 * @author Kaus
 *
 * @param -F I L E  N A M E S-
 * @default
 * @param Organized Folders
 * @desc Use different folders for each layers instead of using default folder 'parallaxes'
 * Default: false
 * @default false
 * @param Parallax Filename
 * @desc filename used for displaying Parallax Images  
 * Default: par
 * @default par
 * @param Ground Filename
 * @desc filename used for displaying Ground Images 
 * Default: ground
 * @default ground
 * @param Light Filename
 * @desc filename used for displaying Light Images 
 * Default: light
 * @default light
 * @param Shadow Filename
 * @desc filename used for displaying Shadow Images 
 * Default: shadow
 * @default shadow
 * @param -S E T T I N G S-
 * @default
 * @param Light Opacity
 * @desc Opacity that Light Images use.  
 * Default:185
 * @default 185
 * @param Quick Start
 * @desc Starts the game with the switches on automatically to avoid fade in transition.
 * Default:true
 * @default true
 * @param Bind Pictures
 * @desc NOTE: Kaus_Ultimate_Overlay should be placed BELOW Galenmereth's Bind Pictures in order to work.
 * Default:false
 * @default false
 * @param Terrax Lighting
 * @desc NOTE: Kaus_Ultimate_Overlay should be placed BELOW Terrax Lighting in order to work.
 * Default:false
 * @default false
 * @param -S W I T C H E S-
 * @default
 * @param Fog Switch ID
 * @desc Overlay Switch ID used for displaying Fog
 * Default:1
 * @default 1
 * @param Light Switch ID
 * @desc Overlay Switch ID used for displaying Light
 * Default:2
 * @default 2
 * @param Parallax Switch ID
 * @desc Overlay Switch ID used for displaying Parallax
 * Default:3
 * @default 3
 * @param Shadow Switch ID
 * @desc Overlay Switch ID used for displaying Shadow
 * Default:4
 * @default 4
 *
 *@help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin lets you add overlay images on your map. 
 * You have a choice of 5 different layers on the map to put your custom images
 * 
 * ============================================================================
 * Filename and Use Instructions
 * ============================================================================
 * By Default:
 * All images must be saved in img/Parallaxes Folder.
 * ground,par,shadow and light overlays must be named designated to their mapID
 * For example: display a parallax map and light in MapID:002
 * Name your files par2 and light 2 and save it in img/Parallaxes Folder
 *
 * If Parameter Option: Organized Folders is set to true
 * Create the ff. new folders:
 * (img/overlays/grounds)
 * (img/overlays/pars)
 * (img/overlays/shadows)
 * (img/overlays/lights)
 * (img/overlays/fog)
 * And all the overlay images you will use should be inside those folders
 * specific to their layer type.
 *
 * ============================================================================
 * Notetags Instructions
 * ============================================================================
 * Note: Input your notetags inside the map properties. The following notetags 
 *       is case sensitive and space sensitive.
 * 
 *  <all>               display all 3 overlays (ground,par,light)
 *  <ground>            display ground layer.
 *  <par>               display parallax layer.
 *  <light>             display light layer.
 *  <shadow>            display shadow layer.
 *  <fogName:filename>  display the chosen fog.
 *  <fogBlend:number>   (OPTIONAL) changes the blend type of fog 0:NORMAL 1:ADD
 *  <fogDuration:number>(OPTIONAL) makes a transition depending on value = frames.before completing opacity.
 *  <xMove:number>      (OPTIONAL) moves the fog left or right (+ moves right, - moves left)
 *  <yMove:number>      (OPTIONAL) moves the fog up or down (+ moves down, - moves up)
 *
 *
 * LAYERS:
 * Light Layer    is the highest layer and used for creating Light Effects such as Sunlight Rays, or Street Lights, etc.
 * Fog Layer      is used for creating a Fog Effect in much that is moving automatically by settings. Used for Mists Clouds etc.
 * Shadow Layer   is used for creating shadow effects.
 * Parallax Layer is used for adding an image in the map that will be OVER the character. 
 * Ground Layer   like Parallax Layer it is used for creating custom images but UNDER your characters.
 *
 *
 *
 * ============================================================================
 * Plugin Command Instructions
 * ============================================================================
 * To change the layer in current map use this Plugin Command;
 * Call Plugin Command thru event then type the following Arguments:
 *
 * Overlay layertype filename
 *      for example: Overlay light light2-1
 *
 * Layer Types:
 * ground = for ground layer
 * par = for parallax layer
 * shadow = for shadow layer
 * light = for light layer
 * fog = for fog layer
 *
 * Calling a new fog has its own arguments: (blendmode and duration is optional and doesnt need to have a value)
 * 
 * Arguments:  Overlay fog filename opacity xMove yMove blendmode duration
 * Examples:
 *             Overlay fog mist2 155 1 -0.5   //Displays 'mist2' fog in 155 Opacity that moves position x to 1 and y to -0.5 every frame. 
 *             Overlay fog shade 130 0 0 1 60 //Displays 'shade' fog in 130 Opacity, additive blend, doesnt move, fades in w/in 60 frames.
 *
 * 1.07 New Feature: Fog Fade Out
 * Function:  Fades out the current fog displayed over the duration.
 * Arguments: Overlay fadeout duration
 * Examples:  Overlay fadeout 120       //Fades out the current fog over 120 frames.
 *
 * NOTE: -Changing Layer Images DOESN'T REQUIRE notetags in the map to display BUT REQUIRES switches.
 *       -DO NOT USE Overlay fadeout if you have map notetags exist in a map as it will not work and map notetags will persist 
 *        to display its function. USE fog switches to turn off the display of the fog completely. 
 */

(function() {
    
function boolFunc(str) {
    return Function("return " + str + " === true")();
  } 
    
var parameters = PluginManager.parameters('Kaus_Ultimate_Overlay');
var parallax_FN = String(parameters['Parallax Filename']);
var ground_FN = String(parameters['Ground Filename']);
var light_FN = String(parameters['Light Filename']);
var shadow_FN = String(parameters['Shadow Filename']);
var light_OP = Number(parameters['Light Opacity']);
var fogSwitch = Number(parameters['Fog Switch ID']);
var lightSwitch = Number(parameters['Light Switch ID']);
var parSwitch = Number(parameters['Parallax Switch ID']);
var shadowSwitch = Number(parameters['Shadow Switch ID']);
var startSwitch = boolFunc(parameters['Quick Start']);
var useBindPictures = boolFunc(parameters['Bind Pictures']);
var useTerrax = boolFunc(parameters['Terrax Lighting'])
var useFolder = boolFunc(parameters['Organized Folders'])

var overlayType = "";
var overlayName = "";
var overlayOpacity = 0;
var overlayxMove = 0;
var overlayyMove = 0;
var overlayDuration;
var overlayBlend = 0;
var overlayFadeOut = false;
var fogFadeOut;

Spriteset_Map.prototype.createLowerLayer = function() {
    Spriteset_Base.prototype.createLowerLayer.call(this);
    overlayType = "";
    overlayName = "";
    overlayOpacity = 0;
    overlayxMove = 0;
    overlayyMove = 0;
    overlayBlend = 0;
    overlayFadeOut = false;
    overlayDuration;
    fogFadeOut;
    map = $dataMap;
    if(startSwitch==true){
        $gameSwitches.setValue(parSwitch,true);
        $gameSwitches.setValue(lightSwitch,true);
        $gameSwitches.setValue(fogSwitch,true);
        $gameSwitches.setValue(shadowSwitch,true);
    }
    if(useBindPictures==true) this.createPicturesLayer('bottom', this._baseSprite);
    this.createParallax();
    if(useBindPictures==true) this.createPicturesLayer('below_tilemap', this._baseSprite);
    this.createTilemap();
    this.createGroundMap();
    if(useBindPictures==true) this.createPicturesLayer('below_characters', this._tilemap);
    this.createCharacters();
    if(useBindPictures==true) this.createPicturesLayer('above_characters', this);
    this.createParMap();
    this.createShadowMap();
    this.createFogMap();
    this.createLightMap();
    this.createShadow();
    if(useBindPictures==true) this.createPicturesLayer('below_weather', this._tilemap, 8); 
    this.createWeather();
    if(useBindPictures==true) this.createPicturesLayer('top', this);
    if(useTerrax==true) this.createLightmask();   
    this.createDestination();
};
  
    
Spriteset_Map.prototype.update = function() {
    Spriteset_Base.prototype.update.call(this);
    this.updateTileset();
    this.updateGroundMap();
    this.updateParallax();
    this.updateParMap();
    this.updateShadowMap();
    this.updateFogMap();
    this.updateLightMap();
    this.updateTilemap();
    this.updateShadow();
    this.updateWeather();
    if(useBindPictures==true) this.updatePictures();
};        
//==================== G R O U N D  M A P ======================    
Spriteset_Map.prototype.createGroundMap = function() {
    this._groundMap = new TilingSprite();
    if(map.meta.ground || map.meta.all){
        if(useFolder) this._groundMap.bitmap = ImageManager.loadBitmap('img/overlays/grounds/',ground_FN+$gameMap.mapId());
        else this._groundMap.bitmap = ImageManager.loadParallax(ground_FN+$gameMap.mapId());
    };
    this._groundMap.move(0, 0, Graphics.width, Graphics.height);
    this._groundMap.z = 1;
    this._tilemap.addChild(this._groundMap);
    };
    
Spriteset_Map.prototype.updateGroundMap = function() {
        this._groundMap.origin.x =  $gameMap.displayX() * $gameMap.tileWidth();
        this._groundMap.origin.y =  $gameMap.displayY() * $gameMap.tileHeight();
        //Plugin Command Update
       if(overlayType=="ground"){
           if(useFolder) this._groundMap.bitmap = ImageManager.loadBitmap('img/overlays/grounds/',overlayName);
           else this._groundMap.bitmap = ImageManager.loadParallax(overlayName);
       }
    };

        
//======================= P A R  M A P =========================    
Spriteset_Map.prototype.createParMap = function() {
    this._parMap = new TilingSprite();
    if(map.meta.par || map.meta.all){
        if(useFolder) this._parMap.bitmap = ImageManager.loadBitmap('img/overlays/pars/',parallax_FN+$gameMap.mapId());
        else this._parMap.bitmap = ImageManager.loadParallax(parallax_FN+$gameMap.mapId());
    };
    this._parMap.move(0, 0, Graphics.width, Graphics.height);
    this._parMap.z = 20
    this._tilemap.addChild(this._parMap);
    if($gameSwitches.value(parSwitch)== true) 
      this._parMap.opacity = 255;
     else
      this._parMap.opacity = 0;
};

Spriteset_Map.prototype.updateParMap = function() {
        this._parMap.origin.x =  $gameMap.displayX() * $gameMap.tileWidth();
        this._parMap.origin.y =  $gameMap.displayY() * $gameMap.tileHeight();
       //Switch Checking
       if($gameSwitches.value(parSwitch)== true){
        if(this._parMap.opacity < 255) this._parMap.opacity += 10; }
     else
        if(this._parMap.opacity!=0) this._parMap.opacity -= 10;
    
    //Plugin Command Update
     if(overlayType=="par"){
        if(useFolder) this._parMap.bitmap = ImageManager.loadBitmap('img/overlays/pars/',overlayName);
        else this._parMap.bitmap = ImageManager.loadParallax(overlayName);
    };
 };
    
        
//======================= S H A D O W  M A P =========================    
Spriteset_Map.prototype.createShadowMap = function() {
    this._shadowMap = new TilingSprite();
     if(map.meta.shadow || map.meta.all){
         if(useFolder) this._shadowMap.bitmap = ImageManager.loadBitmap('img/overlays/shadows/',shadow_FN+$gameMap.mapId());
         else this._shadowMap.bitmap = ImageManager.loadParallax(shadow_FN+$gameMap.mapId());
     }
    this._shadowMap.move(0, 0, Graphics.width, Graphics.height);
    this._shadowMap.z = 21
    this._tilemap.addChild(this._shadowMap);
    if($gameSwitches.value(shadowSwitch)== true) 
      this._shadowMap.opacity = 255;
     else
      this._shadowMap.opacity = 0;
};

Spriteset_Map.prototype.updateShadowMap = function() {
        this._shadowMap.origin.x =  $gameMap.displayX() * $gameMap.tileWidth();
        this._shadowMap.origin.y =  $gameMap.displayY() * $gameMap.tileHeight();
       //Switch Checking
       if($gameSwitches.value(shadowSwitch)== true){
        if(this._shadowMap.opacity < 255) this._shadowMap.opacity += 10; }
     else
        if(this._shadowMap.opacity!=0) this._shadowMap.opacity -= 10;
    
    //Plugin Command Update
     if(overlayType=="shadow"){
        if(useFolder) this._shadowMap.bitmap = ImageManager.loadBitmap('img/overlays/shadows/',overlayName);
         else this._shadowMap.bitmap = ImageManager.loadParallax(overlayName);
     };
};
    
//===================== L I G H T  M A P =======================
Spriteset_Map.prototype.createLightMap = function() {
    map = $dataMap;
    this._lightMap = new TilingSprite();
     if(map.meta.light || map.meta.all){
        if(useFolder) this._lightMap.bitmap = ImageManager.loadBitmap('img/overlays/lights/',light_FN+$gameMap.mapId());
         else this._lightMap.bitmap = ImageManager.loadParallax(light_FN+$gameMap.mapId());
     };
    this._lightMap.move(0, 0, Graphics.width, Graphics.height);
    this._lightMap.blendMode = 1;
    this._lightMap.z = 23;
    this._tilemap.addChild(this._lightMap);
    if($gameSwitches.value(lightSwitch)== true) 
      this._lightMap.opacity = light_OP;
     else
      this._lightMap.opacity = 0;
};

Spriteset_Map.prototype.updateLightMap = function() {
        this._lightMap.origin.x =  $gameMap.displayX() * $gameMap.tileWidth();
        this._lightMap.origin.y =  $gameMap.displayY() * $gameMap.tileHeight();
        //Switch Checking
       if($gameSwitches.value(lightSwitch)== true){
        if(this._lightMap.opacity < light_OP) this._lightMap.opacity += 1; }
     else
        if(this._lightMap.opacity!=0) this._lightMap.opacity -= 1;
    
    //Plugin Command Update
     if(overlayType=="light"){
        if(useFolder) this._lightMap.bitmap = ImageManager.loadBitmap('img/overlays/lights/',overlayName);
         else this._lightMap.bitmap = ImageManager.loadParallax(overlayName);
         };
};
    
    
//======================= F O G  M A P ==========================
Spriteset_Map.prototype.createFogMap = function() {
    map = $dataMap;
    this._fogMap = new TilingSprite();
    if(map.meta.fogName){
        if(useFolder) this._fogMap.bitmap = ImageManager.loadBitmap('img/overlays/fogs/',map.meta.fogName);
        else this._fogMap.bitmap = ImageManager.loadParallax(map.meta.fogName);
    };
    this._fogMap.move(0, 0, Graphics.width, Graphics.height);
    this._fogMap.blendMode = Number(map.meta.fogBlend) || 0;
    this._fogMap.opacity = 0;
    this._fogMap.origin.x =  $gameMap.displayX() * $gameMap.tileWidth();
    this._fogMap.origin.y =  $gameMap.displayY() * $gameMap.tileHeight();
    this._fogMap.z = 22;
    newX = 0;
    newY = 0;
    this._tilemap.addChild(this._fogMap);
};

Spriteset_Map.prototype.updateFogMap = function() {
        map = $dataMap;
        if(overlayBlend!=0) this._fogMap.blendMode = 1;
        if(overlayxMove!=0){ newX += Number(overlayxMove); }
         else newX += Number(map.meta.xMove) || 0;
        if(overlayyMove!=0){ newY += Number(overlayyMove); }
         else newY += Number(map.meta.yMove) || 0;
        if(newX!=0) this._fogMap.origin.x =  ($gameMap.displayX() * $gameMap.tileWidth()) - newX;
         else this._fogMap.origin.x =  ($gameMap.displayX() * $gameMap.tileWidth());
        if(newY!=0) this._fogMap.origin.y =  ($gameMap.displayY() * $gameMap.tileHeight()) - newY;
         else this._fogMap.origin.y =  ($gameMap.displayY() * $gameMap.tileHeight());
    //Switch Checking 
     if($gameSwitches.value(fogSwitch)== true){
         if(overlayOpacity!=0){ //if plugin call opacity exist
          defOpacity = Number(overlayOpacity); }
          else{ //if not
           defOpacity = Number(map.meta.fogOpacity); }
         if(overlayDuration){ //if plugin call duration exist
             fogDuration = overlayDuration; }
          else{ //if not
              fogDuration = Number(map.meta.fogDuration) || 1 ;  }
         fogTransition = defOpacity / fogDuration; 
     }
    else if(this._fogMap.opacity!=0) this._fogMap.opacity -= 10;
    // Transition Effect
    if(overlayFadeOut){ // Fade Out
               fogTransition = defOpacity / fogFadeOut;
               if(this._fogMap.opacity!=0) this._fogMap.opacity -= fogTransition;
               else if(this._fogMap.opacity==0){ //reset variables if opacity is 0
                   overlayFadeOut = false;
                   overlayOpacity = 0;
               }
         }
    else if(this._fogMap.opacity < defOpacity){ //Fade In
             this._fogMap.opacity += fogTransition; 
         }
    //Plugin Command Update
     if(overlayType=="fog"){
        if(useFolder) this._fogMap.bitmap = ImageManager.loadBitmap('img/overlays/fogs/',overlayName);
         else this._fogMap.bitmap = ImageManager.loadParallax(overlayName);
     };
};
    
//====================P L U G I N   C O M M A N D==================
    var _GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
  	_GameInterpreter_pluginCommand.call(this, command, args);
  	if (command == "Overlay") {
  	  if (args[0] == "fog") { //Fog Call
  	  	if (args[1]) { //filename
  	  	  if (args[2]){ //opacity
              if (args[3]){ //xMove
                if (args[4]){ //yMove
                    overlayType = args[0];
                    overlayName = args[1];
                    overlayOpacity = args[2];
                    overlayxMove = args[3];
                    overlayyMove = args[4];
                    if (args[5]) overlayBlend = args[5]; //fogBlend
                    if (args[6]) overlayDuration = args[6]; //fogDuration
              }
            }
          }
  	  	}
  	  } else if(args[0] == "fadeout" ){ //fog fadeout
          if (args[1]){
              overlayFadeOut = true;
              fogFadeOut = args[1]; //fadeout duration
          }
      }
        else if(args[0]){ //layer type
          if (args[1]) { //filename
                overlayType = args[0];
                overlayName = args[1];
          }
      }
  	}//Command Overlay End
  };

})();
