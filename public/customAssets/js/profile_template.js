var defaultUserProfileTemplate = `
{{#if ptitle}}
    <h2 class="heading-md"><span data-i18n="profile.smalltitle"></span> <span>{{ptitle}}</span></h2>
{{else}}
    <h2 class="heading-md" data-i18n="profile.title"></h2>
{{/if}}
<br>
<dl class="dl-horizontal">
    <dt><strong data-i18n="profile.email"></strong></dt>
    <dd>
        {{email}}        
        <!-- span>
          <a class="pull-right" href="#">
            <i class="fa fa-pencil"></i>
          </a>
        </span -->
    </dd>
    <hr>
    <dt><strong data-i18n="profile.type"></strong></dt>
    <dd id="pType" data-accountType={{type}}>
    {{#if ApplicationTokenTypes}}            
        <label class="select">
            <select id="ed-type" disabled name="tokentypes" onchange="setTokenType()">
    	        <option value="none" selected="" disabled="">{{typeTranslate}}</option>
                {{#each ApplicationTokenTypes}}
                <option value="{{this}}">{{this}}</option>
                {{/each}}                
            </select>
            <i></i>
        </label>
        <a class="pull-right" href="javascript:enableTypeManager({{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    {{else}}
        <span data-i18n="{{typeTranslatei18n}}">{{typeTranslate}}</span>
         {{#if enableUserUpgrade}}        
            <div class="pull-right btn-group">
                <button type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown">
                    <span data-i18n="profile.upgrade"></span>                                
                    <i class="fa fa-angle-down"></i>
                </button>
                    
                <ul class="dropdown-menu" role="menu">
                    {{#each enableUserUpgrade}}
                        <li><a onclick="upgradeUserRequest('{{this}}')" data-i18n="profile.{{this}}">{{this}}</a></li>                        
                    {{/each}}
                    <li class="divider"></li>
                    <li><a onclick="upgradeUserRequest('Administrator')">Administrator</a></li>                    
                </ul>
            </div>
            <!--<button onclick="upgradeUserRequest()" class="pull-right btn-u btn-u-red" type="button"><i class="fa  fa-briefcase"></i><span>  </span><span data-i18n="profile.upgrade"></span></button>-->
        {{/if}}
    {{/if}}   
        <!--<a class="pull-right" href=""><i class="fa fa-pencil">Upgrade</i></a>-->        
    </dd>    
    <hr>
    <dt><strong data-i18n="profile.Name"></strong></dt>
    <dd>
        <span data-name="name" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-name">{{name}}</span>
        <a class="pull-right" href="javascript:setEditable('ed-name',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
    <dt><strong data-i18n="profile.Surname"></strong></dt>
    <dd>
        <span data-name="surname" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-surname">{{surname}}</span>
        <a class="pull-right" href="javascript:setEditable('ed-surname',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
    <dt><strong data-i18n="profile.ckanApiKey"></strong></dt>
    <dd>
        <span data-name="ckan_apikey" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-ckan">{{ckan_apikey}}</span>
        <a class="pull-right" href="javascript:setEditable('ed-ckan',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
    <dt><strong data-i18n="profile.avatar"></strong></dt>
    <dd>
        <span data-name="avatar" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-avatar">{{avatar}}</span>
        <a id="ed-avatarButton" style="display: none" class="pull-right" onclick="setEditable('ed-avatar',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
</dl>
<button id="profileCancel" type="button" disabled class="btn-u btn-u-default" data-i18n="profile.cancel" onclick="getUserProfile()">Cancel</button>
<button id="profileSave" type="button" disabled class="btn-u btn-u-default" data-i18n="profile.save" onclick="updateProfile()">Save Changes</button>
`;


var changePasswordTemplate = `
<h2 class="heading-md" data-i18n="profile.passwordTitle"></h2>
<p data-i18n="profile.passwordTitle2"></p>
<br>
<div>
  <div class="input-group margin-bottom-20">
    <span class="input-group-addon rounded-left"><i class="icon-lock color-white"></i></span>
    <input type="password" class="form-control rounded-right" data-i18n="[placeholder]profile.oldPasswordPlaceholder" id="oldPassword">
  </div>

  <div class="input-group margin-bottom-20">
    <span class="input-group-addon rounded-left"><i class="icon-lock color-white"></i></span>
    <input type="password" class="form-control rounded-right" data-i18n="[placeholder]profile.newPasswordPlaceholder" id="newPassword1">
  </div>
  
  <div class="input-group margin-bottom-20">
    <span class="input-group-addon rounded-left"><i class="icon-lock color-white"></i></span>
    <input type="password" class="form-control rounded-right" data-i18n="[placeholder]profile.newPassword2Placeholder" id="newPassword2">
  </div>
  <hr />
  <div class="input-group margin-bottom-20">
    <button type="button" class="btn-u" data-i18n="profile.save" onclick="changePassword()"></button>
  </div>
      
</div>
`;







