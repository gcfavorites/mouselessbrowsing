/*
 * Mouseless Browsing 
 * Version 0.5
 * Created by Rudolf No�
 * 31.12.2007
*/
(function(){
   
   //Imports
	var Utils = rno_common.Utils
	var MlbCommon = mouselessbrowsing.MlbCommon
	var PageInitializer = mouselessbrowsing.PageInitializer
	var EventHandler = mouselessbrowsing.EventHandler
	
	//Add event for each window
	window.addEventListener('load',  MLB_initOnStartup, false);
	
	/*
	Initilization for main window
	*/
	function MLB_initOnStartup() {
		//ShortcutManager must be initialized first, that it processes the
		//key-down-events first ;-)
		//ToDo: Why that?
		ShortCutManager.getInstance();
		
		//Add Main-Key-Listener
		window.addEventListener("keydown", {handleEvent: function(event){EventHandler.onkeydown(event)}}, true);  
		
		//Add pageshow listener to each page
		var appcontent = document.getElementById("appcontent");   // browser
		//Todo: Change to DOMContentLoaded
		if(appcontent){
			appcontent.addEventListener("DOMContentLoaded", {handleEvent: function(event){PageInitializer.onDOMContentLoaded(event)}}, true);
			appcontent.addEventListener("pageshow", {handleEvent: function(event){PageInitializer.onPageShow(event)}}, true);
		}
		
		//Focus Listener
		getBrowser().addEventListener("focus",{handleEvent: function(event){EventHandler.elementFocused(event)}},true);
      getBrowser().addEventListener("blur",{handleEvent: function(event){EventHandler.elementFocusLost(event)}},true);
		
		//Init shortcuts and preferences
		mouselessbrowsing.InitManager.init();
	} 

})()