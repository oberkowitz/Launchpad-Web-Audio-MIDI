function AudioPhaser(audioCtx, launchpad) {
	this.numRows = launchpad.numRows;
	this.numCols = launchpad.numCols;
	this.launchpad = launchpad;
	this.defaultPeriod = 60000;

	this.baseTimesPerPeriod = 60;

	this.baseFrequency = 55;

	this.keys = new Array(this.numRows);
	for (var i=0; i< this.numRows; i++) {
		this.keys[i] = new Array(this.numCols);
	}

	semitone = 0;
	for (var i=0; i<this.numRows; i++) {
		for (var j=0; j<this.numCols; j++) {
			this.keys[i][j] = new PeriodicOscillator(
				this.defaultPeriod, 
				this.baseTimesPerPeriod + semitone,
				this.getFrequency(this.baseFrequency, semitone),
				audioCtx);
			semitone += 1;
		}
	}
}




AudioPhaser.prototype.getFrequency = function (baseFreq, numSemitones) {
	// console.log(baseFreq * Math.pow(Math.pow(2, 1/12), numSemitones))
    return baseFreq * Math.pow(Math.pow(2, 1/12), numSemitones);
}         

AudioPhaser.prototype.start = function() {
	for (var i=0; i<this.numRows; i++) {
		for (var j=0; j<this.numCols; j++) {
			var that = this;
			var osc = that.keys[i][j];
			var ms = osc.period / osc.timesPerPeriod;
			setInterval(function(row, col, freq){
				// that.keys[row][col].vco.oscillator.frequency.value = freq;
				console.log(that.keys[row][col].vco.oscillator.frequency.value);
				that.keys[row][col].envelope.trigger();
				that.launchpad.light(row, col, that.launchpad.green);
				setTimeout(function() {
					that.launchpad.light(row, col, that.launchpad.off);
				}, 100);
			}, ms, i, j, osc.vco.oscillator.frequency.value);
		}
	}
}

AudioPhaser.prototype.stop = function() {
	for (var i=0; i<this.numRows; i++) {
		for (var j=0; j<this.numCols; j++) {
			setInterval(function(){
				this.keys[i][j].envelope.trigger();
				this.launchpad.light(i, j, this.launchpad.green);
				setTimeout(function() {
					this.launchpad.light(i, j, this.launchpad.off);
				}, 20);
			}, this.period / this.timesPerPeriod);
		}
	}
}






function PeriodicOscillator(period, timesPerPeriod, frequency, audioCtx) {
	this.period = period;
	this.timesPerPeriod = timesPerPeriod;
	this.vco = new VCO(audioCtx, frequency);
	this.vca = new VCA(audioCtx);
	this.envelope = new EnvelopeGenerator(audioCtx);

	this.vco.connect(this.vca);
	this.envelope.connect(this.vca.amplitude);
	this.vca.connect(context.destination);
}

