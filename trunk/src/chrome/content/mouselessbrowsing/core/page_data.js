(function(){
   //Imports
   var MlbCommon = mouselessbrowsing.MlbCommon
   	
   //Constructor
	function PageData(idChars){	
		
		
		//Element Counter
		this.counter = 0
		
		//Array with id-marked elements
		this.elementsWithId = new Array(1000)

		if(idChars!=null){
			this.useCharIds = true
			this.idChars = idChars
			this.currentId = ""
			this.idToElementMap = new Object()
		}
		
		//Object used as map to store the number of Ids
		//used in this window/frame and all its subframes
		//Key: window.name; Value: number of ids (including the ids of all subframes)
		this.numberOfIdsMap = new Object()
		
		//Object used as map to store the start-id of windows/frames
		//Key: window.name; Value: start-id
		this.startIdMap = new Object()

		//Flag which indicates that document is already initialised
		//i.e. the ids were inserted
		//Used for frames
		this.initialized = false

		//previousVisisbility Mode
		this.previousVisibilityMode = MlbCommon.VisibilityModes.CONFIG
	}
	
	PageData.prototype =  {
		addElementWithId: function(element){
			this.elementsWithId[this.counter] = element;
			if(this.useCharIds){
				this.idToElementMap[this.currentId] = element;
			}
		},
		
		getNextId:function(){
			this.counter = this.counter+1
			if(this.useCharIds){
				this.currentId = this.getNextCharId(this.currentId, this.currentId.length-1)
				return this.currentId
			}else{
				return this.counter
			}
		},
		
		getNextCharId: function(id, indexInId){
	      if(indexInId==-1) {
	         return this.idChars.charAt(0)+ id;
	      }
	      charAtIndex = id.charAt(indexInId);
	      indexOfCharInChars = this.idChars.indexOf(charAtIndex);
	      newValue = "";
	      if(indexOfCharInChars==this.idChars.length-1) {
	         newValue = this.replaceChar(id, indexInId, this.idChars.charAt(0));
	         return this.getNextCharId(newValue, indexInId-1);
	      }else {
	         return this.replaceChar(id, indexInId, this.idChars.charAt(indexOfCharInChars+1));
	      }
		},

	   replaceChar: function(value, index, newChar) {
	      result = "";
	      if(index!=0) {
	         result = value.substring(0, index);
	      }
	      result = result + newChar;
	      if(index!=value.length-1) {
	         result = result + value.substring(index+1);
	      }
	      return result;
	   },
		
		getElementForId:function(id){
			if(this.useCharIds){
				return this.idToElementMap[id.toUpperCase()]
			}else{
				return this.elementsWithId[id]
			}
		},
		
		hasElementWithId: function(id){
			if(this.useCharIds){
				return this.idToElementMap[id.toUpperCase()]!=null
			}else{
				return this.elementsWithId[id]!=null
			}
		},
		
		
	}
	
	var NS = rno_common.Namespace;
	NS.bindToNamespace("mouselessbrowsing", "PageData", PageData)
})()