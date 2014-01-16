// Interception des erreurs ajax en global
$( document ).ajaxError(function(event, jqxhr, settings, exception) {
    if (settings.handledError) return;
    if (jqxhr.statusText === "abort") return;
    if (jqxhr.responseText === "") return;
    router.popupTechnicalError.show(jqxhr.responseText);
});