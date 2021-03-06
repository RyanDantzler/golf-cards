var game = function() {
  var player1 = {
    name: "Player1",
    score: 0,
    total: 0,
    hand: [],
    isDealer: false,
    revealed: 0
  },
  player2 = {
    name: "Player2",
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
  isCardSelected = false,
  isCardsDealt = false,
  isGameOver = false,
  isDiscardEnabled = true,
  isCardDrawn = false,
  playerToBeat = null;

  var gameStart = function() {
    cards.destroy();
    cards.build();

    if (round !== 1) {
      player1.isDealer = !player1.isDealer;
      player2.isDealer = !player2.isDealer;
    }

    activePlayer = player1.isDealer ? "player2" : "player1";
  };

  var cardClick = function() {
    var $this = $(this),
    position = $this.attr('data-card'),
    playerNum = $this.parents('#player1').attr('id') == "player1" ? 1 : 2,
    player = playerNum == 1 ? player1 : player2,
    $selected,
    $discard = $('.discard'),
    $deck2 = $('.deck-2'),
    $thisLeft = $this.offset().left,
    $thisTop = $this.offset().top,
    leftDiff = 0,
    topDiff = 0;

      if (isCardDrawn) {
        if (position)
          swapCard(position);
        else
          discardCard();

      } else if (isCardSelected) {
        drawDiscard(position);
      } else if (!player.hand[position].visible) {
          revealCard(playerNum, position, $this);
      }
  };

  var displayCards = function() {
    $('.deal').off().addClass('disabled');

    (function dealPlayer1 (i) {
      setTimeout(function () {
          dealtCard = player1.hand[i].card;
           $('#player1 .card-' + i).attr('id', dealtCard.name);
           $('#player1 .card-' + i + ' .side-b').attr('class', 'side-b ' + dealtCard.suit).text(dealtCard.identifier);
           $('#player1 .card-' + i).css({'left': '0', 'top': '0'});
          if (++i < 6) {dealPlayer1(i);}
        }, 300)
      $('#options p').text(cards.count);
    })(0);

    (function dealPlayer2 (i) {
      setTimeout(function () {
      dealtCard = player2.hand[i].card;
      $('#player2 .card-' + i).attr('id', dealtCard.name);
      $('#player2 .card-' + i + ' .side-b').attr('class', 'side-b ' + dealtCard.suit).text(dealtCard.identifier);
      $('#player2 .card-' + i).css({'left': '0', 'top': '0'});
          if (++i < 6) {dealPlayer2(i);}
        }, 300)
      $('#options p').text(cards.count);
    })(0);

    dealtCard = discardPile[0];
    $('.discard').attr('id', dealtCard.name);
    $('.discard .side-b').attr('class', 'side-b ' + dealtCard.suit).text(dealtCard.identifier);
    $('#player1 .card, #player2 .card').addClass('enabled');
    $('.enabled').on('click', game.select);

    $('#options p').text(cards.count);
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

    discardPile[0] = cards.deal();
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

  var drawCard = function() {
    if (gameStage !== "pregame") {
      if (!isCardDrawn){

        topCard = cards.deal();
        console.log("\ntop card", topCard.name);
        isCardDrawn = true;
        displayDraw();

        console.log(activePlayer + " swap or discard the " + topCard.name + ".");
      } else {
        console.log(activePlayer + " must swap or discard the " + topCard.name + " to end their turn.");
      }
    } else {
      console.log("Each player must reveal 2 cards before play begins.");
    }
  };

  var displayDraw = function() {
    var dealtCard = topCard;

    $('.deck').attr('id', dealtCard.name).css({'-webkit-transform': 'rotateY(-.5turn)', 'z-index': 2}).addClass('enabled revealed selected'); 
    $('.deck .side-b').attr('class', 'side-b ' +  dealtCard.suit).text(dealtCard.identifier);

    $('.draw').off().addClass('disabled');
    selectCard('.deck .side-b');
    $('#options p').text(cards.count);
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
              player.hand[pos].card = discardPile[0];
              player.hand[pos].visible = true;
              discardPile[0] = swappedCard;
              console.log(discardPile);
              console.log(swappedCard);
              displaySwap(pos);
              checkStatus();
          } else {
            console.log(activePlayer + " must swap or discard the " + topCard.name + " to end their turn.");
          }
          break;
      }
    } else if (gameStage !== "endgame") {
      $('.draw').off().addClass('disabled');
      selectCard('.discard .side-b');
      $('.discard').addClass('selected');
    } else {
      console.log("You cannot draw from the discard pile on the last turn.")
    }
  };

  var swapCard = function(pos) {
    if (isCardDrawn) {
      var player = activePlayer == "player1" ? player1 : player2,
        swappedCard = player.hand[pos].card;

      if (!player.hand[pos].visible) {
        displayReveal($('#' + activePlayer + ' .card-' + pos));
        player.revealed++;
      }

      player.hand[pos].card = topCard;
      player.hand[pos].visible = true;
      topCard = null;

      displaySwap(pos);

      discardCard(swappedCard);
      isCardDrawn = false;
    } else {
      console.log("Draw a card from the deck or the discard pile.");
    }
  };

  var displaySwap = function(pos) {

      var $discard = $('.discard'),
        $deck2 = $('.deck-2'),
        $target = $('#' + activePlayer + ' .card-' + pos),
        $targetLeft = $target.offset().left,
        $targetTop = $target.offset().top,
        leftDiff = 0,
        topDiff = 0;

      $selected = $('.selected');
      leftDiff = $targetLeft - $selected.offset().left;
      topDiff = $targetTop - $selected.offset().top;
      $('.selected').css({'left': leftDiff, 'top': topDiff});

      leftDiff = $('.discard').offset().left - $targetLeft;
      topDiff = $('.discard').offset().top - $targetTop;
      $target.css({'left': leftDiff, 'top': topDiff});

      setTimeout(function() {
        $('.discard-2').attr('id', $discard.attr('id')).show();
        $('.discard-2 .side-b').attr('class', $discard.children('.side-b').attr('class')).text($discard.children('.side-b').text());
        $('<div class="card discard enabled revealed" id="' + $target.attr('id') + '" style="left: 0px; top: 0px; -webkit-transform: rotateY(-0.5turn); z-index: 2;">' +
          '<div class="side-a"></div>' +
          '<div class="' + $target.children('.side-b').attr('class') + '">' + $target.children('.side-b').text() + '</div>' +
        '</div>').insertAfter($discard);
        $('<div class="' + $target.attr('class') + '" id="' + $selected.attr('id') + '" data-card="' + $target.attr('data-card') + '" style="left: 0px; top: 0px; -webkit-transform: rotateY(-0.5turn); z-index: 2;">' +
          '<div class="side-a"></div>' +
          '<div class="' + $selected.children('.side-b').attr('class') + '">' + $selected.children('.side-b').text() + '</div>' +
        '</div>').insertAfter($target);
        $target.remove();
        $discard.remove();
        $('.deck').remove();
        $deck2.clone().attr('class', 'card deck').insertBefore('.discard');
        $('.discard').on('click', game.drawDiscard);
      }, 1200);
  };

  var discardCard = function(card) {
    discardPile[1] = discardPile[0];

    if (card)
      discardPile[0] = card;
    else {
      discardPile[0] = topCard;
      displayDiscard();
    }

    topCard = null;

    isCardDrawn = false;
    checkStatus();
  };

  var displayDiscard = function() {

    var $discard = $('.discard'),
      $deck2 = $('.deck-2'),
      $discardLeft = $discard.offset().left,
      $discardTop = $discard.offset().top,
      leftDiff = 0,
      topDiff = 0;

    $selected = $('.selected');
    leftDiff = $discardLeft - $selected.offset().left;
    topDiff = $discardTop - $selected.offset().top;
    $('.selected').css({'left': leftDiff, 'top': topDiff, 'z-index': 50});

    setTimeout(function() {
      $('.discard-2').attr('id', $discard.attr('id')).show();
      $('.discard-2 .side-b').attr('class', $discard.children('.side-b').attr('class')).text($discard.children('.side-b').text());
      $('<div class="card discard enabled revealed" id="' + $selected.attr('id') + '" style="left: 0px; top: 0px; -webkit-transform: rotateY(-0.5turn); z-index: 2;">' +
        '<div class="side-a"></div>' +
        '<div class="' + $selected.children('.side-b').attr('class') + '">' + $selected.children('.side-b').text() + '</div>' +
      '</div>').insertAfter($discard);
      $discard.remove();
      $('.deck').remove();
      $deck2.clone().attr('class', 'card deck').insertBefore('.discard');
      $('.discard').on('click', game.drawDiscard);
    }, 1200);
  };

  var selectCard = function(card) {
    isCardSelected = true;
    $(card).css({'border-color': '#FFEC85'});
    $('#' + activePlayer + ' .card').addClass('enabled');
    $('.card').off();
    $('.enabled').on('click', game.select);
  };

  var unselectCard = function() {
    isCardSelected = false;
    $(card).css({'border-color': ''});
  };

  var checkStatus = function($this) {
    if (gameStage == "pregame") {
      if ($this.siblings().hasClass('revealed')) {
        $this.siblings().addBack().removeClass('enabled');
      }
      if (isCardsDealt && !$('#player1 .card, #player2 .card').hasClass('enabled')) {
        gameStage = "midgame";
        $('.discard').css({'-webkit-transform': 'rotateY(-.5turn)', 'z-index': 2}).addClass('enabled revealed');
        $('.draw').on('click', game.draw).removeClass('disabled');
        $('.discard').on('click', game.drawDiscard);
      }

      if (isCardsDealt && player1.revealed > 1 && player2.revealed > 1) {
        gameStage = "midgame";
        $('#turn-indicator').removeClass('player1 player2').addClass(activePlayer).show();
      }
    } else if (gameStage == "midgame") {

      if (player1.revealed == 6 || player2.revealed == 6) {
        gameStage = "endgame";
        isDiscardEnabled = false;
        playerToBeat = activePlayer;
        console.log("endgame");
      }
      isCardSelected = false;
      $('.enabled').removeClass('enabled');
      activePlayer = activePlayer == "player1" ? "player2" : "player1";
      $('#turn-indicator').removeClass('player1 player2').addClass(activePlayer);
      console.log(activePlayer + "'s turn.");
      $('.draw').on('click', game.draw).removeClass('disabled');
    } else {
      console.log("The game is over.");
      revealHidden();
      calcScores();
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
    player1 = {
      name: "Player1",
      score: 0,
      total: 0,
      hand: [],
      isDealer: false,
      revealed: 0
    };
    player2 = {
      name: "Player2",
      score: 0,
      total: 0,
      hand: [],
      isDealer: true,
      revealed: 0
    };
    discardPile = [];
    topCard = null;
    round = 1;
    activePlayer = "";
    gameStage = "pregame";
    isCardSelected = false;
    isCardsDealt = false;
    isGameOver = false;
    isDiscardEnabled = true;
    isCardDrawn = false;
    playerToBeat = null;

    $('.deal').on('click', game.deal).removeClass('disabled');
    gameStart();
    resetBoard();
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
    isCardSelected = false;
    isCardsDealt = false;
    isGameOver = false;
    isDiscardEnabled = true;
    isCardDrawn = false;
    playerToBeat = null;

    gameStart();
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

    $('#player1-scores').append("<div class='score'>" + player1.total + "</div>");
    $('#player2-scores').append("<div class='score'>" + player2.total + "</div>");

    if (player1.total > 49 || player2.total > 49) {
      $('.winner').remove();
      if (player1.total > player2.total) {
        $('#scores').append("<span class='winner'>" + player2.name + " wins.</div>");
        $('#player1-scores > div:last-child').css({'color': '#BC4F49'});
      } else if (player1.total < player2.total) {
        $('#scores').append("<span class='winner'>" + player1.name + " wins.</div>");
        $('#player2-scores > div:last-child').css({'color': '#BC4F49'});
      } else {
        $('#scores').append("<span class='winner'>" + player1.name + " and " + player2.name + " tied.</div>");
        $('#player1-scores > div:last-child').css({'color': '#BC4F49'});
        $('#player2-scores > div:last-child').css({'color': '#BC4F49'});
      }
    }

    $('#screen').delay(1600).fadeIn(500);
  };

  var gameInfo = function() {
    console.log("gameStage = " + gameStage);
    console.log("player1.revealed = " + player1.revealed);
    console.log("player2.revealed = " + player2.revealed);
    console.log("player1.isDealer = " + player1.isDealer);
    console.log("player2.isDealer = " + player2.isDealer);
    console.log("activePlayer = " + activePlayer);
    console.log("round = " + round);
    console.log("isCardSelected = " + isCardSelected);
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
    console.log("\ndiscard pile", discardPile[0].name);
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
    select: cardClick,
    deal: dealCards,
    display: displayCards,
    reveal: revealCard,
    random: revealRandomCard,
    draw: drawCard,
    drawDiscard: drawDiscard,
    swap: swapCard,
    discarded: discardCard,
    status: checkStatus,
    info: gameInfo,
    advance: advanceRound,
    reset: gameReset,
    set: gameSetup
  };
}();

$(document).ready(function() {
  var boardClones = [],
  roundCounter = 0;

  if ($(window).height() < 860)
      document.body.style.zoom = "80%";

  $(window).on('resize', function() {
    if ($(this).height() < 860)
      document.body.style.zoom = "80%";
    else
      document.body.style.zoom = "100%";
  });

  $('.reset').hide();
  $('.settings').hide();
  $('.rules').hide();

  for (var i = 0; i < 20; i++) {
    boardClones[i] = $('#wrapper').clone();
  };
  
  game.start();

  $('.scorecard').on('click', function() {
    $('#screen').fadeIn(300);
    $('.board').css({'z-index': '-1'});
  });

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
      $('.start-screen').fadeIn();
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
      $('.reset').show();
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
          $('.board').css({'z-index': ''});
        });
      }
    });
  });

  // $('#image1').on('click', function() {
  //   $('.side-a').css({
  //     'background': '#498FBC url("img/cardBack1.jpg")',
  //     'background-position': '50% 14%',
  //     'background-size': '200px',
  //     '-webkit-filter': 'grayscale(.3)',
  //     'border-color': '#a32828'
  //   });
  // });

  // $('#image2').on('click', function() {
  //   $('.side-a').css({
  //     'background': '#498FBC url("img/cardBack2.jpg")',
  //     'background-position': '50% 39%',
  //     'background-size': '200px',
  //     '-webkit-filter': 'grayscale(.1)',
  //     'border-color': '#7C7C7C'
  //   });
  // });

  // $('#image3').on('click', function() {
  //   $('.side-a').css({
  //     'background': '#498FBC url("img/cardBack3.jpg")',
  //     'background-position': '50% 12%',
  //     'background-size': '230px',
  //     '-webkit-filter': 'grayscale(.2)',
  //     'border-color': '#308452'
  //   });
  // });

  // $('#image4').on('click', function() {
  //   $('.card .side-a').css({
  //     'background': '#498FBC url("img/cardBack4.jpg")',
  //     'background-position': '50% 63%',
  //     'background-size': '240px',
  //     '-webkit-filter': 'grayscale(.1)',
  //     'border-color': '#141414'
  //   });
  // });

  // $('#image5').on('click', function() {
  //   $('.card .side-a').css({
  //     'background': '#498FBC url("img/cardBack5.jpg")',
  //     'background-position': '50% 21%',
  //     'background-size': '155px',
  //     '-webkit-filter': 'grayscale(.1)',
  //     'border-color': '#494237'
  //   });
  // });

  // $('#image6').on('click', function() {
  //   $('.card .side-a').css({
  //     'background': '#498FBC url("img/cardBack6.jpg")',
  //     'background-position': '50% 63%',
  //     'background-size': '150px',
  //     '-webkit-filter': 'grayscale(.1)',
  //     'border-color': '#fff'
  //   });
  // });

  $('.deal').on('click', game.deal);

  $('.reset').on('click', function() {
    $('#wrapper').replaceWith(boardClones[roundCounter]);
    game.advance();
    $('.scorecard').on('click', function() {
      $('#screen').fadeIn(300);
    });

    $('.deal').on('click', game.deal);
    roundCounter++;
  });
});
