function AudioPhaser(Tone, launchpad) {
	this.numRows = launchpad.numRows;
	this.numCols = launchpad.numCols;
	this.launchpad = launchpad;
	this.defaultPeriod = 60;

	this.baseTimesPerPeriod = 60;

	this.baseFrequency = 55;
	this.baseNote = "A1";

	this.keys = new Array(this.numRows);
	for (var i = 0; i < this.numRows; i++) {
		this.keys[i] = new Array(this.numCols);
	}
}



AudioPhaser.prototype.getFrequency = function(baseFreq, numSemitones) {
	// console.log(baseFreq * Math.pow(Math.pow(2, 1/12), numSemitones))
	return baseFreq * Math.pow(Math.pow(2, 1 / 12), numSemitones);
}

AudioPhaser.prototype.start = function() {
	// for (var i=0; i<this.numRows; i++) {
	// 	for (var j=0; j<this.numCols; j++) {
	// 		var that = this;
	// 		var osc = that.keys[i][j];
	// 		var ms = osc.period / osc.timesPerPeriod;
	// 		setInterval(function(row, col, freq){
	// 			// that.keys[row][col].vco.oscillator.frequency.value = freq;
	// 			console.log(that.keys[row][col].vco.oscillator.frequency.value);
	// that.keys[row][col].envelope.trigger();
	// that.launchpad.light(row, col, that.launchpad.green);
	// setTimeout(function() {
	// 	that.launchpad.light(row, col, that.launchpad.off);
	// }, 100);
	// 		}, ms, i, j, osc.vco.oscillator.frequency.value);
	// 	}
	// }
	this.stop();
	semitone = 0;
	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
			// this.keys[i][j] = new PeriodicOscillator(
			// 	this.defaultPeriod, 
			// 	this.baseTimesPerPeriod + semitone,
			// 	this.getFrequency(this.baseFrequency, semitone),
			// 	audioCtx);

			var synth = new Tone.Synth().toMaster();
			synth.envelope.release.value = .1;
			this.keys[i][j] = synth;
			var len = this.defaultPeriod / (this.baseTimesPerPeriod + semitone);
			var note = this.getFrequency(this.baseFrequency, semitone);
			console.log(this.getFrequency(this.baseFrequency, semitone));
			this.scheduleRepeat(synth, note, i, j, this.launchpad, 60, len);
			semitone += 1;
		}
	}
	Tone.Transport.bpm.value = 120;
	Tone.Transport.start();
}

// Do this as a method to avoid pass by reference issues
AudioPhaser.prototype.scheduleRepeat = function(synth, note, i, j, launchpad, offDelay, len) {
	Tone.Transport.scheduleRepeat(function(time) {
		synth.triggerAttack(note);
		launchpad.light(i, j, launchpad.green);
		// Turn the LED off in offDelay milliseconds
		setTimeout(function() {
			launchpad.light(i, j, launchpad.off);
			synth.triggerRelease();
		}, offDelay);
	}, len);
}

AudioPhaser.prototype.stop = function() {
	// for (var i=0; i<this.numRows; i++) {
	// 	for (var j=0; j<this.numCols; j++) {
	// 		setInterval(function(){
	// 			this.keys[i][j].envelope.trigger();
	// 			this.launchpad.light(i, j, this.launchpad.green);
	// 			setTimeout(function() {
	// 				this.launchpad.light(i, j, this.launchpad.off);
	// 			}, 20);
	// 		}, this.period / this.timesPerPeriod);
	// 	}
	// }
		Tone.Transport.cancel();

	Tone.Transport.stop();

}

AudioPhaser.prototype.handleMidiMessage = function(ev) {
	data = event.data;
	var cmd = data[0];
	var channel = data[0] & 0xf;
	var noteNumber = data[1];
	var velocity = data[2];

	if (cmd == 0x80 || ((cmd == 0x90) && (velocity == 0))) { // with MIDI, note on with velocity zero is the same as note off
		// note off
		//noteOff(b);
	} else if (cmd == 0x90) { // Note on
		if (noteNumber % 8 == 0) {
			// These are the side column buttons
			
			this.start();

		}

	} else if (cmd == 0xB0) { // Continuous Controller message
		// Range of the top buttons is 0x68 to 0x6F
		this.stop();
		console.log(ev);
		switch (noteNumber) {
			case 0x68: // up button
				break;
			case 0x69: // down button
				break;
			case 0x6A: // left button
				break;
			case 0x6B: // right button
				break;
			case 0x6C: // session button
				break;
			case 0x6D: // user 1 button
				break;
			case 0x6E: // user 2 button
				break;
			case 0x6F: // mixer button
				break;
		}
	}
}


// function PeriodicOscillator(period, timesPerPeriod, frequency, audioCtx) {
// 	this.period = period;
// 	this.timesPerPeriod = timesPerPeriod;
// 	this.vco = new VCO(audioCtx, frequency);
// 	this.vca = new VCA(audioCtx);
// 	this.envelope = new EnvelopeGenerator(audioCtx);

// 	this.vco.connect(this.vca);
// 	this.envelope.connect(this.vca.amplitude);
// 	this.vca.connect(context.destination);
// }