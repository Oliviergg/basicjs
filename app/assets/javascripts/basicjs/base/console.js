// Gestion du fallback pour IE8 => Console n'existe qu'en mode debug. WTF?.
var alertFallback = true;
if (typeof console === "undefined" || typeof console.log === "undefined") {
  console = {};
  if (alertFallback) {
      console.log = function(msg) {
           // alert(msg);
      };
      console.time = function(msg) {
           // alert(msg);
      };
      console.timeEnd = function(msg) {
           // alert(msg);
      };

  } else {
      console.log = function() {};
      console.time = function(msg) {};
      console.timeEnd = function(msg) {};
  }

}
if (typeof console === "undefined" || typeof console.time === "undefined") {
	console.time = function(msg) {};
	console.timeEnd = function(msg) {};
}
