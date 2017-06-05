
//_access_token defined in userUiCustom.js

function compileProfile(){

    console.log("===================>> Compile profile template");

    jQuery('#profileContent').localize();

    if(userData){
        var templatePassword = Handlebars.compile(changePasswordTemplate);
        jQuery('#passwordTab').html(templatePassword());
        jQuery('#passwordTab').localize();

        var defaultImg = "assets/img/team/img32-md.jpg";

        // translate user Type

        userData.typeTranslate = i18next.t("profile."+userData.type);
        if(userData.typeTranslate.indexOf(".")>=0)
            userData.typeTranslate = userData.type;


        var template = Handlebars.compile(defaultUserProfileTemplate);
        userData.profileEditParams="[{'id':'profileCancel', 'removeClass':'btn-u-default','addClass':'btn-u-dark-blue'},{'id':'profileSave', 'removeClass':'btn-u-default','addClass':null}]";
        jQuery('#profile').html(template(userData));
        jQuery('#profile').localize();

        jQuery(".editable").editable();
        jQuery(".editable").css("color", "black");

        console.log("###" + JSON.stringify(userData));
        //SetDefaultValues();
        DefaultValuesInit();

    }else{ //if error
        var respBlock = jQuery("#responseBlock");
        respBlock.html(errorsData.error_message);
        respBlock.removeClass("hidden");
    }
}

function getUserProfile()
{
   if(canTranslate){
       console.log("Can Translate");
       compileProfile();
   } else{
       console.log("Wait TO Translate");
       addEventListener('profileLanguageManagerInitialized', function (e) {
           console.log("Now Can Translate");
          compileProfile();
       }, false);
   }


}




function updateProfile()
{
    var data = {"user":{}};


    jQuery("#profile .updatable").each(function(){
        var celement=$(this);
        var name = celement.data("name");
        celement.removeClass("updatable");
        var value= this.textContent;
        if(this.innerHTML.indexOf("<mark>")>=0)
          this.innerHTML=this.textContent;
        data.user[name]=value;
    });


    jQuery.ajax({
        url: _userMsUrl + "/users/" + userData._id+"?access_token=" + userData.UserToken,
        type: "PUT",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function(dataResp, textStatus, xhr)
        {

            jQuery.jGrowl(i18next.t("profile.saved"), {theme:'bg-color-green1', life: 5000});

            jQuery("#profileCancel").removeClass().addClass("btn-u btn-u-default").attr("disabled","disabled");
            jQuery("#profileSave").removeClass().addClass("btn-u btn-u-default").attr("disabled","disabled");

            _.each(data.user,function(value,key){
              userData[key]=value;
            });

            if(!_.isEmpty(data.user.avatar))
              jQuery('#imgBox').attr("src", _userMsUrl + "/users/actions/getprofileimage/" +userData.avatar+"?access_token=" + userData.UserToken);


            // var defaultImg = "assets/img/team/img32-md.jpg";
            //
            // if(data.user.logo)
            // {
            //     jQuery("#imgBox").attr("src", data.user.logo);
            //     sessionStorage.logo = data.user.logo;
            // }
            // else
            // {
            //     jQuery("#imgBox").attr("src", defaultImg);
            //     sessionStorage.logo = undefined;
            // }
        },
        error: function(xhr, status)
        {
            var msg;
            try
            {
                msg = xhr.responseJSON.error_message;
            }
            catch(err)
            {
                msg = i18next.t("error.internal_server_error");
            }

            jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});

            return;
        }
    });
}



function openBrowseFile(){
    $('#loadThumbnailImageProfile').click();
}


function loadProfileImage(){
    var file=$('#loadThumbnailImageProfile')[0].files[0];

    var fd = new FormData();
    fd.append( file.name.split(".")[0], file);

    jQuery.ajax({
        url: _userMsUrl + "/users/actions/uploadprofileimage",
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
            jQuery('#ed-avatarButton').click();
//            console.log(jQuery('#ed-avatar').html());
            jQuery('#ed-avatar').html(data.filecode).blur();
            jQuery('#profileSave').click();
        },
        error: function(xhr, status)
        {

            var errType="error." + xhr.status;
            var msg=i18next.t(errType);

            try{
                msg = msg + " --> " + xhr.responseJSON.error_message;
            }
            catch(err){ }
           jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
        }
    });
}


function changePassword()
{
    if(!userData.UserToken)
    {
        redirectToResetPassword();
    }

    var oldPassword = jQuery("#oldPassword").val();
    var newPassword = jQuery("#newPassword1").val();
    var newPassword2 = jQuery("#newPassword2").val();

    var respBlock = jQuery("#responseBlock");

    if(newPassword !== newPassword2 || newPassword === "")
    {

        respBlock.html(i18next.t("error.password_differs"));
        respBlock.removeClass("hidden");
        return;
    }

    var data = new Object();
    data.oldpassword = oldPassword;
    data.newpassword = newPassword;


    console.log(_userMsUrl + "/users/" +  userData._id + "/actions/setpassword");


    jQuery.ajax({
        url: _userMsUrl + "/users/" +  userData._id + "/actions/setpassword",
        type: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        dataType: "json",
        success: function(dataResp, textStatus, xhr)
        {
            respBlock.addClass("hidden");
            jQuery('#tabProfile').click();
            jQuery("#oldPassword").val("");
            jQuery("#newPassword1").val("");
            jQuery("#newPassword2").val("");
            jQuery.jGrowl(i18next.t("profile.passwordSaved"), {theme:'bg-color-green1', life: 5000});

        },
        error: function(xhr, status)
        {
            var msg;

            console.log("$$$$$$$$$$$$$$$$$$ RESET PAssword");
            console.log(xhr);
            console.log(status);

            try
            {
                msg = xhr.responseJSON.error_message;
            }
            catch(err)
            {
                msg = i18next.t("error.internal_server_error");
            }

            respBlock.html(msg);
            respBlock.removeClass("hidden");

            return;
        },
        beforeSend: function(xhr, settings)
        {
            xhr.setRequestHeader('Authorization','Bearer ' +  userData.UserToken);
        }
    });

}





