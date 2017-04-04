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


function setEditable(elementId,associatedButtons){
    var element=$('#'+elementId);
    var oldContent=element.html();
    element.attr('contentEditable',true);

    element.blur(function() {
            var newContent=element.html();
            element.attr('contentEditable', false);
            if((oldContent!=newContent) && (!(~(newContent.indexOf("mark"))))) {
                element.html("<mark>" + newContent + "</mark>");
                element.addClass("updatable");
            }
    });

    associatedButtons.forEach(function (associatebutton) {
        $('#'+associatebutton.id).removeClass(associatebutton.removeClass).addClass(associatebutton.addClass).removeAttr('disabled');
    });
    element.focus();
}



function openBrowseFile(){
   $('#loadThumbnailImageProfile').click();
}


function loadProfileImage(){
    var file=$('#loadThumbnailImageProfile')[0].files[0];
    console.log(file);
    // var file=$('#fileID')[0].files[0];
    // var reader = new FileReader();
    // var problems=null;
    // reader.onload = function(e) {
    //     var contents = JSON.parse(e.target.result);
    //     console.log(contents);
    //     importMicroservicesListCall({ microservicelist: contents.microservice },url,myToken,function(err){
    //         if(err) problems="----------------------------IMPORT MICROSERVICE LIST---------------------------\n\r" + err;
    //         importAuthendpointCall({authendpoint:contents.roles},url,url+"/authms/authendpoint/actions/import",myToken,function(err){
    //             if(err) problems=(problems||"") + "----------------------------IMPORT AUTHORIZATION ROLES LIST---------------------------\n\r" + err;
    //             importTokenTypeListCall(contents.token,url,myToken,function(err){
    //                 if(err) problems=(problems||"") + "----------------------------IMPORT TOKEN TYPES LIST---------------------------\n\r" + err;
    //
    //                 if(problems) return showError(problems);
    //
    //                 $('#myInfoMsgModalLabel').text("Import Results");
    //                 $('#InfoMsgMessage').text("Architecture import setting Done");
    //                 $('#myInfoMsg').modal({show: true, backdrop: false});
    //                 reloadPage=true;
    //                 $('#myInfoMsg').on('hidden.bs.modal', function (e) {
    //                     if (reloadPage) {
    //                         reloadPage = false;
    //                         location.reload();
    //                     }
    //                 });
    //
    //             })
    //         });
    //     });
    // };
    // reader.readAsText(file);
    // $('#BrowseFile').remove();
}


