"use strict";

function Game() {
	var self = this;

	self.animationID = null;
	self.colors = [
		{ name: 'red', x: 'left', y: 'top' },
		{ name: 'violet', x: 'right', y: 'top' },
		{ name: 'yellow', x: 'left', y: 'bottom' },
		{ name: 'blue', x: 'right', y: 'bottom' }
	];
	self.ring = [];
	self.rounds = 5;
	self.players = [];
	self.currentRound = -1;
	self.currentTurn = -1;
	self.turnStarted = false;
}

Game.prototype.init = function () {
	var self = this;
	
	self.canvas = new fabric.Canvas('game', { selection: false });

	radio('turn:started').subscribe(function () {
		self.turnStarted = true;
	});
};

Game.prototype.initGame = function (players) {
	var self = this,
		corner;

	self.colors.forEach(function (color, i) {
		corner = new Corner(color);
		
		if (typeof players[i] !== 'undefined') {
			self.players.push(new Player(players[i], corner));
		}
	});

	self.setupRing();
	
	self.drawing();

	setTimeout(function() {
		self.startGame();
	}, 1000);
};

Game.prototype.startGame = function () {
	var self = this;

	self.players.forEach(function (player) {
		player.setScore();
	});
	
	self.currentRound = -1;
	self.newRound();
};

Game.prototype.newRound = function () {
	var self = this;

	self.currentTurn = -1;
	self.currentRound += 1;
	console.log('r', self.currentRound);
	if (self.currentRound < self.rounds) {
		self.newTurn();
	} else {
		self.gameEnded();
	}
};

Game.prototype.newTurn = function () {
	var self = this;
	
	self.currentTurn += 1;
	console.log('-t', self.currentTurn);
	self.players[self.currentTurn].startTurn();
};

Game.prototype.hasTurnEnded = function () {
	var self = this,
		stopped = true;

	if (self.currentRound < 0) {
		return;
	}

	self.players[self.currentTurn].balls.forEach(function (ball, i) {
		stopped = stopped && Math.round(ball.speed, 1) === 0;
	});

	if (stopped) {
		self.turnEnded();
	}
};

Game.prototype.turnEnded = function () {
	var self = this;

	self.turnStarted = false;

	self.sumPoints();
	
	if (self.currentTurn < self.players.length - 1) {
		self.newTurn();
	} else {
		self.newRound();
	}
};

Game.prototype.gameEnded = function () {
	var self = this;

	self.stopDrawing();

	$('#layer').addClass('show');
};

Game.prototype.setupRing = function () {
	var self = this;

	fabric.Ring.fromURL('images/duzy-okrag.png', function(oImg) {			
	  	self.canvas.add(oImg);
	  	oImg.moveTo(2);
	  	oImg.center();
	  	oImg.set('points', 25);
	  	oImg.set('inner_radius', 160);
	  	oImg.set('outer_radius', 300);
	  	self.ring.push(oImg);
	});

	fabric.Ring.fromURL('images/maly-okrag.png', function(oImg) {			
	  	self.canvas.add(oImg);
	  	oImg.moveTo(3);
	  	oImg.center();
	  	oImg.set('points', 50);
	  	oImg.set('inner_radius', 100);
	  	oImg.set('outer_radius', 160);
	  	self.ring.push(oImg);
	});

	fabric.Ring.fromURL('images/dziura.png', function(oImg) {			
	  	self.canvas.add(oImg);
	  	oImg.moveTo(4);
	  	oImg.center();
	  	oImg.set('points', -1);
	  	oImg.set('inner_radius', 0);
	  	oImg.set('outer_radius', 70);
	  	self.ring.push(oImg);
	});
};

Game.prototype.sumPoints = function () {
	var self = this;

	self.players.forEach(function (player) {
		player.score = 0;

		player.balls.forEach(function (ball) {
			self.ring.forEach(function (ring) {
				if (ring.containsBall(ball) && ring.points > 0) {
					player.score += ring.points;
				}
			})
		});

		player.setScore();
	});
};

Game.prototype.drawing = function () {
	var self = this;

	var center = self.canvas.getCenter();
	var centerP = new fabric.Point(center.left,center.top);

	self.animationID = requestAnimationFrame(function () {
		self.drawing();
	});

	self.players.forEach(function (player1) {
		player1.balls.forEach(function (ball1) {
			self.players.forEach(function (player2) {
				player2.balls.forEach(function (ball2) {
					if(ball1 !== ball2) {
						if (ball1.checkCollision(ball2)) {
							self.solveCollision(ball1, ball2);
						}
					}
				});
			});
		});
	});

	self.players.forEach(function (player) {
		player.balls.forEach(function (ball,idx) {
			ball.move(true);

			self.ring.forEach(function (ring) {
				if (ring.containsBall(ball)) {
					ball.rotate(centerP, 0.2);

					if (ring.points < 0) {
						if (ball.fall()===false) {
							self.canvas.remove(ball);
							player.balls.splice(idx,1);
						}
					}
				}	
			});
		});
	});

	self.ring.forEach(function (ring, i) {
		ring.move();
	});

	if (self.turnStarted) {
		self.hasTurnEnded();
	}
	
	self.canvas.renderAll();
};

Game.prototype.stopDrawing = function () {
	var self = this;

	cancelAnimationFrame(self.animationID);
};

Game.prototype.solveCollision = function (ball1, ball2) {
	var distance = Math.sqrt(Math.pow(ball1.left-ball2.left,2)+Math.pow(ball1.top-ball2.top,2));
	var contact_angle = Math.asin((ball1.top-ball2.top)/(ball1.radius+ball2.radius));
	console.log('solve collision '+distance);
	var moveBy = (ball1.radius+ball2.radius-distance+1)/2;
	console.log(ball1.checkCollision(ball2));
	if (moveBy > 0) {
		var moveH = Math.abs(Math.cos(contact_angle)*moveBy);
		var moveV = Math.abs(Math.sin(contact_angle)*moveBy);
		console.log(moveH+' '+moveV);
		if (ball1.top<ball2.top) {
			if (ball2.left< ball1.left) {
				ball1.top = ball1.top-moveV;
				ball1.left = ball1.left+moveH;
				ball2.top = ball2.top+moveV;
				ball2.left = ball2.left-moveH;
			}
			else {
				ball1.top = ball1.top-moveV;
				ball1.left = ball1.left-moveH;
				ball2.top = ball2.top+moveV;
				ball2.left = ball2.left+moveH;
			}
		}
		else {
			if (ball2.left< ball1.left) {
				ball1.top = ball1.top+moveV;
				ball1.left = ball1.left+moveH;
				ball2.top = ball2.top-moveV;
				ball2.left = ball2.left-moveH;
			}
			else {
				ball1.top = ball1.top+moveV;
				ball1.left = ball1.left-moveH;
				ball2.top = ball2.top-moveV;
				ball2.left = ball2.left+moveH;	
			}	
		}
		
	}
	console.log(ball1.checkCollision(ball2));
	console.log('after move '+Math.sqrt(Math.pow(ball1.left-ball2.left,2)+Math.pow(ball1.top-ball2.top,2)));

	var ball1_velocity_x = ball2.speed*Math.cos(ball2.move_angle_rad-contact_angle)*Math.cos(contact_angle)+ball1.speed*Math.sin(ball1.move_angle_rad-contact_angle)*Math.cos(contact_angle+Math.PI/2),
		ball1_velocity_y = ball2.speed*Math.cos(ball2.move_angle_rad-contact_angle)*Math.sin(contact_angle)+ball1.speed*Math.sin(ball1.move_angle_rad-contact_angle)*Math.sin(contact_angle+Math.PI/2),
		ball2_velocity_x = ball1.speed*Math.cos(ball1.move_angle_rad-contact_angle)*Math.cos(contact_angle)+ball2.speed*Math.sin(ball2.move_angle_rad-contact_angle)*Math.cos(contact_angle+Math.PI/2),
		ball2_velocity_y = ball1.speed*Math.cos(ball1.move_angle_rad-contact_angle)*Math.sin(contact_angle)+ball2.speed*Math.sin(ball2.move_angle_rad-contact_angle)*Math.sin(contact_angle+Math.PI/2);

	ball1.setVelocity([ball1_velocity_x,ball1_velocity_y]);
	ball2.setVelocity([ball2_velocity_x,ball2_velocity_y]);
};