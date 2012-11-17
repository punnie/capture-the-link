$(document).ready(function() {
	var canvas, ctx, width, height, rectangle;
	var grappling = false;
	var ball_x_speed = 0;
	var ball_y_speed = 0;

	var forceElements = false;
	var ground;

	var images;
	var frame = -1;
	var dir_left = false;
	var dateLast = Date.now();
	var moving = false;

	function init() {
		// Overlay canvas.
		canvas = document.createElement('canvas');
		document.body.appendChild(canvas);

		canvas.style.position = 'absolute';
		canvas.style.left = "0px";
		canvas.style.top = "0px";
		canvas.style.zIndex = "99999999";
		canvas.style.width = document.width;
		canvas.style.height = document.height;
		canvas.width = document.width;
		canvas.height = document.height;
		document.body.appendChild(canvas);

		ctx = canvas.getContext('2d');
		width = canvas.width;
		height = canvas.height;
		rectangle = {
			x: 300,
			y: 200,
			w: 100,
			h: 50
		}

		// load all game images here
    	images = [
    		loadImage(chrome.extension.getURL('images/1.png')),
			loadImage(chrome.extension.getURL('images/2.png')),
			loadImage(chrome.extension.getURL('images/3.png')),
			loadImage(chrome.extension.getURL('images/4.png')),
			loadImage(chrome.extension.getURL('images/5.png')),
			loadImage(chrome.extension.getURL('images/1_2.png')),
			loadImage(chrome.extension.getURL('images/2_2.png')),
			loadImage(chrome.extension.getURL('images/3_2.png')),
			loadImage(chrome.extension.getURL('images/4_2.png')),
			loadImage(chrome.extension.getURL('images/5_2.png'))
		];

		drawCanvas();


	}

	function nextFrame(frame) {
		if(ball_y_speed >= 0) {
			if(moving) {
				dateNow = Date.now();
				if(dateNow-dateLast > 100) {
					dateLast = dateNow;
					frame++;
				}

				if(frame < 0)
					return 0;
				else if(frame < 3)
					return frame;
				else
					return 0;
			}
			return 3; // Stopped.
		}
		else {
			return 4; // Jumping.
		}
	}

	function drawCanvas() {
		ctx.clearRect(0, 0, width, height);

		frame = nextFrame(frame);


	 	ctx.drawImage(images[dir_left ? frame+5 : frame], rectangle.x, rectangle.y);
	}

	// [name] image file name
	function loadImage(name) {
		// create new image object
		var image = new Image();
		// load image
		image.src = name;
		// return image object
		return image;
	}

	var pageElements = function() {
			var elements = [];

			return function(force) {
				force = typeof a !== 'undefined' ? force : false;

				if(elements.length == 0 || force || forceElements) {
					element_string = "a, p, h1, h2, h3, h4, h5, h6, hr, li";

					$(element_string).each(function(i, e) {
						$(e).css("background-color", "gray")
					});

					elements = $(element_string).map(function(i, e) {
						return {
							element: e,
							offset: {
								x: $(e).offset().left,
								y: $(e).offset().top
							},
							width: $(e).width(),
							height: $(e).height()
						}
					});

					// We make this true after the animations on the explode.
					// And make it false again, in order to avoid more calls until the next explode.
					forceElements = false;
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

			// We make ground undefined to make sure that we don't explode it and the user is no longer there.
			ground = [];

			for(i = 0; i < pageElements().length; i++) {
				if(overlaps(pageElements()[i], fakeRectangle).collide) {
					collision_y = true;
					ground.push(pageElements()[i].element);
				}
			}

			// In case of a vertical collision, we make sure the y is set back to its original value.
			// We do not want to mix vertical and horizontal collisions.
			if(collision_y) {
				fakeRectangle.offset.y -= ball_y_speed;
				ball_y_speed = 0;
			}

			fakeRectangle.offset.x += ball_x_speed;

			for(i = 0; i < pageElements().length; i++) {
				if(overlaps(pageElements()[i], fakeRectangle).collide) {
					collision_x = true;
					fakeRectangle.offset.x -= ball_x_speed;
					ball_x_speed = 0;
				}
			}
		}

		var draw_new_position = function() {
			// set the new position applying the movement
			rectangle.x = oldX + ball_x_speed;
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

	function keyDown(e) {
		switch(e.keyCode) {
		// left arrow
		case 65:
			moving = true;
			dir_left = true;
			ball_x_speed = -4.0;
			break;
		// right arrow
		case 68:
			moving = true;
			dir_left = false;
			ball_x_speed = 4.0;
			break;
		// up arrow
		case 87:
			if(collision_y) {
				ball_y_speed -= 21.0;
			}
			break;
		// down arrow
		case 83:
			// nothing
			break;
		// h (grapling hook)
		case 69:
			explode(ground);
			break;
		case 72:
			if(!grappling) {
				console.log("GRAPLING HOOK!");
			}

			grappling = true;
			break;
			// default case
		default:
			console.log("keyDown:"+e.keyCode);
		}
	};

	function keyUp(e) {
		switch(e.keyCode) {
		// left arrow
		case 65:
		case 68:
			moving = false;
			ball_x_speed = 0;
			break;
		default:
			console.log("keyUp:"+e.keyCode);
		}
	};

	function explode(grounds) {
		var length = grounds.length;
		var once = true;
		for(var j = 0; j < grounds.length; j++) {
			var o = grounds[j];

			if(o != undefined) {
				var $o = $(o);

				// Remove from colisions.
				for(var i = 0; i < pageElements().length; i++) {
					if(pageElements()[i].element === o) {
						pageElements().splice(i, 1);
						break;
					}
				}

				$o.html($o.text().replace(/([\S])/g, "<span>$1</span>"));
				$o.css("position", "relative");
				$("span", $o).each(function(i) {
					var newTop = Math.floor(Math.random() * 500) * ((i % 2) ? 1 : -1);
					var newLeft = Math.floor(Math.random() * 500) * ((i % 2) ? 1 : -1);

					$(this).css({
						position: "relative",
						opacity: 1,
						fontSize: 12,
						top: 0,
						left: 0
					}).animate({
						opacity: 0,
						fontSize: 84,
						top: newTop,
						left: newLeft
					}, 1000, function() {
						$(this).remove();

						// The next time we ask for the elements, we will force them to refresh their coordinates.
						forceElements = true;
					});
				});
			}
		}
		grounds = [];
	};

	document.addEventListener('keydown', keyDown, true);
	document.addEventListener('keyup', keyUp, true);

	init();

	console.log("success!");
});
