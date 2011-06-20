window.addEventListener( 'load', function() {
    var apodFeed = null;
    var feedMax = 7;
    var feedUpdate = 60; // Minutes
    var feedCount = 0;
    
    var debugging = false;
    
    var mainData = {};
    var othersData = {};
    
    var speed = 2;
    var size = '';
    var width = -1;
    var stopped = -1;
    var mainTimeout = stopped;
    var othersTimeout = stopped;
    
    var rssFeed = 'http://www.acme.com/jef/apod/rss.xml';
    var urlLink = 'http://apod.nasa.gov/apod/';
    
    function animationHide( animObj, move ) {
	    
	    if( !animObj.checkRun ) {
	    	animObj = animObj.createAnimation();
	    }
	    else if( animObj.checkRun() ) {
	    	animObj.stop();
	    }
		
			animObj.addAnimation( 'opacity', '1.0', '0.0' );
		
        animObj.accelerationProfile = animObj.accelerate;
        animObj.speed = 15;
        
        return animObj;
    }
    
    function animationShow( animObj, move ) {
	    
	    if( !animObj.checkRun ) {
	    	animObj = animObj.createAnimation();
	    }
	    else if( animObj.checkRun() ) {
	    	animObj.stop();
	    }
    	
			animObj.addAnimation( 'opacity', '0.0', '1.0' );
	
		animObj.accelerationProfile = animObj.decelerate;
		animObj.speed = 15; 
        
        return animObj;
    }
    
    function change( objId, data, timerFunction )
    {
	    var obj = document.querySelector( objId );
	    var move = width;
		
	    var animObj = animationHide( obj, move );
	    
	    animObj.onfinish = function() { 
	    
	    	var number = next( data );
            if ( debugging ) {
                //number = 4;
            }
	    	var feed = apodFeed.getItemList()[number];
	    
	    	var title = feed.getTitle();
	    	var description = feed.getDesc();
	    	var pubed = feed.getDate();

            //var date = pubed.getDate() + '/' + (pubed.getMonth()+1);<span class="num">' + (date) + "</span> 
            obj.innerHTML = '<div class="title">' + getText( title ) + '</div><div class="desc">' + getText( description ) + '</div>';
	    	
	    	animObj = animationShow( obj, move );
	    	
            updateTitle( pubed )
            updateUrl( getText( feed.getLink() ) )
            
	    	/*if( haveNext( data ) ) {
	    		animObj.onfinsh = function() {
	    			timerFunction();
	    			debug( "Starting timer" );
	    		}   
	    	}*/
	    	
	    	animObj.run();
	    	
	    	if( haveNext( data ) ) {
	    		timerFunction();
	    	}
	    	
		};       

	    animObj.run();
    }
    
    function getText( maybeText ) {
    	if( maybeText && maybeText.nodeValue ) {
    		return maybeText.nodeValue;
    	}
    		
    	if( maybeText && maybeText.childNodes ) {
    		return maybeText.childNodes.item(0).nodeValue;
    	}
    		
    	return maybeText;
    	
    }
    
    function next( data )  {
    	var newItem = data.current;
    	
    	if( newItem === -1 || newItem === data.max) {
    		newItem = data.min;
    	}
    	else {
    		newItem++;
    	}
    	
		data.current = newItem;
		    	
    	return newItem;
    }
    
    function haveNext( data ) {
    	return data.max !== data.min;
    }
    
    function changeMain() {
	    stopMainTimer();
        change( '#apod article', mainData,  function() { startMainTimer(); } );
    }
    function startMainTimer() {
        if( mainTimeout === stopped ) {
            if( mainData.change === 0 ) {
                changeMain();
            }
            else {
                // Rotate image with todays being shown for the longest time.
                var current = 7 - Math.max(mainData.current,0);
                var time = Math.pow(2,Math.max(current,3) ) * 1000;
                if ( debugging ) {
                    time = 10000;
                }
                mainTimeout = setTimeout( function () { changeMain(); }, time );
            }
        }
    }
    function stopMainTimer() {
    	if( mainTimeout > 0 ) {
    		clearTimeout( mainTimeout );
    	}
    	mainTimeout = stopped;
    }
    
    function changeOthers() {
    	stopOthersTimer();
        change( '#flow article', othersData, function() { startOthersTimer(); } );
    }
    function startOthersTimer() {
        if( othersTimeout === stopped ) {
            othersTimeout = setTimeout( function () { changeOthers(); }, othersData.change );
        }
    }
    function stopOthersTimer() {
    	if( othersTimeout > 0 ) {
    		clearTimeout( othersTimeout );
    	}
    	othersTimeout = stopped;
    }
    
    function newPost(noChange, err) {
    	debug( "Update feeds!" );
        
        if( !noChange ) {
            if( apodFeed.getItemList().length > 0 )
            {
                feedCount = apodFeed.getItemList().length;
                
                _setSections(size);
                _startSections(size);
                
            }
        }
    }
    
    function updateTitle( date )
    {
        var monthsShort = ['Jan','Feb','March','April','May','June','July','Aug','Sept','Oct','Nov','Dec'];
        
    	if (opera.contexts.speeddial) { 
            var today = new Date();
            var dateStr = ''
            
            if ( today.getDate() == date.getDate() && today.getMonth() === date.getMonth() ) {
                dateStr = "Today's";
            }
            else {
                dateStr = date.getDate() + ' ' + monthsShort[date.getMonth()];
            }
            
            var title = dateStr + " Astronomy Picture of the Day";
            
			opera.contexts.speeddial.title = title;
		}
    }
    function updateUrl( url )
    {
        debug( "Url:" + url );
    	if (opera.contexts.speeddial) {
                debug( "Url:" + url );
				opera.contexts.speeddial.url = url;
		}
    }
    
    window.addEventListener( 'storage', function(event) {
		debug( "Storage event: " + event.key + " " + event.oldValue + " " + event.newValue );
		
    	if( event.oldValue !== event.newValue )
    	{
			/*if (event.key === 'something' && widget.preferences.something !== undefined ) {
				// Do something
			}*/
			
		}
        
	}, false );
    
    function _resizeHandler() {
        var oldSize = size;
        _setWidth();
        
        if( oldSize !== size )
        {
        	_setSections( size );
			_updateTimers( size );
		}
    }
    
    function _setWidth() {
    		bodyElement = document.getElementsByTagName('body')[0];
	    	
        width = bodyElement.clientWidth;
         
        if(width > 400) {
        	size = 'large';
        }
        else if( width > 310 ) {
            size = 'bigger';
        }
        else if (width > 250) {
        	size = 'big';
        }
        else if (width > 170) {
        	size = 'small';
        }
        else {
        	size = 'tiny';
        }
			
			bodyElement.className = size;
			debug( "Size: " + size + " (" + width + ")" );
			
        return width;
    }
    
    function _setSections( size ) {
    	if( size === 'large' )
	    { 
			// large view
	      mainData = { min: 0, max: feedCount-1, current: -1, change: 15000 * speed };
			//othersData = { min: 1, max: feedCount-1, current: -1, change: 6000 * speed };
	    }
	    else if ( size === 'big' || size === 'bigger' ){
	    	// big view		    	
	      mainData = { min: 0, max: feedCount-1, current: -1, change: 15000 * speed };
			//othersData = { min: 5, max: feedCount-1, current: -1, change: 4000 * speed };
	    }
	    else {
	    	// small view or tiny view
	      mainData = { min: 0, max: feedCount-1, current: -1, change: 15000 * speed };
			//othersData = { min: 0, max: 0, current: 0, change: 0 };
		}
    }
    
    function _updateTimers( size ) {
		if( size === 'large' )
	    { 
			// large view
			startMainTimer();
			stopOthersTimer();
	    }
	    else if ( size === 'big' || size === 'bigger' ){
	    	// big view
			startMainTimer();
			stopOthersTimer();
	    }
	    else {
	    	// small view or tiny view
			startMainTimer();
			stopOthersTimer();
		}
    }
    
    function _startSections( size ) {
		if( size === 'large' )
	    { 
			// large view
			changeMain();
			stopOthersTimer();
	    }
	    else if ( size === 'big' || size === 'bigger' ){
	    	// big view
			changeMain();
			stopOthersTimer();
	    }
	    else {
	    	// small view or tiny view
			changeMain();
			stopOthersTimer();
		}
    }
   
   function debug( mess ) {
   		if( debugging ) {
   			opera.postError( mess );
        }
   }
   
   	function createFeed() {
   	
		if( apodFeed && apodFeed.clearUpdateInterval ) {
			apodFeed.clearUpdateInterval();
		}
		
		apodFeed = new Feed( rssFeed, 'APOD', 'Astronomy Pic of Day', newPost, feedUpdate, parsers['generic'], feedMax, true );
		apodFeed.update();
    }
    
	// 
	// Begin
	//
    _setWidth();
    addEventListener( 'resize', _resizeHandler, false );
    
	createFeed();
   
}, false);



