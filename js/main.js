$(function(){
    
    var genres = [];

    function millisToMinutesAndSeconds(millis) {
        var seconds = parseInt((millis/1000)%60)
        var minutes = parseInt((millis/(1000*60))%60)

        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    
    var alltracks = "https://api.soundcloud.com/users/8711397/tracks.json?client_id=eee8ba9091def29e417285ce6138212b";
    $.getJSON( alltracks, function(data) {
        $.each(data, function(key, track) {
            var song = 
            '<tr id="'+track.permalink+'" class="song showhand" data-stream="'+track.stream_url + '?client_id=eee8ba9091def29e417285ce6138212b">\
                <td class="title">'+track.title+'</td>\
                <td class="video">'+ ((/\/[^ ]+/i.test(track.tag_list))?'<div class="youtube-icon" data-yt="'+ track.tag_list.match(/\/[^ ]+/i)[0] +'"></div>':'') +'</td>\
                <td class="genre">'+track.genre+'</td>\
                <td class="time">'+millisToMinutesAndSeconds(track.duration)+'</td>\
                <td class="added">'+track.created_at.slice(0,-15).replace(/\//g, '-')+'</td>\
            </tr>';

            $('.songlist tbody').append(song);
        });

        $('.songlist').tablesorter({
            sortList: [[4,1]],
            headers: { 
                1: { sorter: false }
            } 
        }); 
        
        $('.song').click(function() {
            if ($(this).attr('id') == $('.bar .player .audio').attr("data-key")) 
                $('.playpause').click();
            else
                playSong($(this).attr('id'));
            
        });
        
        $('.youtube-icon').click(function(e) {
            e.stopPropagation();
            
            //load audio stream
            loadSong($(this).parents('tr').attr('id'));

            $('body').removeClass('wallpaper');
            
            $('.playpause').removeClass('fa-pause');
            $('.playpause').addClass('fa-play');
            
            $('.youtube-player iframe').attr('src', '//www.youtube.com/embed/'+$(this).attr('data-yt')+'?rel=0&showinfo=0&autohide=1&enablejsapi=1&autoplay=1');
            
            $('.youtube-player').show();
        });
        
        //autostart
        if (window.location.hash && $(window.location.hash).length > 0) {
            playSong(window.location.hash.substring(1));
        }
    });
    
    $('.youtube-player').click(function () {
        $(this).hide();
        $('.youtube-player iframe')[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
    });
    
    function loadSong(id) {
        var stream = $('#'+id).attr('data-stream');
        var audio = $('.bar .player .audio').attr("src", stream)[0];
        audio.load();
        
        $('#' + $('.bar .player .audio').attr("data-key")).removeClass('playing');
        $('#' + id).addClass('playing');
        
        $('.bar .player .audio').attr("data-key", id);
        $('.bar .player .title').html($('#'+id+' .title').html());
        $('.bar .player .duration').html($('#'+id+' .time').html());
    }
    
    function playSong(id) {
        loadSong(id);
        
        $('body').addClass('wallpaper');
        
        $('.bar .player .audio')[0].play();
        $('.playpause').removeClass('fa-play');
        $('.playpause').addClass('fa-pause');
    };

    $(".bar .player .audio").bind('ended', function(){
        var currentRowId = $('.bar .player .audio').attr("data-key");
        var nextRow = $('#'+currentRowId).next("tr");
        var nextRowId;

        if (nextRow.length > 0) {
            // select the next row.
            nextRowId = $('#'+currentRowId).next("tr").attr("id");
        } else {
            // select the first row.
            nextRowId = $('.songlist tbody tr:first').attr('id');
        }
        
        playSong(nextRowId);
    });

    $('.progressbar').click(function (e) {
        if ($('.bar .player .audio').attr('src')) {
            var progressbar = $(e.target);
            var offset = progressbar.offset();
            var x = e.clientX - offset.left;
            var percentage = x / $('.progressbar').width();

            $('.progress').width(x);
            $('.bar .player .audio')[0].currentTime = $('.bar .player .audio')[0].duration * percentage;
        }
    });
    
    $('.playpause').click(function() {
        if (!$('.bar .player .audio').is("[data-key]")) {
            playSong($('.songlist tbody tr:first').attr('id'));
            return;
        }

        // toggle
        if ($(this).hasClass('fa-play')) {
            
            $('body').addClass('wallpaper');
            
            $('.bar .player .audio')[0].play();
            $(this).removeClass('fa-play');
            $(this).addClass('fa-pause');
        } else {
            
            $('body').removeClass('wallpaper');
            
            $('.bar .player .audio')[0].pause();
            $(this).removeClass('fa-pause');
            $(this).addClass('fa-play');
        }
    });
    
    
    $('.audio').on('timeupdate', function() {
        var progress = $(this).siblings('.progressbar').children('.progress')[0];
        var time = $(progress).children('.time')[0];

        //set current time
        var time = $(progress).children('.time')[0];
        var minutes = Math.floor(this.currentTime / 60);
        var seconds = Math.floor(this.currentTime % 60);
        var playtime = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;

        $(time).html(playtime);
        $(progress).width(((this.currentTime / this.duration) * 100)+ '%');

    });

});