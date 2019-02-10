var cards = function(){
  var _count = 0,
  card = {},
  joker = {
    name: "joker",
    rank: "joker",
    points: -2,
    identifier: "JK",
    suit: ""
  },
  deck = [],
  suits = ["spades", 
           "hearts", 
           "clubs", 
           "diamonds"],
  ranks = [
            { rank: "ace",
              points: 1,
              identifier: "A"},
            { rank: "two",
              points: 2,
              identifier: "2"},
            { rank: "three",
              points: 3,
              identifier: "3"},
            { rank: "four",
              points: 4,
              identifier: "4"},
            { rank: "five",
              points: 5,
              identifier: "5"},
            { rank: "six",
              points: 6,
              identifier: "6"},
            { rank: "seven",
              points: 7,
              identifier: "7"},
            { rank: "eight",
              points: 8,
              identifier: "8"},
            { rank: "nine",
              points: 9,
              identifier: "9"},
            { rank: "ten",
              points: 10,
              identifier: "10"},
            { rank: "jack",
              points: 10,
              identifier: "J"},
            { rank: "queen",
              points: 10,
              identifier: "Q"},
            { rank: "king",
              points: 0,
              identifier: "K"}
              ];

  var buildDeck = function() {
    deck = [];
    for (var r = ranks.length - 1; r >= 0; r--) {
      for (var s = suits.length - 1; s >= 0; s--) {
        card = {
          name: ranks[r].rank + "-" + suits[s],
          rank: ranks[r].rank, 
          suit: suits[s], 
          points: ranks[r].points, 
          identifier: ranks[r].identifier
        };
        deck.push(card);
        _count++;
      };
    };
    deck.push(joker);
    _count++;
    deck.push(joker);
    _count++;
  };

  var shuffleDeck = function() {
    for (var i = 1; i <= 1000; i++) {
      var p1 = Math.floor((Math.random()*deck.length)+0),
      p2 = Math.floor((Math.random()*deck.length)+0),
      c1 = deck[p1];
      deck[p1] = deck[p2];
      deck[p2] = c1;
    };
  };

  var dealDeck = function() {
    if (deck.length > 0) {
      var c = Math.floor((Math.random()*deck.length)+0);
      card = deck[c];
      deck.splice(c, 1);
      _count--;
    } else {
      console.log("There are no cards left to deal.")
    }

    return card;
  };

  var destroyDeck = function() {
    deck = [];
    _count = 0;
  };

  var getDeck = function() {
    for (var i = deck.length - 1; i >= 0; i--) {
      if (deck[i].rank !== "joker") {
        console.log(deck[i].rank + " of " + deck[i].suit);
      } else {
        console.log(deck[i].rank);
      }
    };
  };

  var getCount = function() {
    return _count;
  };

  return {
    build: buildDeck,
    shuffle: shuffleDeck,
    deal: dealDeck,
    destroy: destroyDeck,
    deck: getDeck,
    count: getCount
  };
}();