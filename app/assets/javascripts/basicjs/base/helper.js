Helper={
	dataAttributeToObject: function(html){
		var $html=html;
		if(!html.jquery){
			$html = $(html);
		}
		var data={};
		$html.find("[data-attribute-name]").each(function(i,elem){
      var $elem = $(elem);
      var value = undefined;
      var attributeNameValue = $elem.attr("data-attribute-name");
      if($elem.is("input[type=checkbox]")){
				value = $elem.is(":checked");
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
      data[attributeNameValue] = value;

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
	}
}