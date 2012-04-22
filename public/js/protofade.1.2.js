/**
	Protofade 1.2 18/09/09
	Copyright (c) 2009 Filippo Buratti; info [at] cssrevolt.com [dot] com; http://www.filippoburatti.net/

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

var Protofade = Class.create({
	initialize: function(element, options) {		
		this.options = {
      		duration: 1,
			  delay: 10.0,
			  randomize: false,
			  autostart:true,
			  controls:false,
			  eSquare:false,
			  eRows: 3, 
			  eCols: 5,
			  eColor: '#FFFFFF'
    		}

		Object.extend(this.options, options || {});

		this.element		= $(element);
		this.slides		= this.element.childElements();
		this.num_slides		= this.slides.length;		
		this.current_slide 	= (this.options.randomize) ? (Math.floor(Math.random()*this.num_slides)) : 0;
		this.end_slide		= this.num_slides - 1;
			
		this.slides.invoke('hide');
		this.slides[this.current_slide].show();
				
		if (this.options.autostart) { 
			this.startSlideshow();
		}				
		
		if (this.options.eSquare) {
			this.buildEsquare();
		}
	},
	
	buildEsquare: function() {		
		this.eSquares 	= [];
		var elDimension	 	= this.element.getDimensions();
		var elWidth  		= elDimension.width;
		var elHeight 		= elDimension.height;
				
		var sqWidth 		= elWidth / this.options.eCols;
		var sqHeight 		= elHeight / this.options.eRows;
	
		$R(0, this.options.eCols-1).each(function(col) {
			this.eSquares[col] = [];							 	
			$R(0, this.options.eRows-1).each(function(row) {
				var sqLeft = col * sqWidth;
			    var sqTop  = row * sqHeight;
				this.eSquares[col][row] = new Element('div').setStyle({
 														    opacity: 0, backgroundColor: this.options.eColor,
															position: 'absolute', 'z-index': 5,
															left: sqLeft + 'px', top: sqTop + 'px',
															width: sqWidth + 'px', height: sqHeight + 'px'		
														});
				this.element.insert(this.eSquares[col][row]);				 							 										 
			}.bind(this))
		}.bind(this));			
	},

	startSlideshow: function(event) {
		if (event) { Event.stop(event); }
		if (!this.running)	{
			this.executer = new PeriodicalExecuter(function(){
	  			this.updateSlide(this.current_slide+1);
	 		}.bind(this),this.options.delay);
			this.running=true;
		}
	},
	
	stopSlideshow: function(event) {	
		if (event) { Event.stop(event); } 
		if (this.executer) { 
			this.executer.stop();
			this.running=false;
		}	 
	},

	updateSlide: function(next_slide) {		
		if (next_slide > this.end_slide) { 
			next_slide = 0; 
		} 
		else if ( next_slide == -1 ) {
			next_slide = this.end_slide;
		}	
		this.fadeInOut(next_slide, this.current_slide);		
	},

 	fadeInOut: function (next, current) {		
		new Effect.Parallel([
			new Effect.Fade(this.slides[current], { sync: true }),
			new Effect.Appear(this.slides[next], { sync: true }) 
  		], { duration: this.options.duration });
		
		if (this.options.eSquare) {			
			$R(0, this.options.eCols-1).each(function(col) {	 						 	
				$R(0, this.options.eRows-1).each(function(row) {
					var eSquare = this.eSquares[col][row];
					var delay = Math.random() * 150;				
					setTimeout(this.delayedAppear.bind(this, eSquare), delay);
				}.bind(this))
			}.bind(this));	
		}
		
		this.current_slide = next;		
	},
	
	delayedAppear: function(eSquare)	{
		var opacity = Math.random();
		new Effect.Parallel([ 
			new Effect.Appear ( eSquare, { from: 0, to: opacity, duration: this.options.duration/4 } ),
			new Effect.Appear ( eSquare, { from: opacity, to: 0, duration: this.options.duration/1.25} )
		], { sync: false });			
	}
});
