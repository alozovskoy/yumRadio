function placeAlert(type, msg){
	var alertGuid = guid();
	var alertText = '<div class="alert alert-' + type + ' alert-dismissible" id="' + alertGuid + '" role="alert" style="display:none;"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><p><span id="alertErrorMsg"></span>' + msg + '</p>';
	$('#alerts').append(alertText);
	$('#'+ alertGuid ).fadeTo(2000, 500).slideUp(500, function(){$('#' + alertGuid).alert('close');});
}
