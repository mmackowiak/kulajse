(function(global) {

  "use strict";

  var fabric  = global.fabric || (global.fabric = { });

  if (fabric.Ball) {
    fabric.warn('fabric.Circle is already defined.');
    return;
  }

  fabric.Ball = fabric.util.createClass(fabric.Image, {
    type: 'ball',
    moveResistance: 0.18,
    fallSpeed: 1/60,
    initialize: function(options) {
      options = options || { };

      this.set('speed',options.speed || 0);
      this.move_angle = 0;
      this.speed = 0;
      this.setMoveAngle(options.move_angle || 0);
      this.setSpeed(options.speed || 0);
      this.hasControls = false;
      this.selectable = false;
      this.originX = 'center';
      this.originY = 'center';
      //calculating velocity vector:
      
      this.callSuper('initialize', options);
    },
    setMoveAngle: function(angle) {
      this.move_angle = angle;
      this.move_angle_rad = this.move_angle*Math.PI/180;

      this.fillVector();
    },
    setSpeed: function(speed) {
      this.speed = speed;
      this.fillVector();
    },
    fillVector: function() {
      var vel_x = this.speed*Math.cos(this.move_angle_rad);
      var vel_y = this.speed*Math.sin(this.move_angle_rad);
      
      this.velocity = [vel_x,vel_y];
    },
    setVelocity: function(vector) {
      var length = Math.sqrt(Math.pow(vector[0],2)+Math.pow(vector[1],2));
      var angle = 0;
      if (length !== 0) {
        if (vector[0]<0 && vector[1]<0)
          angle = Math.asin(Math.abs(vector[1])/length)+Math.PI;
        else if (vector[0]<0)
          angle = Math.acos(vector[0]/length);
        else
          angle = Math.asin(vector[1]/length);
      }
      this.velocity = vector;
      this.speed = length;
      this.move_angle_rad = angle;
      this.move_angle = angle*180/Math.PI;
    },
    move: function(applyResistance) {
      // console.log(this.speed, this.move_angle,this.velocity);
      if (this.speed <= 0)
        return;
      applyResistance = applyResistance || false;
      this.left += this.velocity[0];
      this.top += this.velocity[1];
      if (applyResistance) {
        var new_v = this.speed-this.moveResistance;
        if (new_v<=0) {
          this.setVelocity([0,0]);
        }
        else {
          this.setSpeed(new_v);
        }
      }
    },
    checkCollision: function(ball) {
      var distance = Math.sqrt(Math.pow(ball.left-this.left,2)+Math.pow(ball.top-this.top,2));
      if (distance<=this.radius+ball.radius)
          return true;
      return false;
    },
    rotate:function(origin,angle) {
      var center = new fabric.Point(this.left,this.top);
      var rotated = fabric.util.rotatePoint(center,origin,angle*Math.PI/180);
      this.left = rotated.x;
      this.top = rotated.y;
    },
    fall: function() {
      this.fallPerKlatka = this.fallPerKlatka || this.fallSpeed*this.radius;
      if (this.radius <= this.fallPerKlatka || this.opacity <= this.fallSpeed) {
        this.opacity = 0;
        this.scale = 0;
        return false;
      }
      this.opacity -= this.fallSpeed;
      this.scale -= this.fallPerKlatka;
      this.setSpeed(0);
    }
  });

  fabric.Ball.fromURL = function(url, callback, imgOptions) {
    fabric.util.loadImage(url, function(img) {
      callback(new fabric.Ball(img, imgOptions));
    });
  };

})(this);