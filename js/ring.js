(function(global) {

	"use strict";

	var fabric  = global.fabric || (global.fabric = { });

	if (fabric.Ring) {
		fabric.warn('fabric.Ring is already defined.');
		return;
	}

	fabric.Ring = fabric.util.createClass(fabric.Image, {
		type: 'ring',
		rotateSpeed: 0.2,
		rotateDirection: 1,
		initialize: function(element, options) {
			options = options || { };

			this.set('inner_radius',options.inner_radius || 0);
			this.set('outer_radius',options.outer_radius || 0);
			this.set('points',options.points || -1);
			this.callSuper('initialize', element, options);
			this.originX = 'center';
			this.originY = 'center';
			this.hasControls = false;
			this.selectable = false;
		},
		containsBall: function(ball) {
			var distance = Math.sqrt(Math.pow(Math.abs(ball.left - this.left), 2) + Math.pow(Math.abs(ball.top - this.top), 2));
			
			if (distance > this.inner_radius && distance < this.outer_radius)
				return true;
			return false;
		},
		move: function() {
			this.angle+=this.rotateDirection*this.rotateSpeed;
		}
	});

	fabric.Ring.fromURL = function(url, callback, imgOptions) {
		fabric.util.loadImage(url, function(img) {
		callback(new fabric.Ring(img, imgOptions));
	});
  };
})(this);
