
// Register Form
$(function() {
    var button = $('#registerButton');
    var box = $('#registerBox');
    var form = $('#registerForm');
    button.removeAttr('href');
    button.mouseup(function(register) {
        box.toggle();
        button.toggleClass('active');
    });
    form.mouseup(function() {
        return false;
    });
    $(this).mouseup(function(register) {
        if(!($(register.target).parent('#registerButton').length > 0)) {
            button.removeClass('active');
            box.hide();
        }
    });
});
// After login Form
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
/*
function insRow()
{
  var table = document.getElementById("time-settings");
  var row = table.insertRow(table.length);
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  var cell6 = row.insertCell(5);
  cell1.innerHTML = "<i class=\"glyphicon glyphicon-ok-circle\"></i>";
  cell2.innerHTML = "<input type=\"time\" class=\"form-control\" id=\"start-time\" placeholder=\"start time\">";
  cell3.innerHTML = "<input type=\"time\" class=\"form-control\" id=\"end-time\" placeholder=\"end time\">";
  cell4.innerHTML = "<input type=\"number\" class=\"form-control\" id=\"last-time\" placeholder=\"last time\">";
  cell5.innerHTML = "<input type=\"number\" class=\"form-control\" id=\"delay-time\" placeholder=\"delay time\">";
  //cell6.innerHTML = "<button class=\"button add-item-button\" onclick=\"deleteRow(this)\"><i class=\"glyphicon glyphicon-remove\"></i></button>";
}
*/
