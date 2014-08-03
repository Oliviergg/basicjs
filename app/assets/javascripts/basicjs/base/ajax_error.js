// Interception des erreurs ajax en global
$( document ).ajaxError(function(event, jqxhr, settings, exception) {
    router.ajaxError(event, jqxhr, settings, exception);
    return false;
});
