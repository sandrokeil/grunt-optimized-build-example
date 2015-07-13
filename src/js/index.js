/* globals jQuery, document */
( function( $ ) {
    'use strict';

    var $document = $( document );

    $document.ready( function() {

        var $video = $( '.container' );
        $video.fitVids();

        $( '.dropdown-toggle' ).dropdown();

    } );
})( jQuery );
