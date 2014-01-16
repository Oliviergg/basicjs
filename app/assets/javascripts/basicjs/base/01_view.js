var View = Class.extend({
	init: function(options){
		var self=this;
    this.initWithOptions(options);
		

	  this.$el.on("remove", function () {
      console.log("onClose - View :",self.$el.attr("id"));
      if(self.onClose){
				self.onClose();
      }
    });

    if(this.postInit){
    	this.postInit(options);
    }
	},
	setBaseDOM:function(options){
    var self=this;
    if(this.el === undefined){
      this.el = options.el
    }
    // controller element selector
    this.$el=$(this.el);
    // find a selector enclosed in current controller element
    this.$=function(selector){return this.$el.find(selector)};
	},

  initWithOptions: function(options) {
    this.setBaseDOM(options)
  },

  showErrors: function(errors){
    this.showingError = true;

    var flashText;
    if(typeof errors == "object"){
      flashText = "Erreurs : "
      _(errors).pairs().forEach(function(pair){
        var attribute = pair[0];
        var error = pair[1][0];
        flashText += error.detail+"<BR>";
      });
    }else{
      flashText=errors;
    }
    var $flashbox = this.$(".flash").first()
    $flashbox.html(flashText);
    $flashbox.show();
  },

  hideErrors: function(){
    this.showingError = false;
    var $flashbox = this.$(".flash").first();
    $flashbox.html("");
    $flashbox.hide();
  },

  // Gestion du focus
  // Memorise le dernier champ ayant eu le focus
  // Le focus est réappliqué quand la liste redevient active
  initFocus:function(){
    var self=this;
    this.$("input,select").focus(function(e){
      self.$("[data-default-focus=true]").each(function(i,elem){
        $(elem).attr("data-default-focus",false);
      });
      self.$(e.target).attr("data-default-focus",true);
    })
  },
  // Réapplique le dernier focus connu
  setFocus:function(){
    var $focus=this.$("[data-default-focus=true]");
    if($focus.is("select")){
      $focus.select2("focus");
    }else{
      $focus.focus();
    }
  }


})