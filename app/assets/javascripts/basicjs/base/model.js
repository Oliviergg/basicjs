Model=Class.extend({
  init:function(attributes){
    
    this.attributes = attributes;
    if(this.attributes === undefined){
      this.attributes = {};
    };
    this.isValid=false;
    this.errors = {};
    this.notifyOn();

    if(this.postInit){
      this.postInit();
    }
  },
  set:function(key,value){
    this.attributes[key]=value;
    this.attrChanged(key);
    return value;
  },
  get:function(key){
    return this.attributes[key];
  },
  attribute_names:function(){
    return _(this.attributes).keys();
  },
  attrChanged:function(key){
  },
  validationWrapper:function(){
    this.validate();
  },
  onChannelReceived:function(args){
    console.log("received on ",this._channelName,args);
  },
  channelName: function(cn){
    this._channelName = cn;
    channel(cn).subscribe([this.onChannelReceived,this])
  },
  notify:function(event,payload){
    if(!this.canNotify){return};
    channel(this._channelName).broadcast({event: event,payload: payload});
  },
  notifyOn:function(){
    this.canNotify = true;
  },
  notifyOff:function(){
    this.canNotify = false;
  },
  //
  addError: function(attribute,detail){
    this.errors = this.errors || {};
    if(!detail){
      return;
    }
    this.errors[attribute] = this.errors[attribute] || [];
    this.errors[attribute].push(detail);
    this.isValid=false;
  }


})