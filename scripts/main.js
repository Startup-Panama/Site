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
		if(ga){ ga('send', 'event', 'signWithGithub', 'start'); }
		var self = App.UI.SignModal;
		App.firebase.authWithOAuthPopup("github", function(error, authData) {
			if (error) {
				if(ga){ ga('send', 'event', 'signWithGithub', 'error', error.code); }
				console.log("Login Failed!", error);
			} else {
				if(ga){ ga('send', 'event', 'signWithGithub', 'success'); }
				console.log("Authenticated successfully with payload:", authData);
				self.PubSub.trigger('auth:login',{ provider: authData.provider, payload: authData });
			}
		});
	},
	signWithTwitter: function(e){
		if(ga){ ga('send', 'event', 'signWithTwitter', 'start'); }
		var self = App.UI.SignModal;
		App.firebase.authWithOAuthPopup("twitter", function(error, authData) {
			if (error) {
				if(ga){ ga('send', 'event', 'signWithTwitter', 'error', error.code); }
				console.log("Login Failed!", error);
			} else {
				if(ga){ ga('send', 'event', 'signWithTwitter', 'success'); }
				console.log("Authenticated successfully with payload:", authData);
				self.PubSub.trigger('auth:login',{ provider: authData.provider, payload: authData });
			}
		});
	},
	signWithFacebook: function(e){
		if(ga){ ga('send', 'event', 'signWithFacebook', 'start'); }
		var self = App.UI.SignModal;
		App.firebase.authWithOAuthPopup("facebook", function(error, authData) {
			if (error) {
				if(ga){ ga('send', 'event', 'signWithFacebook', 'error', error.code); }
				console.log("Login Failed!", error);
			} else {
				if(ga){ ga('send', 'event', 'signWithFacebook', 'success'); }
				console.log("Authenticated successfully with payload:", authData);
				self.PubSub.trigger('auth:login',{ provider: authData.provider, payload: authData });
			}
		});
	}
});

App.Views.SignatureList = Backbone.View.extend({
	initialize: function(opts){
		this.Users = opts.Users;
		if(!this.Users.isEmpty()){ this.render(); }
		this.listenTo(this.Users, 'sync', function(){ this.render(); });
	},
	render: function(){
		var users = _.first(this.Users.shuffle(), 5);

		var names = _.map(users, function(user){
			return user.get('name').split(' ')[0];
		}).join(', ');

		this.$('.users-copy')
			.html(names + ' y ' + (this.Users.length - users.length) +
					 ' personas más han firmado el manifiesto.');

		_.each(users, function(user, i){
			this.$('.user-pics div').eq(i)
				.css('background-image', 'url(' + user.get('avatar') + ')');
		}, this);
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
		url: App.opts.firebaseUrl + "/users",
		autoSync: true
	}))();
};

App.ifUserDontExistDo = function(uid,cb){
	var collection = new (Backbone.Firebase.Collection.extend({
		model: App.Models.User,
		url: new Firebase(App.opts.firebaseUrl + "/users").orderByChild("uid").equalTo(uid),
	}))();

	collection.once("sync",function(collection){
		if (collection.length === 0)
			cb();
		App.PubSub.trigger("UI:disable_sign_button",{});
	});
};

App.setupUILayer = function(){
	App.UI.SignModal = new App.Views.SignModal({el:"#sign-manifesto",PubSub: App.PubSub});
	App.UI.SignatureList = new App.Views.SignatureList({el:"#manifesto-signatures", Users: App.Data.Users});
};

App.setupEvents = function(){
	//Add Events Here

	// Auth Events
	App.PubSub.once("auth:login",App.onLogin);
	App.PubSub.once("UI:disable_sign_button",App.disableSignButton);

};


App.disableSignButton = function(){
	$("#sign-btn").prop("disabled",true).addClass("disabled").text("¡Gracias por firmar el manifiesto!");
	$("#sign-manifesto").modal("hide");
};

App.onLogin = function(result){
	App.ifUserDontExistDo(result.payload.uid,function(){
		if(result.provider === "github")
			App.addGithubUser(result.payload);

		if(result.provider === "facebook")
			App.addFacebookUser(result.payload);

		if(result.provider === "twitter")
			App.addTwitterUser(result.payload);
	});
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
