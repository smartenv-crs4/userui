
//_access_token defined in custom.js

function getUserProfile()
{
  jQuery('#profileContent').localize();

  if(userData){
      var templatePassword = Handlebars.compile(changePasswordTemplate);
      jQuery('#passwordTab').html(templatePassword());
      jQuery('#passwordTab').localize();

      var defaultImg = "assets/img/team/img32-md.jpg";

      // translate user Type
      //userData.typeTranslate = i18next.t("profile.customer");

      var template = Handlebars.compile(defaultUserProfileTemplate);
      userData.profileEditParams="[{'id':'profileCancel', 'removeClass':'btn-u-default','addClass':'btn-u-dark-blue'},{'id':'profileSave', 'removeClass':'btn-u-default','addClass':null}]";
      jQuery('#profile').html(template(userData));
      jQuery('#profile').localize();

      jQuery(".editable").editable();
      jQuery(".editable").css("color", "black");

      console.log("###" + JSON.stringify(userData));
      SetDefaultValues();

  }else{ //if error
      var respBlock = jQuery("#responseBlock");
      respBlock.html(errorsData.error_message);
      respBlock.removeClass("hidden");
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
        console.log("===> " + name + "|" + value);
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

            //TODO INSERT IMAGE
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





// function getUserProfile()
// {
//
//     // already verified from server
//     // if(sessionStorage.userId == undefined)
//     // {
//     //   redirectToLogin();
//     // }
//
//     jQuery('#profileContent').localize();
//
//     var templatePassword = Handlebars.compile(changePasswordTemplate);
//     jQuery('#passwordTab').html(templatePassword());
//     jQuery('#passwordTab').localize();
//
//
//
//     //console.log(sessionStorage.token);
//     jQuery.ajax({
//         url: _userMsUrl + "users/" + sessionStorage.userId,
//         type: "GET",
//         contentType: "application/json; charset=utf-8",
//         success: function(data, textStatus, xhr)
//         {
//             var defaultImg = "assets/img/team/img32-md.jpg";
//
//             // success
//             if(data.type == "customer")
//             {
//                 data.typeTranslate = i18next.t("profile.customer");
//                 var template = Handlebars.compile(customerProfileTemplate);
//                 jQuery('#profile').html(template(data));
//                 jQuery('#profile').localize();
//
//                 getFavoriteSuppliers();
//
//                 var tFavTab = Handlebars.compile(favoriteTabTemplate);
//                 jQuery("#tabContainer").append(tFavTab());
//                 jQuery("#tabContainer").localize();
//
//
//                 var tFav = Handlebars.compile(favoriteTemplate);
//                 jQuery("#tabBodyContainer").append(tFav());
//                 jQuery("#tabBodyContainer").localize();
//
//                 if(getUrlParameter("tab") == "favoriteTab")
//                 {
//                     jQuery("#tabContainer li.active").removeClass("active");
//                     jQuery("[href='#favoriteTab'").parent().addClass("active");
//
//                     jQuery("#tabBodyContainer div.active").removeClass("in active");
//                     jQuery("#favoriteTab").addClass("in active");
//
//                 }
//
//             }
//             else if(data.type == "supplier")
//             {
//                 data.typeTranslate = i18next.t("profile.supplier");
//                 var template = Handlebars.compile(supplierProfileTemplate);
//                 jQuery('#profile').html(template(data));
//                 jQuery('#profile').localize();
//
//                 getDocumentList();
//
//                 var tDocTab = Handlebars.compile(documentsTabTemplate);
//                 jQuery("#tabContainer").append(tDocTab());
//                 jQuery("#tabContainer").localize();
//
//                 var tDoc = Handlebars.compile(documentsTemplate);
//                 jQuery("#tabBodyContainer").append(tDoc());
//                 //jQuery("#tabBodyContainer").localize();
//
//                 //jQuery("#documentInput").filestyle();
//                 jQuery("#documentInput").filestyle({buttonText: i18next.t("profile.documentsInputLabel"),
//                     buttonBefore: true});
//               /*
//                var tCertTab = Handlebars.compile(certificationsTabTemplate);
//                jQuery("#tabContainer").append(tCertTab());
//                jQuery("#tabContainer").localize();
//
//                var tCert = Handlebars.compile(certificationsTemplate);
//                jQuery("#tabBodyContainer").append(tCert());
//                jQuery("#tabBodyContainer").localize();
//
//                */
//                 var tCatTab = Handlebars.compile(categoriesTabTemplate);
//                 jQuery("#tabContainer").append(tCatTab());
//                 jQuery("#tabContainer").localize();
//
//                 var tCat = Handlebars.compile(categoriesTemplate);
//                 jQuery("#tabBodyContainer").append(tCat());
//                 jQuery("#tabBodyContainer").localize();
//
//                 autoCompleteCat("acCat");
//                 getUserCategoryList();
//
//                 var tCertTab = Handlebars.compile(certificationsTabTemplate);
//                 jQuery("#tabContainer").append(tCertTab());
//                 jQuery("#tabContainer").localize();
//
//                 var tCert = Handlebars.compile(certificationsTemplate);
//                 jQuery("#tabBodyContainer").append(tCert());
//                 jQuery("#tabBodyContainer").localize();
//
//                 getCertificationsList();
//             }
//
//
//
//             jQuery(".editable").editable();
//             jQuery(".editable").css("color", "black");
//
//
//             jQuery(document).on("translate", function(){
//                 var aType = jQuery("#pType").data("accounttype");
//                 if(aType == "customer")
//                     jQuery("#pType").html(i18next.t("profile.customer"));
//                 else if(aType == "supplier")
//                 {
//                     jQuery("#pType").html(i18next.t("profile.supplier"));
//                     jQuery("#documentInput").filestyle('buttonText', i18next.t("profile.documentsInputLabel"));
//                 }
//
//                 jQuery(".editable").each(function(){
//                     jQuery(this).editable("option", "emptytext", jQuery(this).data("emptytext"));
//                 });
//                 jQuery(".editable-empty").each(function(){
//                     jQuery(this).html(jQuery(this).data("emptytext"));
//                 });
//
//
//                 jQuery('[data-toggle=confirmation]').confirmation("destroy");
//                 jQuery('[data-toggle=confirmation]').popover("destroy");
//                 jQuery('[data-toggle=confirmation]').attr('data-original-title', i18next.t("profile.areYouSure"));
//                 //jQuery('[data-toggle=confirmation]').attr('data-btn-cancel-label', i18next.t("profile.no"));
//                 //jQuery('[data-toggle=confirmation]').attr('data-btn-ok-label', i18next.t("profile.yes"));
//
//
//                 jQuery('[data-toggle=confirmation]').confirmation({
//                     rootSelector: '[data-toggle=confirmation]',
//                     btnOkLabel: i18next.t("profile.yes"),
//                     btnCancelLabel: i18next.t("profile.no"),
//                     title: i18next.t("profile.areYouSure")
//                 });
//             });
//
//         },
//         error: function(xhr, status)
//         {
//             var respBlock = jQuery("#responseBlock");
//
//             switch(xhr.status)
//             {
//                 case 400:
//                     if(xhr.responseJSON.error == "invalid_token")
//                     {
//                         respBlock.html(i18next.t("error.unauthorized"));
//                         redirectToLogin();
//                     }
//                     else if(xhr.responseJSON.error == "BadRequest")
//                         respBlock.html(i18next.t("error.missing_user_or_password"));
//                     else
//                         respBlock.html(xhr.responseJSON.error_message);
//                     break;
//                 case 401:
//                     respBlock.html(i18next.t("error.unauthorized"));
//                     redirectToLogin();
//                     break;
//                 case 500:
//                     respBlock.html(i18next.t("error.internal_server_error"));
//                     break;
//                 default:
//                     respBlock.html(xhr.responseJSON.error_message);
//             }
//             respBlock.removeClass("hidden");
//             return;
//         },
//         beforeSend: function(xhr, settings)
//         {
//             xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token);
//         }
//     });
// };






// function updateProfile()
// {
//   if(sessionStorage.userId == undefined)
//   {
//     redirectToLogin();
//   }
//
//   var data = new Object();
//   data.user = new Object();
//
//   jQuery("#profile .editable").each(function(){
//     var name = jQuery(this).data("name");
//     var value = jQuery(this).editable('getValue')[name];
//     if(value || jQuery(this).hasClass("editable-unsaved"))
//     {
//       if(name.indexOf(".") >= 0)
//       {
//         var sName = name.split(".");
//         if(data.user[sName[0]] == undefined)
//         {
//           data.user[sName[0]] = {};
//         }
//         data.user[sName[0]][sName[1]] = value;
//       }
//       else
//       {
//         data.user[name] = value;
//       }
//     }
//   });
//
//   //console.log(sessionStorage.token);
//   jQuery.ajax({
//     url: _brokerMsUrl + "users/",
//     type: "PUT",
//     contentType: "application/json; charset=utf-8",
//     data: JSON.stringify(data),
//     dataType: "json",
//     success: function(dataResp, textStatus, xhr)
//     {
//       jQuery('.editable-unsaved').removeClass('editable-unsaved');
//       jQuery.jGrowl(i18next.t("profile.saved"), {theme:'bg-color-green1', life: 5000});
//
//       var defaultImg = "assets/img/team/img32-md.jpg";
//
//       if(data.user.logo)
//       {
//         jQuery("#imgBox").attr("src", data.user.logo);
//         sessionStorage.logo = data.user.logo;
//       }
//       else
//       {
//         jQuery("#imgBox").attr("src", defaultImg);
//         sessionStorage.logo = undefined;
//       }
//     },
//     error: function(xhr, status)
//     {
//       var msg;
//       try
//       {
//         msg = xhr.responseJSON.message;
//       }
//       catch(err)
//       {
//         msg = i18next.t("error.internal_server_error");
//       }
//
//       jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
//
//       return;
//     },
//     beforeSend: function(xhr, settings)
//     {
//       xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token);
//     }
//   });
// }






function changePassword()
{
  if(sessionStorage.userId == undefined)
  {      
    redirectToLogin();
  }
  
  var oldPassword = jQuery("#oldPassword").val();
  var newPassword = jQuery("#newPassword1").val();
  var newPassword2 = jQuery("#newPassword2").val();
  
  if(newPassword !== newPassword2 || newPassword === "")
  {
    jQuery.jGrowl(i18next.t("error.password_differs"), {theme:'bg-color-red', life: 5000});    
    return;
  }
  
  var data = new Object();
  data.oldpassword = oldPassword;
  data.newpassword = newPassword;
  
  
  //console.log(sessionStorage.token);
  jQuery.ajax({
    url: _userMsUrl + "users/" + sessionStorage.userId + "/actions/setpassword",
    type: "POST",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    dataType: "json",
    success: function(dataResp, textStatus, xhr)
    {        
      if(!dataResp.access_credentials.error)
      {
        jQuery.jGrowl(i18next.t("profile.passwordSaved"), {theme:'bg-color-green1', life: 5000});    
      }
      else
      {
        jQuery.jGrowl(dataResp.access_credentials.error_message, {theme:'bg-color-red', life: 5000});    
      }
    },     
    error: function(xhr, status)
    {
      var msg;
      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
            
      return;    
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    }                    
  });  
}





function getFavoriteSuppliers()
{
  if(sessionStorage.userId == undefined)
  {      
    redirectToLogin(); 
  }
  
  var ret;
  
  jQuery.ajax({
    url: _brokerMsUrl + "users/favorites",
    type: "GET",    
    contentType: "application/json; charset=utf-8",
    success: function(dataResp, textStatus, xhr)
    {        
      var tFavTab = Handlebars.compile(favoriteTableTemplate); 
      jQuery("#favoriteSuppliersList").empty();
      jQuery("#favoriteSuppliersList").append(tFavTab(dataResp));        
      //console.log(dataResp);               
    },     
    error: function(xhr, status)
    {
      var msg;
      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
            
      return;    
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    }                    
  });  
  
}

function getCertificationsList()
{
  if(sessionStorage.userId == undefined)
  {      
    redirectToLogin(); 
  }
  
  var ret;
  
  jQuery.ajax({
    url: _brokerMsUrl + "users/certifications",
    type: "GET",    
    contentType: "application/json; charset=utf-8",
    success: function(dataResp, textStatus, xhr)
    {        
      var tCertTab = Handlebars.compile(certificationsTableTemplate); 
      jQuery("#certificationsList").empty();
      jQuery("#certificationsList").append(tCertTab(dataResp)); 
      
      jQuery("#certificationsList").localize();            
      //console.log(dataResp);               
    },     
    error: function(xhr, status)
    {
      var msg;
      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
            
      return;    
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    }                    
  });  
  
}






function uploadDocument()
{
  var fd = new FormData();
  var f = jQuery("#documentInput")[0];
  fd.append( 'document', f.files[0] );
  fd.append('docName', f.files[0].name);
 
  //var url = _brokerMsUrl + "users/actions/attachment";
  var url = _brokerMsUrl + "files/actions/attachments";

  jQuery.ajax({
    url: url,
    data: fd,
    processData: false,
    contentType: false,
    type: 'POST',    
    success: function(data)
    {
      jQuery.jGrowl(i18next.t("profile.documentSaved"), {theme:'bg-color-green1', life: 5000});
      getDocumentList();
    },
    error: function(xhr, status)
    {
      var msg;
      
      switch(xhr.status)
      {
        case 400:
          //msg = i18next.t("error.invalid_pdf");
          try
          {        
            msg = xhr.responseJSON.message;
          }
          catch(err)
          {
            msg = i18next.t("error.internal_server_error");
          }                      
            
          break;
        case 403:
          msg = i18next.t("error.unauthorized");
          break;
        case 500:
          msg = i18next.t("disk_quota_exceeded");
          break;
        default:
          try
          {        
            msg = xhr.responseJSON.message;
          }
          catch(err)
          {
            msg = i18next.t("error.internal_server_error");
          }
      }
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    } 
  });
}


function getDocumentList()
{
  jQuery.ajax({
    url: _brokerMsUrl + "files/attachments/" + sessionStorage.userId,     
    type: "GET",
    contentType: "application/json; charset=utf-8",
    success: function(data, textStatus, xhr)
    {      
      var dd = [];
      if(data.attachments)
      {
        for(var i in data.attachments.files)
        {
          var d ={}
          d.url = _brokerMsUrl + "files/" + data.attachments.files[i].id;
          d.name = data.attachments.files[i].name;
          d.fid = data.attachments.files[i].id;
          dd.push(d);
        }
      }
        
      var tDocTable = Handlebars.compile(documentsTableTemplate);      
      jQuery("#documentsList").html(tDocTable(dd));
      jQuery("#documentsList").localize();
      
      
      jQuery('[data-toggle=confirmation]').confirmation({
        rootSelector: '[data-toggle=confirmation]',
        // other options
      });
    },
    error: function(xhr, status)
    {
      var msg;
      
      switch(xhr.status)
      {
        case 400:
          msg = i18next.t("error.invalid_pdf");
          break;
        case 403:
          msg = i18next.t("error.unauthorized");
          break;
        case 500:
          msg = i18next.t("disk_quota_exceeded");
          break;
        default:
          try
          {        
            msg = xhr.responseJSON.message;
          }
          catch(err)
          {
            msg = i18next.t("error.internal_server_error");
          }
      }
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    } 
  });
}

function deleteDocument(fid)
{
  if(!fid)
  {
    //console.log(jQuery(this).data("fnme"));
    //console.log(jQuery(this));
    fid = jQuery(this).data("fid");
    if(!fid)
    {
      jQuery.jGrowl("No file id", {theme:'bg-color-red', life: 5000});
      return;      
    }
  }
  
  jQuery.ajax({
    url: _brokerMsUrl + "files/actions/attachment/" + fid,
    type: "DELETE",
    contentType: "application/json; charset=utf-8",
    success: function(data, textStatus, xhr)
    {      
      jQuery.jGrowl(i18next.t("profile.documentDeleted"), {theme:'bg-color-green1', life: 5000});
      getDocumentList();                                  
    },
    error: function(xhr, status)
    {
      var msg;
      
      switch(xhr.status)
      {
        case 400:
          msg = i18next.t("error.invalid_pdf");
          break;
        case 403:
          msg = i18next.t("error.unauthorized");
          break;
        case 500:
          msg = i18next.t("disk_quota_exceeded");
          break;
        default:
          try
          {        
            msg = xhr.responseJSON.message;
          }
          catch(err)
          {
            msg = i18next.t("error.internal_server_error");
          }
      }
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    } 
  });
}


function removeFavoriteSupplier(sid)
{
  jQuery.ajax({
    url: _brokerMsUrl + "users/actions/favorites/" + sid,
    type: "DELETE",
    contentType: "application/json; charset=utf-8",
    success: function(data, textStatus, xhr)
    {      
      getFavoriteSuppliers();  
    },
    error: function(xhr, status)
    {
      var msg;

      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }      
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    } 
  });
  
}


function removeUserCategory(cid)
{
  jQuery.ajax({
    url: _brokerMsUrl + "users/actions/categories/" + cid,
    type: "DELETE",
    contentType: "application/json; charset=utf-8",
    success: function(data, textStatus, xhr)
    {      
      //getFavoriteSuppliers();  
      //console.log(data);
      getUserCategoryList();
    },
    error: function(xhr, status)
    {
      var msg;

      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }      
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    } 
  });
}

function addUserCategory()
{
  if(sessionStorage.userId == undefined)
  {      
    redirectToLogin();
  }
  
  var category = jQuery("#acCat").data("cat-id");
  
  
  if(category == "" || category == undefined)
  {
    //
    return;
  }
  
  var data = new Object();
  data.category = category;
  
  
  jQuery.ajax({
    url: _brokerMsUrl + "users/actions/categories",
    type: "POST",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    dataType: "json",
    success: function(dataResp, textStatus, xhr)
    {        
      getUserCategoryList();
      //console.log(dataResp);
    },     
    error: function(xhr, status)
    {
      var msg;

      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }      
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    }           
  });  
}


function addCertification()
{
  if(sessionStorage.userId == undefined)
  {      
    redirectToLogin();
  }
  
  var name = jQuery("#iCertName").val();
  var date = jQuery("#iCertDate").val();
  var desc = jQuery("#iCertDescription").val();
  
  
  var data = new Object();
  data.certification = {};
  data.certification.name = name;
  data.certification.date = date;
  data.certification.description = desc;
  
  
  jQuery.ajax({
    url: _brokerMsUrl + "users/actions/certifications",
    type: "POST",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    dataType: "json",
    success: function(dataResp, textStatus, xhr)
    {     
      getCertificationsList();               
    },     
    error: function(xhr, status)
    {
      var msg;

      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }      
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    }           
  });  
}


function removeCertification(name)
{
  jQuery.ajax({
    url: _brokerMsUrl + "users/actions/certifications/" + name,
    type: "DELETE",
    contentType: "application/json; charset=utf-8",
    success: function(data, textStatus, xhr)
    {            
      getCertificationsList();
    },
    error: function(xhr, status)
    {
      var msg;

      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }      
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    } 
  });
  
}



function getUserCategoryList()
{
  if(sessionStorage.userId == undefined)
  {      
    redirectToLogin();
    return; 
  }
  
  var ret;
  
  jQuery.ajax({
    url: _brokerMsUrl + "users/categories/",
    type: "GET",    
    contentType: "application/json; charset=utf-8",
    success: function(dataResp, textStatus, xhr)
    {        
      var data = [];
      
      for(var i in dataResp)
      {
        data.push({"id": dataResp[i]._id, "name": dataResp[i].name[localStorage.lng]});
      }
      
      jQuery("#categoriesList").empty();
      var tCatTable = Handlebars.compile(categoriesTableTemplate);      
      jQuery("#categoriesList").html(tCatTable(data));
      jQuery("#categoriesList").localize();
    },     
    error: function(xhr, status)
    {
      var msg;
      try
      {        
        msg = xhr.responseJSON.message;
      }
      catch(err)
      {
        msg = i18next.t("error.internal_server_error");
      }
      
      jQuery.jGrowl(msg, {theme:'bg-color-red', life: 5000});
            
      return;    
    },
    beforeSend: function(xhr, settings) 
    { 
      xhr.setRequestHeader('Authorization','Bearer ' + sessionStorage.token); 
    }                    
  });  
  
}


