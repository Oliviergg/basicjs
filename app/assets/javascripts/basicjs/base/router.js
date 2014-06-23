// Router 
// THe purpose of the router is to apply the javascript controller corresponding to a specific url.
// The browser load a page, the router is started and choose the controller corresponding to the given route.
// cf application.js for the detail of routes.
var Router=Class.extend({
	optionalParam : /\((.*?)\)/g,
	namedParam    : /(\(\?)?:\w+/g,
	splatParam    : /\*\w+/g,
	escapeRegExp  : /[\-{}\[\]+?.,\\\^$|#\s]/g,
  routeToRegExp: function(route) {
    route = route.replace(this.escapeRegExp, '\\$&')
                 .replace(this.optionalParam, '(?:$1)?')
                 .replace(this.namedParam, function(match, optional){
                   return optional ? match : '([^\/]+)';
                 })
                 .replace(this.splatParam, '(.*?)');
    return new RegExp('^' + route + '$');
  },
  extractParameters: function(route, fragment) {
    var params = route.exec(fragment).slice(1);
    return _.map(params, function(param) {
      return param ? decodeURIComponent(param) : null;
    });
  },
  currentController: function(){
  	return this.controllerHistory[this.controllerHistory.length-1];
  },
  pushControllerHistory: function(cc){
  	this.controllerHistory.push(cc);
  },
  replaceControllerHistory: function(cc){
  	this.controllerHistory.pop();
  	this.controllerHistory.push(cc);
  },
  popControllerHistory: function(){
  	return this.controllerHistory.pop();
  },
  resetControllerHistory: function(){
  	return this.controllerHistory.pop();
  },

	init:function(){
		var self=this;
		routes=[];
		window.onpopstate= function(event){
			var $currentLevel = $("#history-level li.current");
			var currentLevel = parseInt($currentLevel.attr("data-history-level"));

			if(history.state == null  || history.state.level == undefined || history.state.level > currentLevel){
				// console.log("popstate",event);
				// self.hideControllerTimeout = setTimeout(function(){self.currentController().hide()},200);
				// self.loadAndInitialize()				
				self.navigate(window.location.href)
			  $(window).scrollTop(0);
				router.refreshMenu();			  
				return;				
			}

			if(currentLevel == history.state.level ){
				return;
			}

			var $levels = $("#history-level").find("li[data-history-level]");
			$levels.each(function(i,level){
				var $level = $(level);
				var level =	parseInt($level.attr("data-history-level"));
		    $(window).scrollTop(0);
				if(history.state.level < level){
					$level.remove();
					self.popControllerHistory();
				}else if(history.state.level == level){
					$level.addClass("current");
					self.currentController().show();
				}
		    router.refreshMenu();
			})
		};

	  $("body").on("click", "a[data-ajax-navigation]", function(e){
	    var $currentTarget = $(e.currentTarget);
	    if($currentTarget.hasClass("disabled")) return false;
	    var href=$currentTarget.attr("href");
	    self.pushNavigate(href);
	    var $ddm = $currentTarget.closest(".dropdown");
	    if($ddm.length > 0){
	      $ddm.removeClass("open");
	    }

	    return false ;
	  })

	  $("body").on("click","a[data-newtab-navigation]",function(e){
	    self.openInNewTab($(e.currentTarget).attr("href"));
	  })


	  window.onerror = function(message, url, lineNumber) {  
	    console.log(message,url,lineNumber);
	    alert(message+"\n"+url+"\n"+lineNumber);
	    return false;
	  };  

	  self.defaultController = DefaultController;

	  self.popupTechnicalError = new PopupTechnicalError({el:"#popup_ajax_error_show"})


	  if($("#popup_result").length > 0 && typeof ResultPopup !== "undefined" && ResultPopup !== undefined ){
	  	self.popupResult = new ResultPopup({el:$("#popup_result")});
	  }else{
	  	self.popupResult={
	  		show: function(){
	  			console.log("no popup_result found");
	  		},
	  		hide: function(){
	  			console.log("no popup_result found");
	  		}
	  	}
	  }

	  self.refreshMenu = function(){};


		this.references = {};
		this.controllerHistory=[];
	},
	route:function(route,callback){
		routes.push({route:this.routeToRegExp(route),callback:callback});
	},
	bindKey: function(){
		var self=this;
		$(Config.KEY_DOM_HANDLER).bind(Config.PREVIOUS_PAGE_KEY,function(e){
			console.log("PREVIOUS_PAGE_KEY")
			if(self.currentController().previousPage){
				self.currentController().previousPage(e)
			}
      return(false);
    })
    $(Config.KEY_DOM_HANDLER).bind(Config.NEXT_PAGE_KEY,function(e){
			console.log("NEXT_PAGE_KEY")
			if(self.currentController().nextPage){
				self.currentController().nextPage(e)
			}
      return(false);
    })
    
    $(Config.KEY_DOM_HANDLER).bind(Config.PREVIOUS_LINE_KEY,function(e){
			console.log("PREVIOUS_LINE_KEY")
			if(self.currentController().previousLine){
				self.currentController().previousLine(e)
			}
      return(false);
    })
    
    $(Config.KEY_DOM_HANDLER).on(Config.NEXT_LINE_KEY,function(e){
			console.log("NEXT_LINE_KEY")
			if(self.currentController().nextLine){
				self.currentController().nextLine(e)
			}
      return(false);
    })

    $(Config.KEY_DOM_HANDLER).bind(Config.SEARCH_KEY,function(e){
			console.log("SEARCH_KEY")
			if(self.currentController().search){
				self.currentController().search(e)
			}
      return(false);
    })
    $(Config.KEY_DOM_HANDLER).bind(Config.SELECT_LINE_KEY,function(e){
			console.log("SELECT_LINE_KEY")
			if(self.currentController().selectLine){
				self.currentController().selectLine(e)
			}
      return(false);
    })

	},
	unbindKey: function(){
		$(Config.KEY_DOM_HANDLER).unbind(Config.PREVIOUS_PAGE_KEY);
    $(Config.KEY_DOM_HANDLER).unbind(Config.NEXT_PAGE_KEY);
    $(Config.KEY_DOM_HANDLER).unbind(Config.PREVIOUS_LINE_KEY);
    $(Config.KEY_DOM_HANDLER).unbind(Config.NEXT_LINE_KEY);
    $(Config.KEY_DOM_HANDLER).unbind(Config.SEARCH_KEY);
    $(Config.KEY_DOM_HANDLER).unbind(Config.SELECT_LINE_KEY);
	},

	start:function(){
		var self=this;
		var url = window.location.pathname;
		var pathname = URI(url).pathname();
		var pathnameRouter=_.find(routes,function(pathnameRouter){
			return pathname.match(pathnameRouter.route) !== null
		});

		this.resetControllerHistory();
		if(pathnameRouter !== undefined ){
			var parameters  =this.extractParameters(pathnameRouter.route,pathname);
			$(document).ready(function(){
				self.pushControllerHistory(pathnameRouter.callback.apply(window,parameters));
			})
		}else{
			var viewId = "#"+$("#history-level li.current .view").find("div").first().attr("id");
			self.pushControllerHistory(new DefaultController({el:viewId}));
		}

		if(this.onStart!==undefined){
			this.onStart();
		}
		// $(".navbar").show();
		console.log("router started");
		// this.mapKey();
	},
	
	navigate:function(pathname){
		var self=this;
		console.log("navigate ",pathname);

		self.currentController().hide();
		$("#history-level li").remove();
		$("#history-level").html("<li data-history-level=0 class='current'><div class=view></div></li>");
		this.resetControllerHistory();

		// this.currentController.hide();
		this.pushState({}, "", pathname);
		this.loadAndInitialize(pathname);
	},

	pushNavigate:function(pathname){
		var $currentLevel = $("#history-level li.current");
		var level = parseInt($currentLevel.attr("data-history-level"));
		var nextLevel = level + 1;

		$currentLevel.removeClass("current");
		$("#history-level").prepend("<li data-history-level=" + nextLevel + " class='current'><div class=view></div></li>"); 
		
		this.replaceState({level:level}, "", window.location.href);
		this.pushState({level: nextLevel},"",pathname);
		this.currentController().hide();

		this.loadAndInitialize(pathname);
	},

	loadAndInitialize: function(url){
		var self=this;
		var pathname = URI(url).pathname();

		var pathnameRouter=_.find(routes,function(router){
			return pathname.match(router.route) !== null
		});
		var parameters;
		$.get(url,function(data){
			var $view = $(data).find(".view");
			$("#history-level li.current .view").html($view.html());

			if(pathnameRouter === undefined){
				var viewId = "#"+$("#history-level li.current .view").find("div").first().attr("id");			
				pathnameRouter= { 
					route:pathname,
					callback: function(){
						return new DefaultController({el:viewId});
					}
				}
				parameters  = [];
			}else{
				parameters  = self.extractParameters(pathnameRouter.route,pathname);
			};
			self.pushControllerHistory(pathnameRouter.callback.apply(window,parameters));
			channel("View").broadcast({event:"LoadedAndInitialized"});
			channel("View:LoadAndInitialize").broadcast({finished:true});
			self.popupResult.hide();
		})
	},

	refreshCurrentView: function(data){
		var self=this;
		var url = this.currentUrl();
		var pathname = URI(url).pathname();

		var router=_.find(routes,function(router){
			return pathname.match(router.route) !== null
		});
		var parameters;
		var $view = $(data).find(".view");
		$("#history-level li.current .view").html($view.html());

		if(router === undefined){
			var viewId = "#"+$("#history-level li.current .view").find("div").first().attr("id");			
			router= { 
				route:pathname,
				callback: function(){
					return new DefaultController({el:viewId});
				}
			}
			parameters  = [];
		}else{
			parameters  = self.extractParameters(router.route,pathname);
		};
		self.popControllerHistory();
		self.pushControllerHistory(router.callback.apply(window,parameters));
	},	
	reloadPage: function(){
		this.loadAndInitialize(window.location.href,true);
	},
	pushState: function(state,title,url){
		console.log("pushState ",state,url);
		window.history.pushState(state,title,url);
	},
	replaceState: function(state,title,url){
		console.log("replaceState ",state,url);
		window.history.replaceState(state,title,url);
	},
	getState: function(){
		return window.history.state;
	},
	reload: function(){
		window.location.href="/";
	},	
	openInNewTab:function(url){
		if(url.substring(0,2)=="\\\\" || url.substring(0,2)=="//"){
			url = "file:"+url;
		}
		window.open(url, '_blank');
	},
	currentUrl: function(){
		var url = window.location.href;
		return url.replace(/\/#\//,"/");
	}
})
























