
var moment = require('moment');



/*
TODO: 
	http://en.wikipedia.org/wiki/ISO_week_date
	timezones / utc-mode
	rounding
	get span bounds
	fuzzy match unit names
	format
	
maybe:
	arbitrary year/quarter beginning
	arbitrary beginning day of week
	moment-style math operators
*/

var UnixTime = function(unit, date) {
	
	this.uts = moment(date).unix(); 
	this.unit = unit;
	this.qty = UnixTime.from(unit, date);
}


// takes a unix timestamp, returns quantity of selected unix-units
var fromFns = {
	// these are the easy ones
	seconds: function(ts) { return ts },
	minutes: function(ts) { return Math.floor(ts / 60) }, // rounding?
	hours: function(ts) { return Math.floor(ts / 3600) }, // rounding?
	days: function(ts) { return Math.floor(ts / (3600*24)) }, // rounding?
	weeks: function(ts) { return Math.floor(ts / (3600*24*7)) }, // BUG: TODO: offset, the epoch was a thursday, rounding?
	
	// these are the hard ones: leap years and other length variation 
	months: function(ts) { 
		var m = moment.unix(ts);
		return (m.year() - 1970) * 12 + m.month();
	}, // rounding?
	quarters: function(ts) { 
		var m = moment.unix(ts);
		return (m.year() - 1970) * 4 + m.quarter() - 1; // moment quarters are 1-based
	}, // rounding?
	
	// back to easy ones
	years: function(ts) { return moment.unix(ts).year() - 1970 }, 
	decades: function(ts) { return Math.floor((moment.unix(ts).year() - 1970) / 10) }, 
	scores: function(ts) { return Math.floor((moment.unix(ts).year() - 1970) / 20) }, 
	centuries: function(ts) { return Math.floor((moment.unix(ts).year() - 1970) / 100) }, 
	millenia: function(ts) { return Math.floor((moment.unix(ts).year() - 1970) / 1000) }, // why not?
};

// takes quantity of selected unix units, returns a moment
var toFns =  {
	// these are the easy ones
	seconds: function(uu) { return moment.unix(uu) },
	minutes: function(uu) { return moment.unix(uu * 60) }, // rounding?
	hours: function(uu) { return moment.unix(uu * 3600) }, // rounding?
	days: function(uu) { return moment.unix(uu * 3600*24) }, // rounding?
	weeks: function(uu) { return moment.unix(uu * 3600*24*7) }, // BUG: TODO: offset, the epoch was a thursday, rounding?
	
	// these are the hard ones: leap years and other length variation 
	months: function(uu) { return moment.year(Math.floor(uu / 12) + 1970).month(uu % 12) }, // rounding?
	quarters: function(uu) { return moment.year(Math.floor(uu / 4) + 1970).quarter((uu % 4) + 1) }, // moment quarters are 1-based rounding?
	
	// back to easy ones
	years: function(uu) { return moment.year(uu + 1970) }, 
	decades: function(uu) { return moment.year(uu * 10 + 1970) }, 
	scores: function(uu) { return moment.year(uu * 20 + 1970) }, 
	centuries: function(uu) { return moment.year(uu * 100 + 1970) }, 
	millenia: function(uu) { return moment.year(uu * 1000 + 1970) }, // why not?
};



UnixTime.prototype.valueOf = function() {
	return this.qty;
};

UnixTime.prototype.timestamp = function() {
	return this.uts;
};

// returns a moment for the beginning of a given unix-unit quantity
// kind of a crap implementation.
UnixTime.prototype.toMoment = function() {
	if(!toFns[this.unit]) return null;
	
	return toFns[this.unit](this.qty);
};


// returns the unix-unit quantity for the beginning span a given moment falls in
// kind of a crap implementation.
UnixTime.prototype.from = UnixTime.prototype.parse = function(unit, date) {
	if(!fromFns[unit]) return null; // TODO: need nice error handling and fuzzy matching here
	
	this.unit = unit;
	this.qty = fromFns[unit](moment(date).unix());
	
	return this;
};


// returns moments for the start and end points of a given unix-unit 
// in a way this is the inverse function of UnixTime.from
UnixTime.boundingSpan = function(unit, qty) {
	return [
		this.toMoment(unit, qty),
		UnixTime.toMoment(unit, qty+1) //BUG: broken from refactoring 
	]
};





// passthrough of moment.format
UnixTime.prototype.format = function(fmtStr) {
	var m = UnixTime.toMoment(this.unit, this.qty);
	if(!m) return m;
	
	return m.format(fmtStr);
};


// fancy string like "34th week of 1977" or "October 1993"
UnixTime.prototype.desc = function() {
	var m = this.toMoment();
	switch(this.unit) {
		case 'seconds': 
			return m.format('YYYY-MM-DD HH:mm:ss'); // check up on the format
		case 'minutes': 
			return m.format('YYYY-MM-DD HH:mm'); // check up on the format
		case 'hours': 
			return m.format('YYYY-MM-DD HH:mm'); // check up on the format
		case 'days': 
			return m.format('YYYY-MM-DD'); // check up on the format
		case 'weeks': 
			return m.format('wo week of YYYY'); // check up on the format
		case 'months': 
			return m.format('MMMM YYYY'); // check up on the format
		case 'quarters': 
			var q = ['1st', '2nd', '3rd', '4th'][m.quarter() - 1];
			return m.format(q + ' quarter YYYY'); // check up on the format
		case 'years': 
			return m.format('YYYY'); // check up on the format
		case 'decades': 
			return m.year((m.year()/10)|0*10).format('YYYY') + "'s"; // check up on the format
		case 'scores': 
			return m.year((m.year()/10)|0*10).format('YYYY') + "'s"; // check up on the format
		case 'centuries': 
			return m.year((m.year()/10)|0*10).format('YYYY') + " century"; // check up on the format
	
	
	
}








// maybe there sould be a default init options

module.exports = UnixTime;


