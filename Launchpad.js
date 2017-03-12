function Launchpad(numRows, numCols, launchpadFound) {
	this.launchpadFound = launchpadFound;
	this.numRows = numRows;
	this.numCols = numCols;
	this.htmlLaunchpad = document.createElement("table");
	this.htmlLaunchpad.className = "launchpad";

	this.pad = new Array(numRows);
	for (var i = 0; i < this.numRows; i++) {
		this.pad[i] = new Array(this.numCols);
	}
	if (!launchpadFound) {
		for (var i = 0; i < this.numRows; i++) {
			var rowElem = document.createElement("tr");
			rowElem.className = "row";
			rowElem.row = i;
			for (var j = 0; j < this.numCols; j++) {
				var button = document.createElement("td");
				button.row = i;
				button.col = j;
				button.onmousedown = this.handlePress(i, j);
				button.onmouseup = this.handleRelease(i, j);
				rowElem.appendChild(button);
			}
			this.htmlLaunchpad.appendChild(rowElem);
		}
		document.getElementById("main").appendChild(this.htmlLaunchpad)
	}
}

Launchpad.prototype.OFF = 0x00;

Launchpad.prototype.GREEN = 0x3C;

Launchpad.prototype.LIGHT_GREEN = 0x1C;

Launchpad.prototype.RED = 0x0f

Launchpad.prototype.AMBER = 0x3F;

Launchpad.prototype.openingAnimation = async function(cb) {
	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
			var key = i * 16 + j;
			this.light(i, j, this.RED);
		}
	}
	await new Promise(resolve => setTimeout(resolve, 400));

	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
			var key = i * 16 + j;
			this.light(i, j, this.GREEN);
		}
	}
	await new Promise(resolve => setTimeout(resolve, 400));

	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
			var key = i * 16 + j;
			this.light(i, j, this.AMBER);
		}
	}
	await new Promise(resolve => setTimeout(resolve, 400));

	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
			var key = i * 16 + j;
			this.light(i, j, this.OFF);
		}
	}
	if (cb) cb();
}

Launchpad.prototype.light = function(row, col, color) {
	var key = row * 16 + col;
	if (launchpadFound) {
		midiOut.send([0x90, key, color]);
	} else {
		var el = this.findElemByRowCol(row, col)
		el.className = "";
		switch (color) {
			case this.GREEN:
				el.classList.add("green");
				break;
			case this.LIGHT_GREEN:
				el.classList.add("light-green");
				break;
			case this.RED:
				el.classList.add("red");
				break;
			case this.AMBER:
				el.classList.add("amber");
				break;
		}
	}
}

Launchpad.prototype.handlePress = function(row, col) {
	return function() {
		var key = row * 16 + col;
		midiIn.onmidimessage({
			"data": [0x90, key, 100]
		});
	}
}

Launchpad.prototype.handleRelease = function(row, col) {
	return function() {
		var key = row * 16 + col;
		midiIn.onmidimessage({
			"data": [0x90, key, 0]
		});
	}
}

Launchpad.prototype.findElemByRowCol = function(row, col) {
	var e, i, j, c;

	for (i in this.htmlLaunchpad.children) {
		e = this.htmlLaunchpad.children[i];
		if (e.row == row) {
			for (j in e.children) {
				if (e.children[j].col == col)
					return e.children[j];
			}
		}
	}
	return null;
}