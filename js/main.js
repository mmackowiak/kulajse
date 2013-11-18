"use strict";

var game = new Game();

$(function () {
	var w = $(window),
		d = $(document),
		toInt = function (x) {
			return parseInt(x, 10);
		};
	
	game.init();

	game.initGame(['Slawek', 'Kamil', 'Sebastian', 'Marcin']);
});