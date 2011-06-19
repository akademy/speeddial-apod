window.addEventListener( 'load', function() {
    var apodFeed = null;
    var feedMax = 6;
    var feedUpdate = 60; // Minutes
    var feedCount = 0;
    
    var debugging = true;
    
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
	    	var feed = apodFeed.getItemList()[number];
	    
	    	var pubed = feed.getDate();
	    	
	    	var title = feed.getTitle();
	    	var description = feed.getDesc();

         obj.innerHTML = '<div class="title"><span class="num">' + (number+1) + "</span> " + getText( title ) + '</div><div class="desc">' + getText( description ) + '</div>';
	    	
	    	animObj = animationShow( obj, move );
	    	
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
                mainTimeout = setTimeout( function () { changeMain(); }, mainData.change );
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
	      mainData = { min: 0, max: feedCount-1, current: -1, change: 6000 * speed };
			othersData = { min: 1, max: feedCount-1, current: -1, change: 6000 * speed };
	    }
	    else if ( size === 'big' || size === 'bigger' ){
	    	// big view		    	
	      mainData = { min: 0, max: feedCount-1, current: -1, change: 6000 * speed };
			othersData = { min: 5, max: feedCount-1, current: -1, change: 4000 * speed };
	    }
	    else {
	    	// small view or tiny view
	      mainData = { min: 0, max: feedCount-1, current: -1, change: 6000 * speed };
			//othersData = { min: 0, max: 0, current: 0, change: 0 };
		}
    }
    
    function _updateTimers( size ) {
		if( size === 'large' )
	    { 
			// large view
			startMainTimer();
			startOthersTimer();
	    }
	    else if ( size === 'big' || size === 'bigger' ){
	    	// big view
			startMainTimer();
			startOthersTimer();
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
			changeOthers();
	    }
	    else if ( size === 'big' || size === 'bigger' ){
	    	// big view
			changeMain();
			changeOthers();
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



