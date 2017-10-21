

$(function() {
    var button = $('#loggedInButton');
    var box = $('#loggedInBox');
    var form = $('#loggedInForm');
    button.removeAttr('href');
    button.mouseup(function(register) {
        box.toggle();
        button.toggleClass('active');
    });
    form.mouseup(function() {
        return false;
    });
    $(this).mouseup(function(register) {
        if(!($(register.target).parent('#loggedInButton').length > 0)) {
            button.removeClass('active');
            box.hide();
        }
    });
});

function deleteRow(row)
{
    var i=row.parentNode.parentNode.rowIndex;
    document.getElementById('time-settings').deleteRow(i);
}
