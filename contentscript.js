$(document).ready(function() {
	var canvas, ctx, width, height, rectangle, ball_x_speed, ball_y_speed = false;

	function init() {
		// Overlay canvas.
		canvas = document.createElement('canvas');
		document.body.appendChild(canvas);

		canvas.style.position = 'absolute';
		canvas.style.left = "0px";
		canvas.style.top = "0px";
		canvas.style.zIndex = "99999999";
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		document.body.appendChild(canvas);

		ctx = canvas.getContext('2d');
		width = canvas.width;
		height = canvas.height;
		rectangle = {
			x: width / 2 - 50,
			y: height / 2 - 25,
			w: 100,
			h: 50
		}

		drawCanvas();
	}

	function drawCanvas() {
		ctx.clearRect(0, 0, width, height);
	 	ctx.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
	}


	var pageElements = function() {
			var elements = [];

			return function(force) {
				force = typeof a !== 'undefined' ? force : false;

				if(elements.length == 0 || force) {
					element_string = "a, p, h1, h2, h3, h4, h5, h6, hr, li";

					$(element_string).each(function(i, e) {
						$(e).css("background-color", "gray")
					});

					elements = $(element_string).map(function(i, e) {
						return {
							offset: {
								x: $(e).offset().left,
								y: $(e).offset().top
							},
							width: $(e).width(),
							height: $(e).height()
						}
					});
				}

				return elements;
			}
		}();

	var overlaps = (function() {
		function getPositions(elem) {
			var pos, width, height;
			pos = elem.offset;
			width = elem.width;
			height = elem.height;
			return [[pos.x, pos.x + width], [pos.y, pos.y + height]];
		}

		function comparePositions(p1, p2) {
			var r1, r2;
			r1 = p1[0] < p2[0] ? p1 : p2;
			r2 = p1[0] < p2[0] ? p2 : p1;
			return r1[1] > r2[0] || r1[0] === r2[0];
		}

		return function(a, b) {
			var pos1 = getPositions(a),
				pos2 = getPositions(b);
			return {
				collide: (comparePositions(pos1[0], pos2[0]) && comparePositions(pos1[1], pos2[1]))
			};
		};
	})();

	setInterval(function() {
		var check_colisions = function() {

			// check for colisions
			var fakeRectangle = {
				offset: { x: rectangle.x , y: rectangle.y },
				width: rectangle.width,
				height: rectangle.height
			}

			fakeRectangle.offset.y += ball_y_speed;
			

			for(i = 0; i < pageElements().length; i++) {
				console.log(pageElements());
				if(overlaps(pageElements()[i], fakeRectangle).collide) {
					console.log("COLLIDE Y");
					collision_y = true;
					fakeRectangle.y -= ball_y_speed;
					ball_y_speed = 0;
				}
			}

			fakeRectangle.offset.x += ball_x_speed;

			for(i = 0; i < pageElements().length; i++) {
				console.log(pageElements());
				if(overlaps(pageElements()[i], fakeRectangle).collide) {
					console.log("COLLIDE X");
					collision_x = true;
					fakeRectangle.offset.x -= ball_x_speed;
					ball_x_speed = 0;
				}
			}
		}

		var draw_new_position = function() {
			// set the new position applying the movement
			rectangle.x = oldX + 10;
			rectangle.y = oldY + ball_y_speed;

			drawCanvas();
		}

		// set collision as false
		collision_x = false;
		collision_y = false;

		// get previous frame's position
		var oldX = rectangle.x
		var oldY = rectangle.y;

		// check for collisions
		check_colisions();

		// draw the new position
		draw_new_position();

		// things that happen when we fall down or are at the ground
		if(collision_y) {
			// friction
			ball_x_speed *= 0.995;
		}

		// gravity is your f(r)iend
		ball_y_speed += 1.5;

		if(ball_y_speed >= 9.8) {
			ball_y_speed = 9.8;
		}

	}, 1000/60);

	
	init();
});