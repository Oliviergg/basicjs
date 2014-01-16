// Gestion du fallback pour IE8 => Console n'existe qu'en mode debug. WTF?.
var alertFallback = true;
if (typeof console === "undefined" || typeof console.log === "undefined") {
  console = {};
  if (alertFallback) {
      console.log = function(msg) {
           // alert(msg);
      };
  } else {
      console.log = function() {};
  }
}

