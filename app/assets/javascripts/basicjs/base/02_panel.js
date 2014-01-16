var Panel=View.extend({
  
  initWithOptions:function(options){
    // Init with options
    var self=this;
    this.$el=$(options.el);
    this.$=function(options){
      return this.$el.find(options)
    };
    this.isActive=false;
    this.initState(options);
    this.collection = options.collection;
    this.channelName = options.channelName;
    if(this.channelName !== undefined){
      channel(this.channelName).subscribe([self._onChannelReceived,self]);
    }

    // Prepare the view
    this.initFocus();
    this.hide();

  },
  
  onClose: function(){
    console.log("was closed");
  },

  finder: function(filter){
    console.log("finder");
    var cl=new this.collection(filter);
    // this.finder=function(filter){
    //   cl.setFilter(filter);
    //   return cl;
    // };
    return cl;
  },

  _onChannelReceived: function(args){
    if(args.event == this.readyOnEvent){
      this.onReadyEvent(args.payload);
    }
  },

  initState: function(options){
    var self = this;
    this.readyOnEvent = options.readyOn;
    if(this.readyOnEvent){
      this.setState("not_ready");
    }else{
      this.setState("ready");      
    }
  },

  onReadyEvent: function(payload){
    this.setState("ready");
    if(this.postReady){
      this.postReady();
    }
  },

  reset: function(){
    this.setState("not_ready");
    this.clear();
  },

  setState: function(state){
    this.$(".state > div").hide();
    this.$(".state ."+state).show();
    this.state = state;
  },

  hide: function(){
    this.isActive=false;
    this.$el.hide();
  },
  show:function(){
    this.isActive=true;
    var self=this;
    this.$el.show();
    this.setFocus();
  },

  // Send changed value to main controller by valuesChangeCallback
  sendValues: function(){
    var data={};
    this.$("[data-attribute-name]").each(function(i,elem){
      var $elem =$(elem);
      if($elem.attr("type")=="checkbox"){
        data[$elem.data("attributeName")] = $elem.is(":checked");
      }else{
        data[$elem.data("attributeName")] = $elem.val();
      }
    })
    this.valuesChangedCallback.call(this,data);
  },
  
  cancelFirstSearch:function(){
    this.searchOnce=true;
    this.$(".searching").hide();
    this.$(".results_not_found").hide();
    this.$(".need_first_search").show();

  }

})