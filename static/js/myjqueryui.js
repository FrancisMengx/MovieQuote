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


/**
 * @param {bool} Tracks the editing status.
 */
rh.moviequotes.editEnabled = false;


/**
 * @param {number} N
 * @const
 */
rh.moviequotes.NO_ID_SELECTED = -1;

/**
 * @param {number} Tracks the editing status.
 */
rh.moviequotes.selectedId = rh.moviequotes.NO_ID_SELECTED;


/**
 * Prints a movie quote to the log.
 * param {Object} movieQuote MovieQuote to print.
 */
rh.moviequotes.print = function (movieQuote) {
	$titleEl = $('<h2></h2>').html(movieQuote.movie_title);
	$quoteEl = $('<p></p>').html(movieQuote.quote);
	$quoteInfo = $('<div class="quote-info"></div>').append($titleEl).append($quoteEl);

	$buttonGroup = $('<div class="row-buttons"></div>');
	$buttonGroup.append('<button class = "individual-edit-button">Edit</button>');
	$buttonGroup.append('<button class = "individual-delete-button">Delete</button>');

	if (rh.moviequotes.editEnabled) {
		$quoteInfo.addClass('narrow-for-edit');
	} else {
		$buttonGroup.hide();
	}
	$movieQuoteEl = $('<li></li>').attr('id', movieQuote.id).addClass('movie-quote-item').append($quoteInfo).append($buttonGroup).append('<hr>');
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
}


/**
 *
 */
rh.moviequotes.deleteQuote = function ($deleteButton) {
	var quoteId = 0;
	var $parent = null;
	var parentEls = $deleteButton.parents();
	for (var i = 0; i < parentEls.length; i++) {
		$parent = $(parentEls[i]);
		if ($parent.hasClass('movie-quote-item')) {
			quoteId = $parent.attr('id');
			break;
		}
	}
	if (quoteId != 0) {
		rh.moviequotes.endpoints.deleteMovieQuote(quoteId, $parent);
	}
}

/**
 * Enables the button callbacks in the UI.
 */
rh.moviequotes.enableButtons = function () {
	$('#display-add-quote-modal').click(function () {
		$('#movie_title').val('');
		$('#quote').val('');
		$("#dialog-form").dialog("open");
	});

	$('#refresh-button').click(function () {
		if (rh.moviequotes.editEnabled) {
			rh.moviequotes.toggleEdit();
		}
		rh.moviequotes.endpoints.listMovieQuotes();
	});

	$('#toggle-edit-mode-button').click(function () {
		rh.moviequotes.toggleEdit();
	});

	$('#outputLog').on('click', '.individual-edit-button', function () {
		console.log('TODO: Implement Edit quote');
		//rh.moviequotes.editQuote($(this));
	});

	$('#outputLog').on('click', '.individual-delete-button', function () {
		rh.moviequotes.deleteQuote($(this));
	});

};

/**
 * Initializes the application.
 * @param {string} apiRoot Root of the API's path.
 */
rh.moviequotes.init = function (apiRoot) {
	console.log("init called but doing nothing for now.");
	var apisToLoad;
	var callback = function () {
		console.log("Loaded an api");
		if (--apisToLoad == 0) {
			rh.moviequotes.enableButtons();
			rh.moviequotes.endpoints.listMovieQuotes();
		}
	}
	apisToLoad = 1; // must match number of calls to gapi.client.load()
	gapi.client.load('moviequotes', 'v1', callback, apiRoot);
};


// ---------- Code the runs before Endpoints js is ready ----------
$(document).ready(function () {
	$("#menu").menu();
	$("#dialog-form").dialog({
		autoOpen: false,
		height: 330,
		width: 750,
		modal: true,
		buttons: {
			"Add a Movie Quote": function () {
				rh.moviequotes.endpoints.insertMovieQuote(
					$('#movie_title').val(),
					$('#quote').val());
				$(this).dialog("close");
			},
			Cancel: function () {
				$(this).dialog("close");
			}
		}
	});


});


// ----------------------- Endpoints methods -----------------------

/**
 * Lists MovieQuotes via the API.
 */
rh.moviequotes.endpoints.listMovieQuotes = function () {
	gapi.client.moviequotes.quote.list({'order': '-last_touch_date_time'}).execute(
		function (resp) {
			if (!resp.code) {
				$('#outputLog').html('');
				resp.items = resp.items || [];
				// Loop through in reverse order since the newest goes on top.
				for (var i = resp.items.length - 1; i >= 0; i--) {
					rh.moviequotes.print(resp.items[i]);
				}
			}
		});
};


/**
 * Insert a movie quote
 * @param {string} movieTitle Title of the movie for the quote
 * @param {string} quote Quote from the movie.
 */
rh.moviequotes.endpoints.insertMovieQuote = function (movieTitle, quote, existingId) {
	var postJson = {
		'movie_title': movieTitle,
		'quote': quote
	};
	if (existingId) {
		postJson.id = existingId
	}
	gapi.client.moviequotes.quote.insert(postJson).execute(function (resp) {
		if (!resp.code) {
			rh.moviequotes.print(resp);
		}
	});
};

/**
 * Delete a movie quote
 * @param {int} id Id of the movieQuote to delete
 */
rh.moviequotes.endpoints.deleteMovieQuote = function (movieQuoteId, $row) {
	gapi.client.moviequotes.quote.delete({
		'id': movieQuoteId
	}).execute(function (resp) {
			if (!resp.code) {
				console.log("Deleted now remove from DOM");
				$row.slideUp();
			}
		});
};
