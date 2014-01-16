"use strict";

var DefaultController = View.extend({

  show: function(){
  	$(window).scrollTop(0);
  	router.refreshMenu();
    this.$el.show();
  },

  hide: function(){
    this.$el.hide();
  },

  onClose: function(){
    console.log("was closed");
  }


});
