var PopupTechnicalError = Class.extend({
  init: function(options){
    var self=this;
    this.$el=$(options.el);
    this.$=function(options){
      return self.$el.find(options)
    };
    this.$("button.select").click(function(e){
        self.$el.modal('hide');
    });
    this.$el.on('hidden',function(){
      self.$(".modal-body").html("")
    })
  },
  show:function(options){
    this.$el.modal('show');
    this.displayMessage(options);
  },
  hide:function(options){
    this.$el.modal('hide');
    this.$(".modal-body").html("")
  },
  displayMessage:function(options){
    this.$(".modal-body").html(options)
  }
})
