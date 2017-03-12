function AudioPhaser(Tone, launchpad) {
	this.numRows = launchpad.numRows;
	this.numCols = launchpad.numCols;
	this.launchpad = launchpad;
	this.defaultPeriod = 60;
	this.heldKeys = [];

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
			synth.oscillator.mute = false;
			this.keys[i][j] = synth;
			synth.repsPerSecond = semitone + this.baseTimesPerPeriod;
			var note = this.getFrequency(this.baseFrequency, semitone);
			synth.pitch = note;
			this.scheduleRepeat(synth, i, j, this.launchpad)
			semitone += 1;
		}
	}
	Tone.Transport.bpm.value = 120;
	Tone.Transport.start();
}

// Do this as a method to avoid pass by reference issues
AudioPhaser.prototype.scheduleRepeat = function(synth, i, j, launchpad, offDelay=.1, release=0.04) {
	synth.timerId = Tone.Transport.scheduleRepeat(function(time) {
		synth.triggerAttackRelease(synth.pitch, release);
		// Don't use Tone.Draw to turn on the light, it looks way better on time and doesn't take much processing
		if (!synth.oscillator.mute) {
			launchpad.light(i, j, launchpad.GREEN);
		}

		// Turn the LED off in offDelay milliseconds
		Tone.Draw.schedule(function() {
			if (synth.oscillator.mute) {
				launchpad.light(i, j, launchpad.OFF);
			} else {
				launchpad.light(i, j, launchpad.LIGHT_GREEN);
			}
		}, Tone.context.currentTime + offDelay);
	}, synth.repsPerSecond / 60.0 + "hz");
	return synth.timerId;
}

AudioPhaser.prototype.stop = function() {
	Tone.Transport.cancel();

	Tone.Transport.pause();
}

AudioPhaser.prototype.handleMidiMessage = function(ev) {
	data = ev.data;
	var cmd = data[0];
	var channel = data[0] & 0xf;
	var noteNumber = data[1];
	var velocity = data[2];
	var row = Math.floor(noteNumber / 16);
	var col = noteNumber % 16;


	if (cmd == 0x80 || ((cmd == 0x90) && (velocity == 0))) { // with MIDI, note on with velocity zero is the same as note off
		// note off
		//noteOff(b);
		this.heldKeys.splice(this.heldKeys.indexOf(noteNumber), 1);
	} else if (cmd == 0x90) { // Note on
		this.heldKeys.push(noteNumber);

		if (noteNumber % 16 == 8) {
			// These are the side column buttons
			this.start();
		} else {
			var synth = this.keys[row][col]
			synth.oscillator.mute = !synth.oscillator.mute;
			var isMuted = synth.oscillator.mute;

			if (!isMuted) {
				this.launchpad.light(row, col, this.launchpad.LIGHT_GREEN);
				console.log("starting " + this.scheduleRepeat(synth, row, col, this.launchpad)); // triggerAttackRelease takes seconds

			} else {
				this.launchpad.light(row, col, this.launchpad.OFF);
				console.log("clearing " + synth.timerId);
				Tone.Transport.clear(synth.timerId);
			}

		}

	} else if (cmd == 0xB0) { // Continuous Controller message
		// Range of the top buttons is 0x68 to 0x6F
		switch (noteNumber) {
			case 0x68: // up button
				for (var ind = 0; ind < this.heldKeys.length; ind++) {
					var row = Math.floor(this.heldKeys[ind] / 16);
					var col = this.heldKeys[ind] % 16;
					var synth = this.keys[row][col]
					synth.repsPerSecond += 1;
				}
				break;
			case 0x69: // down button
				for (var ind = 0; ind < this.heldKeys.length; ind++) {
					var row = Math.floor(this.heldKeys[ind] / 16);
					var col = this.heldKeys[ind] % 16;
					var synth = this.keys[row][col]
					synth.repsPerSecond -= 1;
				}
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
