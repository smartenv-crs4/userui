/**
 * Created by Alessandro on 29/03/17.
 */


function DefaultValuesInit(){
    jQuery(document).ready(function() {
        SetDefaultValues();
    });
}

function SetDefaultValues(){
    var elements= jQuery("[data-defaultEmptyValue]");
    elements.each(function( index ) {
        var dataDefaultEmptyValue=this.getAttribute('data-defaultEmptyValue');
        if(!(this.innerHTML.match(/[^\t\v\0\s\n\r]/igm)))
            this.textContent=dataDefaultEmptyValue;
    });
}