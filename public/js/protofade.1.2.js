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
			  autostart:false,
			  controls:false,
			  eSquare:false,
			  eRows: 3, 
			  eCols: 5,
			  eColor: '#FFFFFF'
    		}

		Object.extend(this.options, options || {});

		this.element		= $(element);
		this.slides		= [] 
		this.meta 		= []
		this.num_slides		= this.slides.length;		
		this.current_slide 	= 0;
		this.end_slide		= this.num_slides - 1;
	},

	addPic: function(pic) {
		var img = document.createElement("img")
		img.src = pic.src

		//Event.observe(img, 'load', (function() {
			img.setAttribute("alt", pic.caption)
			var li = document.createElement("li")
			li.setAttribute("style", "display:none")
			li.appendChild(img)

			$("protofade").appendChild(li)

			this.slides = this.element.childElements()
			this.num_slides	= this.slides.length;		
			this.end_slide = this.num_slides - 1;

			this.meta = []
			for(var i = 0 ; i < this.num_slides ; i++) {
				this.meta.push({
					caption: this.slides[i].select("img")[0].alt
				})
			}

			if(this.slides.length == 1) {
				this.slides[0].show()
			}
		//}).bind(this))

		//img.src = pic.src
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
		var img = this.slides[next].select("img")[0]
		var twidth = img.width
		var theight = img.height
		var ratio

		for(;;) {
			if(twidth > document.viewport.getWidth() - 60) {
				ratio = Math.min(2, (document.viewport.getWidth() - 60) / twidth)
			} else {
				ratio = Math.min(2, (document.viewport.getHeight() - 60) / theight)
			}

			twidth = twidth * ratio
			theight = theight * ratio

			if(twidth < document.viewport.getWidth() && theight < document.viewport.getHeight()) {
				break;
			}
		}

		new Effect.Parallel([
			new Effect.Fade(this.slides[current], { sync: true }),
			new Effect.Appear(this.slides[next], { sync: true }), 
			new Effect.Morph(img, {
				style: {
					width: twidth + 'px',
					height: theight + 'px'
				}
			}),
			new Effect.Morph('container', {
				style: {
					paddingLeft: 0.5 * (document.viewport.getWidth() - twidth) + 'px',
				}
			})
		], { duration: this.options.duration });

		$("caption").update(this.meta[next].caption)
		this.current_slide = next;		
	}
});
