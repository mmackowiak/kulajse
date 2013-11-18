"use strict";

function Player(nickname, corner) {
	var self = this;

	self.nickname = nickname;
	self.corner = corner;
	self.balls = [];
	self.score = 0;

	return self;
}

Player.prototype.startTurn = function (data) {
	var self = this;

	fabric.Ball.fromURL('images/' + self.corner.color.name + '-ball.png', function(ball) {
		ball.set({ 
			radius: 20, 
			speed: 0 
		});

		ball.setShadow({ 
			color: 'rgba(0, 0, 0, 0.5)',
		    blur: 10,    
		    offsetX: 5,
		    offsetY: 5
		});

	  	game.canvas.add(ball);
	  	self.balls.push(ball);

		self.corner.placeBall(ball);
		self.corner.showControls();
	});
};

Player.prototype.setScore = function () {
	var self = this,
		score = $('.gamer.' + self.corner.color.x + '.' + self.corner.color.y);

	score.children('h2').text(self.nickname);
	score.children('h3').text(self.score + 'pkt.');
};