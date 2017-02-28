
function Launchpad(numRows, numCols) {
	this.numRows = numRows;
	this.numCols = numCols;
	this.htmlLaunchpad = document.createElement("table");
	this.htmlLaunchpad.className="launchpad";

	this.pad = new Array(numRows);
	for (var i=0; i< this.numRows; i++) {
		this.pad[i] = new Array(this.numCols);
	}

	for (var i=0; i<this.numRows; i++) {
		var rowElem = document.createElement("tr");
		rowElem.className = "row";
		rowElem.row = i;
		for (var j=0; j<this.numCols; j++) {
			var button = document.createElement("td");
			button.row = i;
			button.col = j;
			// button.onclick = flipHandler;
			rowElem.appendChild(button);
		}
		this.htmlLaunchpad.appendChild(rowElem);
	}
	document.getElementById("main").appendChild(this.htmlLaunchpad)
}

Launchpad.prototype.off = 0x00;

Launchpad.prototype.green = 0x3C;

Launchpad.prototype.red = 0x0f

Launchpad.prototype.amber = 0x3F;

Launchpad.prototype.openingAnimation = async function(cb) {
	for (var i=0; i<this.numRows; i++) {
		for (var j=0; j<this.numCols; j++) {
			var key = i*16 + j;
			this.light(i,j, this.red);
		}
	}
	await new Promise(resolve => setTimeout(resolve, 400));

	for (var i=0; i<this.numRows; i++) {
		for (var j=0; j<this.numCols; j++) {
			var key = i*16 + j;
			this.light(i,j, this.green);
		}
	}
	await new Promise(resolve => setTimeout(resolve, 400));

	for (var i=0; i<this.numRows; i++) {
		for (var j=0; j<this.numCols; j++) {
			var key = i*16 + j;
			this.light(i,j, this.amber);
		}
	}
	await new Promise(resolve => setTimeout(resolve, 400));

	for (var i=0; i<this.numRows; i++) {
		for (var j=0; j<this.numCols; j++) {
			var key = i*16 + j;
			this.light(i,j, this.off);
		}
	}
	if (cb) cb();
}

Launchpad.prototype.light = function(row, col, color) {
	var key = row*16 + col;
	midiOut.send( [0x90, key, color]);
	var el = this.findElemByRowCol(row, col)
	el.className = "";
	switch (color) {
		case this.green:
			el.classList.add("green");
			break;
		case this.red:
			el.classList.add("red");
			break;	
		case this.amber:
			el.classList.add("amber");
			break;
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


