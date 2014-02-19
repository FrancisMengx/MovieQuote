/**
 * @fileoverview
 * User interactions for the Movie Quotes web client.
 *
 * @author fisherds@gmail.com (Dave Fisher)
 */

/** Namespace declarations. */
var rh = rh || {};
rh.moviequotes = rh.moviequotes || {};
rh.moviequotes.endpoints = rh.moviequotes.endpoints || {};
rh.moviequotes.localstorage = rh.moviequotes.localstorage || {};

/**
 * @param {Object}
 *            Map of IDs to movieQuotes.
 */
rh.moviequotes.quotes = {}

rh.moviequotes.offlineDeleted = []

rh.moviequotes.currentLimit;
/**
 * @param {bool}
 *            Tracks the editing status.
 */
rh.moviequotes.editEnabled = false;


/**
 * @param {number}
 *            Constant for when to ID is selected.
 * @const
 */
rh.moviequotes.NO_ID_SELECTED = -1;


/**
 * @param {number}
 *            Tracks the editing status.
 */
rh.moviequotes.selectedId = rh.moviequotes.NO_ID_SELECTED;


/**
 * @param {bool}
 *            Flag to indicate if messages should be sent to Endpoints or simply
 *            stored.
 */
rh.moviequotes.moviequotesApiDidLoad = false;


/**
 * Prints a movie quote to the log. param {Object} movieQuote MovieQuote to
 * print.
 */
rh.moviequotes.print = function (movieQuote) {
	$titleEl = $('<h2></h2>').addClass('list-group-item-heading').html(movieQuote.movie_title);
	$quoteEl = $('<p></p>').addClass('list-group-item-text').html(movieQuote.quote);
	$quoteInfo = $('<div class="quote-info"></div>').append($titleEl).append($quoteEl);

	$buttonGroup = $('<div class="row-buttons"></div>');
	$buttonGroup.append('<button class = "btn btn-success individual-edit-button">Edit</button>');
	$buttonGroup.append('<button class = "btn btn-danger individual-delete-button">Delete</button>');

	if (rh.moviequotes.editEnabled) {
		$quoteInfo.addClass('narrow-for-edit');
	} else {
		$buttonGroup.hide();
	}
	$movieQuoteEl = $('<li></li>').attr('id', movieQuote.id).addClass('list-group-item').append($quoteInfo).append($buttonGroup);
	$('#outputLog').prepend($movieQuoteEl);
};


/**
 * Shows or hides the edit and delete buttons.
 */
rh.moviequotes.toggleEdit = function () {
	if (rh.moviequotes.editEnabled) {
		rh.moviequotes.editEnabled = false;
		$('#toggle-edit-mode-button').html("Edit");
		$('.row-buttons').fadeOut('fast');
		$('.quote-info').removeClass('narrow-for-edit');
	} else {
		rh.moviequotes.editEnabled = true;
		$('#toggle-edit-mode-button').html("Done");
		console.log("change to done");
		$('.row-buttons').fadeIn('fast');
		$('.quote-info').addClass('narrow-for-edit');
	}
};


/**
 * Finds the ID for the MovieQuote using the list-group-item's id attribute.
 */
rh.moviequotes.getQuoteId = function ($rowButton) {
	var quoteId = 0;
	var $parent = null;
	var parentEls = $rowButton.parents();
	for (var i = 0; i < parentEls.length; i++) {
		$parent = $(parentEls[i]);
		if ($parent.hasClass('list-group-item')) {
			quoteId = $parent.attr('id');
			break;
		}
	}
	return quoteId;
};


/**
 * Deletes the MovieQuote for this row.
 */
rh.moviequotes.deleteQuote = function ($deleteButton) {
	var quoteId = rh.moviequotes.getQuoteId($deleteButton);
	if (quoteId != 0) {
		if (navigator.onLine) {
			rh.moviequotes.endpoints.deleteMovieQuote(quoteId);
		} else {
			rh.moviequotes.localstorage.deleteQuote(quoteId);
		}
	}
};


/**
 * Enables the button callbacks in the UI.
 */
rh.moviequotes.enableButtons = function () {
	$('#display-add-quote-modal').click(function () {
		$('#myModalLabel').html('Add a movie quote');
		$('#add-quote-button').html("Add Quote");
		rh.moviequotes.selectedId = rh.moviequotes.NO_ID_SELECTED;
		$('#movie_title').val('');
		$('#quote').val('');
		$('#add-quote-modal').modal('show');
	});

	$('#refresh-button').click(function () {
		if (navigator.onLine) {
			if (rh.moviequotes.editEnabled) {
				rh.moviequotes.toggleEdit();
			}
			rh.moviequotes.endpoints.listMovieQuotes((JSON.parse(localStorage['last_list_response']).length/10+1)*10);
		} else {
			if (rh.moviequotes.editEnabled) {
				rh.moviequotes.toggleEdit();
			}
			window.location.reload(false);
		}

	});

	$('#add-quote-button').click(function () {
		if (navigator.onLine) {
			rh.moviequotes.endpoints.insertMovieQuote(
				$('#movie_title').val(),
				$('#quote').val());
		} else {
			rh.moviequotes.localstorage.insertMovieQuote(
				$('#movie_title').val(),
				$('#quote').val());
		}
	});

	$('#toggle-edit-mode-button').click(function () {
		rh.moviequotes.toggleEdit();
	});

	$('#outputLog').on('click', '.individual-edit-button', function () {
		$('#myModalLabel').html('Edit movie quote');
		$('#add-quote-button').html("Edit Quote");
		rh.moviequotes.selectedId = rh.moviequotes.getQuoteId($(this));
		console.log(rh.moviequotes.selectedId);
		var selectedQuote = rh.moviequotes.quotes[rh.moviequotes.selectedId];
		$('#movie_title').val(selectedQuote.movie_title);
		$('#quote').val(selectedQuote.quote);
		$('#add-quote-modal').modal('show');
	});

	$('#outputLog').on('click', '.individual-delete-button', function () {

		rh.moviequotes.deleteQuote($(this));
	});

};

/**
 * Enables the network listener
 */
rh.moviequotes.enableNetworkListeners = function () {

	window.addEventListener("online", function () {

		// rh.moviequotes.uploadOfflineEdit();
		// if(rh.moviequotes.localEntryCount > 0){
		// 			console.log(rh.moviequotes.localEntryCount);
		//  		rh.moviequotes.uploadOfflineInsert();
		// 	}

		if (typeof gapi === 'undefined') {
			$.getScript('https://apis.google.com/js/client.js?onload=clientJsReload', function () {
				console.log("Added not loaded yet");
			});

		} else {
			rh.moviequotes.uploadOfflineDelete();
			rh.moviequotes.uploadOfflineInsert();
			rh.moviequotes.uploadOfflineEdit();
		}

		$('.offline').tooltip('destroy')
		$(".offline-icon").fadeOut();

	}, true);

	window.addEventListener("offline", function () {
		rh.moviequotes.moviequotesApiDidLoad = false;
		$('.offline').tooltip();
		$(".offline-icon").fadeIn();
		setTimeout(function () {
		}, 2000);
	}, true);
};

rh.moviequotes.uploadOfflineEdit = function () {
	var offlineEdited = JSON.parse(localStorage['offline_edit']);
	console.log(offlineEdited);
	for (var i = 0; i < offlineEdited.length; i++) {
		rh.moviequotes.selectedId = offlineEdited[i].id;
		rh.moviequotes.endpoints.insertMovieQuote(offlineEdited[i].movie_title, offlineEdited[i].quote);
	}
	localStorage['offline_edit'] = "[]";
};

rh.moviequotes.uploadOfflineDelete = function () {
	if (localStorage['offline_delete'] != "[]") {
		var offlineDeleted = JSON.parse(localStorage['offline_delete']);
		console.log(offlineDeleted);
		for (var i = 0; i < offlineDeleted.length; i++) {
			rh.moviequotes.endpoints.deleteMovieQuote(offlineDeleted[i].id)
		}
		localStorage['offline_delete'] = "[]";
	}
};

rh.moviequotes.uploadOfflineInsert = function () {
	if (localStorage['offline_insert'] == "[]") {
		localStorage['offline_insert'] = JSON.stringify([]);
		return;
	}
	var id = [];
	var offlineItems = JSON.parse(localStorage['offline_insert']);
	for (var i = 0; i < offlineItems.length; i++) {
		id.push(offlineItems[i].id);
		gapi.client.moviequotes.quote.insert({
			'movie_title': offlineItems[i].movie_title,
			'quote': offlineItems[i].quote
		}).execute(function (resp) {
				var curId = id.shift();
				console.log("uploading offline insert");
				rh.moviequotes.quotes[resp.id] = resp;
				$('#' + curId + " span").remove();
				$('#' + curId).attr('id', resp.id);
			});
	}
	localStorage['offline_insert'] = JSON.stringify([]);
	rh.moviequotes.localEntryCount = 0;
};


/**
 * Initializes the content that can be on-line or off-line.
 */
rh.moviequotes.init = function () {
	console.log("Initialize even for off-line.");

	if (!navigator.onLine) {
		$(".offline-icon").fadeIn();
	}
	rh.moviequotes.currentLimit = 10;
	rh.moviequotes.enableButtons();
	rh.moviequotes.enableBottomRefresh();
	rh.moviequotes.enableNetworkListeners();
	rh.moviequotes.localstorage.listMovieQuotes();



	// TESTING
	$.getScript('https://apis.google.com/js/client.js?onload=clientJsLoaded', function () {
		console.log("Added not loaded yet");
	});

}

function clientJsLoaded() {
	rh.moviequotes.onClientJsLoad('//' + window.location.host + '/_ah/api');
}
/**
 * reload clientjs after back online.
 */
function clientJsReload() {
	rh.moviequotes.onClientJsReload('//' + window.location.host + '/_ah/api');
}

rh.moviequotes.onClientJsReload = function (apiRoot) {
	console.log("Client JS did load");
	var apisToLoad;
	var callback = function () {
		console.log("Loaded an api");

		rh.moviequotes.uploadOfflineDelete();
		rh.moviequotes.uploadOfflineInsert();
		rh.moviequotes.uploadOfflineEdit();
	}
	apisToLoad = 1; // must match number of calls to gapi.client.load()
	gapi.client.load('moviequotes', 'v1', callback, apiRoot);
};


rh.moviequotes.enableBottomRefresh = function(){
	$(window).scroll(function(){
		if ($(window).scrollTop() == $(document).height()-$(window).height()){

			var quoteList = JSON.parse(localStorage['last_list_response']);
			rh.moviequotes.endpoints.listMovieQuotes((quoteList.length/10 + 1)*10);
			console.log('Bottom refreshing, current limit = '+(quoteList.length/10 + 1)*10);
		}
	});
//	$(window).scroll(function(){
//		if ($(window).scrollTop() == $(document).height()-$(window).height()){
//			alert("We're at the bottom of the page!!");
//		}
//	});
};

/**
 * Initializes the application.
 *
 * @param {string}
 *            apiRoot Root of the API's path.
 */
rh.moviequotes.onClientJsLoad = function (apiRoot) {
	console.log("Client JS did load");
	var apisToLoad;
	var callback = function () {
		console.log("Loaded an api");
		if (--apisToLoad == 0) {
			rh.moviequotes.moviequotesApiDidLoad = true;
			rh.moviequotes.endpoints.listMovieQuotes();
		}
	}
	apisToLoad = 1; // must match number of calls to gapi.client.load()
	gapi.client.load('moviequotes', 'v1', callback, apiRoot);
};


//----------------------- localStorage methods -----------------------

/**
 * Lists MovieQuotes via the localStorage values.
 */
rh.moviequotes.localstorage.listMovieQuotes = function () {
	if (!localStorage['last_list_response']) {
		console.log('No localStorage data to display');
		return;
	}

	var items = JSON.parse(localStorage['last_list_response']) || [];
	console.log("offline items length = " + items.length)
	// Loop through in reverse order since the newest goes on top.
	for (var i = items.length - 1; i >= 0; i--) {
		var movieQuote = items[i];
		if (navigator.onLine) {
			rh.moviequotes.print(movieQuote);
		} else {
			rh.moviequotes.localstorage.print(movieQuote);
		}

		rh.moviequotes.quotes[movieQuote.id] = movieQuote;
	}
};
/**
 * insert or edit movie quote
 * @param movieTitle movie title
 * @param quote movie quote
 */


rh.moviequotes.localstorage.insertMovieQuote = function (movieTitle, quote) {
	var postJson = {
		'movie_title': movieTitle,
		'quote': quote
	};
	if (rh.moviequotes.selectedId == rh.moviequotes.NO_ID_SELECTED) {
		rh.moviequotes.localstorage.insertion(postJson);
	} else {
		rh.moviequotes.localstorage.edit(movieTitle, quote);
	}
	$('#add-quote-modal').modal('hide');
};

/**
 * Actual insertion
 * @param postJson data to store and send
 */
rh.moviequotes.localstorage.insertion = function(postJson){
	var items = JSON.parse(localStorage['last_list_response']) || [];
	postJson.id = items.length;
	var offlineItems;
	if (localStorage['offline_insert'] != "[]") {
		offlineItems = JSON.parse(localStorage['offline_insert']);
		offlineItems.unshift(postJson);
		localStorage['offline_insert'] = JSON.stringify(offlineItems);
	} else {

		inserted = [postJson];
		localStorage['offline_insert'] = JSON.stringify(inserted);
	}


	items.unshift(postJson);

	localStorage['last_list_response'] = JSON.stringify(items);
	rh.moviequotes.quotes[postJson.id] = postJson;
	rh.moviequotes.localstorage.print(postJson);
};

/**
 * Actual edit
 * @param postJson data to store and send
 */
rh.moviequotes.localstorage.edit = function(movieTitle,quote){
	$('#' + rh.moviequotes.selectedId + ' .list-group-item-heading').html(movieTitle);
	$('#' + rh.moviequotes.selectedId + ' .list-group-item-text').html(quote);
	var items = JSON.parse(localStorage['last_list_response']);
	var offlineInsert = JSON.parse(localStorage['offline_insert']);
	if (parseInt(rh.moviequotes.selectedId) < 1000) {
		for (var i = 0; i < items.length; i++) {
			if (items[i].id == rh.moviequotes.selectedId) {
				items[i].movie_title = movieTitle;
				items[i].quote = quote;
				localStorage['last_list_response'] = JSON.stringify(items);
			}
		}
		for (var j = 0; j < offlineInsert.length; j++) {
			if (offlineInsert[j].id == rh.moviequotes.selectedId) {
				offlineInsert[j].movie_title = movieTitle;
				offlineInsert[j].quote = quote;
				localStorage['offline_insert'] = JSON.stringify(offlineInsert);
			}
		}
	} else {
		for (var i = 0; i < items.length; i++) {
			if (items[i].id == rh.moviequotes.selectedId) {
				var edit = JSON.parse(localStorage['offline_edit']);
				items[i].movie_title = movieTitle;
				items[i].quote = quote;
				edit.unshift(items[i]);
				localStorage['offline_edit'] = JSON.stringify(edit);
				localStorage['last_list_response'] = JSON.stringify(items);
			}
		}

	}
};


/**
 * local print
 * @param movieQuote
 */

rh.moviequotes.localstorage.print = function (movieQuote) {
	var offlineInsert = JSON.parse(localStorage['offline_insert']);
	$titleEl = $('<h2></h2>').addClass('list-group-item-heading').html(movieQuote.movie_title);
	$quoteEl = $('<p></p>').addClass('list-group-item-text').html(movieQuote.quote);
	$quoteInfo = $('<div class="quote-info"></div>').append($titleEl).append($quoteEl);

	$buttonGroup = $('<div class="row-buttons"></div>');
	$buttonGroup.append('<button class = "btn btn-success individual-edit-button">Edit</button>');
	$buttonGroup.append('<button class = "btn btn-danger individual-delete-button">Delete</button>');
	//if a quote is in the local insertion, then print with offline mark.
	for (var i = 0; i < offlineInsert.length; i++) {
		if (offlineInsert[i].id == movieQuote.id) {
			$quoteInfo.append(
				'<span data-toggle="tooltip" data-placement="bottom" title="Offline Mode" ' +
					'data-toggle="tooltip" data-placement="bottom" title="Tooltip on bottom"' +
				' class="glyphicon glyphicon-resize-full offline-icon quoteIcon offline"></span>');

		}
	}
	if (rh.moviequotes.editEnabled) {
		$quoteInfo.addClass('narrow-for-edit');
	} else {
		$buttonGroup.hide();
	}

	$movieQuoteEl = $('<li></li>').attr('id', movieQuote.id).addClass('list-group-item').append($quoteInfo).append($buttonGroup);
	$('#outputLog').prepend($movieQuoteEl);
	$('.offline').tooltip();
};

rh.moviequotes.localstorage.deleteQuote = function (movieQuoteId) {
	var items = JSON.parse(localStorage['last_list_response']);
	var offlineInsert = JSON.parse(localStorage['offline_insert']);
	var offlineEdit = JSON.parse(localStorage['offline_edit']);
	if (parseInt(movieQuoteId) < 10000) {
		for (var i = 0; i < items.length; i++) {
			if (items[i].id == movieQuoteId) {

				items.splice(i, 1);
				localStorage['last_list_response'] = JSON.stringify(items);
			}
		}
		for (var j = 0; j < offlineInsert.length; j++) {
			if (offlineInsert[j].id == movieQuoteId) {
				offlineInsert.splice(j, 1);
				localStorage['offline_insert'] = JSON.stringify(offlineInsert);
			}
		}

	} else {
		for (var i = 0; i < items.length; i++) {
			if (items[i].id == movieQuoteId) {
				var deleted = items[i];
				items.splice(i, 1);
				localStorage['last_list_response'] = JSON.stringify(items);
				var deletedItems = JSON.parse(localStorage['offline_delete']);
				deletedItems.push(deleted);
				localStorage['offline_delete'] = JSON.stringify(deletedItems);
			}
		}
		for (var k = 0; k < offlineEdit.length; k++) {
			if (offlineEdit[k] == movieQuoteId) {
				offlineEdit.splice(k, 1);
				localStorage['offline_edit'] = JSON.stringify(offlineEdit);
			}
		}
	}
	$('#' + movieQuoteId).slideUp();
}


//----------------------- Endpoints methods -----------------------

/**
 * Lists MovieQuotes via the API.
 */
rh.moviequotes.endpoints.listMovieQuotes = function (limit) {

	gapi.client.moviequotes.quote.list({'order': '-last_touch_date_time', limit:limit}).execute(
		function (resp) {
			if (!resp.code) {
				localStorage['offline_edit'] = JSON.stringify([]);
				localStorage['offline_delete'] = JSON.stringify([]);
				localStorage['offline_insert'] = JSON.stringify([]);
				localStorage['last_list_response'] = JSON.stringify(resp.items);
				$('#outputLog').html('');
				rh.moviequotes.currentLimit = ((resp.items/10)+1)*10;
				resp.items = resp.items || [];
				// Loop through in reverse order since the newest goes on top.
				rh.moviequotes.quotes = {};
				for (var i = resp.items.length - 1; i >= 0; i--) {

					var movieQuote = resp.items[i];
					rh.moviequotes.print(movieQuote);
					rh.moviequotes.quotes[movieQuote.id] = movieQuote;
				}
			}
		});

};


/**
 * Insert a movie quote
 *
 * @param {string}
 *            movieTitle Title of the movie for the quote
 * @param {string}
 *            quote Quote from the movie.
 */
rh.moviequotes.endpoints.insertMovieQuote = function (movieTitle, quote) {
	var postJson = {
		'movie_title': movieTitle,
		'quote': quote
	};
	if (rh.moviequotes.selectedId != rh.moviequotes.NO_ID_SELECTED) {
		postJson.id = rh.moviequotes.selectedId;
		var items = JSON.parse(localStorage['last_list_response']);
		for (var i = 0; i < items.length; i++) {
			if (items[i].id == rh.moviequotes.selectedId) {
				items[i].movie_title = movieTitle;
				items[i].quote = quote;
				localStorage['last_list_response'] = JSON.stringify(items);
			}
		}
		$('#' + rh.moviequotes.selectedId + ' .list-group-item-heading').html(movieTitle);
		$('#' + rh.moviequotes.selectedId + ' .list-group-item-text').html(quote);
	}
	gapi.client.moviequotes.quote.insert(postJson).execute(function (resp) {
		if (!resp.code) {
			if (rh.moviequotes.selectedId == rh.moviequotes.NO_ID_SELECTED) {
				var items = JSON.parse(localStorage['last_list_response']);
				rh.moviequotes.print(resp);
				items.unshift(resp);
				console.log("inin");
				rh.moviequotes.quotes[resp.id] = resp;
				localStorage['last_list_response'] = JSON.stringify(items);
			}
		}
	});
	$('#add-quote-modal').modal('hide');
};


/**
 * Delete a movie quote
 *
 * @param {int}
 *            id Id of the movieQuote to delete
 */
rh.moviequotes.endpoints.deleteMovieQuote = function (movieQuoteId) {
	gapi.client.moviequotes.quote.delete({
		'id': movieQuoteId
	}).execute(function (resp) {
			if (!resp.code) {
				console.log("Deleting now remove from DOM");
				$('#' + movieQuoteId).slideUp();
			}
		});
};