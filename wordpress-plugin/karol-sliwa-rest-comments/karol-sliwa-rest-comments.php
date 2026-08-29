<?php
/**
 * Plugin Name: Karol Śliwa — komentarze REST API
 * Description: Umożliwia niezalogowanym czytelnikom dodawanie komentarzy przez WordPress REST API.
 * Version: 1.0.0
 * Author: Karol Śliwa
 * License: GPL-2.0-or-later
 * Text Domain: karol-sliwa-rest-comments
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Allow anonymous visitors to submit comments through POST /wp-json/wp/v2/comments.
 * Standard WordPress discussion, moderation and anti-spam rules still apply.
 */
function karol_sliwa_allow_anonymous_rest_comments( $allow_anonymous, $request ) {
	return true;
}

add_filter( 'rest_allow_anonymous_comments', 'karol_sliwa_allow_anonymous_rest_comments', 10, 2 );
