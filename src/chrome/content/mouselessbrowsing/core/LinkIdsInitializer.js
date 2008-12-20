with(mlb_common){
with(mouselessbrowsing){
(function(){
   function LinkIdsInitializer(pageInitData){
      this.AbstractInitializer(pageInitData)
   }
   
   ///RegEx for checking if an link is empty
   LinkIdsInitializer.regexWhitespace =  /\s/g
   
   LinkIdsInitializer.prototype = {
      constructor: LinkIdsInitializer,

      /*
          Init for Links
      */
      _initIds: function() {
         //For performance reasons in case of keep existing ids only the not initialized a are taken
         var xpathExp = "//A"
         if (this.pageInitData.getKeepExistingIds()) {
            xpathExp += "[not(@" + MlbCommon.MLB_BINDING_KEY_ATTR +")]"          
         }
         //ARI syntax
         xpathExp += "|//*[@role='link']"
         
         var doc = this.pageInitData.getCurrentDoc()
         var links = XPathUtils.getElements(xpathExp, doc, XPathResult.ORDERED_NODE_ITERATOR_TYPE)
         
         var filteredLinks = this.preprocessLinks(links)

         // Limit max. number of links
         var maxIdNumber = MlbPrefs.maxIdNumber

         for (var i = 0; i < filteredLinks.length; i++) {
            if (this.pageInitData.pageData.counter >= maxIdNumber) {
               break;
            }

            var link = filteredLinks[i];

            if(link.hasAttribute(MlbCommon.ATTR_IGNORE_ELEMENT))
               continue

            // Display image links?
//          var isImageLink = this.isImageLink(link);
            //TODO check
            var isImageLink = this.isImageElement(link);

            var idSpan = this.pageInitData.getIdSpan(link);

            // Is there already a span with the id
            if (idSpan != null) {
               if (this.pageInitData.keepExsitingIds) {
                  continue
               } else {
                  this.updateSpan(idSpan);
               }
            } else {
               // Insert new Span
               if (isImageLink) {
                  var newSpan = this.insertSpanForImageLink(link)
               } else {
                  var newSpan = this.insertSpanForTextLink(link)
               }
               // Set reference to idSpan
               this.pageInitData.addElementIdSpanBinding(link, newSpan)
            }
            // Update elements array
            this.pageInitData.pageData.addElementWithId(link);
         }
      },
      
      insertSpanForImageLink: function(link){
         var newSpan = this.getNewSpan(MlbCommon.IdSpanTypes.IMG);
         if(MlbPrefs.smartPositioning){
            var imgElements = link.getElementsByTagName("img")
            var imgElement = null
            var parentElement = null
            if(imgElements.length==0){
               imgElement = link
               parentElement = link.parentNode
            }else{
               imgElement = imgElements[0]
               parentElement = link
            }
            return this.doOverlayPositioning(imgElement, newSpan, parentElement, SpanPosition.NORTH_EAST_INSIDE)
         }else{
            return link.appendChild(newSpan)
         }             
      },
      
      insertSpanForTextLink: function(link){
         var newSpan = this.getNewSpan(MlbCommon.IdSpanTypes.LINK);
         return this.insertSpanForTextElement(link, newSpan)
      },

      /*
       * Checks wether an id span should be appended to an link
       * Heurisitic implementation
       * TODO Must be further adapted over time
       */
      isMarkableLink: function(link){
         if(link.className)
            return "true"
         
         // No real link
         // commented out on 18.12.2008
         //Problems on youtube as links has dynamically added listeners
//         if (link.tagName=="A" && 
//               (StringUtils.isEmpty(link.getAttribute("href")) ||  link.getAttribute("href")=="#") &&
//               link.getAttribute("onclick") == null)
//            return "false";
         
         var imgs = link.getElementsByTagName("img")
         if (imgs.length>0){
            //for performance reasons only the first one will be evalutated, as multiple img within a link is quite unlikley 
            var img = imgs[0]
            if(img.offsetWidth>1 && img.offsetHeight>1)
               return "true"
            else if (this.pageInitData.isOnDomContentLoaded())
               return "unsure";
            else
               return "false"
         }

         // empty link
         if (link.innerHTML == "" || !link.textContent
               || link.textContent.replace(LinkIdsInitializer.regexWhitespace, "").length == 0)
            return "false";

         return "true";
      },
      
      preprocessLinks: function(links){
         var filteredLinks = new Array()
         var hrefToLinkMap = {}
         var topWin = this.pageInitData.getCurrentTopWin()
         var imageLinksDisabled = !TabLocalPrefs.isIdsForImgLinksEnabled(topWin)
         var textLinksDisabled = !TabLocalPrefs.isIdsForLinksEnabled(topWin)
         for (var i = 0; i < links.length; i++) {
            link = links[i]
            //Perf-Tuning
            if(link.hasAttribute(MlbCommon.ATTR_IGNORE_ELEMENT))
               continue
            // is there anything noteworth
            var markableLink = this.isMarkableLink(link)
            if (markableLink=="false") {
               link.setAttribute(MlbCommon.ATTR_IGNORE_ELEMENT, "true")
               continue;
            }else if(markableLink=="unsure"){
               //revalutation next time
               continue
            }
            var isImageLink = this.isImageElement(link)
            // Check against preferences
            if ((isImageLink && imageLinksDisabled) || (!isImageLink && textLinksDisabled)){
               continue;
            }
            
            var href = link.href
            if(MlbPrefs.filterDuplicateLinks && href!="#"){
               var sameHrefLink = hrefToLinkMap[href]
               if(!sameHrefLink){
                  hrefToLinkMap[href] = link
               }else {
                  var otherIsImage = this.isImageElement(sameHrefLink)
                  if(isImageLink && !otherIsImage){
                     link.setAttribute(MlbCommon.ATTR_IGNORE_ELEMENT, true)
                     continue
                  }else if(!isImageLink && otherIsImage){
                     sameHrefLink.setAttribute(MlbCommon.ATTR_IGNORE_ELEMENT, true)
                     hrefToLinkMap[href] = link
                  }
               }
            }
            filteredLinks.push(link)            
         }
         return filteredLinks
      }
   }
   
   ObjectUtils.extend(LinkIdsInitializer, AbstractInitializer)
   
   Namespace.bindToNamespace("mouselessbrowsing", "LinkIdsInitializer", LinkIdsInitializer)
})()
}}