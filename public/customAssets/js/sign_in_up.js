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


jQuery(document).on("translate", function(){
  jQuery('.selectpicker').selectpicker('refresh');
})





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
      switch(xhr.status)
      {
        case 400:
          if(xhr.responseJSON.error == "invalid_token")
            respBlock.html(i18next.t("error.unauthorized"))
          else if(xhr.responseJSON.error == "BadRequest")
            respBlock.html(i18next.t("error.missing_user_or_password"));
          else
            respBlock.html(xhr.responseJSON.error_message);
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
        console.log(data);
        console.log(data.access_credentials.apiKey.token);
        sessionStorage.token = data["access_credentials"]["apiKey"]["token"];
        sessionStorage.refresh_token = data["access_credentials"]["refreshToken"]["token"];
        sessionStorage.userId = data["created_resource"]["_id"];
        sessionStorage.email = email;
        getProfileInfo(false);
        sessionStorage.prevPage = "page_profile_settings.html";
        
        redirectToPrevPage();
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
      switch(xhr.status)
      {

        case 400:
          if(xhr.responseJSON.error == "invalid_token")
            respBlock.html(i18next.t("error.unauthorized"))
          else if(xhr.responseJSON.error == "BadRequest")
            respBlock.html(i18next.t("error.missing_user_or_password"));
          else
            respBlock.html(xhr.responseJSON.error_message);
          break;
        case 401:
          respBlock.html(i18next.t("error.bad_request"));
          break;
        case 403:
          respBlock.html(i18next.t("error.invalid_auth"));
          break;
        case 500:
          respBlock.html(i18next.t("error.internal_server_error"));
          break;
        default:
          respBlock.html(xhr.responseJSON.error_message);


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
