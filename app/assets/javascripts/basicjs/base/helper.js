Helper={
	getHtmlElementValue:function(elem){
    var $elem = elem;
    if(!elem.jquery){
			$elem = $(elem);
		}
    var value = undefined;
    if($elem.is("input[type=checkbox]")){
			value = $elem.is(":checked");
    }else if($elem.data("select2")){
    	value = $elem.select2("val");
    }else if($elem.is("select")){
      value = $elem.val();
    }else if( $elem.is("input") || $elem.is("textarea") ){
      value = $elem.val();
		}else{
      value = $elem.html(); 
    }
    value = Helper.trim(value);
    if(value == "true"){
    	value = true;
    }else if(value == "false"){
    	value = false;
    }else if(/^\[.*\]$/.test(value)){
    	value = JSON.parse(value);
    }
    return value
	},

	mergeAttributeValue:function(data,elem){
    var $elem = elem;
    if(!elem.jquery){
			$elem = $(elem);
		}
		data[$elem.attr("data-attribute-name")] = this.getHtmlElementValue($elem);
	},

	dataModelToObject: function(modelName,html){
		var self=this;
		var $html=html;
		if(!html.jquery){
			$html = $(html);
		}
		var data={};
		$html.find("[data-model-name="+modelName+"]").each(function(i,elem){
			self.mergeAttributeValue(data,elem);
    });
		return data;

	},

	dataAttributeToObject: function(html){
		var self = this;
		var $html=html;
		if(!html.jquery){
			$html = $(html);
		}
		var data={};
		$html.find("[data-attribute-name]").each(function(i,elem){
			self.mergeAttributeValue(data,elem);
    });
		return data;
	},
	objectToDataAttribute: function(object,html){
		var $html=html;
		if(!html.jquery){
			$html = $(html);
		}
		if(object.attributes){
			object = object.attributes;
		}
		_.each(_.pairs(object),function(pair){
			var attr= pair[0];
			var value= pair[1];
			if(value==null){
				value="";
			}
			var $elem = $html.find("[data-attribute-name='"+attr+"']");
			if($elem.is("input")){
				$elem.val(value);
			}else if($elem.is("select")){
        $elem.select2().select2('val',value);
			}else{
				$elem.text(value);
			}
		})
	},
	clearDataAttribute: function(html){
		var $html=html;
		if(!html.jquery){
			$html = $(html);
		}
		$html.find("[data-attribute-name]").each(function(i,elem){
      var $elem = $(elem);
      if($elem.is("input[type=checkbox]")){
				$elem.prop("checked",false);
      }else if($elem.is("select")){
	      $elem.val("");
      }else if($elem.is("input")){
	      $elem.val("");
			}else{
	      $elem.text(""); 
      }
    });

	},
	// Mathematical function
	round2: function(amount){
		return Math.round(amount*100)/100;
	},
	amount: function(amount){
		if(typeof amount == "string"){
			amount = this.parseFloat(amount);
		}
		return amount.toFixed(2);
	},
	parseFloat:function(amount){
		if(amount){
			return parseFloat(amount)
		}else{
			return 0.0;
		}
	},
	trim:function(str){
		if(typeof str == 'string' || str instanceof String){
			return str.replace(/^\s+|\s+$/g, '');
		}
		return str;
	},
	s4: function() {
  	return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
	},

	guid: function() {
	  return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
	         this.s4() + '-' + this.s4() + this.s4() + this.s4();
	},

	diffArray: function(tab1,tab2,key){
    var p1=0;
    var p2=0;
    var finished = false;
    if(tab1[p1] ==undefined && tab2[p2] ==undefined){
        finished = true;
    }

    while(!finished){
      var t1=tab1[p1];
      var t2=tab2[p2];
      if(_.isEqual(t1,t2)){
        t1.change="same";
        p1+=1;
        p2+=1;
      }else if(t1 && t2 && t1[key]==t2[key]){
        tab1[p1] = t2;        
        t2.change="updated";
        p1+=1;
        p2+=1
      }else if(t1 && t2 && t1[key] > t2[key]){
        // La tache qui est dans t1 est connu
        t1.change="deleted"
        p1+=1;
      }else if((t1 && t2 && t1[key] < t2[key]) || (!t1 && t2)){
        tab1.splice(p1, 0, t2);
        t2.change="added"
        p1+=1;
        p2+=1;
      }else if(tab1[p1] !== undefined && tab2[p2] == undefined){
        t1.change="deleted"
        p1+=1;
      }
      if(tab1[p1] ==undefined && tab2[p2] ==undefined){
        finished = true;
      }
    }
    return tab1;
  },



}