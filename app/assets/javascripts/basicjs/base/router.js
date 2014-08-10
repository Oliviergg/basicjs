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
  	this.controllerHistory = [];
  },

	init:function(){
		var self=this;
		this.routes=[];
		window.onstatechange = function(event){
			var currentState = History.getState();
			var $currentLevel = $("#history-level li.current");
			var level = parseInt($currentLevel.attr("data-history-level"));

			if(currentState.data.level == undefined){
				// New page
				var nextLevel = level + 1;
				$currentLevel.removeClass("current");
				$("#history-level").prepend("<li data-history-level=" + nextLevel + " class='current'><div class=view><div id='default_view'>"+self.defaultView+"</div></div></li>");
				if(self.currentController()){
					self.currentController().hide();
				}
				History.replaceState({level:nextLevel}, currentState.title, currentState.url);

			}else if (level == 0 && currentState.data.level == 0){
				self.loadAndInitialize(currentState.url);


			}else if (currentState.data.level == level){
				self.loadAndInitialize(currentState.url);

			}else if (currentState.data.level < level){
				$("#history-level li[data-history-level]").each(function(index,elem){
					var $level = $(elem);
					if($level.attr("data-history-level") > currentState.data.level){
						$level.remove();
						self.popControllerHistory();
					};
					if($level.attr("data-history-level") == currentState.data.level){
						$level.addClass("current");
					};
				})
				self.currentController().show();

			}else if (currentState.data.level > level){
				History.replaceState({level:undefined}, currentState.title, currentState.url);
			}
		};

		window.onerror = function(message, url, lineNumber) {
			if(router.alertOn == true ){
				alert(message+"\n"+url+"\n"+lineNumber);
			}else{
				console.log(message+"\n"+url+"\n"+lineNumber);
			}
			return false;
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

	  self.defaultController = DefaultController;

	  self.popupTechnicalError = new PopupTechnicalError({el:"#popup_ajax_error_show"})


	  if($("#popup_result").length > 0 && typeof PopupResult !== "undefined" && PopupResult !== undefined ){
	  	self.popupResult = new PopupResult({el:$("#popup_result")});
	  }else{
	  	self.popupResult={
	  		show: function(){
	  			console.log("Router - no popup_result found");
	  		},
	  		hide: function(){
	  			console.log("Router - no popup_result found");
	  		}
	  	}
	  }

	  self.refreshMenu = function(){};


		this.references = {};
		this.controllerHistory=[];
	},
	route:function(route,callback){
		this.routes.push({route:this.routeToRegExp(route),callback:callback});
	},

	start:function(){
		var self=this;
		var url = window.location.href;

		this.defaultView = this.defaultView || "";
		this.alertOn = this.alertOn || false;
		this.resetControllerHistory();


		History.pushState({level:0},"",url);
		this.loadAndInitialize(url);


		if(this.onStart!==undefined){
			this.onStart();
		}
		// $(".navbar").show();
		console.log("router started");
		// this.mapKey();
	},

	pushNavigate:function(pathname){
		History.pushState(null,null,pathname);
	},

	loadAndInitialize: function(url){
		var self=this;
		var pathname = URI(url).pathname();

		var pathnameRouter=_.find(self.routes,function(router){
			return pathname.match(router.route) !== null
		});
		var parameters;
		channel("Router").broadcast({name:"LoadAndInitialize:Start",payload:{url:url,time:new Date().getTime()}});

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
			channel("View").broadcast({event:"LoadedAndInitialized",payload:{url:url}});
			channel("View:LoadAndInitialize").broadcast({finished:true});
			
			channel("Router").broadcast({name:"LoadAndInitialize:Finished",payload:{url:url,time:new Date().getTime()}});

			self.popupResult.hide();
			self.pushControllerHistory(pathnameRouter.callback.apply(window,parameters));
		})
	},

	back: function(){
		if(this.controllerHistory.length > 1){
			History.back();
		}else{
			this.loadAndInitialize("/");
		}
	},

	reloadPage: function(){
		this.loadAndInitialize(window.location.href,true);
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
		var res = url.match(/(.*)#(.*)$/);
		if(res == undefined){
			return url
		}else{
			url = History.getRootUrl() + res[2];
			return url;
		}

	},
	ajaxError: function(event, jqxhr, settings, exception){
		if (settings.handledError) return;
		if (jqxhr.statusText === "abort") return;
		if (jqxhr.responseText === "") return;
		router.popupTechnicalError.show(jqxhr.responseText);
	}

})
