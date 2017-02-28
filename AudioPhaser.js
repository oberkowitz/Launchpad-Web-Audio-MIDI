function AudioPhaser(Tone, launchpad) {
	this.numRows = launchpad.numRows;
	this.numCols = launchpad.numCols;
	this.launchpad = launchpad;
	this.defaultPeriod = 60;

	this.baseTimesPerPeriod = 10;

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
	this.stop();
	semitone = 0;
	for (var i = 0; i < this.numRows; i++) {
		for (var j = 0; j < this.numCols; j++) {
			var synth = new Tone.Synth().toMaster();
			synth.envelope.release.value = .1;
			this.keys[i][j] = synth;
			var freq = (semitone + this.baseTimesPerPeriod) / this.defaultPeriod + "hz";
			var note = this.getFrequency(this.baseFrequency, semitone);
			console.log(note, freq);
			this.scheduleRepeat(synth, note, i, j, this.launchpad, 100.0, freq, 40.0 / 1000); // triggerAttackRelease takes seconds
			semitone += 1;
		}
	}
	Tone.Transport.bpm.value = 120;
	Tone.Transport.start();
}

// Do this as a method to avoid pass by reference issues
AudioPhaser.prototype.scheduleRepeat = function(synth, note, i, j, launchpad, offDelay, freq, release) {
	Tone.Transport.scheduleRepeat(function(time) {
		synth.triggerAttackRelease(note, release);
		Tone.Draw.schedule(function() {
			launchpad.light(i, j, launchpad.green);
		}, Tone.context.currentTime);

		// Turn the LED off in offDelay milliseconds
		Tone.Draw.schedule(function() {
			console.log("off");
			launchpad.light(i, j, launchpad.off);
		}, Tone.context.currentTime + offDelay / 1000);
	}, freq);
}

AudioPhaser.prototype.stop = function() {
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