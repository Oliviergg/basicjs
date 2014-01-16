var Popup = View.extend({
  initWithOptions:function(options){
    var self=this;
    this.setBaseDOM(options);
    this.$el.on("show",function(){
      self.onShow();
    });
    this.$el.on("hidden",function(){
      self.onHidden();
    });
  },
  postInit:function(options){

  },
  
  show: function(){
    this.$el.modal("show");
    this.refresh();
  },

  hide: function(){
    this.$el.modal("hide");
  },
  refresh: function(){
  	//
  },

  onShow: function(){
  },

  onHidden: function(){
  },

  onClose: function(){
    console.log("onClose : popup");
  }
});