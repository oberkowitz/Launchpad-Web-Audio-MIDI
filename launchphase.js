var selectMIDIIn = null;
var selectMIDIOut = null;
var midiAccess = null;
var midiIn = null;
var midiOut = null;
var launchpadFound = false;
var audioPhaser;

function onMIDIInit(midi) {
	midiAccess = midi;
	selectMIDIIn = document.getElementById("midiIn");
	selectMIDIOut = document.getElementById("midiOut");

	// clear the MIDI input/output select
	selectMIDIIn.options.length = 0;
	selectMIDIOut.options.length = 0;

	//Put in the dummy launchpad
	selectMIDIIn.add(new Option("Launchpad Simulator", -1, true, true));
	selectMIDIOut.add(new Option("Launchpad Simulator", -1, true, true));
	midiIn = {"onmidimessage": null};
	midiOut = {"onmidimessage": function(a, b, c) {

	}};


	for (var input of midiAccess.inputs.values()) {
		if ((input.name.toString().indexOf("Launchpad") != -1) || (input.name.toString().indexOf("QUNEO") != -1)) {
			launchpadFound = true;
			selectMIDIIn.add(new Option(input.name, input.id, true, true));
			midiIn = input;
		} else
			selectMIDIIn.add(new Option(input.name, input.id, false, false));
	}
	selectMIDIIn.onchange = changeMIDIIn;

	// clear the MIDI output select
	for (var output of midiAccess.outputs.values()) {
		if ((output.name.toString().indexOf("Launchpad") != -1) || (output.name.toString().indexOf("QUNEO") != -1)) {
			selectMIDIOut.add(new Option(output.name, output.id, true, true));
			midiOut = output;
		} else
			selectMIDIOut.add(new Option(output.name, output.id, false, false));
	}
	selectMIDIOut.onchange = changeMIDIOut;
	if (midiIn)
		midiIn.onmidimessage = handle;

	if (midiOut && launchpadFound) {
		midiOut.send([0xB0, 0x00, 0x00]); // Reset Launchpad
		midiOut.send([0xB0, 0x00, 0x01]); // Select XY mode
		audioPhaser.launchpad.openingAnimation(function() {
			audioPhaser.start();
		});
	}
}


function onMIDIFail(err) {
	alert("MIDI initialization failed.");
}

function changeMIDIIn(ev) {
	if (midiIn)
		midiIn.onmidimessage = null;
	var selectedID = selectMIDIIn[selectMIDIIn.selectedIndex].value;

	if (selectedID == -1) {
		// This is the simulator
		midiIn = {"onmidimessage": null};
		return;
	}
	for (var input of midiAccess.inputs.values()) {
		if (selectedID == input.id)
			midiIn = input;
	}
}

function handle(ev) {
	console.log(ev);
	if (audioPhaser) {
		audioPhaser.handleMidiMessage(ev);
	}
}

function changeMIDIOut(ev) {
	var selectedID = selectMIDIOut[selectMIDIOut.selectedIndex].value;
	if (selectedID == -1) {
		// This is the simulator
		midiOut = {"onmidimessage": function(a, b, c) {

		}};
		return;
	}

	for (var output of midiAccess.outputs.values()) {
		if (selectedID == output.id) {
			midiOut = output;
			midiOut.send([0xB0, 0x00, 0x00]); // Reset Launchpad
			midiOut.send([0xB0, 0x00, 0x01]); // Select XY mode
		}
	}
}

window.addEventListener('load', function() {
	var startButton = document.getElementById("startButton");
	startButton.disabled = false;
	navigator.requestMIDIAccess({}).then(onMIDIInit, onMIDIFail);
});

function startLaunchphase() {
	var launchpad = new Launchpad(8, 8, launchpadFound);
	audioPhaser = new AudioPhaser(Tone, launchpad);
	audioPhaser.start();
}




