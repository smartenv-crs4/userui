jQuery(document).ready(function(){
  jQuery("#inupblock").keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
    {
      signIn();
      return false;
    }
  });
});


// jQuery(document).on("translate", function(){
//   jQuery('.selectpicker').selectpicker('refresh');
// })


function signIn()
{
  var email = jQuery("#signInEmail").val();
  var password = jQuery("#signInPassword").val();

  var respBlock = jQuery("#signInResponse");

  if(respBlock.is(":visible"))
  {
    respBlock.addClass("invisible");
  }


  if(!isValidEmailAddress(email))
  {
    respBlock.html(i18next.t("error.invalid_email"));
    respBlock.removeClass("invisible");
    return;
  }



  var data = new Object();
  //data["user"] = new Object();
  data["username"] = email;
  data["password"] = password;
  jQuery.ajax({
    url: _userMsUrl + "/users/signin",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data, textStatus, xhr)
    {
        console.log(xhr);
      // success
      if(xhr.status == 200)
      {

        // sessionStorage.token = data["access_credentials"]["apiKey"]["token"];
        // sessionStorage.userId = data["access_credentials"]["userId"];
        // sessionStorage.email = email;
        //  getProfileInfo(false);
        redirectToPrevPage(data["access_credentials"]["apiKey"]["token"]);

        return;
      }
      // error
      else
      {
        respBlock.html(xhr.responseJSON.error_message);
        respBlock.removeClass("invisible");
        return;
      }
    },
    error: function(xhr, status)
    {
      console.log(xhr.status);
        switch (xhr.status) {
            case 400:
                if (xhr.responseJSON.error && xhr.responseJSON.error == "invalid_token")
                    respBlock.html(i18next.t("error.unauthorized"))
                else if (xhr.responseJSON.error && xhr.responseJSON.error == "BadRequest")
                    respBlock.html(i18next.t("error.missing_user_or_password"));
                else if (xhr.responseJSON.error_message)
                    respBlock.html(xhr.responseJSON.error_message);
                else if (xhr.responseText)
                    respBlock.html(xhr.responseText);
                else respBlock.html(JSON.stringify(xhr));
                break;
            case 500:
                respBlock.html(i18next.t("error.internal_server_error"));
                break;
            case 403:
                respBlock.html(i18next.t("error.invalid_auth"));
                break;
            default:
                console.log(xhr);
                respBlock.html(xhr.responseJSON.error_message);
        }
      respBlock.removeClass("invisible");
      return;
    }
  });
}




function errorMessageDisplay(xhr){
    switch(xhr.status)
    {

        case 400:
            respBlock.html(i18next.t("error.400"));
            break;
        case 401:
            respBlock.html(i18next.t("error.401"));
            break;
        case 403:
            respBlock.html(i18next.t("error.403"));
            break;
        case 500:
            respBlock.html(i18next.t("error.500"));
            break;
        default:
            respBlock.html(JSON.stringify(xhr));
            break;

    }
}


function signUp()
{
  var email = jQuery("#signUpEmail").val();
  var name = jQuery("#signUpName").val();
  var password = jQuery("#signUpPassword").val();
  var password2 = jQuery("#signUpPassword2").val();
  var userType=config.defaultUserType;


  var respBlock = jQuery("#signUpResponse");

  if(respBlock.is(":visible"))
  {
    respBlock.addClass("invisible");
  }

  if(!isValidEmailAddress(email))
  {
    respBlock.html(i18next.t("error.invalid_email"));
    respBlock.removeClass("invisible");
    return;
  }

  if(password === "")
  {
      respBlock.html(i18next.t("error.void_password"));
      respBlock.removeClass("invisible");
      return;
  }

  if(password !== password2)
  {
    respBlock.html(i18next.t("error.password_differs"));
    respBlock.removeClass("invisible");
    return;
  }

  var data = {"user":{}};
  data["user"]["email"] = email;
  data["user"]["name"] = name;
  data["user"]["password"] = password;
  data["user"]["type"] = userType;

  jQuery.ajax({
    url: _userMsUrl + "/users/signup",
    type: "POST",
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType:"json",
    success: function(data, textStatus, xhr)
    {
      //console.log(xhr);      
      // success
      if(xhr.status == 201)
      {
          redirectToPrevPage(data["access_credentials"]["apiKey"]["token"]);
          return;
      }
      else
      {
        respBlock.html(xhr.responseJSON.error_message);
        respBlock.removeClass("invisible");
        return;
      }
    },
    error: function(xhr, status)
    {
        console.log(xhr);

        if(xhr.responseJSON && xhr.responseJSON.error){
            if(xhr.responseJSON.error == "invalid_token")
                respBlock.html(i18next.t("error.unauthorized"))
            else if(xhr.responseJSON.error == "BadRequest")
                respBlock.html(i18next.t("error.missing_user_or_password"));
            else  if(xhr.responseJSON.error_message)
                respBlock.html(xhr.responseJSON.error_message);
            else if (xhr.responseText)
                respBlock.html(xhr.responseText);
            else
                errorMessageDisplay(xhr);

        }else{
            errorMessageDisplay(xhr);
        }
      respBlock.removeClass("invisible");
      return;
    },
    beforeSend: function(xhr, settings)
    {
      xhr.setRequestHeader('Authorization','Bearer ' + _access_token);
    }
  });
}


function resetPassword(){
    var email = jQuery("#passwordrecoveremail").val();




    //console.log(sessionStorage.token);
    jQuery.ajax({
        url: _userMsUrl + "/users/actions/resetPassword/"+ email,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        success: function(dataResp, textStatus, xhr)
        {
            jQuery('#reseterror').addClass("hidden");
            jQuery('#resetform').addClass("hidden");
            jQuery('#resetmessage').removeClass("hidden");

        },
        error: function(xhr, status)
        {

            var msg;
            console.log(xhr.status);
            switch(xhr.status)
            {

                case 400:
                    msg = i18next.t("error.400");
                    break;
                case 401:
                    msg =i18next.t("error.401");
                    break;
                case 403:
                    msg =i18next.t("error.403");
                    break;
                case 404:
                    msg =i18next.t("error.404");
                    break;
                case 500:
                    msg =i18next.t("error.500");
                    break;
                default:
                    msg =i18next.t("error.500");


            }


            jQuery('#reseterror').removeClass("hidden");
            console.log(xhr);
            jQuery('#resetPasswordErrorMessage').text(msg);
            jQuery('#showmore').text(JSON.stringify(xhr.responseJSON.error_message));


            return;
        }
    });
}


function setPassword(resetToken,userID)
{

    console.log("??????????????????????????????????????????");
    console.log(resetToken);
    console.log(userID);

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
    data.reset_token = resetToken;
    data.newpassword = newPassword;


    console.log(_userMsUrl + "/users/" +  userID + "/actions/setpassword");


    jQuery.ajax({
        url: _userMsUrl + "/users/" + userID + "/actions/setpassword",
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
            redirectToPrevPage(dataResp["access_credentials"]["apiKey"]["token"]);

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
         } ,
        beforeSend: function(xhr, settings)
        {
            xhr.setRequestHeader('Authorization','Bearer ' +  _access_token);
        }
    });

}