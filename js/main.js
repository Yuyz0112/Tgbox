;(function($) {

	var TgBox = function() {
		var self = this;

		this.Mask = $('<div id="Tgbox-mask"></div>');
		this.Popup = $('<div id="Tgbox-popup"></div>');

		this.bodyNode = $(document.body);

		this.render();
		this.picArea=this.Popup.find("div.Tgbox-pic-area");
		this.pic=this.Popup.find("img.Tgbox-image");
		this.captionArea=this.Popup.find("div.Tgbox-caption");
		this.prevBtn=this.Popup.find("span.Tgbox-btn-prev-icon");
		this.nextBtn=this.Popup.find("span.Tgbox-btn-next-icon");
		this.currentIndex=this.Popup.find("p.Tgbox-index");
		this.closeBtn=this.Popup.find("span.Tgbox-btn-close");

		this.TgboxIndex=null;
		this.bodyNode.delegate('.js-Tgbox,*[data-role=Tgbox]','click',function(e){
			e.stopPropagation();
			self.initPopup($(this));
		})

		this.Mask.click(function(){
			$('body').css('overflow','auto');
			$(this).fadeOut();
			self.Popup.fadeOut();
		})
		this.closeBtn.click(function(){
			$('body').css('overflow','auto');
			self.Mask.fadeOut();
			self.Popup.fadeOut();
		})

		//control
		this.prevBtn.click(function(e){
			if(!$(this).hasClass("disabled")){
				e.stopPropagation();
				self.goTo("prev");
			}
		})
		this.nextBtn.click(function(e){
			if(!$(this).hasClass("disabled")){
				e.stopPropagation();
				self.goTo("next");
			}
		})

		//zoom and drag
		this.Popup.bind('mousewheel',function(e){
			e.stopPropagation();
			$('body').css('overflow','hidden');
			self.zoomPic(this);
		})
		this.Popup.bind('mousedown',function(e){
			var self = this;
			var initX=e.clientX;
          	var initY=e.clientY;
      		var	x = $(self).position().left;
      		var	y = $(self).position().top-$(window).scrollTop();
			$("html").mousemove(function(e){
          		$(self).css("left",x+e.clientX-initX).css("top",y+e.clientY-initY);
          	});
		})
		this.Popup.bind('mouseup',function(){
			$('html').unbind('mousemove');
		})
	}

	TgBox.prototype = {
		
		zoomPic:function(o){
			var zoom=parseInt(o.style.zoom, 10)||100;
			zoom+=event.wheelDelta/20;
			if (zoom>0) o.style.zoom=zoom+'%';
			return false;
		},
		goTo:function(dir){
			if(dir == "next"){
				this.index++;
				if(this.index >= $('#article .js-Tgbox').length){
					this.nextBtn.addClass("disabled");
				}
				if(this.index!=0){
					this.prevBtn.removeClass("disabled");
				}
				var src = $('#article .js-Tgbox').eq(this.index-1).attr('src');
				this.loadSize(src);
			}else if(dir == "prev"){
				this.index--;
				console.log(this.index);
				if(this.index <= 1){
					this.prevBtn.addClass("disabled");
				}
				if(this.index!=$('#article .js-Tgbox').length){
					this.nextBtn.removeClass("disabled");
				}
				var src = $('#article .js-Tgbox').eq(this.index-1).attr('src');
				this.loadSize(src);
			}
		},
		loadSize:function(sourceSrc){
			var self=this;

			this.pic.css({
				width:"auto",
				height:"auto"
			}).hide();

			this.preLoadImg(sourceSrc,function(){
				self.pic.attr("src",sourceSrc);
				var picWidth=self.pic.width();
				var picHeight=self.pic.height();
				self.reSize(picWidth,picHeight);
			})
		},
		reSize:function(width,height){
			var self=this,
				winWidth=$(window).width();
				winHeight=$(window).height();

			//Compare image size and viewport size.
			var scale=Math.min(winWidth/(width+10),winHeight/(height+10),1);
			width = width*scale;
			height = height*scale;

			self.picArea.animate({
				width:width-10,
				height:height-10
			})
			self.Popup.animate({
				width:width,
				height:height,
				marginLeft:-width/2,
				top:(winHeight-height)/2
			},function(){
				self.pic.css({
					width:width-10,
					height:height-10
				}).fadeIn();
				self.captionArea.fadeIn();
			})

			//Write in index
			this.currentIndex.text(this.index+"/"+$('#article .js-Tgbox').length);
		},
		preLoadImg:function(src,callback){
			var img = new Image();
				img.src=src;
			/* For IE */
			if(!!window.ActiveXObject){
				img.onreadystatechange=function(){
					if(this.readyState == 'complete'){
						callback();
					}
				}
			/* For Other Browsers */
			}else{
				img.onload=function(){
					callback();
				}
			}
		},
		showTgbox:function(sourceSrc,currentID){
			var self=this,
				winWidth=$(window).width(),
				winHeight=$(window).height(),
				viewHeight=winHeight/2+10;

			this.captionArea.hide();

			this.Mask.fadeIn();
			this.Popup.fadeIn();

			this.picArea.css({
				width:winWidth/2,
				height:winHeight/2
			});
			this.Popup.css({
				width:winWidth/2+10,
				height:winHeight/2+10,
				marginLeft:-(winWidth/2+10)/2,
				top:-viewHeight
			}).animate({
				top:(winHeight-viewHeight)/2
			},function(){
				self.loadSize(sourceSrc);
			});
			this.index=currentID;

			var indexLength=$('#article .js-Tgbox').length;
			if (this.index == 1) {
				this.prevBtn.addClass("disabled");
				this.nextBtn.removeClass("disabled");
				if (indexLength == 1) {
					this.nextBtn.addClass("disabled");
				}
			}else if(this.index == indexLength){
				this.prevBtn.removeClass("disabled");
				this.nextBtn.addClass("disabled");
			}else{
				this.prevBtn.removeClass("disabled");
				this.nextBtn.removeClass("disabled");
			}

		},
		initPopup:function(currentObj){
			var self=this,
				sourceSrc=currentObj.attr('data-src');
				currentID=currentObj.attr('data-index');

			this.showTgbox(sourceSrc,currentID);
		},
		render: function() {
			var strDom =
				'<div class = "Tgbox-pic-area" >' +
				'<img class = "Tgbox-image" src="">' +
				'<div class = "Tgbox-btn-prev" >' +
				'<span class = "Tgbox-btn-prev-icon" > </span> </div>' +
				'<div class = "Tgbox-btn-next" >' +
				'<span class = "Tgbox-btn-next-icon" > </span> </div> ' +
				'<span class = "Tgbox-btn-close" > </span> </div>' +
				'<div class = "Tgbox-caption" >' +
				'<p class = "Tgbox-index" > 0 / 0 </p>' +
				'</div>';

			this.Popup.html(strDom);
			this.bodyNode.append(this.Mask, this.Popup);
		}

	};

	window['TgBox'] = TgBox;
})(jQuery);