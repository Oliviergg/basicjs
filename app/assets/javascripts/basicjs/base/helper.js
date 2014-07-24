Helper={
	getHtmlElementValue:function(elem){
    var $elem = elem;
    if(!elem.jquery){
			$elem = $(elem);
		}
    var value = undefined;
    if($elem.attr("original") !== undefined && $elem.attr("original") !== "" ){
    	value = $elem.attr("original");
    }else if($elem.is("input[type=checkbox]")){
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

	setHtmlElementValue: function($elem,value){
		if(value==null){
			value="";
		}
		if($elem.is("input[type=checkbox]")){
      $elem.prop("checked",value)
		}else if($elem.is("select")){
			if(value === true){
				value = "true"
			}else if(value === false){
				value = "false"
			}
      $elem.select2().select2('val',value);
		}else if($elem.is("input")){
			$elem.val(value);
		}else{
			$elem.text(value);
		}
	},

	objectToDataModel: function(object,modelName,html){
		if (object === null || object === undefined) return;
		var self=this;
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
			var $elem = $html.find("[data-model-name='"+modelName+"'][data-attribute-name='"+attr+"']");
			Helper.setHtmlElementValue($elem,value);
		})

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
			var $elem = $html.find("[data-attribute-name='"+attr+"']");
			Helper.setHtmlElementValue($elem,value);
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
		if(amount && amount !== ""){
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

  attributeVatProperties:function(attribute){
  	var properties = {attribute:attribute};
   	if(attribute == "price_inc_vat"){
   		properties.is_inc_vat = true;
   		properties.attribute_inc_vat = attribute;
   		properties.attribute_exc_vat = "price_exc_vat";
	  }else if(attribute == "price_inc_discount_inc_vat"){
   		properties.is_inc_vat = true;
   		properties.attribute_inc_vat = attribute;
   		properties.attribute_exc_vat = "price_inc_discount_exc_vat";
	  }else if(attribute == "price_inc_discount_exc_vat"){
   		properties.is_inc_vat = false;
   		properties.attribute_inc_vat = "price_inc_discount_inc_vat";
   		properties.attribute_exc_vat = attribute;
	  }else if(attribute == "price_exc_vat"){
   		properties.is_inc_vat = false;
   		properties.attribute_inc_vat = "price_inc_vat";
   		properties.attribute_exc_vat = attribute;
   	}else{
	    if((result = attribute.match(/(.*)_inc_vat_(.*)/)) != null){
	      properties.is_inc_vat = true;
	      properties.attribute_inc_vat = attribute;
	      properties.attribute_exc_vat = [result[1],result[2]].join("_");
	    }else{
	      properties.is_inc_vat = false;
	      var l = attribute.lastIndexOf("_");
	      properties.attribute_inc_vat = [attribute.substr(0,l),"_inc_vat_",attribute.substr(l+1)].join("");;
	      properties.attribute_exc_vat = attribute;
	    }
   	}
   	return properties;
  },

  applyVatRate: function($elem,vatRate){
  	var attribute = $elem.attr("data-attribute-name");
    var amount_exc_vat, amount_inc_vat;
    var $context = $elem.closest(".js-auto_vat");
    var prop = Helper.attributeVatProperties(attribute);

    if(prop.is_inc_vat){
      amount_inc_vat = Helper.amount($context.find("[data-attribute-name="+prop.attribute_inc_vat+"]").val());
      amount_exc_vat = Helper.round2(amount_inc_vat/(1+vatRate));    	
      $context.find("[data-attribute-name="+prop.attribute_exc_vat+"]").val(amount_exc_vat);
    }else{
      amount_exc_vat = Helper.amount($context.find("[data-attribute-name="+prop.attribute_exc_vat+"]").val());
      amount_inc_vat = Helper.round2(amount_exc_vat*(1+vatRate));
      $context.find("[data-attribute-name="+prop.attribute_inc_vat+"]").val(amount_inc_vat);
    }
  },


  uiSpinEdit: function($el){

    $el.find('.js-spin-duration').spinedit({
      minimum: 12,
      maximum: 72,
      step: 3
    });

    $el.find('.js-spin-mileage').spinedit({
      minimum: 20000,
      maximum: 200000,
      step: 5000
    });

  }
}


