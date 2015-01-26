var App = {};

// App Structure
App.Models = {};
App.Views = {};
App.JST = {};
App.opts = {};
App.Data = {};
App.UI = {};

// Models
App.Models.User = Backbone.Model.extend({
	defaults:{
		uid:"",
		avatar:"",
		email:"",
		name:"",
		homepage:""
	}
});

//Views 
App.Views.SignModal = Backbone.View.extend({
	events:{
		"click a.btn-github":"signWithGithub",
		"click a.btn-twitter":"signWithTwitter",
		"click a.btn-facebook":"signWithFacebook"
	},
	initialize: function(opts){
		this.PubSub = opts.PubSub;
	},
	signWithGithub: function(e){
		var self = App.UI.SignModal;
		App.firebase.authWithOAuthPopup("github", function(error, authData) {
		  if (error) {
		    console.log("Login Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		    self.PubSub.trigger('auth:login',{ provider: authData.provider, payload: authData });
		  }
		});
	},
	signWithTwitter: function(e){
		var self = App.UI.SignModal;
		App.firebase.authWithOAuthPopup("twitter", function(error, authData) {
		  if (error) {
		    console.log("Login Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		    self.PubSub.trigger('auth:login',{ provider: authData.provider, payload: authData });
		  }
		});
	},
	signWithFacebook: function(e){
		var self = App.UI.SignModal;
		App.firebase.authWithOAuthPopup("facebook", function(error, authData) {
		  if (error) {
		    console.log("Login Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		    self.PubSub.trigger('auth:login',{ provider: authData.provider, payload: authData });
		  }
		});
	}
});


// Initializing Configurations 
App.initialize = function(opts){
	App.opts = opts || {};
	App.firebase = new Firebase(opts.firebaseUrl);
	App.start();
};

App.setupDataLayer = function(){
	// Check out BackboneFire https://github.com/firebase/backbonefire
	App.Data.Users = new (Backbone.Firebase.Collection.extend({
		model: App.Models.User,
		url: App.opts.firebaseUrl + "/users"
	}))();
};

App.setupUILayer = function(){
	App.UI.SignModal = new App.Views.SignModal({el:"#sign-manifesto",PubSub: App.PubSub});
};

App.setupEvents = function(){
	//Add Events Here

	// Auth Events
	App.PubSub.once("auth:login",App.onLogin);

};

App.onLogin = function(result){
	
	if(result.provider === "github")
		App.addGithubUser(result.payload);

	if(result.provider === "facebook")
		App.addFacebookUser(result.payload);

	if(result.provider === "twitter")
		App.addTwitterUser(result.payload);
}

App.addGithubUser = function(payload){
	var user = {};

	user.uid = payload.uid;
	user.avatar = payload.github.cachedUserProfile.avatar_url;
	user.name = payload.github.displayName;

	App.Data.Users.add(user);
}

App.addTwitterUser = function(payload){
	var user = {};

	user.uid = payload.uid;
	user.avatar = payload.twitter.cachedUserProfile.profile_image_url;
	user.name = payload.twitter.displayName;

	App.Data.Users.add(user);
}

App.addFacebookUser = function(payload){
	var user = {};

	user.uid = payload.uid;
	user.avatar = payload.facebook.cachedUserProfile.picture.data.url;
	user.name = payload.facebook.displayName;

	App.Data.Users.add(user);
}

//Starting Data and UI Layers, PubSub for connecting both layers
App.start = function(){
	App.PubSub = _.extend({},Backbone.Events);
	App.setupDataLayer();
	App.setupUILayer();
	App.setupEvents();
};

// Starts when document is loaded
$(function(){
	App.initialize({firebaseUrl:"https://torid-inferno-7223.firebaseIO.com"});
});