/* 

  Mouseless Browsing 
  Version 0.5
  Created by Rudolf No�
  01.01.2008
*/
var MlbCommon = mouselessbrowsing.MlbCommon
var MlbUtils = mouselessbrowsing.MlbUtils
var Utils = rno_common.Utils
var Prefs = rno_common.Prefs
var PrefUtils = rno_common.PrefUtils
var Listbox = rno_common.Listbox
var COMBINED_KEY_CODE_ATTR = "COMBINED_KEY_CODE_ATTR"
var keyInputBox 
var STRINGBUNDLE_ID = "jsStrings"

function doOnload(){
   keyInputBox = byId('keyInputBox')
   rno_common.Prefs.loadPrefs(document);
	document.title = "Mouseless Browsing " + MlbCommon.MLB_VERSION 
   MLB_onCommandIdType();
	MLB_onTogglingVisibilityAllIds();
	MLB_setPreviewForIds("styleForIdSpan")
	MLB_setPreviewForIds("styleForFrameIdSpan")
	MLB_initForCoolirisPreview()
	byId('siteRulesLB').addEventListener("select", MLB_onSelectSiteRule, false)
	PrefUtils.initElementHelp('jsStrings', 'helpDescriptionTB')
	if(window.arguments){
		//Case of adding site rule
		MLB_initForAddingSiteRule(window.arguments[0])
	}
}

function MLB_initForAddingSiteRule(url){
   byId('siteruletab').click();
   byId('urlPatterTB').value=url	
}

function MLB_initForCoolirisPreview(){
	if(!MlbUtils.isCoolirisPreviewsInstalled()){
		byId('coolirisPreviewsModifierRow').style.display="none"
		var keyListBox = byId('keyListBox')
		var indexOfCoolirisPreviewKey = keyListBox.getIndexOfItem(byId('keys.openInCoolirisPreviewsPostfixKey'))
		keyListBox.removeItemAt(indexOfCoolirisPreviewKey)
	}
}

function saveUserPrefs(){
	try{
		MLB_validateUserInput()
	}catch(e){
		alert(e)
		return false
	}
   rno_common.Prefs.savePrefs(document);
   Utils.notifyObservers(MlbCommon.MLB_PREF_OBSERVER);
}

function MLB_restoreDefaults(){
	if(!confirm(Utils.getString(STRINGBUNDLE_ID, "mouselessbrowsing.confirmRestoreDefault"))){
		return
	}
	var mlb = "mouselessbrowsing."
	var prefsNotToReset = [mlb+"version", mlb+"siteRules"]
	Prefs.clearUserPrefForBranch(mlb, prefsNotToReset)
	rno_common.Prefs.loadPrefs(document);
}

function dialogHelp(){
	MlbUtils.showMlbHelp();
}

function MLB_onTogglingVisibilityAllIds(){
	var disableVisibilityFlags = document.getElementById("allIds").checked;
	var visibilityFlags = document.getElementsByAttribute ( "visibilityFlag", "true" );
	for(var i=0; i<visibilityFlags.length; i++){
		visibilityFlags[i].disabled=disableVisibilityFlags;
	}
}

function MLB_setStyleDefault(styleTextboxId){
	var Prefs = Prefs 
	var textbox = document.getElementById(styleTextboxId)
	var prefId = textbox.getAttribute("prefid")
	if(Prefs.hasUserPref(prefId)){
	  Prefs.clearUserPref(prefId)
	}
	textbox.value=Prefs.getCharPref(prefId)
   MLB_setPreviewForIds(styleTextboxId)
}

function MLB_setPreviewForIds(styleTextboxId){
	var styleTextbox = document.getElementById(styleTextboxId);
	var previewSpan = document.getElementById(styleTextbox.getAttribute('previewSpanId'));
	previewSpan.style.cssText=styleTextbox.value
}

function MLB_addSiteRule(){
   var urlPattern = byId("urlPatterTB").value
   var visibilityModeML = byId("visibilityModeML")
   var siteRuleExclusiveNumpadCB = byId("siteRuleExclusiveNumpadCB")
   var siteRuleOnDemandFlagCB = byId("siteRuleOnDemandFlagCB")
   var siteRulesLB = byId("siteRulesLB")
   var items = Listbox.getItems(siteRulesLB);
   var newListitem = Listbox.appendMultiColumnItem(siteRulesLB, [urlPattern, visibilityModeML.label, siteRuleExclusiveNumpadCB.checked, siteRuleOnDemandFlagCB.checked], 
         [urlPattern, visibilityModeML.value, siteRuleExclusiveNumpadCB.checked, siteRuleOnDemandFlagCB.checked], null, [null, "display:none", "display:none", "display:none"])
}

function MLB_updateSiteRule(){
   var urlPattern = byId("urlPatterTB").value
   var visibilityModeML = byId("visibilityModeML")
   var siteRulesLB = byId("siteRulesLB")
   var siteRuleExclusiveNumpadCB = byId("siteRuleExclusiveNumpadCB")
   var siteRuleOnDemandFlagCB = byId("siteRuleOnDemandFlagCB")
   var selectedIndex = siteRulesLB.selectedIndex
   if(selectedIndex==-1){
      alert('No item to update selected!')
      return
   }
   Listbox.updateSelectedRow(siteRulesLB, [urlPattern, visibilityModeML.label, siteRuleExclusiveNumpadCB.checked, siteRuleOnDemandFlagCB.checked], 
         [urlPattern, visibilityModeML.value, siteRuleExclusiveNumpadCB.checked, siteRuleOnDemandFlagCB.checked])
}

function MLB_removeSiteRule(){
   var siteRulesLB = byId("siteRulesLB")
   var selectedIndex = siteRulesLB.selectedIndex
   if(selectedIndex==-1){
   	alert('No item to remove selected!')
   	return
   }
   siteRulesLB.removeItemAt(selectedIndex)
   siteRulesLB.focus();
}

function MLB_onSelectSiteRule(){
   var siteRulesLB = byId("siteRulesLB")
   var updateBtn = byId("updateBtn")
   var removeBtn = byId("removeBtn")
   if(siteRulesLB.selectedIndex==-1){
      updateBtn.disabled=true
      removeBtn.disabled=true
   }else{
      updateBtn.disabled=false
      removeBtn.disabled=false
      var listcells = Listbox.getSelectedListCells(siteRulesLB)
      byId('urlPatterTB').setAttribute("value", listcells[0].getAttribute('value'))
      byId('visibilityModeML').value=listcells[1].getAttribute('value')
      byId('siteRuleExclusiveNumpadCB').checked=(listcells[2].getAttribute('value')=='true')
      byId('siteRuleOnDemandFlagCB').checked=(listcells[3].getAttribute('value')=='true')
   }
}

function MLB_onInputIdCharsTB(){
   var idCharsTB = byId('idCharsTB')
   if(idCharsTB.value!=null){
   	idCharsTB.value = idCharsTB.value.toUpperCase()
   }	
}

function MLB_validateUserInput() {
	// No duplicate chars in self defined char set for ids
	var useCharIds = byId('idtype').value == MlbCommon.IdTypes.CHAR
	var idCharsTB = byId('idCharsTB')
	if (useCharIds) {
		var charMap = new Object()
		var selfDefindedCharSet = idCharsTB.value
		if (selfDefindedCharSet == "") {
			throw Error("No id char defined")
		}
		for (var i = 0; i < selfDefindedCharSet.length; i++) {
			var singleChar = selfDefindedCharSet.charAt(i)
			if (charMap[singleChar] != null) {
				throw Error("The character '"
						+ singleChar
						+ "' is defined multiple times in the self-defined character set for ids.")
			}
			charMap[singleChar] = ""
		}
	}
}

function MLB_onCommandIdType(){
   var idTypeRG = byId('idtype')
   if(idTypeRG.value==MlbCommon.IdTypes.NUMERIC){
      byId('idCharsTB').disabled=true   
      byId('exclusiveNumpad').disabled=false   
      byId('modifierForWritableElement').disabled=false  
      byId('modifierForOpenInNewTab').disabled=false
      byId('modifierForOpenInCoolirisPreviews').disabled=false
   }else{
      byId('idCharsTB').disabled=false   
      byId('exclusiveNumpad').disabled=true   
      byId('modifierForWritableElement').disabled=true  
      byId('modifierForOpenInNewTab').disabled=true   
      byId('modifierForOpenInCoolirisPreviews').disabled=true   
   }
}

function MLB_onCommandAssignShortcut(){
	var keyListBox = byId('keyListBox')
	Listbox.updateSelectedRow(keyListBox, [null, keyInputBox.getKeyString()], [null, null])
	keyListBox.selectedItem.setAttribute(COMBINED_KEY_CODE_ATTR, keyInputBox.getCombinedValue())
	keyListBox.focus()
}

function MLB_onCommandRemoveShortcut(){
	var keyListBox = byId('keyListBox')
	Listbox.updateSelectedRow(keyListBox, [null, "None"], [null, null])
	keyListBox.selectedItem.setAttribute(COMBINED_KEY_CODE_ATTR, "0")
	keyListBox.focus()
}

function MLB_onCommandRestoreDefault(){
	var keyListBox = byId('keyListBox')
	var selItem = keyListBox.selectedItem
	var prefid = selItem.getAttribute("prefid")
	if(Prefs.hasUserPref(prefid)){
   	Prefs.clearUserPref(prefid)
	}
	var defaultKey = Prefs.getCharPref(prefid)
	Listbox.updateSelectedRow(keyListBox, [null, keyInputBox.getStringForCombinedKeyCode(defaultKey)], [null, null])
   keyListBox.selectedItem.setAttribute(COMBINED_KEY_CODE_ATTR, defaultKey)
   keyListBox.focus()
}

function MLB_loadKeyListbox(){
	var keyListBox = byId('keyListBox')
   var keyItems = Listbox.getItems(keyListBox)
   for (var i = 0; i < keyItems.length; i++) {
   	var keyItem = keyItems[i]
   	var prefId = keyItem.getAttribute('prefid')
   	var combinedKeyCode = Prefs.getCharPref(prefId)
   	var keyString = keyInputBox.getStringForCombinedKeyCode(combinedKeyCode)
   	keyItem.setAttribute(COMBINED_KEY_CODE_ATTR, combinedKeyCode)
   	Listbox.updateRow(keyListBox, keyItem, [null, keyString!=null?keyString:"None"], new Array(2))
   }
}

function MLB_saveKeyListbox(){
	var keyListBox = byId('keyListBox')
   var keyItems = Listbox.getItems(keyListBox)
   for (var i = 0; i < keyItems.length; i++) {
      var keyItem = keyItems[i]
      var prefId = keyItem.getAttribute('prefid')
   	Prefs.setCharPref(prefId, keyItem.getAttribute(COMBINED_KEY_CODE_ATTR))
   }
}

function MLB_setKeyboxFromKeyboxMenu(keyCombId){
	if(keyCombId=="TAB"){
	  keyInputBox.setCombinedValue(9<<4)
	}else if(keyCombId=="SHIFT_TAB"){
	  keyInputBox.setCombinedValue(9<<4|Event.SHIFT_MASK)
	}
}

function byId(elementId){
	return document.getElementById(elementId)
}