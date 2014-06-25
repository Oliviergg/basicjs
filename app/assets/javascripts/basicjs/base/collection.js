/*
  Usage : 
  SlaList = Collection.extend({
    url:"/service_level_agreements",
    modelName:"sla",
    model:function(){return ServiceLevelAgreement}
  })
  slas = new SlaList({sla_number:"A0010"});
  
  // fetch la page web
  slas.fetch({
            success:function(data){
                       console.log(data)
                    }
  });
  
  // fetch un Sla si un seul est disponible
  slas.fetchOneOnly({
                      success:function(data){
                          console.log(data.attributes)
                              }
  });
  
*/

var Collection = Class.extend({
  init:function(options){
    this.setFilter(options);
  },
  setFilter:function(options){
    if ("string" == (typeof options)){
      this.href = URI(options).query();
    }else{
      this.filters=options;
      _.each(_.pairs(options),function(pair){
        if (pair[1]==""){
          delete options[pair[0]];
        }

      })
    }
  },
  fetchOneOnly:function(opts){
    var self=this;
    var successCallback = opts.success;
    var failedCallback = opts.failed;
    var data;
    // Filters compatible with Rails
    if(this.filters !== undefined){
      data={};
      data[this.modelName]=this.filters;
      data["partial"] = true;
    }else{
      data=this.href
    }
    // Only one request a time is allowed on an instance of Collection.
    if(this.request){
      this.request.success=null;
      this.request.handledError = true;
      this.request.abort();
    }

    this.request = $.ajax({
      url:this.url,
      dataType:"html",
      type:"get",
      data:data,
      success:function(html){
        this.request=null;

        var $html = $(html);
        var line=$html.find("tbody tr");
        self.count = line.length;
        if(self.count !== 1){
          if(failedCallback != undefined){
            failedCallback.call(this,self.count)
          }

        }else {
          if(successCallback != undefined){
            successCallback.call(this,self.rowToObject(line));
          }
        }
      }
    });  
    
  },
  fetch:function(opts){
    var self=this;
    var successCallback = opts.success;

    var data;
    // Filters compatible with Rails
    if(this.filters !== undefined){
      data={};
      data[this.modelName]=this.filters;
      data["partial"] = true;
    }else{
      data=this.href
    }
    if(this.request){
      this.request.success=null;
      this.request.handledError = true;
      this.request.abort();
    }

    // Sometime browser cache json or html request and return cache content without controlling datatype
    // WorkAround : (Rails Only) without disabling cache.

    var dataType = "html";
    var url = this.url;
    if(opts.dataType == "json"){
      dataType = "json";
    }
    url += "." + dataType;

    this.request = $.ajax({
      url: url,
      dataType: dataType,
      type: "get",
      data: data,
      success:function(data){
        self.request=null;
        if(dataType == "html"){
          // Comptage 
          self.count = $(data).find("tbody tr").length;
          self.data = data;
          if(successCallback != undefined){
            var _this = this;
            // setTimeout(function(){
            return successCallback.call(_this,self)
            // },0);
          }          
        }else{
          return successCallback.call(_this,data)
        }

      },
      error:function(p1,p2,p3){
        console.log("error:",p1,p2,p3)
      }
    });  
  },

  rowToObject:function(row){
    var model=this.model();
    return new model(Helper.dataAttributeToObject(row));
  }

})

