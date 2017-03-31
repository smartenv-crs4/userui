var header_template = `	<div class="header">
    <div class="container">
      <!-- Logo -->
      <a class="logo" href="index.html">
        <img src="assets/img/port/logo1-default.png" alt="Logo"/>
      </a>
      <!-- End Logo -->

      <!-- Topbar -->
      <div class="topbar">
        <ul class="loginbar pull-right">
          <li class="hoverSelector">    
            <i class="fa fa-globe"></i>
            <a data-i18n="nav.lang"></a>
            <ul class="languages hoverSelectorBlock">
              <li class="active ">
                <a class="" data-lng="en" href="#">English <i class="fa fa-check"></i></a>
              </li>
              <li><a href="#" data-lng="en">English</a></li>
              <li><a  data-lng="it" href="#">Italiano</a></li>
            </ul>
          </li>
          <li class="topbar-devider"></li>
          <li><a href="page_faq.html" data-i18n="nav.help">Help</a></li>
          <li class="topbar-devider"></li>
          <li id="h_login"><a href="page_login_and_registration.html">Login</a></li>          
          <li id="h_logout"><a href="#" onclick="logout()" data-i18n="nav.logout"></a></li>   
                                           
          <li style="padding-left:20px" id="h_user"><a href="page_profile_settings.html" ><strong></strong></a></li>
        </ul>
      </div>
      <!-- End Topbar -->

      <!-- Toggle get grouped for better mobile display -->
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-responsive-collapse">
        <span class="sr-only">Toggle navigation</span>
        <span class="fa fa-bars"></span>
      </button>
      <!-- End Toggle -->
    </div><!--/end container-->

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse mega-menu navbar-responsive-collapse">
      <div class="container">
        <ul class="nav navbar-nav">
          <!-- Home -->
          <li {{#if isHome}}class="active"{{/if}} >
            <a href="index.html"  >
              Home
            </a>
          </li>
            {{#if isLogged}}
          <li class="logged {{#if isRFQ}}active{{/if}}">
           <a href="./page_rfq_inbox.html"  >
              RFQ
           </a>
          </li>          
            {{/if}}
          <li>
            <a href="javascript:void(0);"  data-i18n="nav.about">
              
            </a>
          </li>
          </li>
          {{#if showSearch}}
          <li>
            <i class="search fa fa-search search-btn"></i>
            <div class="search-open">
                <div class="input-group animated fadeInDown">
                    <input type="text" class="form-control" placeholder="" id="smallSearch" >
                    <span class="input-group-btn">
                        <button class="btn-u" type="button"  id="smallSearchButton" onclick="javascript:window.location = 'list.html?name=' + $('#smallSearch').val() + '&type_search=p';" >
                       <i class="fa fa-search"></i>
                       <span data-i18n="catalog.search"></span>
                       </button>
                    </span>
                </div>
            </div>
          </li>
		 {{/if}}

        </ul>
      </div><!--/end container-->
    </div><!--/navbar-collapse-->
  </div>`;
