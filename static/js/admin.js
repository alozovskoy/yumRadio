var divs = [
    'queueRow',
    'usersRow',
    'banRow',
];

var activeButton = 'queueButton'

function showPage(page, button, nobuttons = false){
    if ( !nobuttons ){
        $('#' + activeButton).removeClass('btn-success');
        $('#' + activeButton).addClass('btn-primary');
        
        activeButton = button;
    
        $('#' + activeButton).removeClass('btn-primary');
        $('#' + activeButton).addClass('btn-success');
    }
    for (var i = 0; i < divs.length; i++){
        if ( page == divs[i] ){
            $('#' + divs[i]).show();
        } else {
            $('#' + divs[i]).hide();
        }
    }
}

showPage('queueRow', 'queueButton', true);
