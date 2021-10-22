var game = function() {
  var player1 = {
    name: "Player 1",
    score: 0,
    total: 0,
    hand: [],
    isDealer: false,
    revealed: 0
  },
  player2 = {
    name: "Player 2",
    score: 0,
    total: 0,
    hand: [],
    isDealer: true,
    revealed: 0
  },
  discardPile = [],
  topCard = null,
  round = 1,
  activePlayer = "",
  gameStage = "pregame",
  isCardsDealt = false,
  isGameOver = false,
  isDiscardEnabled = true,
  isCardDrawn = false,
  playerToBeat = null,
  deckOffset = {};

  var gameStart = function() {
    cards.destroy();
    cards.build();

    if (round !== 1) {
      player1.isDealer = !player1.isDealer;
      player2.isDealer = !player2.isDealer;
    }

    activePlayer = player1.isDealer ? "player2" : "player1";
  };

  var playerCardClick = function() {
    var $this = $(this),
    $selected = $('.selected'),
    position = $this.attr('data-card'),
    playerNum = $this.parents('#player1').attr('id') == "player1" ? 1 : 2,
    player = playerNum == 1 ? player1 : player2;

      if ($selected.hasClass('deck')) {
        drawDeck(position);
      } else if ($selected.hasClass('discard')) {
        drawDiscard(position);
      } else if (gameStage == "pregame" && !player.hand[position].visible) {
        revealCard(playerNum, position, $this);
      }
  };

  var deckClick = function() {
    if (gameStage !== "pregame") {
      if (!isCardDrawn) {
        unselectCard($('.discard'));
        revealTopCard();
      }
      else {
        console.log(activePlayer + " must swap or discard the " + topCard.name + " to end their turn.");
      }
    } else {
      console.log("Each player must reveal 2 cards before play begins.");
    }
  };

  var discardClick = function() {
    if (isCardDrawn) {
      discardCard();
    } else if (gameStage !== "endgame" && !$('.discard').hasClass('.selected')) {
      selectCard($('.discard'));
    }
  };

  var displayCards = function() {
    $('.deal').off().addClass('disabled');

    (function dealPlayer1 (i) {
      setTimeout(function() {
        $('#player1 .card-' + i).attr('id', player1.hand[i].card.name);
        $('#player1 .card-' + i + ' .side-b').attr('class', 'side-b ' + player1.hand[i].card.suit).text(player1.hand[i].card.identifier);
        $('#player1 .card-' + i).css({'left': '0', 'top': '0'});
        if (++i < 6) {dealPlayer1(i);}
      }, 300)
    })(0);

    (function dealPlayer2 (i) {
      setTimeout(function() {
        $('#player2 .card-' + i).attr('id', player2.hand[i].card.name);
        $('#player2 .card-' + i + ' .side-b').attr('class', 'side-b ' + player2.hand[i].card.suit).text(player2.hand[i].card.identifier);
        $('#player2 .card-' + i).css({'left': '0', 'top': '0'});
        if (++i < 6) {dealPlayer2(i);}
      }, 300)
    })(0);

    $('.discard').attr('id', discardPile[0].name);
    $('.discard .side-b').attr('class', 'side-b ' + discardPile[0].suit).text(discardPile[0].identifier);
    $('#player1 .card, #player2 .card').addClass('enabled').on('click', game.selectCard);
    $('.deck').on('click', deckClick);
  };

  var dealCards = function() {

    for (var i = 0; i < 6; i++) {
      player1.hand[i] = {card: cards.deal(), visible: false};
    };

    console.log("\nplayer1 hand");

    for (var i = 0; i < 6; i++) {
      console.log(i + " " + player1.hand[i].card.name + " " + player1.hand[i].visible);
    };

    for (var i = 0; i < 6; i++) {
      player2.hand[i] = {card: cards.deal(), visible: false};
    };

    console.log("\nplayer2 hand");

    for (var i = 0; i < 6; i++) {
      console.log(i + " " + player2.hand[i].card.name + " " + player2.hand[i].visible);
    };

    isCardsDealt = true;

    discardPile.push(cards.deal());
    console.log("\ndiscard pile", discardPile[0].name);

    console.log("Choose two cards to reveal.");

    displayCards();
  };

  var revealCard = function(player, pos, $this) {
    var player = player == 1 ? player1 : player == 2 ? player2 : null;

    if (player.revealed < 2) {
      if (!player.hand[pos].visible) {
        player.hand[pos].visible = true;
        console.log(player.name + " revealed " + player.hand[pos].card.name);

        player.revealed++;
        displayReveal($this);
        checkStatus($this);
      } else {
        console.log("That card has already been revealed.");
      }
    } else {
      console.log(player.name + " is not allowed to reveal more cards.");
    }
  };

  var revealRandomCard = function() {
    if (player1.revealed < 2 && player2.revealed < 2) {
      while(player1.revealed < 2) {
        var random = Math.floor(Math.random()*6);
        if (!player1.hand[random].visible) {
          player1.hand[random].visible = true;
          console.log(player1.name + " revealed " + player1.hand[random].card.name);

          for (var i = 0; i < 6; i++) {
            console.log(i + " " + player1.hand[i].card.name + " " + player1.hand[i].visible);
          };
          player1.revealed++;
        }
      }

      while(player2.revealed < 2) {
        var random = Math.floor(Math.random()*6);
        if (!player2.hand[random].visible) {
          player2.hand[random].visible = true;
          console.log(player2.name + " revealed " + player2.hand[random].card.name);

          for (var i = 0; i < 6; i++) {
            console.log(i + " " + player2.hand[i].card.name + " " + player2.hand[i].visible);
          };
          player2.revealed++;
        }
      }

      checkStatus();
    }
  };

  var revealHidden = function() {
    for (var i = 0; i < 6; i++) {
      if (!player1.hand[i].visible)
        displayReveal($('#player1 .card-' + i));
    };

    for (var i = 0; i < 6; i++) {
      if (!player2.hand[i].visible)
        displayReveal($('#player2 .card-' + i));
    };
  };

  var displayReveal = function($this) {
    $this.css({'-webkit-transform': 'rotateY(-.5turn)', 'z-index': 2}).addClass('revealed');
  };

  var revealTopCard = function() {
    topCard = cards.deal();
    isCardDrawn = true;
    displayRevealTopCard(topCard);

    console.log("\ntop card", topCard.name);
    console.log(activePlayer + " swap or discard the " + topCard.name + ".");
  };

  var displayRevealTopCard = function(card) {
    var $deck = $('.deck');

    if (cards.count() == 0)
      $('.deck-2').css({'opacity': 0});

    selectCard($deck);
    $('.deck .side-b').attr('class', 'side-b ' +  card.suit).text(card.identifier);

    deckOffset = $deck.offset();
    console.log("left: " + deckOffset.left);
    $deck.attr('id', card.name).css({'-webkit-transform': 'rotateY(-.5turn)', 'z-index': 3, 'left': 0, 'top': 0}).addClass('revealed'); 

    $('.draw').off().addClass('disabled');
    $('.discard').addClass('enabled').on('click', discardClick);
  };

  var drawDiscard = function(pos) {
    if (pos > -1) {
      switch (gameStage) {
        case "pregame":
          console.log("Each player must reveal 2 cards before play begins.");
          break;
        case "midgame":
          if (!isCardDrawn) {
            var player = activePlayer == "player1" ? player1 : player2,
              swappedCard = player.hand[pos].card;

              if (!player.hand[pos].visible) {
                displayReveal($('#' + activePlayer + ' .card-' + pos));
                player.revealed++;
              }

              console.log(swappedCard);
              player.hand[pos].card = discardPile[discardPile.length - 1];
              player.hand[pos].visible = true;
              discardPile[discardPile.length - 1] = swappedCard;
              console.log(discardPile);
              console.log(swappedCard);
              displaySwap(pos, $('.discard').offset(), false, false);
              checkStatus();
          } else {
            console.log(activePlayer + " must swap or discard the " + topCard.name + " to end their turn.");
          }
          break;
      }
    } else if (gameStage !== "endgame") {
      $('.draw').off().addClass('disabled');
      selectCard($('.discard'));
    } else {
      console.log("You cannot draw from the discard pile on the last turn.")
    }
  };

  var drawDeck = function(pos) {
    if (isCardDrawn) {
      var player = activePlayer == "player1" ? player1 : player2,
        swappedCard = player.hand[pos].card;

      if (!player.hand[pos].visible) {
        displayReveal($('#' + activePlayer + ' .card-' + pos));
        player.revealed++;
      }

      player.hand[pos].card = topCard;
      player.hand[pos].visible = true;

      displaySwap(pos, deckOffset, true, gameStage == "endgame");
      discardCard(swappedCard);
    } else {
      console.log("Draw a card from the deck or the discard pile.");
    }
  };

  var displaySwap = function(pos, selectedOffset, updateDiscard2, freezeDeck) {
    var $discard = $('.discard'),
      $selected = $('.selected'),
      $target = $('#' + activePlayer + ' .card-' + pos),
      $targetLeft = $target.offset().left,
      $targetTop = $target.offset().top;

    $('.selected').css({'z-index': 3, 'left': $targetLeft - selectedOffset.left, 'top': $targetTop - selectedOffset.top});

    $target.on('transitionend', function() {
      if(updateDiscard2) {
        $('.discard-2').attr('id', $discard.attr('id')).show();
        $('.discard-2 .side-b').attr('class', $discard.children('.side-b').attr('class')).text($discard.children('.side-b').text());
      }
      $('<div class="card discard enabled revealed" id="' + $target.attr('id') + '" style="left: 0px; top: 0px; -webkit-transform: rotateY(-0.5turn); z-index: 2;">' +
        '<div class="side-a"></div>' +
        '<div class="' + $target.children('.side-b').attr('class') + '">' + $target.children('.side-b').text() + '</div>' +
      '</div>').insertAfter($discard);
      $('<div class="' + $target.attr('class') + '" id="' + $selected.attr('id') + '" data-card="' + $target.attr('data-card') + '" style="left: 0px; top: 0px; -webkit-transform: rotateY(-0.5turn); z-index: 1;">' +
        '<div class="side-a"></div>' +
        '<div class="' + $selected.children('.side-b').attr('class') + '">' + $selected.children('.side-b').text() + '</div>' +
      '</div>').insertAfter($target);
      $target.remove();
      $discard.remove();
      $('.deck').remove();
      $('.deck-2').clone().attr('class', 'card deck enabled').css({'z-index': 3}).insertBefore('.discard');

      if (gameStage == "endgame") {
        $('.discard').removeClass('enabled');
      }

      if (!freezeDeck) {
        $('.deck').on('click', deckClick);
        $('.discard').on('click', discardClick);
      } else {
        $('.deck').removeClass('enabled');
      }
    }).css({'z-index': 4, 'left': $discard.offset().left - $targetLeft, 'top': $discard.offset().top - $targetTop});
  };

  var discardCard = function(card) {
    if (card)
      discardPile.push(card);
    else {
      discardPile.push(topCard);
      displayDiscardTopCard();
    }

    topCard = null;
    isCardDrawn = false;
    checkStatus();
  };

  var displayDiscardTopCard = function() {
    var $discard = $('.discard'),
      $selected = $('.selected');

    $('.selected').one('transitionend', function(){
      $(this).on('transitionend', function() {
        $('.discard-2').attr('id', $discard.attr('id')).show();
        $('.discard-2 .side-b').attr('class', $discard.children('.side-b').attr('class')).text($discard.children('.side-b').text());
        $('<div class="card discard enabled revealed" id="' + $selected.attr('id') + '" style="left: 0px; top: 0px; -webkit-transform: rotateY(-0.5turn); z-index: 2;">' +
          '<div class="side-a"></div>' +
          '<div class="' + $selected.children('.side-b').attr('class') + '">' + $selected.children('.side-b').text() + '</div>' +
        '</div>').insertAfter($discard);
        $discard.remove();
        $('.deck').remove();
        $('.deck-2').clone().attr('class', 'card deck enabled').css({'z-index': 3}).insertBefore('.discard');

        if (gameStage == "endgame") {
          $('.discard, .deck').removeClass('enabled');
        } else {
          $('.deck').on('click', deckClick);
          $('.discard').on('click', discardClick);
        }
      });
    }).css({'left': $discard.offset().left - deckOffset.left, 'top': $discard.offset().top - deckOffset.top, 'z-index': 5});
  };

  var selectCard = function($card) {
    $card.css({'border-color': '#FFEC85'}).addClass('selected').removeClass('enabled');
    $('#' + activePlayer + ' .card').addClass('enabled');
    $('#player1 .card, #player2 .card').off();
    $('#' + activePlayer + ' .card').on('click', game.selectCard);
  };

  var unselectCard = function($card) {
    $card.css({'border-color': ''}).removeClass('selected');
  };

  var checkStatus = function($this) {
    if (gameStage == "pregame") {
      if ($this.siblings().hasClass('revealed')) {
        $this.siblings().addBack().removeClass('enabled');
      }
      if (isCardsDealt && player1.revealed > 1 && player2.revealed > 1) {
        gameStage = "midgame";

        setTimeout(function() {
          $('.discard').css({'-webkit-transform': 'rotateY(.5turn)', 'left': 0, 'top': 0}).addClass('enabled revealed');
        },600);

        setTimeout(function() {
          $('.draw').on('click', deckClick).removeClass('disabled');
          $('.discard').on('click', discardClick).css({'z-index': 2});
          $('.card').css({'z-index': 1});
          $('.deck').addClass('enabled').css({'z-index': 3});
        },1200);

        $('#turn-indicator').removeClass('player1 player2').addClass(activePlayer).show();
      }
    } else if (gameStage == "midgame" && cards.count() > 0) {
      if (player1.revealed == 6 || player2.revealed == 6) {
        gameStage = "endgame";
        isDiscardEnabled = false;
        playerToBeat = activePlayer;
        console.log("endgame");
      }

      $('.enabled').removeClass('enabled');
      activePlayer = activePlayer == "player1" ? "player2" : "player1";
      $('#turn-indicator').removeClass('player1 player2').addClass(activePlayer);
      console.log(activePlayer + "'s turn.");
      $('.draw').on('click', deckClick).removeClass('disabled');
    } else {
      console.log("The game is over.");
      $('.card').off().removeClass('enabled');
      $('.draw').off().addClass('disabled');
      revealHidden();
      calcScores();
      displayScores();
    }
  };

  var gameSetup = function(player1Name, player2Name) {
    if (player1Name) {
      player1.name = player1Name;
      $('#player1-scorecard-name').text(player1.name);
    }
    if (player2Name) {
      player2.name = player2Name;
      $('#player2-scorecard-name').text(player2.name);
    }
  };

  var gameReset = function() {
    player1.score = 0;
    player1.total = 0;
    player1.hand = [];
    player1.revealed = 0;
    player2.score = 0;
    player2.total = 0;
    player2.hand = [];
    player2.revealed = 0;
    discardPile = [];
    topCard = null;
    round = 1;
    activePlayer = "";
    gameStage = "pregame";
    isCardsDealt = false;
    isGameOver = false;
    isDiscardEnabled = true;
    isCardDrawn = false;
    playerToBeat = null;
  };

  var advanceRound = function() {
    player1.score = 0;
    player1.hand = [];
    player1.revealed = 0;
    player2.score = 0;
    player2.hand = [];
    player2.revealed = 0;
    discardPile = [];
    topCard = null;
    round++;
    activePlayer = "";
    gameStage = "pregame";
    isCardsDealt = false;
    isGameOver = false;
    isDiscardEnabled = true;
    isCardDrawn = false;
    playerToBeat = null;
  };

  var calcScores = function() {
    var matches = [],
      player1Bonus = 0,
      player2Bonus = 0;

    for (var i = 0; i < 3; i++) {
      if (player1.hand[i].card.rank !== player1.hand[i + 3].card.rank) {
        player1.score += player1.hand[i].card.points;
        player1.score += player1.hand[i + 3].card.points;
      } else {
        var match = player1.hand[i].card.rank;

        if (match == "joker") {
          player1.score -= 4;
          player2Bonus += 10;
          console.log("Player1 double jokers +10");
        } else if (match == matches[0] || match == matches[1]) {
          player2Bonus += 10;
          console.log("Player1 four of a kind +10");
        }

        matches.push(match);
      }
    };

    matches = [];

    for (var i = 0; i < 3; i++) {
      if (player2.hand[i].card.rank !== player2.hand[i + 3].card.rank) {
        player2.score += player2.hand[i].card.points;
        player2.score += player2.hand[i + 3].card.points;
      } else {
        var match = player2.hand[i].card.rank;

        if (match == "joker") {
          player2.score -= 4;
          player1Bonus += 10;
          console.log("Player2 double jokers +10");
        } else if (match == matches[0] || match == matches[1]) {
          player1Bonus += 10;
          console.log("Player2 four of a kind +10");
        }

        matches.push(match);
      }
    };

    if (playerToBeat == "player1") {
      if (player1.score >= player2.score) {
        player1.score += 10;
        console.log("player1 did not beat player2's score +10");
      }
    } else {
      if (player2.score >= player1.score) {
        player2.score += 10;
        console.log("player2 did not beat player1's score +10");
      }
    }

    player1.score += player1Bonus;
    player2.score += player2Bonus;

    console.log("\nscores\nplayer 1: " + player1.score);
    console.log("player 2: " + player2.score);
    player1.total += player1.score;
    player2.total += player2.score;

    if (player1.total > 49 || player2.total > 49)
      isGameOver = true;
  };

  var displayScores = function() {
    $('#player1-scores').append("<div class='score'>" + player1.total + "</div>");
    $('#player2-scores').append("<div class='score'>" + player2.total + "</div>");

    if (player1.total > 49 || player2.total > 49) {
      $('.winner').remove();
      if (player1.total > player2.total) {
        $('#screen').append("<span class='winner'>" + player2.name + " wins!</div>");
        $('#player1-scores > div:last-child').css({'color': '#BC4F49'});
      } else if (player1.total < player2.total) {
        $('#screen').append("<span class='winner'>" + player1.name + " wins!</div>");
        $('#player2-scores > div:last-child').css({'color': '#BC4F49'});
      } else {
        $('#screen').append("<span class='winner'>It's a draw.</div>");
        $('#player1-scores > div:last-child').css({'color': '#BC4F49'});
        $('#player2-scores > div:last-child').css({'color': '#BC4F49'});
      }

      $('.shuffle').hide();
      $('.reset').show();
    }

    $('#screen').delay(1800).fadeIn(500);
  };

  var gameInfo = function() {
    console.log("gameStage = " + gameStage);
    console.log("player1.revealed = " + player1.revealed);
    console.log("player2.revealed = " + player2.revealed);
    console.log("player1.isDealer = " + player1.isDealer);
    console.log("player2.isDealer = " + player2.isDealer);
    console.log("activePlayer = " + activePlayer);
    console.log("round = " + round);
    console.log("isCardDrawn = " + isCardDrawn);
    console.log("isCardsDealt = " + isCardsDealt);

    console.log("\nplayer1 hand");
    for (var i = 0; i < 6; i++) {
      console.log(i + " " + player1.hand[i].card.name + " " + player1.hand[i].visible);
    };
    console.log("\nplayer2 hand");
    for (var i = 0; i < 6; i++) {
      console.log(i + " " + player2.hand[i].card.name + " " + player2.hand[i].visible);
    };
    if (topCard)
      console.log("\ntop card", topCard.name);
    console.log("\ndiscard pile", discardPile[discardPile.length - 1].name);
  };

  var debounce = function(fn, threshold, execAsap){
    var timeout;
    return function debounced(){
      var obj = this, args = arguments;
      function delayed(){
        if (!execAsap){
          fn.apply(obj, args);
        }
        timeout = null; 
      };
   
      if (timeout){
        clearTimeout(timeout);
      } else if(execAsap){
        fn.apply(obj, args);
      }

      timeout = setTimeout(delayed, threshold || 100); 
    };
  }

  return {
    start: gameStart,
    selectCard: playerCardClick,
    deal: dealCards,
    display: displayCards,
    reveal: revealCard,
    random: revealRandomCard,
    revealTopCard: revealTopCard,
    drawDiscard: drawDiscard,
    drawDeck: drawDeck,
    discarded: discardCard,
    status: checkStatus,
    info: gameInfo,
    advance: advanceRound,
    reset: gameReset,
    set: gameSetup
  };
}();

$(document).ready(function() {
  if ($(window).height() < 860)
      document.body.style.zoom = "80%";

  $(window).on('resize', function() {
    if ($(this).height() < 860)
      document.body.style.zoom = "80%";
    else
      document.body.style.zoom = "100%";
  });

  var boardHtml = $('#wrapper').html();

  var registerButtons = function() {
    $('.scorecard').on('click', function() {
      $('#screen').fadeIn(300);
    });

    $('.deal').on('click', game.deal);
  };

  var resetScorecard = function() {
    $('#player1-scores, #player2-scores').empty();
    $('.winner').remove();
  };

  var resetBoard = function() {
    $('#wrapper').html(boardHtml);
    $('.reset').fadeOut(300, function() {
      $('.shuffle').show();
    });
    registerButtons();
  };

  $('.settings').on('click', function() {
    if ($('.score-screen').is(':visible')) {
      $('.score-screen').fadeOut(300, function() {
        $('.settings-screen').fadeIn(300);
      });
    } else if ($('.instructions-screen').is(':visible')) {
      $('.instructions-screen').fadeOut(300, function() {
        $('.settings-screen').fadeIn(300);
      });
    }
  });

  $('.rules').on('click', function() {
    if ($('.score-screen').is(':visible')) {
      $('.score-screen').fadeOut(300, function() {
        $('.instructions-screen').fadeIn(300);
      });
    } else if ($('.settings-screen').is(':visible')) {
      $('.settings-screen').fadeOut(300, function() {
        $('.instructions-screen').fadeIn(300);
      });
    } 
  });

  $('.new-game').on('click', function(e) {
    $('.title-screen').fadeOut(300, function() {
      $('.back').hide();
      $('.instructions').css({'height': '512px'});
      $('.start-screen').fadeIn(function() {
        $('#player1-name').focus();
      });
    });
    $(document).on('keyup', function(e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        $('.start').trigger('click');
        $(this).off();
        }
    });
  });

  $('.title-rules').on('click', function(e) {
    $('.title-screen').fadeOut(300, function() {
      $('#modal').removeClass('title-bg');
      $('.instructions-screen').fadeIn();
    });
  });

  $('.back').on('click', function(e) {
    $('.instructions-screen').fadeOut(300, function() {
      $('#modal').addClass('title-bg');
      $('.title-screen').fadeIn();
    });
  });

  $('.start').on('click', function(e) {
    var player1Name = $('#player1-name').val(),
      player2Name = $('#player2-name').val();

    game.set(player1Name, player2Name);

    $('#screen').fadeOut(300, function() {
      $('#modal').removeClass('title-bg');
      $('.start-screen').hide();
      $('.score-card').show();
      $('.shuffle').show();
      $('.settings').show();
      $('.rules').show();
    });
    
    $('#screen').on('click', function(e) {
      if (!e.target.classList.contains("settings") && !e.target.classList.contains("rules")) {
        $('#screen').fadeOut(300, function() {
          $('.start-screen').hide();
          $('.settings-screen').hide();
          $('.instructions-screen').hide();
          $('.score-screen').show();
        });
      }
    });
  });

  $('#image1').on('click', function() {
    $('body').removeClass().addClass('card-back1');
  });

  $('#image2').on('click', function() {
    $('body').removeClass().addClass('card-back2');
  });

  $('#image3').on('click', function() {
    $('body').removeClass().addClass('card-back3');
  });

  $('#image4').on('click', function() {
    $('body').removeClass().addClass('card-back4');
  });

  $('#image5').on('click', function() {
    $('body').removeClass();
  });

  // $('#image6').on('click', function() {
  //   $('.card .side-a').css({
  //     'background': '#498FBC url("img/cardBack6.jpg")',
  //     'background-position': '50% 63%',
  //     'background-size': '150px',
  //     '-webkit-filter': 'grayscale(.1)',
  //     'border-color': '#fff'
  //   });
  // });

  $('.shuffle').on('click', function() {
    resetBoard();

    game.advance();
    game.start();
  });

  $('.reset').on('click', function() {
    resetBoard();
    resetScorecard();

    game.reset();
    game.start();
  });

  registerButtons();
  game.start();
});