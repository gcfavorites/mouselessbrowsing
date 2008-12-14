/*
 * Mouseless Browsing 
 * Version 0.5
 * Created by Rudolf No�
 * 30.12.2007
 */

(function(){
	
	var KeyInputbox = mlb_common.KeyInputbox
	var Prefs = mlb_common.Prefs
   var ShortcutManager = mlb_common.ShortcutManager
	var Utils = mlb_common.Utils

	var EventHandler = mouselessbrowsing.EventHandler
   var GoogleProjectHelper = mouselessbrowsing.miscellaneous.GoogleProjectHelper
   var LayoutDebugger = mouselessbrowsing.miscellaneous.LayoutDebugger
   var MlbCommon = mouselessbrowsing.MlbCommon
	var MlbPrefs = mouselessbrowsing.MlbPrefs
	var MlbUtils = mouselessbrowsing.MlbUtils
	var PageInitializer = mouselessbrowsing.PageInitializer
	var TabLocalPrefs = mouselessbrowsing.TabLocalPrefs
	var VersionManager = mouselessbrowsing.VersionManager
   
	var STRINGBUNDLE_ID = "mouselessbrowsingOverlaySB"

   //Prefs observer
   var MLB_prefObserver = null;
   
   //EventHandler
   var mainKeyPressHandler = {handleEvent: function(event){EventHandler.onkeypress(event)}};
   var mainKeyDownHandler = {handleEvent: function(event){EventHandler.onkeydown(event)}}
   var mainDomContentLoadedHandler = {handleEvent: function(event){PageInitializer.onDOMContentLoaded(event)}}
   var mainPageShowHander = {handleEvent: function(event){PageInitializer.onPageShow(event)}}
   var googleProjectHelperHandler = {handleEvent: function(event){GoogleProjectHelper.onPageShow(event)}}
   var focusHandler = {handleEvent: function(event){EventHandler.onElementFocusEvent(event)}}
   var tabSelectHandler = {handleEvent: function(event){mouselessbrowsing.TabLocalPrefs.onTabSelect()}}
   
   
	var InitManager = {
		eventHandlersActive: false,
		
		init: function(event){
		   MlbPrefs.initPrefs();
         if(VersionManager.hasVersionToBeMigrated()){
            VersionManager.doMigration()
         }
         if(MLB_prefObserver==null){
            this.registerObservers();
         }
         ShortCutManager.clearAllShortCutsForClientId(MlbCommon.SCM_CLIENT_ID);
			if(MlbPrefs.disableMLB){
				this.disableMLB()
			}else{
				this.enableMLB()
			}
		   this.initStatusbar();
         if(Application.prefs.get("mouselessbrowsing.debug.layoutdebugger", false)){
            LayoutDebugger.init()
         }
		   MlbUtils.logDebugMessage("InitManager.init done")
		},
		
		enableMLB: function (){
		    this.initShortCuts();
		    if(!this.eventHandlersActive){
		       this.initEventHandlers("addEventListener");
		       this.eventHandlersActive = true
		    }
		    TabLocalPrefs.initPrefs()
		    this.initMenu();
          var showIdsOnDemand = Prefs.getBoolPref("mouselessbrowsing.showIdsOnDemand");
          var disableAllIds = Prefs.getBoolPref("mouselessbrowsing.disableAllIds");
          //Init the current page the others are only initialized on demand
          PageInitializer.init()

          //As only the current page will be entirely initialized for performance reasons
          //the visibility mode of the others must be adjusted 
          var browsers = gBrowser._browsers
          for (var i = 0; i < browsers.length; i++) {
          	if(browsers[i]==gBrowser.mCurrentBrowser){
          		continue
          	}
          	var contentWin = browsers[i].contentWindow
          	var visibilityMode = TabLocalPrefs.getVisibilityMode(contentWin)
          	var idsVisible = PageInitializer.hasVisibleIdSpans(contentWin)  
            if(visibilityMode==MlbCommon.VisibilityModes.NONE && idsVisible){
          		EventHandler.hideIdSpans(contentWin)
          	}
          }
		},
		
		disableMLB: function(){
			//Remove event listener
			if(this.eventHandlersActive){
			   this.initEventHandlers("removeEventListener")
			   this.eventHandlersActive = false
			}
			//Add single shortcut for enabling MLB
			this.setShortcut("mouselessbrowsing.keys.toggleEnableDisableMLB", "mouselessbrowsing.InitManager.toggleEnableDisableMLB()");
		   PageInitializer.disableMlb()
			EventHandler.disableMlb()
		},
		
		registerObservers: function(){
			//Add preferences-observer
	      MLB_prefObserver = Utils.createObserverForInterface(InitManager)
	      Utils.registerObserver(MlbCommon.MLB_PREF_OBSERVER, MLB_prefObserver)
	      Utils.observeObject(TabLocalPrefs, "observedPropExclusiveUseOfNumpad", this.initStatusbar, this)
		},
		
		initEventHandlers : function(addOrRemoveListenerFunction) {
			var tabbrowser = document.getElementById("content"); // tabbrowser
			//key event listener
			window[addOrRemoveListenerFunction]("keypress", mainKeyPressHandler, true);  
         window[addOrRemoveListenerFunction]("keydown", mainKeyDownHandler, true);
         
         //load event listener
   		tabbrowser[addOrRemoveListenerFunction]("DOMContentLoaded", mainDomContentLoadedHandler, true);
	  		tabbrowser[addOrRemoveListenerFunction]("pageshow", mainPageShowHander, false);
			tabbrowser[addOrRemoveListenerFunction]("pageshow", googleProjectHelperHandler, false);

			// Focus Listener
			getBrowser()[addOrRemoveListenerFunction]("focus", focusHandler, true);
			getBrowser()[addOrRemoveListenerFunction]("blur", focusHandler, true);
         
			//Tab select listener
			getBrowser().tabContainer[addOrRemoveListenerFunction]("TabSelect", tabSelectHandler,false);
		},
		
		initShortCuts: function (){
		    //Shortcut for Enter
		    ShortCutManager.addJsShortCutWithCombinedKeyCode(208, "mouselessbrowsing.EventHandler.handleEnter()", MlbCommon.SCM_CLIENT_ID);
		    
          this.setShortcut("mouselessbrowsing.keys.openInNewTabPostfixKey", "mouselessbrowsing.EventHandler.openLinkInOtherLocationViaPostfixKey(event, mouselessbrowsing.MlbCommon.OpenLinkLocations.TAB)");

          this.setShortcut("mouselessbrowsing.keys.openInNewWindowPostfixKey", "mouselessbrowsing.EventHandler.openLinkInOtherLocationViaPostfixKey(event, mouselessbrowsing.MlbCommon.OpenLinkLocations.WINDOW)");

          this.setShortcut("mouselessbrowsing.keys.openInCoolirisPreviewsPostfixKey", "mouselessbrowsing.EventHandler.openLinkInOtherLocationViaPostfixKey(event, mouselessbrowsing.MlbCommon.OpenLinkLocations.COOLIRIS_PREVIEW)");

		    this.setShortcut("mouselessbrowsing.keys.toggleMLB", "mouselessbrowsing.EventHandler.toggleIds()");
		    
			 this.setShortcut("mouselessbrowsing.keys.toggleAllIds", "mouselessbrowsing.EventHandler.toggleAllIds()");

          this.setShortcut("mouselessbrowsing.keys.updatePage", "mouselessbrowsing.PageInitializer.updatePage()");
		    
		    this.setShortcut("mouselessbrowsing.keys.historyBack", "mouselessbrowsing.EventHandler.moveHistory('back')");
		
		    this.setShortcut("mouselessbrowsing.keys.historyForward", "mouselessbrowsing.EventHandler.moveHistory('forward')");
		    
		    this.setShortcut("mouselessbrowsing.keys.clearKeybuffer", "mouselessbrowsing.EventHandler.resetVars()");
		    
		    this.setShortcut("mouselessbrowsing.keys.scrollDown", "mouselessbrowsing.EventHandler.scrollUpDown('down')");
		    
		    this.setShortcut("mouselessbrowsing.keys.scrollUp", "mouselessbrowsing.EventHandler.scrollUpDown('up')");
		    
		    this.setShortcut("mouselessbrowsing.keys.selectLink", "mouselessbrowsing.EventHandler.selectLink()");

		    this.setShortcut(MlbPrefs.BLOCK_KEYBOARD_INDPUT_PREF_ID, "mouselessbrowsing.EventHandler.toggleBlockKeyboardInputForMLB()");

		    this.setShortcut(MlbPrefs.BLUR_ACTIVE_ELEMENT_KEY_PREF_ID, "mouselessbrowsing.EventHandler.blurActiveElement()");
		    
		    this.setShortcut("mouselessbrowsing.keys.openConfig", "mouselessbrowsing.EventHandler.openConfiguration()");
		    var combinedKeyCode = Prefs.getCharPref("mouselessbrowsing.keys.openConfig");
			 var openConfigBC = document.getElementById("mlb_openConfig_bc");
			 openConfigBC.setAttribute('acceltext', KeyInputbox.getStringForCombinedKeyCode(combinedKeyCode))

		    this.setShortcut("mouselessbrowsing.keys.addSiteRule", "mouselessbrowsing.EventHandler.addSiteRule()");
		    combinedKeyCode = Prefs.getCharPref("mouselessbrowsing.keys.addSiteRule");
			 var addUrlRuleBC = document.getElementById("mlb_addUrlRule_bc");
			 addUrlRuleBC.setAttribute('acceltext', KeyInputbox.getStringForCombinedKeyCode(combinedKeyCode))

		    //Toggling exclusive use with double stroke of numpad-key
			 if(MlbPrefs.toggleExlNumpadWithDoubleStrokeNumKey){
		       ShortCutManager.addJsShortCutWithCombinedKeyCode(2304, "mouselessbrowsing.EventHandler.toggleExclusiveUseOfNumpad();", MlbCommon.SCM_CLIENT_ID);
			 }
		
		    combinedKeyCode = Prefs.getCharPref("mouselessbrowsing.keys.toggleExlusiveUseOfNumpad");
		    if(combinedKeyCode!="2304" && combinedKeyCode!="0")
			    ShortCutManager.addJsShortCutWithCombinedKeyCode(combinedKeyCode, "mouselessbrowsing.TabLocalPrefs.toggleExclusiveUseOfNumpad();", MlbCommon.SCM_CLIENT_ID);
		    
			 this.setShortcut("mouselessbrowsing.keys.toggleEnableDisableMLB", "mouselessbrowsing.InitManager.toggleEnableDisableMLB()");
		},
		
		setShortcut: function(prefsKey, jsCode){
			var combinedKeyCode = Prefs.getCharPref(prefsKey);
			if(combinedKeyCode!="0"){
				ShortCutManager.addJsShortCutWithCombinedKeyCode(combinedKeyCode, jsCode, MlbCommon.SCM_CLIENT_ID);
			}
		},
		
		initMenu: function(){
		   //Display menu?
			var mlbMenu = document.getElementById("mlb_tools_menu");
			if(MlbPrefs.showMlbMenu){
				mlbMenu.style.display="block"
			}else{
				mlbMenu.style.display="none"
			}
		},
		
		initStatusbar:function(){
         //Display keybuffer in statusbar?
          var statusPanel = document.getElementById("mlb-status-panel");
          if(MlbPrefs.showMlbIconInStatusbar || MlbPrefs.showKeybufferInStatusbar){
              statusPanel.style.display="block";
          }else{
              statusPanel.style.display="none";
          }
          var statusIcon = document.getElementById("mlb-status-image");
          var skinUrlPrefix = "chrome://mouselessbrowsing/skin/" 
          if(MlbPrefs.disableMLB){
          	statusIcon.src = skinUrlPrefix + "MLB_disabled.ico"
          }else{
          	statusIcon.src = skinUrlPrefix + "MLB.ico"
          }
          if(MlbPrefs.showMlbIconInStatusbar){
              statusIcon.style.display="block";
          }else{
              statusIcon.style.display="none";
          }
          var exlNumpadIcon = document.getElementById("mlb-status-exl-numpad-image");
          if(TabLocalPrefs.isExclusiveUseOfNumpad() && MlbPrefs.showMlbIconInStatusbar && !MlbPrefs.isCharIdType() && !MlbPrefs.disableMLB){
              exlNumpadIcon.style.display="block";
          }else{
              exlNumpadIcon.style.display="none";
          }       
          var statusLabel = document.getElementById("mlb-status");
          if(MlbPrefs.showKeybufferInStatusbar && !MlbPrefs.disableMLB){
              statusLabel.style.display="block";
          }else{
              statusLabel.style.display="none";
          }
          var tooltiptext = "Mouseless Browsing " + MlbCommon.MLB_VERSION
          if(MlbPrefs.disableMLB){
          	tooltiptext += " disabled"
          }
          if(TabLocalPrefs.isExclusiveUseOfNumpad() && !MlbPrefs.isCharIdType() && !MlbPrefs.disableMLB){
          	tooltiptext += "\n" + Utils.getString(STRINGBUNDLE_ID, "exclusiveUseOfNumpadActive")
          }
          statusPanel.tooltipText = tooltiptext
		},
		
		toggleEnableDisableMLB: function(){
			MlbUtils.logDebugMessage('init on toggling')
			Prefs.setBoolPref("mouselessbrowsing.disableMLB", !MlbPrefs.disableMLB)
			this.init()
			return ShortCutManager.SUPPRESS_KEY
		},
		
		observe: function(){
			this.init();
		}
	
	}
	
	var NS = mlb_common.Namespace
	NS.bindToNamespace("mouselessbrowsing","InitManager", InitManager)

   //TODO remove, used only for test purposes
   function showOffsets(event){
      if(event.ctrlKey && event.button==2){
        var target = event.originalTarget
        var offsetTop = MlbUtils.getOffsetTopToBody(target)
        var offsetLeft = MlbUtils.getOffsetLeftToBody(target)
        mlb_common.Utils.logMessage("MLB: TagName: " + target.tagName + " OffsetLeft (Body): " + offsetLeft + " OffsetTop (Body): " + offsetTop)
        event.stopPropagation()
        event.preventDefault()
      }
   }
	
})()


