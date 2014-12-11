var exile = {
	hasClass: function(element, className) {
		return new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
	},
	addClass: function(element, className) {
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

	this.td = [];
	this.availableTd = [];

	this.calendars = [];

	this.startTime = 0;
	this.endTime = 0;
	this.startBox = null;
	this.endBox = null;
	
	this.activeTd = null;
	this.dateText = document.getElementsByClassName("showDate")[0];

	this.init();
	this.addEventHandle();
}

App.prototype.init = function() {
	var self = this;

	var newDay = new Date();
	var year = newDay.getFullYear(),
		month = newDay.getMonth(),
		date = newDay.getDate();

	this.calendars[0] = new Calendar({id: 1, year: year, month: month, date: date});
	
	for (var i = 1; i < this.count; i++) {
		this.calendars[i] = this.calendars[i-1].buildNextMonth();
	}

	this.getAllDateTd();
	this.getAvailableDateTd();
};

App.prototype.getAllDateTd = function() {
	var self = this;

	this.calendars.forEach(function(calendar) {
		self.getDateTd(calendar);
	});
};

App.prototype.getDateTd = function(calendar) {
	for (var i = 0; i < calendar.td.length; i++) {
		this.td.push(calendar.td[i]);
	}
};

App.prototype.getAvailableDateTd = function() {
	for (var i = 0, len = this.td.length; i < len; i++) {
		if (this.td[i].innerHTML !== '' && !exile.hasClass(this.td[i], 'oldDate')) {
			this.availableTd.push(this.td[i]);
		}
	}
};

App.prototype.set = function(option) {
	if (!option) return;
};
App.prototype.chooseInAndOutDate = function(that, mill) {
	var self = this;
};

App.prototype.getDateFromDataRole = function(element) {
	return parseInt(element.getAttribute('data-date').substr(8, 2));
};

App.prototype.returnInitState = function() {
	var self = this;

	if (self.startBox !== null) {
		self.startBox.innerHTML = self.getDateFromDataRole(self.startBox);
	}
	if (self.endBox !== null) {
		self.endBox.innerHTML = self.getDateFromDataRole(self.endBox);
	}
	for (var i = 0, len = self.availableTd.length; i < len; i++) {
		if (exile.hasClass(self.availableTd[i], 'availableDate')) {
			exile.removeClass(self.availableTd[i], 'availableDate');
		}
	}
};

App.prototype.addEventHandle = function() {
	var self = this;
	for (var i = 0, len = this.availableTd.length; i < len; i++) {
		this.availableTd[i].addEventListener('click', function(event) {
			console.log(this)
			var year = this.getAttribute('data-date').substr(0, 4);
			var month = this.getAttribute('data-date').substr(5, 2);
			var day = this.getAttribute('data-date').substr(8, 2);

			self.dateText.innerHTML = this.getAttribute('data-date');

			exile.addClass(event.target, ' active');
			if (self.activeTd !== null) exile.removeClass(self.activeTd, 'active');
			self.activeTd = this;


			var newDate = new Date();
			newDate.setFullYear(year, month, day);
			var mill = newDate.getTime();

			if (self.startBox === null || (self.startBox !== null && self.endBox !== null)) {
				self.returnInitState();
				
				self.endBox = null;
				self.startBox = this;
				self.startTime = mill;
				this.innerHTML = 'in';
			} else {
				if (mill > self.startTime) {
					self.endBox = this;
					self.endTime = mill;
					this.innerHTML = 'out';
					
					self.setAvailableDate.call(self);
				} else {
					self.returnInitState();
					self.endBox = null;
					self.startBox = this;
					self.startTime = mill;
					this.innerHTML = 'in';
				}
			}
		});
	}
};

App.prototype.setAvailableDate = function() {
	var self = this;

	for (var i = 0, len = this.availableTd.length; i < len; i++) {
		var startDate = new MyDate();
		startDate.getDateFromElement(self.startBox);
		var endDate = new MyDate();
		endDate.getDateFromElement(self.endBox);
		var thisDate = new MyDate();
		thisDate.getDateFromElement(self.availableTd[i]);

		if (thisDate.isAfter(startDate) && endDate.isAfter(thisDate)) {
			exile.addClass(this.availableTd[i], 'availableDate');
		}
	}
};

function Calendar(option) {
	if (!option) return;
	this.id = option.id;
	this.year = option.year;
	this.month = option.month;
	this.date = option.date;
	
	this.months = [];
	
	this.firstDay = this.getFirstDay();

	this.init();
}

Calendar.prototype.createDOMTree = function() {
	var topBox = '<div class="clearfix">' +
									'<div class="show_mn">' +
				          	'<span class="showDate2 year">选择年份</span>' +
				            '<span class="ml5 mr5">年</span>' +
				            '<span class="showDate2 month">选择月份</span>' +
				            '<span class="ml5">月</span>' +
				        	'</div>' +
				        '</div>';
  var tr = '<tr>' +
		          '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>' +
		      '</tr>';
	var tbody = '<tbody>' + tr+tr+tr+tr+tr+tr + '</tbody>';
	var thead = '<thead>' +
		          	'<tr>' +
		            	'<td>日</td><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td>' +
		         		'</tr>' +
		      		'</thead>';
	var dateTable = '<table class="data_table">' + thead + tbody + '</table>';
	var frame = '<div class="data_box" id="data_box' + this.id + '">' +
								'<div class="sel_date dn">' + topBox + dateTable + '</div>' +
							'</div>';
	return frame;
};

Calendar.prototype.init = function() {
	var self = this;

	var page = document.getElementsByClassName('page')[0];
	var template = this.createDOMTree();
	var div = document.createElement('div');
	div.innerHTML = template;
	page.appendChild(div);

	this.calendarBox = document.getElementById('data_box' + this.id);
	
	this.getMonthArray();
	var months = this.months;

	var dataTable = this.calendarBox.getElementsByClassName("data_table")[0];
	var tbody = dataTable.tBodies[0];
	this.td = tbody.getElementsByTagName("td");

	for (var i = 0; i < 42; i++) {

		if (i+1 < this.date) {
			this.td[i + this.firstDay].className = 'oldDate';
		}
	}

	this.render();
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

Calendar.prototype.getMonthArray = function() {
	var year = this.year;
	var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (year % 4 === 0) {
		months[1] = 29;
		if (year % 100 === 0 && year % 400 !== 0) months[1] = 28; 
	}
	this.months = months;
};

Calendar.prototype.getFirstDay = function() {
	var firstDate = new Date();
	firstDate.setFullYear(this.year, this.month, 1);
	return firstDate.getDay();
};

Calendar.prototype.render = function () {
	var yearBox = this.calendarBox.getElementsByClassName("year")[0];
	var monthBox = this.calendarBox.getElementsByClassName("month")[0];
	yearBox.innerHTML = this.year;
	monthBox.innerHTML = this.month + 1;

	this.renderDate();
};

Calendar.prototype.renderDate = function () {
	var self = this;

	for (var i = 0; i < this.td.length; i++) {
		this.td[i].innerHTML = '';
		exile.removeClass(this.td[i], 'active');
	}

	var firstDay = this.firstDay;
	for (var j = 0, len = this.months[this.month]; j < len; j++) {
		var tdBox = this.td[j + firstDay];

		var month = (this.month+1 < 10) ? ('0' + (this.month+1)) : this.month+1;
		var day = (j+1 < 10) ? ('0' + (j+1)) : j+1;
		tdBox.innerHTML = j+1;
		tdBox.setAttribute('data-date', this.year + '-' + month + '-' + day);

		if (j+1 === this.date && !exile.hasClass(tdBox, 'active')) {
			//tdBox.className += ' active';
			tdBox.innerHTML = 'Today';
		}
	} 
};


function MyDate(year, month, date) {
	this.year = year || 0
	this.month = month || 0;
	this.date = date || 0;
	
	this.millisecond = 0;
	
	this.init();
}

MyDate.prototype.init = function() {
	var newDate = new Date();
	newDate.setFullYear(this.year, this.month-1, this.date);
	this.millisecond = newDate.getTime();
	//console.log(this.millisecond)
};

MyDate.prototype.getDateFromElement = function(element) {
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

	if (this.millisecond >= newDate.getTime()) return true;
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



new App(4);
