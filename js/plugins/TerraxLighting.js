//=============================================================================
// Terrax Plugins - Lighting system
// TerraxLighting.js
// Version: 1.1.7
//=============================================================================
//
// This script overwrites the following core scripts.
// Scene_Load.prototype.onSavefileOk
// Game_CharacterBase.prototype.updateMove
// Spriteset_Map.prototype.createLowerLayer



//=============================================================================
 /*:
 * @plugindesc v1.1.7 Creates an extra layer that darkens a map and adds lightsources!
 * @author Terrax
 *
 * @param Player radius
 * @desc Adjust the light radius around the player
 * Default: 300
 * @default 300
 *
 * @param Reset Lights
 * @desc Resets the light switches each map
 * Default: No
 * @default No
 *
 * @param Save DaynightHours
 * @desc Game variable the time of day (0-23) can be stored in
 * Default: 0
 * @default 0
 *
 * @param Save DaynightMinutes
 * @desc Game variable the time of day (0-59) can be stored in
 * Default: 0
 * @default 0
 *
 * @param Save DaynightSeconds
 * @desc Game variable the time of day (0-59) can be stored in
 * Default: 0
 * @default 0 
 *
 * @help
 * To activate the script in an area, do the following:
 * 1. Put an event switch into the map.
 * 2. In the 'Note' field (Next to the name) put the following text :
 * Light 250 #FFFFFF
 * - Light activates the script
 * - 250 is the lightradius of the object
 * - #FFFFFF is the lightcolor (white in this case)
 * 3. You're done, its that simple.
 *
 * To alter the player radius in game use the following plugin command : 
 * Light radius 200 #FFFFFF  (to change the radius and the color)
 * If you want to change the player radius slowly over time (like a dying torch)
 * use the command 'Light radiusgrow 200 #FFFFFF'
 *
 * To turn on and off lightsources in the game, do the following:
 * Give the lightsource the normal def :  Light 250 #FFFFFF and an extra number 
 * so it becomes 'Light 250 #FFFFFF 1'
 * To turn on this light use plugin command : 'Light on 1'.
 * The plugin command will also trigger SelfSwitch 'D' on the targeted light(s).
 * To turn off the light use plugin command : 'Light off 1'.
 * You can reset the switches each map with the option or manualy by
 * the plugin command 'Light switch reset' 
 *
 * Replacing the 'Light' keyworld with 'Fire' will give the lights a subtle flicker
 * You can configure the fire effect with the plugin command 'SetFire 7 10'
 * Where 7 is the radius change and 10 is the shift in color from red to yellow. 
 * 
 * To completly turn off the script use : 'Light deactivate'
 * To turn it on again use the command: 'Light activate'
 *
 * To activate a day-night cycle on a map, put in a trigger with 'DayNight' in the note.
 * Plugin command 'Daynight speed 10' changes the speed.
 * Speed 10 means it takes 10 seconds to to pass one hour in game (probably to fast)
 * Plugin command 'Daynight hour 16 30' sets the hour to 16:30 hours
 * Each hour has its own color value.
 * Plugin command 'Daynight color 0 #222222' changes 0:00 hours to color value '#222222' 
 *
 * If you want to use the time of day to trigger effects (like turning on lights when it gets dark)
 * you can use the parameters 'Save DaynightHours','Save DaynightMinutes','Save DaynightSeconds'
 * The default is 0, which means its off.
 * If you set it to a value,5 for example, it will store the daynight value inside game variable 5.
 * You can then use that variable to trigger lights.
 * To help syncing/debugging the time system you can use scriptcommand 'daynight debug' to display the current time.
 * If you want to go 'alien world' and stuff, you can change the number of hours in a day with
 * script command 'daynight hoursinday 48' (for 48 hours in day, don't forget to fill in the hour values)
 *
 * To use a flashlight effect use 'Flashlight on 8 12 #FFFFFF' and 'Flashlight off'
 * Moving events can also use the flashlight effect. Use 'Flashlight 8 12 #888888 1' in the note-tag.
 * where 8 is the length of the flashlights beam and 12 is the width of the beam. The last number is
 * optional and can be used to turn the NPC's flashlight on or off, just like with lights.
 *
 * Released under the MIT license,
 * if used for commercial projects feel free to make a donation or 
 * better yet, give me a free version of what you have created.
 * e-mail : fox(AT)caiw.nl / terraxz2 on steam.
 * 
 * Special thanks to everyone in the rpgmakerweb community for idea's, support and interest.
*/
//=============================================================================
//  ps.. if my code looks funky, i'm an old guy..
// object orientated programming bugs the hell out of me.
var Imported = Imported || {};
Imported.TerraxLighting = true;

var testcounter = 0;

(function() {
	var lightarray_id = [];
	var lightarray_state = [];
	var lightgrow_value;
	var lightgrow_target;
	var lightgrow_speed;
	var oldmap = 0;
	var oldseconds = 0;
    var playercolor = '#FFFFFF';  
    var playerflicker = false; 
    var flickerradiusshift = 7;
    var flickercolorshift = 10;
    var playerflashlight = false;
    var flashlightlength = 8;
    var flashlightwidth = 12; 
    var scriptactive = true;
    var daynightspeed = 10;
    var daynightcycle = 17;
    var daynighttimer = 0;
    var daynightstop = false;
    var daynightcolors = [  '#000000', '#000000', '#000000', '#000000',
      						'#000000', '#000000', '#666666', '#AAAAAA',
      						'#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
      						'#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
      						'#FFFFFF', '#FFFFFF', '#AAAAAA', '#666666',
      						'#000000', '#000000', '#000000', '#000000' ];       						
	var daynightHoursInDay = 24;
	var parameters = PluginManager.parameters('TerraxLighting');
    var player_radius = Number(parameters['Player radius'] || 300);	
	var reset_each_map = parameters['Reset Lights'] || No;  
	var daynightsave = Number(parameters['Save DaynightHours'] || 10);	
	var daynightsavemin = Number(parameters['Save DaynightMinutes'] || 11);
	var daynightsavesec = Number(parameters['Save DaynightSeconds'] || 12);
	var daynightdebug = false;
	
	var move_event_x = [];
	var move_event_y = [];
	var move_event_id = [];
	var move_event_dir = [];
	
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        command = command.toLowerCase();
        if (command === 'light' || command === 'fire' || command === 'flashlight' || command === 'daynight' || command === 'setfire') {
            
	        // ************* DAYNIGHT *******************
	        if (command === 'daynight') {
   			
		   		if (args[0] === 'speed') {   
			   		daynightspeed = Number(args[1]);  
		        	if (daynightspeed == 0) {
			       		daynightspeed = 1000;
			       		daynightstop = true;
		        	} else {
		        		daynightstop = false;
			        }	
			        $gameVariables.setSpeedDayNightSave(daynightspeed);
		   		}
		   		
		   		if (args[0] === 'hour') {   
			   		daynightcycle = Number(args[1]);  
			   		if (args.length > 2) {
			   			daynightminutes = Number(args[2]); 
		   			} else {
			   			daynightminutes = 0;
		   			}
			   		daynighttimer = daynightminutes * daynightspeed;
			   		$gameVariables.setDayNightSaveMin(daynightminutes);
			   		if (daynightsavemin > 0) {
						$gameVariables.setValue(daynightsavemin, daynightminutes);			
					}
		        	if (daynightcycle < 0) {
			       		daynightcycle = 0;
					}
		        	if (daynightcycle >= daynightHoursInDay) {
			       		daynightcycle = (daynightHoursInDay-1);
					}
					if (daynightsave > 0) {
						$gameVariables.setValue(daynightsave, daynightcycle);			
					}
					$gameVariables.setDayNightSave(daynightcycle);

				}
				
				if (args[0] === 'hoursinday') { 
					var old_value = daynightHoursInDay ; 
			   		daynightHoursInDay = Number(args[1]);  
		        	if (daynightHoursInDay < 0) {
			       		daynightHoursInDay = 0;
					}
		        	if (daynightHoursInDay > old_value) {
			       		for (var i = old_value; i < daynightHoursInDay; i++) {
				       		daynightcolors.push('#FFFFFF');	
			       		}	
					}
					$gameVariables.setDayNightColorArray(daynightcolors);
					$gameVariables.setDayNightHoursInDay(daynightHoursInDay);
				}
				
				if (args[0] === 'debug') {   
						daynightdebug = true;
				}
				
		   			   		
		   		if (args[0] === 'color') {   
			   		var hour = Number(args[1]);  
		        	if (hour < 0) {
			       		hour = 0;
					}
		        	if (hour >= daynightHoursInDay) {
			       		hour = (daynightHoursInDay-1);
					}
					hourcolor = args[2];
					var isValidColor  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hourcolor); 	    
					if (isValidColor) {
						daynightcolors[hour] = hourcolor;
	   				}
	   				$gameVariables.setDayNightColorArray(daynightcolors);
				}
		   		
		        
			}
	       
	        // ************* FLASHLIGHT *******************
	        if (command === 'flashlight') {
		        if (args[0] == 'on') {
	    			playerflashlight = true;
	    			flashlightlength = args[1];
	    			flashlightwidth = args[2];
	    			playercolor = args[3];
					var isValidPlayerColor  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor); 	    
					if (!isValidPlayerColor) {
						playercolor = '#FFFFFF' 
					}
	    			if (flashlightlength == 0 || isNaN(flashlightlength)) { flashlightlength = 8 }
	    			if (flashlightwidth == 0 || isNaN(flashlightwidth)) { flashlightwidth = 12 }
	    			//Graphics.printError('test',flashlightlength+' '+flashlightwidth);
	    			$gameVariables.setPlayerColor(playercolor);  
    			}
		        if (args[0] == 'off') {
	    			playerflashlight = false;
    			}
    			$gameVariables.setFlashLight(playerflashlight);
			} 
			
	        // ******************* SET FIRE *******************
	        if (command === 'setfire') {
		       
    			flickerradiusshift = args[0];
    			flickercolorshift = args[1];
			 	//Graphics.printError('test',flickerradiusshift+' '+flickercolorshift);
    			$gameVariables.setFireRadius(flickerradiusshift);
				$gameVariables.setFireColorshift(flickercolorshift);
			}			
			

			// ******************* FIRE *******************
	        if (command === 'fire') {
	    		playerflicker = true;
	    		$gameVariables.setFire(playerflicker);
	    		$gameVariables.setFireRadius(flickerradiusshift);
				$gameVariables.setFireColorshift(flickercolorshift);
		    } else {
				playerflicker = false;   
				$gameVariables.setFire(playerflicker);
				$gameVariables.setFireRadius(flickerradiusshift);
				$gameVariables.setFireColorshift(flickercolorshift);
			}			
			
	        //var evid = this._eventId;
	        if (command === 'light' || command === 'fire') {
		        
		        //******************* Light radius 100 #FFFFFF ************************  	    
		        if (args[0] == 'radius') {
	    			var newradius = Number(args[1]);
	    			if (newradius >= 0) {
	    				player_radius = newradius;
	    				lightgrow_value = newradius;
	    				lightgrow_target = newradius;
	    				
						$gameVariables.setRadiusSave(player_radius);
	    				
					}
					if (args.length > 2) {
						playercolor = args[2];
						var isValidPlayerColor  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor); 	    
						if (!isValidPlayerColor) {
							playercolor = '#FFFFFF'    
							
						}
						$gameVariables.setPlayerColor(playercolor);  
					}
				} 
				
				//******************* Light radiusgrow 100 #FFFFFF ************************  	    
		        if (args[0] == 'radiusgrow') {
			        var evid = this._eventId;
			        //Graphics.printError('test',evid);
	    			var newradius = Number(args[1]);
	    			if (newradius >= 0) {
	    				//player_radius = newradius;
		 				lightgrow_value = player_radius;
						lightgrow_target = newradius;
						lightgrow_speed = (Math.abs(newradius-player_radius))/500;
	
					}
				
					if (args.length > 2) {
						playercolor = args[2];
						var isValidPlayerColor  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(playercolor); 	    
						if (!isValidPlayerColor) {
							playercolor = '#FFFFFF'    
						}
						$gameVariables.setPlayerColor(playercolor);  
					}
				} 
				
				// *********************** TURN SPECIFIC LIGHT ON *********************
	 			if (args[0] == 'on') {
	    	 		var lightid = Number(args[1]);
	    			var idfound = false;
					for (var i = 0; i < lightarray_id.length; i++) {
						if (lightarray_id[i] == lightid) {
							idfound = true;
							lightarray_state[i] = true;
						}
					}
					if (idfound == false) {
						lightarray_id.push(lightid);
						lightarray_state.push(true);					
					}
					//Graphics.printError('test',lightarray_id.length+' '+lightarray_state.length);
					$gameVariables.setLightArrayId(lightarray_id);
					$gameVariables.setLightArrayState(lightarray_state);				
				}	
				
				// *********************** TURN SPECIFIC LIGHT OFF *********************
	 			if (args[0] == 'off') {
	    			var lightid = Number(args[1]);
	    			var idfound = false;
					for (var i = 0; i < lightarray_id.length; i++) {
						if (lightarray_id[i] == lightid) {
							idfound = true;
							lightarray_state[i] = false;
						}
					}
					if (idfound == false) {
						lightarray_id.push(lightid);
						lightarray_state.push(false);
					}
					$gameVariables.setLightArrayId(lightarray_id);
					$gameVariables.setLightArrayState(lightarray_state);  
				}
				
				// **************************** RESET ALL SWITCHES ***********************
				if (args[0] == 'switch' && args[1] == 'reset') {
					// reset switches to false
									
					for (var i = 0; i < $dataMap.events.length; i++) {
		        		if ($dataMap.events[i]) {
							for (var j = 0; j < lightarray_id.length; j++) {
								if (lightarray_id[j] == lightid) {
									var mapid = $gameMap.mapId();
									var eventid = $dataMap.events[i].id;
									var key = [mapid,eventid,'D'];
									$gameSelfSwitches.setValue(key, false);
								}
							}
						}
					}
	    			lightarray_id = [];
					lightarray_state = [];
					$gameVariables.setLightArrayId(lightarray_id);
					$gameVariables.setLightArrayState(lightarray_state); 
				}
			}
			// *********************** TURN SCRIPT ON/OFF *********************
 			if (args[0] == 'deactivate') {
    			scriptactive = false;	
    			
			}
 			if (args[0] == 'activate') {
    			scriptactive = true;
    			
			}	
							
		}  
	}
    
	Spriteset_Map.prototype.createLightmask = function() {
	    this._lightmask = new Lightmask();
	    this.addChild(this._lightmask);
	};
	
	
	function Lightmask() {
	    this.initialize.apply(this, arguments);
	}
	
	Lightmask.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
	Lightmask.prototype.constructor = Lightmask;
	
	Lightmask.prototype.initialize = function() {
	    PIXI.DisplayObjectContainer.call(this);
	    this._width = Graphics.width;
	    this._height = Graphics.height;
	    this._sprites = [];
	    this._createBitmap();
	};
	
	//Updates the Lightmask for each frame.
	
	Lightmask.prototype.update = function() {
		  	this._updateMask();
	};
	
	//@method _createBitmaps
	
	Lightmask.prototype._createBitmap = function() {
	    this._maskBitmap = new Bitmap(2500,1500);   // one big bitmap to fill the intire screen with black
	    var canvas = this._maskBitmap.canvas;
	};
	
	/**
	 * @method _updateAllSprites
	 * @private
	 */
	Lightmask.prototype._updateMask = function() {
	
	
		// ****** DETECT MAP CHANGES ********
		var map_id = $gameMap.mapId();
		if (map_id != oldmap) {
			oldmap = map_id;
				
			
			if (reset_each_map == 'Yes' || reset_each_map == 'yes') {
				// reset switches to false
				for (var i = 0; i < $dataMap.events.length; i++) {
	        		if ($dataMap.events[i]) {
						for (var j = 0; j < lightarray_id.length; j++) {
							if (lightarray_id[j] == lightid) {
								var mapid = $gameMap.mapId();
								var eventid = $dataMap.events[i].id;
								var key = [mapid,eventid,'D'];
								$gameSelfSwitches.setValue(key, false);
							}
						}
					}
				}
    			Lightarray_id = [];
				lightarray_state = [];
				$gameVariables.setLightArrayId(lightarray_id);
				$gameVariables.setLightArrayState(lightarray_state); 
			} 
		}
	
				
		// remove old sprites
		for (var i = 0; i < this._sprites.length; i++) {	  // remove all old sprites
			this._removeSprite();
		}
		
		
		if (scriptactive == true) {	
			// are there lightsources on this map?
			for (var i = 0; i < $dataMap.events.length; i++) {
		        if ($dataMap.events[i]) {
		            var note = $dataMap.events[i].note
		            var note_args = note.split(" ");
		    		var note_command = note_args.shift().toLowerCase();    		
		            if (note_command == "light" || note_command == "fire" || note_command == "daynight" || note_command == "flashlight") {			
						this._addSprite(0,0,this._maskBitmap); // yes.. then turn off the lights		
						break;
					}
				}
			}
		
			// ******** GROW OR SHRINK GLOBE *********
			
			if (lightgrow_value < lightgrow_target) {			
				lightgrow_value = lightgrow_value + lightgrow_speed;
				player_radius = Math.floor(lightgrow_value)
				$gameVariables.setRadiusSave(player_radius);
			}
			if (lightgrow_value > lightgrow_target) {				
				lightgrow_value = lightgrow_value - lightgrow_speed;
				player_radius = Math.floor(lightgrow_value)
				$gameVariables.setRadiusSave(player_radius);
			}
			
			
		    // ****** PLAYER LIGHTGLOBE ********
		
		    var canvas = this._maskBitmap.canvas;
		   	var ctx = canvas.getContext("2d");
		    this._maskBitmap.fillRect(0, 0, 2500, 1500, 'black');
		  
			//ctx.globalCompositeOperation = 'lighten';
			ctx.globalCompositeOperation = 'lighter';
			
			var pw = $gameMap.tileWidth()
		    var ph = $gameMap.tileHeight();
			var dx = $gameMap.displayX();
			var dy = $gameMap.displayY();
			var px = $gamePlayer._realX;
			var py = $gamePlayer._realY;
			var pd = $gamePlayer._direction;	
			
			var x1 = (pw/2)+( (px-dx)*pw);
			var y1 = (ph/2)+( (py-dy)*ph);
		    var paralax = false;
			// paralax does something weird with coordinates.. recalc needed
			if (dx>$gamePlayer.x) {
				var xjump = $gameMap.width() - Math.floor(dx-px);  
				x1 = (pw/2)+(xjump*pw);
			} 
			if (dy>$gamePlayer.y) {
				var yjump = $gameMap.height() - Math.floor(dy-py);
				y1 = (ph/2)+(yjump*ph);
			}
					
			if (player_radius > 0) {
				if (playerflashlight == true) {
					this._maskBitmap.radialgradientFillRect2(x1,y1, 20, player_radius, playercolor, 'black', pd, flashlightlength, flashlightwidth);
				}
				if (player_radius < 100){
					// dim the light a bit at lower lightradius for a less focused effect.
					var r = hexToRgb(playercolor).r;
		    		var g = hexToRgb(playercolor).g;
		    		var b = hexToRgb(playercolor).b;
		    		g = g - 60;
		    		r = r - 60;
		    		b = b - 60;
					if (g<0) { g = 0; }
					if (r<0) { r = 0; }
					if (b<0) { b = 0; }						
		  			var newcolor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		  				
					this._maskBitmap.radialgradientFillRect(x1,y1, 0, player_radius, newcolor, 'black', playerflicker); 
				} else { 	
					this._maskBitmap.radialgradientFillRect(x1,y1, 20, player_radius, playercolor, 'black', playerflicker); 
				}
				
			}
			

			// *********************************** DAY NIGHT CYCLE TIMER **************************
		            
		    if (daynightspeed > 0) {
				if (daynightstop == false) {
					var seconds;
					var datenow = new Date();
					var seconds = Math.floor(datenow.getTime()/10); 
					if (seconds > oldseconds) {
						oldseconds = seconds;
						daynighttimer = daynighttimer + 1;
						var daynightminutes = Math.floor(daynighttimer/daynightspeed)
					    var daynighttimeover = daynighttimer-(daynightspeed*daynightminutes)
					    var daynightseconds = Math.floor(daynighttimeover/daynightspeed*60)
					    if (daynightdebug == true) {
						    var daynightseconds2 = daynightseconds;
						    if (daynightseconds < 10) {
							    daynightseconds2 = '0' + daynightseconds;
							}
							Graphics.Debug('Debug Daynight system',daynightcycle+' '+daynightminutes+' '+daynightseconds2);	
						}
		 				if (daynightsavemin > 0) {
							$gameVariables.setValue(daynightsavemin, daynightminutes);			
						}
						if (daynightsavesec > 0) {
							$gameVariables.setValue(daynightsavesec, daynightseconds);			
						}
						$gameVariables.setDayNightSaveMin(daynightminutes);
						if (daynighttimer >= (daynightspeed * 60)) {

							daynightcycle = daynightcycle + 1;
							if (daynightcycle >= daynightHoursInDay ) {
								daynightcycle = 0;
							}	
							if (daynightsave > 0) {
								$gameVariables.setValue(daynightsave, daynightcycle);
		 					}
		 					$gameVariables.setDayNightSave(daynightcycle);
							daynighttimer = 0;
						}
					}
			    }
	        }
			
			// ********** OTHER LIGHTSOURCES **************
			
			for (var i = 0; i < $dataMap.events.length; i++) {
		        if ($dataMap.events[i]) {
		            var note = $dataMap.events[i].note;
		            var evid = $dataMap.events[i].id;
		            var note_args = note.split(" ");
		    		var note_command = note_args.shift().toLowerCase();
		            if (note_command == "light" || note_command == "fire" || note_command == "flashlight") {
			            
			            var objectflicker = false;
			            if (note_command == "fire") {
			        		objectflicker = true;
				        }
				        
			            var light_radius = 1;
				        var flashlength = 8;
				        var flashwidth = 12;
				        if (note_command == "flashlight") {
					        flashlength = Number(note_args.shift());
					        flashwidth = Number(note_args.shift());
					        if (flashlength == 0) { flashlightlenth = 8 }
	    					if (flashwidth == 0) { flashlightlenth = 12 }
				    	} else {
			        		light_radius = note_args.shift();
		        		}        	
			        	// light radius
			        	if (light_radius >= 0) {
				        	
				        	// light color
				        	var colorvalue = note_args.shift();
				        	var isValidColor  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(colorvalue) 	    
				            if (!isValidColor) {
					        	colorvalue = '#FFFFFF'    
				            }     
					  		
				            // conditional lighting
						    var lightid = note_args.shift();
						    var state = true;
						     
				        	if (lightid > 0) {
					        	var state = false;
						    	for (var j = 0; j < lightarray_id.length; j++) {
									if (lightarray_id[j] == lightid) {
										idfound = true;
										state = lightarray_state[j]; 
										var mapid = $gameMap.mapId();
										var eventid = $dataMap.events[i].id;
										
										//Graphics.printError('test',mapid+' '+eventid);
										key = [mapid,eventid,'D'];
										if (state == true) {
											$gameSelfSwitches.setValue(key, true);
										} else {
											$gameSelfSwitches.setValue(key, false);
										}
									}
								}
							}  
						    			        	
				        	// show light
				            if (state == true) {
				        				        	
					            var lpx = $dataMap.events[i].x;
					            var lpy = $dataMap.events[i].y;
					            
					            // moving lightsources
					            var flashlight = false;
								for (var j = 0; j < move_event_id.length; j++) {
									if (move_event_id[j] == evid) {
										lpx = move_event_x[j];
										lpy = move_event_y[j];
										ldir = move_event_dir[j];
										if (note_command == "flashlight") {
											flashlight = true;
										}
									}
								}
					            
					            var lx1 = (pw/2)+( (lpx-dx)*pw);
								var ly1 = (ph/2)+( (lpy-dy)*ph);
								// paralaxloop does something weird with coordinates.. recalc needed
								
								if ($dataMap.scrollType === 2 || $dataMap.scrollType === 3) {	
									if (dx-10>lpx) {
										var lxjump = $gameMap.width() - (dx-lpx);
										lx1 = (pw/2)+(lxjump*pw);
									} 
								}
								if ($dataMap.scrollType === 1 || $dataMap.scrollType === 3) {
									if (dy-10>lpy) {
										var lyjump = $gameMap.height() -(dy-lpy);
										ly1 = (ph/2)+(lyjump*ph);
									}
								}
								if (flashlight == true) {
									this._maskBitmap.radialgradientFillRect2(lx1,ly1, 0, light_radius , colorvalue, 'black', ldir, flashlength, flashwidth);
								} else {
					            	this._maskBitmap.radialgradientFillRect(lx1,ly1, 0, light_radius , colorvalue, 'black', objectflicker); 
								}
					        }
		            	}
		            }
		            
		            
					// *********************************** DAY NIGHT CYCLE FILTER **************************
		            
		            
		            if (note_command == "daynight") {
		            
    					var color1 = daynightcolors[daynightcycle];
    					
    					if (daynightspeed > 0) {
	    					var nextcolor = daynightcycle+1;
	    					if (nextcolor >= daynightHoursInDay ) {
		    					nextcolor = 0;	
	    					}
	    					var color2 = daynightcolors[nextcolor];
	
	    					var r = hexToRgb(color1).r;
			    			var g = hexToRgb(color1).g;
			    			var b = hexToRgb(color1).b;
			    			
			    			var r2 = hexToRgb(color2).r;
			    			var g2 = hexToRgb(color2).g;
			    			var b2 = hexToRgb(color2).b;		    			
			    			
			    			var stepR = (r2-r)/(60*daynightspeed);
			    			var stepG = (g2-g)/(60*daynightspeed);
			    			var stepB = (b2-b)/(60*daynightspeed);
			    						    					    			
			    			r = Math.floor(r + (stepR * daynighttimer));
			    			g = Math.floor(g + (stepG * daynighttimer));
			    			b = Math.floor(b + (stepB * daynighttimer));
			    						    			
	    				}		    					    			
		  				color1 = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    					
						this._maskBitmap.FillRect(0,0,2500,1500,color1);
	            	}
		        }

		    }
			
			// reset drawmode to normal
		    ctx.globalCompositeOperation =  'source-over';	    
		}
	};
	
	
	/**
	 * @method _addSprite
	 * @private
	 */
	Lightmask.prototype._addSprite = function(x1,y1,selectedbitmap) {
		
	    var sprite = new Sprite(this.viewport);
	    sprite.bitmap = selectedbitmap;
	    sprite.opacity = 255;
	    sprite.blendMode = 2;
	    sprite.x = x1;
	 	sprite.y = y1;
	    this._sprites.push(sprite);
	    this.addChild(sprite);
	    sprite.rotation = 0;
	    sprite.ax = 0
	    sprite.ay = 0
	 	sprite.opacity = 255;
	};
	
	/**
	 * @method _removeSprite
	 * @private
	 */
	Lightmask.prototype._removeSprite = function() {
	    this.removeChild(this._sprites.pop());
	};
	
	
		
	// *******************  NORMAL BOX SHAPE ***********************************
	// Fill gradient circle
	
	Bitmap.prototype.FillRect = function(x1, y1, x2, y2, color1) {
	    var context = this._context;
	    context.save();
	    context.fillStyle = color1;
	    context.fillRect(x1, y1, x2, y2);
	    context.restore();
	    this._setDirty();
	};
	
	// *******************  NORMAL LIGHT SHAPE ***********************************
	// Fill gradient circle
	
	Bitmap.prototype.radialgradientFillRect = function(x1, y1, r1, r2, color1, color2, flicker) {
	    var context = this._context;
	    var grad;	  
	    var wait = Math.floor((Math.random()*8)+1); 
	   	if (flicker == true && wait == 1) {
		   	//var flickerradiusshift = 7;
    		//var flickercolorshift = 10;
		    var gradrnd = Math.floor((Math.random()*flickerradiusshift)+1); 
		  	var colorrnd = Math.floor((Math.random()*flickercolorshift)-(flickercolorshift/2)); 
		  	
		    var r = hexToRgb(color1).r;
		    var g = hexToRgb(color1).g;
		    var b = hexToRgb(color1).b;
		    g = g + colorrnd;
		    if (g<0) { g = 0; }
			if (g>255) { g = 255; }
		  	color1 = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
		    r2 = r2 - gradrnd;  
  		}
	  	grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
	    grad.addColorStop(0, color1);
	    grad.addColorStop(1, color2);
	    context.save();
	    context.fillStyle = grad;
	    context.fillRect(x1-r2, y1-r2, r2*2, r2*2);
	    context.restore();
	    this._setDirty();
	};
	
	// ********************************** FLASHLIGHT *************************************
	// Fill gradient Cone
	
	Bitmap.prototype.radialgradientFillRect2 = function(x1, y1, r1, r2, color1, color2, direction, flashlength, flashwidth) {
	    var context = this._context;
	    var grad;	
	    
	    // smal dim glove around player
	   	context.save();
	    	    
	    r1 = 0;
	  	r2 = 60;
		grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
		grad.addColorStop(0, '#999999');
		grad.addColorStop(1, color2);
	
		context.fillStyle = grad;
		context.fillRect(x1-r2, y1-r2, r2*2, r2*2);
	    
	    // flashlight
	    
	    //direction = 4;

		for (var cone = 0; cone < flashlength; cone++) {
		   	r1 = cone * 2;
	  		r2 = cone * flashwidth;
	  		
	  		switch(direction) {
	    		case 6:
	    			x1 = x1 + cone*6;
	       	    	break;
	   			case 4:
	   				x1 = x1 - cone*6;
	       	    	break;
	   			case 2:
	   				y1 = y1 + cone*6;
	       	    	break;
	            case 8:
	            	y1 = y1 - cone*6;
	       	    	break;
			} 
	  		  		

		  	grad = context.createRadialGradient(x1, y1, r1, x1, y1, r2);
		    grad.addColorStop(0, color1);
		    grad.addColorStop(1, color2);
	
		    context.fillStyle = grad;
		    context.fillRect(x1-r2, y1-r2, r2*2, r2*2);
    	}
	    
	    context.restore();	    
	    
	    
	    this._setDirty();
	};
	
	
	function hexToRgb(hex) {
    	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    	return result ? {
        	r: parseInt(result[1], 16),
        	g: parseInt(result[2], 16),
        	b: parseInt(result[3], 16)
    	} : null;
	}
	
	// Saving Variables in Game_Variables 
	// Big thanks to Schlangan for the code.
	
	Game_Variables.prototype.valueRadiusSave = function() {
		return this._Terrax_Lighting_Radius || 0;
	};
	Game_Variables.prototype.valueDayNightSave = function() {
		return this._Terrax_Lighting_DayNight || 0;
	};
	Game_Variables.prototype.valueDayNightSaveMin = function() {
		return this._Terrax_Lighting_DayNightMin || 0;
	};
	Game_Variables.prototype.valueSpeedDayNightSave = function() {
		return this._Terrax_Lighting_SpeedDayNight || 0;
	};
	Game_Variables.prototype.valueFlashLightSave = function() {
		return this._Terrax_Lighting_FlashLight || false;
	};
	Game_Variables.prototype.valueFireSave = function() {
		return this._Terrax_Lighting_Fire || false;
	};
	Game_Variables.prototype.setDayNightSave = function(value) {
		this._Terrax_Lighting_DayNight = value;
	};
	Game_Variables.prototype.setDayNightSaveMin = function(value) {
		this._Terrax_Lighting_DayNightMin = value;
	};
	Game_Variables.prototype.setRadiusSave = function(value) {
		this._Terrax_Lighting_Radius = value;
	};
	Game_Variables.prototype.setSpeedDayNightSave = function(value) {
		this._Terrax_Lighting_SpeedDayNight = value;
	};
	Game_Variables.prototype.setFlashLight = function(value) {
		this._Terrax_Lighting_FlashLight = value;
	};
	Game_Variables.prototype.setFire = function(value) {
		this._Terrax_Lighting_Fire = value;
	};
	Game_Variables.prototype.setFireRadius = function(value) {
		this._Terrax_Lighting_FireRadius = value;
	};
	Game_Variables.prototype.valueFireRadiusSave = function() {
		return this._Terrax_Lighting_FireRadius || false;
	};	
	Game_Variables.prototype.setFireColorshift = function(value) {
		this._Terrax_Lighting_FireColorshift = value;
	};
	Game_Variables.prototype.valueFireColorshiftSave = function() {
		return this._Terrax_Lighting_FireColorshift || false;
	};		
	Game_Variables.prototype.setPlayerColor = function(value) {
		this._Terrax_Lighting_PlayerColor = value;
	};
	Game_Variables.prototype.valuePlayerColorSave = function() {
		return this._Terrax_Lighting_PlayerColor || '#FFFFFF';
	};
	

	Game_Variables.prototype.valueDayNightColor = function() {
	    var default_color = [ '#FF0000', '#FF0000', '#FF0000', '#FF0000',
	                          '#FF0000', '#FF0000', '#FF0000', '#FF0000',
	                          '#FF0000', '#FF0000', '#FF0000', '#FF0000',
	                          '#FF0000', '#FF0000', '#FF0000', '#FF0000',
	                          '#FF0000', '#FF0000', '#FF0000', '#FF0000',
	                          '#FF0000', '#FF0000', '#FF0000', '#FF0000' ];
    	return this._Terrax_Lighting_DayNightColor || default_color;
	};

	Game_Variables.prototype.setDayNightColorArray = function(value) {
    	this._Terrax_Lighting_DayNightColor = value;
	};

	Game_Variables.prototype.valueLightArrayId = function() {
	    var default_LAI = [];
    	return this._Terrax_Lighting_LightArrayId || default_LAI;
	};

	Game_Variables.prototype.setLightArrayId = function(value) {
    	this._Terrax_Lighting_LightArrayId = value;
	};	
	
	Game_Variables.prototype.valueLightArrayState = function() {
	   	var default_LAS = [];
    	return this._Terrax_Lighting_LightArrayState || default_LAS;
	};

	Game_Variables.prototype.setLightArrayState = function(value) {
    	this._Terrax_Lighting_LightArrayState = value;
	};	


	
	function SaveLightingVariables() {

			var storeddata = $gameVariables.valueRadiusSave();
			if (storeddata > 0) {
				player_radius = storeddata;
			}

			var storeddata = $gameVariables.valueDayNightSave();
			if (storeddata > 0) {
				daynightcycle = storeddata;
				if (daynightsave > 0) {
					$gameVariables.setValue(daynightsave, daynightcycle);
				}
			}
			daynightminutes = $gameVariables.valueDayNightSaveMin();
			daynighttimer = daynightminutes * daynightspeed; 		

			var storeddata = $gameVariables.valueSpeedDayNightSave();
			if (storeddata > 0) {
				daynightspeed = storeddata;
			
				if (daynightspeed == 0) {
				   daynightspeed = 1000;
				   daynightstop = true;
			    } else {
			       daynightstop = false;
				}
			}
			playercolor = $gameVariables.valuePlayerColorSave();
			playerflicker = $gameVariables.valueFireSave();
			playerflashlight = $gameVariables.valueFlashLightSave(); 
			daynightcolors =  $gameVariables.valueDayNightColor();
			lightarray_id = $gameVariables.valueLightArrayId();
			lightarray_state = $gameVariables.valueLightArrayState();
			flickerradiusshift = $gameVariables.valueFireRadiusSave();
			flickercolorshift = $gameVariables.valueFireColorshiftSave();
	};
	
	
	

//Game_Variables.prototype.setDayNightColorIndex = function(value, index) {
//    this._Terrax_Lighting_DayNightColor[index] = value;
//};
	
	//****
	// Debug
	//****

	Graphics.Debug = function(name, message) {
    	if (this._errorPrinter) {
        	this._errorPrinter.innerHTML = this._makeErrorHtml(name, message);
    	}
	}
	
	//****
	// This function is overwritten from rpg_sprites.js
	//****

	Spriteset_Map.prototype.createLowerLayer = function() {
	    Spriteset_Base.prototype.createLowerLayer.call(this);
	    this.createParallax();
	    this.createTilemap();
	    this.createCharacters();
	    this.createShadow();
	    this.createDestination();
	    this.createLightmask();
	    this.createWeather();
	
	}
	
	//****
	// These functions are overwritten from objects/sprites/scenes.
	//****
	

	Game_CharacterBase.prototype.updateMove = function() {
		
		var evid = this._eventId;    // Capture the realX and realY of moving events.
		if (evid) {
			var note = $dataMap.events[evid].note;  
			var note_args = note.split(" ");
			var note_command = note_args.shift().toLowerCase();
			if (note_command == "light" || note_command == "fire" || note_command == "flashlight") {
				//Graphics.printError('test',evid + ' ' + this._realX + ' '+ this._realY);
				var idfound = false;
				for (var i = 0; i < move_event_id.length; i++) {
					if (move_event_id[i] == evid) {
						idfound = true;
						move_event_x[i] = this._realX;
						move_event_y[i] = this._realY;
						move_event_dir[i] = this._direction;
					}
				}
				if (idfound == false) {
					move_event_id.push(evid);
					move_event_x.push(this._realX);
					move_event_y.push(this._realY);	
					move_event_dir.push(this._direction);
				}
			}
		}
		//Graphics.printError('test',evid + ' ' + this._realX + ' '+ this._realY);
		
	    if (this._x < this._realX) {
	        this._realX = Math.max(this._realX - this.distancePerFrame(), this._x);
	    }
	    if (this._x > this._realX) {
	        this._realX = Math.min(this._realX + this.distancePerFrame(), this._x);
	    }
	    if (this._y < this._realY) {
	        this._realY = Math.max(this._realY - this.distancePerFrame(), this._y);
	    }
	    if (this._y > this._realY) {
	        this._realY = Math.min(this._realY + this.distancePerFrame(), this._y);
	    }
	    if (!this.isMoving()) {
	        this.refreshBushDepth();
	    }
	}
	
	
	Scene_Load.prototype.onSavefileOk = function() {
	    Scene_File.prototype.onSavefileOk.call(this);
	    if (DataManager.loadGame(this.savefileId())) {
	        this.onLoadSuccess();
	        
	        if (Imported.TerraxLighting) {	        
	        	SaveLightingVariables();
        	}
	        if (Imported.TerraxPuzzle) {
				SavePuzzleVariables();
		    }
	        	        
	    } else {
	        this.onLoadFailure();
	    }
	}


	
	

})();