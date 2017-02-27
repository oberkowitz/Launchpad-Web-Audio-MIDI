var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);


function VCO(context, frequency) {
  this.oscillator = context.createOscillator();
  this.oscillator.type = 'sawtooth';
  this.setFrequency(frequency);
  this.oscillator.start(0);

  this.input = this.oscillator;
  this.output = this.oscillator;

  // var that = this;
  // $(document).bind('frequency', function(_, frequency) {
  //   that.setFrequency(frequency);
  // });
}

VCO.prototype.setFrequency = function(frequency) {
  this.oscillator.frequency.setValueAtTime(frequency, context.currentTime);
}

VCO.prototype.connect = function(node) {
  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
}

function VCA(context) {
  this.gain = context.createGain();
  this.gain.gain.value = 0;
  this.input = this.gain;
  this.output = this.gain;
  this.amplitude = this.gain.gain;
}

VCA.prototype.connect = function(node) {
  if (node.hasOwnProperty('input')) {
    this.output.connect(node.input);
  } else {
    this.output.connect(node);
  }
}

function EnvelopeGenerator(context) {
  this.attackTime = 0.1;
  this.releaseTime = 0.1;

  // var that = this;
  // $(document).bind('gateOn', function (_) {
  //   that.trigger();
  // });
  // $(document).bind('setAttack', function (_, value) {
  //   that.attackTime = value;
  // });
  // $(document).bind('setRelease', function (_, value) {
  //   that.releaseTime = value;
  // });
}

EnvelopeGenerator.prototype.trigger = function() {
  now = context.currentTime;
  this.param.cancelScheduledValues(now);
  this.param.setValueAtTime(0, now);
  this.param.linearRampToValueAtTime(.5, now + this.attackTime);
  this.param.linearRampToValueAtTime(0, now + this.attackTime + this.releaseTime);
}

EnvelopeGenerator.prototype.connect = function(param) {
  this.param = param;
}

