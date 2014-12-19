'use strict'
var exile = {
	hasClass: function(element, className) {
		return new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
	},
	addClass: function(element, className) {
		if (exile.hasClass(element, className)) return;
		element.className += (' ' + className);
		element.className = element.className.trim();
		//var classList = element.className.split(' ');
	},
	removeClass: function(element, className) {
		element.className = element.className.replace(className, ' ').trim();
	},
	attr: function(element, attr, value) {
		if(arguments.length === 2) {
			return element.attributes[attr] ? element.attributes[attr].value : undefined;
		}
		else if(arguments.length === 3) {
			element.setAttribute(attr, value);
		}
	}
};



function App(count) {
	this.count = count || 1;

	this.availableTd = [];

	this.calendars = [];

	this.startDate = null;
	this.startDate = null;

	this.init();
}

App.prototype.init = function() {
	var self = this;

	var newDay = new Date();
	var year = newDay.getFullYear(),
		month = newDay.getMonth(),
		date = newDay.getDate();

	this.startDate = new MyDate(year, month+1, date);
	this.endDate = this.startDate.buildNextDate();

	this.calendars[0] = new Calendar({id: 1, year: year, month: month, date: date});
	
	for (var i = 1; i < this.count; i++) {
		this.calendars[i] = this.calendars[i-1].buildNextMonth();
	}

	this.getAllDateTd();
	this.render();
	this.addEventHandle();
};

App.prototype.getAllDateTd = function() {
	var self = this;

	this.calendars.forEach(function(calendar) {
		self.getDateTd(calendar);
	});
};

App.prototype.getDateTd = function(calendar) {
	for (var i = 0; i < calendar.td.length; i++) {
		//this.td.push(calendar.td[i]);
		var tdBox = calendar.td[i];
		if (tdBox.innerHTML !== '' && !exile.hasClass(tdBox, 'oldDate')) {
			this.availableTd.push(tdBox);
		}
	}
};

/*
App.prototype.getAvailableDateTd = function() {
	for (var i = 0, len = this.td.length; i < len; i++) {
		if (this.td[i].innerHTML !== '' && !exile.hasClass(this.td[i], 'oldDate')) {
			this.availableTd.push(this.td[i]);
		}
	}
};
*/

App.prototype.render = function() {
	if (this.startDate) var startDateText = this.startDate.toString();
	if (this.endDate) var endDateText = this.endDate.toString();

	for (var i = 0, len = this.availableTd.length; i < len; i++) {
		if (startDateText === this.availableTd[i].getAttribute('data-date')) {
			this.availableTd[i].innerHTML += '<p>\u5165\u4f4f</p>';
		}
		if (endDateText === this.availableTd[i].getAttribute('data-date')) {
			this.availableTd[i].innerHTML += '<p>\u79bb\u5e97</p>';
		}
		var thisDate = new MyDate();
		thisDate.updateDateFromElement(this.availableTd[i]);
	}

	var startDateBox = document.getElementsByClassName("startDate")[0];
	var endDateBox = document.getElementsByClassName("endDate")[0];
	endDateBox.innerHTML = endDateText;
	startDateBox.innerHTML = startDateText;

	this.renderChooseDate();
};

App.prototype.renderChooseDate = function() {
	if (!this.startDate || !this.endDate) return;

	var self = this;

	this.availableTd.forEach(function(td) {
		var newDate = new MyDate();
		newDate.updateDateFromElement(td);

		if (newDate.isAfter(self.startDate) && self.endDate.isAfter(newDate)) {
			exile.addClass(td, 'availableDate');
		}
	})
};

App.prototype.getDateFromDataRole = function(element) {
	return parseInt(element.getAttribute('data-date').substr(8, 2));
};

App.prototype.returnInitState = function() {
	var self = this;

	for (var i = 0, len = self.availableTd.length; i < len; i++) {
		self.availableTd[i].innerHTML = self.getDateFromDataRole(self.availableTd[i]);
		if (exile.hasClass(self.availableTd[i], 'availableDate')) {
			exile.removeClass(self.availableTd[i], 'availableDate');
		}

		if (exile.hasClass(self.availableTd[i], 'active')) {
			exile.removeClass(self.availableTd[i], 'active');
		}
	}
};

App.prototype.addEventHandle = function() {
	var self = this;

	for (var i = 0, len = this.availableTd.length; i < len; i++) {
		this.availableTd[i].addEventListener('click', function(event) {
			console.log(this)
			self.returnInitState();
			exile.addClass(this, 'active');
			self.checkInAndOut(this);
			self.render();
		});
	}
};

App.prototype.checkInAndOut = function(element) {
	var self = this;

	//exile.addClass(element, 'active');
	var newDate = new MyDate();
	newDate.updateDateFromElement(element);

	if (self.startDate === null || (self.startDate !== null && self.endDate !== null)) {
		self.endDate = null;
		self.startDate = newDate;
	} else {
		if (newDate.isAfter(self.startDate) && !newDate.equal(self.startDate)) {
			self.endDate = newDate;
		} else {
			self.endDate = null;
			self.startDate = newDate;
		}
	}
};

App.prototype.set = function(option) {
	if (!option) return;
};



function Calendar(option) {
	if (!option) return;
	this.id = option.id;
	this.year = option.year;
	this.month = option.month;
	this.date = option.date;

	this.init();
}

Calendar.prototype.init = function() {
	this.createDOMTree('page');

	this.monthDays = this.getMonthDays();
	this.firstDay = this.getFirstDay();

	this.render();
};

Calendar.prototype.createDOMTree = function(className) {
	var page = document.getElementsByClassName(className)[0];
	var template = this.createTemplate();
	var div = document.createElement('div');
	div.innerHTML = template;
	page.appendChild(div);
};

Calendar.prototype.createTemplate = function() {
	var topBox = '<div class="clearfix">' +
							'<div class="show_mn">' +
		          	'<span class="showDate2 year">\u9009\u62e9\u5e74\u4efd</span>' +
		            '<span class="ml5 mr5">\u5e74</span>' +
		            '<span class="showDate2 month">\u9009\u62e9\u6708\u4efd</span>' +
		            '<span class="ml5">\u6708</span>' +
		        	'</div>' +
		        '</div>';
	var tr = '<tr>' +
		          '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>' +
		      '</tr>';
	var tbody = '<tbody>' + tr+tr+tr+tr+tr+tr + '</tbody>';
	var thead = '<thead>' +
		          	'<tr>' +
		            	'<td>\u65e5</td><td>\u4e00</td><td>\u4e8c</td>' +
		            	'<td>\u4e09</td><td>\u56db</td><td>\u4e94</td><td>\u516d</td>' +
		         	'</tr>' +
		      	'</thead>';
	var dateTable = '<table class="data_table">' + thead + tbody + '</table>';
	var frame = '<div class="data_box" id="data_box' + this.id + '">' +
					'<div class="sel_date dn">' + topBox + dateTable + '</div>' +
				'</div>';
	return frame;
};

Calendar.prototype.getMonthDays = function() {
	var year = this.year;
	var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (year % 4 === 0) {
		months[1] = 29;
		if (year % 100 === 0 && year % 400 !== 0) months[1] = 28; 
	}
	return months[this.month];
};

Calendar.prototype.getFirstDay = function() {
	var firstDate = new Date();
	firstDate.setFullYear(this.year, this.month, 1);
	return firstDate.getDay();
};

Calendar.prototype.render = function () {
	this.calendarBox = document.getElementById('data_box' + this.id);
	var tbody = this.calendarBox.getElementsByTagName('tbody')[0];
	this.td = tbody.getElementsByTagName("td");

	var yearBox = this.calendarBox.getElementsByClassName("year")[0];
	var monthBox = this.calendarBox.getElementsByClassName("month")[0];
	yearBox.innerHTML = this.year;
	monthBox.innerHTML = this.month + 1;

	this.renderDateBox();
	this.renderOldDate();
	this.removeValiedTr();
};

Calendar.prototype.renderDateBox = function () {
	var self = this;

	for (var i = 0; i < this.td.length; i++) {
		this.td[i].innerHTML = '';
		exile.removeClass(this.td[i], 'active');
	}

	var firstDay = this.firstDay;
	for (var j = 0, len = this.monthDays; j < len; j++) {
		var tdBox = this.td[j + firstDay];

		var month = (this.month+1 < 10) ? ('0' + (this.month+1)) : this.month+1;
		var day = (j+1 < 10) ? ('0' + (j+1)) : j+1;
		tdBox.innerHTML = j + 1;
		tdBox.setAttribute('data-date', this.year + '-' + month + '-' + day);

		if (j+1 === this.date && !exile.hasClass(tdBox, 'active')) {
			//tdBox.className += ' active';
			tdBox.innerHTML = '\u4eca\u5929';
		}
	}
};

Calendar.prototype.renderOldDate = function() {
	if (!this.date) return;

	for (var i = 0; i < 42; i++) {
		if (i + 1 >= this.date) break;
		exile.addClass(this.td[i + this.firstDay], 'oldDate');
	}
};

Calendar.prototype.removeValiedTr = function() {
	var tbody = this.calendarBox.getElementsByTagName('tbody')[0];
	var tr = tbody.getElementsByTagName('tr');
	var removeTr = [];

	for (var i = 4; i < 6; i++) {
		var td = tr[i].getElementsByTagName('td');
		if (td[0].innerHTML === '') {
			removeTr.push(tr[i]);
		}
	}

	removeTr.forEach(function(tr) {
		tr.parentNode.removeChild(tr);
	});
};

Calendar.prototype.buildNextMonth = function() {
	var year = this.year;
	var month = this.month + 1;
	var id = this.id + 1;
	if (month >= 12) {
		year += 1;
		month -= 12;
	}
	return new Calendar({id: id, year: year, month: month});
};


function MyDate(year, month, date) {
	this.year = year || 0
	this.month = month || 0;
	this.date = date || 0;
	
	this.millisecond = 0;
	
	this.init();
}

MyDate.prototype.toString = function() {
	var month = parseInt(this.month);
	var date = parseInt(this.date);
	month = (month < 10) ? ('0' + (month)) : month;
	date = (date < 10) ? ('0' + (date)) : date;
	return this.year + '-' + month + '-' + date;
};

MyDate.prototype.equal = function(otherDate) {
	if (this.toString() === otherDate.toString()) return true;
	return false;
};

MyDate.prototype.init = function() {
	var newDate = new Date();
	newDate.setFullYear(this.year, this.month-1, this.date);
	this.millisecond = newDate.getTime();
};

MyDate.prototype.updateDateFromElement = function(element) {
	var dateString = element.getAttribute('data-date');
	if (!dateString) return;
	this.year = dateString.substr(0, 4);
	this.month = dateString.substr(5, 2),
	this.date = dateString.substr(8, 2);
	
	this.init();
};

MyDate.prototype.isAfter = function(otherDate) {
	var newDate = new Date();
	newDate.setFullYear(otherDate.year, otherDate.month-1, otherDate.date);

	if (this.millisecond + 24*60*60*1000 > newDate.getTime()) return true;
	return false;
	
	/* old Version
	if (this.year > otherDate.year) {
		return true;
	} else if (this.year === otherDate.year && this.month > otherDate.month) {
		return true;
	} else if (this.year === otherDate.year && this.month === otherDate.month 
			&& this.date > otherDate.date) {
		return true;
	}
	return false;
	*/
};

MyDate.prototype.getDaysFrom = function(otherDate) {
	//if (!this.isAfter(otherDate)) return;

	var t = this.millisecond - otherDate.millisecond;
	return Math.abs(Math.round(t / (24*60*60*1000)));
};

MyDate.prototype.buildNextDate = function() {
	var year = parseInt(this.year);
	var month = parseInt(this.month);
	var date = parseInt(this.date) + 1;

	var monthDays = this.getMonthDays();

	if (date > this.monthDays) {
		date = 1;
		month += 1;
		if (month > 12) {
			month = 1;
			year += 1;
		}
	}
	return new MyDate(year, month, date);
};

MyDate.prototype.getMonthDays = function() {
	var year = this.year;
	var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (year % 4 === 0) {
		months[1] = 29;
		if (year % 100 === 0 && year % 400 !== 0) months[1] = 28; 
	}
	return months[this.month - 1];
};




new App(12);
