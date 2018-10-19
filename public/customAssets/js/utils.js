/**
 * Created by michela on 07/10/16.
 */
function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

function cacheCompile(templateid, data) {
    if (!window[templateid + "_template"]) {
        window[templateid + "_template"] = Handlebars.compile($('#' + templateid).html());
    }
    return window[templateid + "_template"](data);
}

function isSupplier() {
    if (userType() == "supplier" ) {
        return true;
    }
    else return false;
}

function userType() {
    if (window.sessionStorage && sessionStorage.type)
        return sessionStorage.type;
    else
        return "customer";
}

function userId() {

    if (window.sessionStorage.userId)
        return window.sessionStorage.userId;
    else return null;
}

function isLogged() {
    if (window.sessionStorage.token)
        return true;
    else
        return false;
}

function isSearchVisible() {
    "use strict";
    if (window.isHome)
        return false;
    if (window.isList)
        return false;
    return true;
}




function enableAssociateButton(associatedButtons){
    associatedButtons.forEach(function (associatebutton) {
        $('#'+associatebutton.id).removeClass(associatebutton.removeClass).addClass(associatebutton.addClass).removeAttr('disabled');
    });
}

function disableAssociateButton(associatedButtons){
    associatedButtons.forEach(function (associatebutton) {
        $('#'+associatebutton.id).removeClass(associatebutton.addClass).addClass(associatebutton.removeClass).attr('disabled',true);
    });
}

function setEditable(elementId,associatedButtons){
    var element=$('#'+elementId);
    var oldContent=element.text();
    element.attr('contentEditable',true);
    // element.html().select();

    if(!element.attr('data-blur')){
        element.off( "blur", null, blurHandler).on("blur",{oldContent:oldContent,associatedButtons:associatedButtons},blurHandler);  // set handler off then on to override function
        element.off( "keyup", null, keyUpHandler).on("keyup",{oldContent:oldContent,associatedButtons:associatedButtons},keyUpHandler);
    }
    element.attr('data-blur',true);
    element.focus();
    document.execCommand('selectAll',false,null); // select all editable content

    // element.get(0).setSelectionRange(0,2);
}

function blurHandler(event){
    var element=$(this);
    var newContent=element.text();
    var oldContent=event.data.oldContent;
    var associatedButtons=event.data.associatedButtons;

    element.attr('contentEditable', false);
    if((oldContent!=newContent)) {
        element.html("<mark>" + newContent + "</mark>");
        element.addClass("updatable");
        enableAssociateButton(associatedButtons);
    }else{
        element.html(element.text());
        element.removeClass("updatable");
        disableAssociateButton(associatedButtons);
    }
}
function keyUpHandler(event){
    var element=$(this);
    var newContent=element.text();
    var oldContent=event.data.oldContent;
    var associatedButtons=event.data.associatedButtons;

    if((oldContent!=newContent)) {
        enableAssociateButton(associatedButtons);
    }else{
        disableAssociateButton(associatedButtons);
    }
}

function resetEditableHandler(){

    $("[data-blur]").each(function(){
        var celement=$(this);
        celement.removeAttr("data-blur");
    });
}



// function setEditable(elementId,associatedButtons){
//     var element=$('#'+elementId);
//     var oldContent=element.html();
//     element.attr('contentEditable',true);
//     // element.html().select();
//
//
//     if(!element.attr('data-blur')){
//         element.blur(function() {
//             var newContent=element.html();
//
//             console.log("OLD Content:--> " + oldContent + " | New Content:--> " +newContent);
//
//             element.attr('contentEditable', false);
//             if((oldContent!=newContent) && (!(~(newContent.indexOf("mark"))))) {
//                 element.html("<mark>" + newContent + "</mark>");
//                 element.addClass("updatable");
//                 enableAssociateButton(associatedButtons);
//             }else{
//                 element.html(element.text());
//                 element.removeClass("updatable");
//                 disableAssociateButton(associatedButtons);
//             }
//         });
//
//         element.keypress(function() {
//             var newContent=element.html();
//
//             if((oldContent!=newContent) && (!(~(newContent.indexOf("mark"))))) {
//                 enableAssociateButton(associatedButtons);
//             }else{
//                 disableAssociateButton(associatedButtons);
//             }
//         });
//
//
//     }
//
//     element.attr('data-blur',true);
//     element.focus();
//     document.execCommand('selectAll',false,null);
//
//     // element.get(0).setSelectionRange(0,2);
// }





