"use strict";

function Corner(color) {
	var self = this;

	self.color = color;
	self.maxSpeed = 24;
	self.maxDistance = 400;
	self.size = {
		width: 394,
		height: 344
	};
	self.position = {
		x: self.color.x === 'left' ? 0 : game.canvas.width - self.size.width, 
		y: self.color.y === 'top' ? 0 : game.canvas.height - self.size.height
	};
	self.ballCenter = {
		x: self.position.x + (self.color.x === 'left' ? 70 : -70 + self.size.width),
		y: self.position.y + (self.color.y === 'top' ? 70 : -70 + self.size.height)
	};
	self.activeBall = null;
	self.controlLine = null;
	self.controlCircle = null;

	self.placeCorner();
}

Corner.prototype.placeCorner = function () {
	var self = this;

	fabric.Image.fromURL('images/corners/' + self.color.name + '.png', function(image) {
		image.set({
			left: self.position.x, 
			top: self.position.y,
			hasControls: false,
			selectable: false
		});

    	game.canvas.add(image);
    	image.moveTo(10);
	});
};

Corner.prototype.placeBall = function (ball) {
	var self = this;

	self.activeBall = ball;

	self.activeBall.left = self.ballCenter.x;
	self.activeBall.top = self.ballCenter.y;
	self.activeBall.moveTo(20);
};

Corner.prototype.showControls = function () {
	var self = this;
		
	self.controlLine = new fabric.Line([
		self.ballCenter.x,
		self.ballCenter.y,
		self.ballCenter.x,
		self.ballCenter.y
	], {
     	fill: '#00ffe4',
		stroke: '#00ffe4',
		strokeWidth: 2,
		hasControls: false,
		selectable: false,
		originX: 'center',
		originY: 'center'
    });

    self.controlCircle = new fabric.Circle({
    	radius: 3, 
    	fill: '#00ffe4', 
    	left: self.ballCenter.x,
		top: self.ballCenter.y
    });

    game.canvas.add(self.controlLine);
    game.canvas.add(self.controlCircle);

    game.canvas.on('mouse:move', function (options) {
    	var event = options.e,
    		x2 = self.controlLine.get('x2'),
			y2 = self.controlLine.get('y2'),
			dx = event.x - self.ballCenter.x,
			dy = event.y - self.ballCenter.y,
			angle = Math.atan2(dy, dx),
			distance = Math.sqrt(Math.abs(dx * dx) + Math.abs(dy * dy)),
			newX = distance < self.maxDistance ? event.x : self.ballCenter.x + Math.cos(angle) * self.maxDistance,
			newY = distance < self.maxDistance ? event.y : self.ballCenter.y + Math.sin(angle) * self.maxDistance;
		
    	self.controlLine.set({
    		'x2': newX, 
    		'y2': newY
    	});

    	self.controlCircle.set({
    		'left': newX - self.controlCircle.radius, 
    		'top': newY - self.controlCircle.radius
    	});
    });

    game.canvas.on('mouse:down', function (options) {
    	self.shootBall(options.e);
    });
};

Corner.prototype.shootBall = function (event) {
	var self = this,
		x2 = self.controlLine.get('x2'),
		y2 = self.controlLine.get('y2'),
		dx = x2 - self.ballCenter.x,
		dy = y2 - self.ballCenter.y,
		angle = Math.atan2(dy, dx) * 180 / Math.PI,
		distance = Math.sqrt(Math.abs(dx * dx) + Math.abs(dy * dy));
	
	game.canvas.remove(self.controlLine);
	game.canvas.remove(self.controlCircle);
	game.canvas.off('mouse:move');
	game.canvas.off('mouse:down');

	self.activeBall.setSpeed(distance/self.maxDistance * self.maxSpeed);
	self.activeBall.setMoveAngle(angle);
	self.activeBall = null;

	radio('turn:started').broadcast();
};