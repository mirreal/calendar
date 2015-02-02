'use strict'
var _ = {
  hasClass: function(element, className) {
    return new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
  },
  addClass: function(element, className) {
    if (_.hasClass(element, className)) return;
    element.className += (' ' + className);
    element.className = element.className.trim();
    //var classList = element.className.split(' ');
  },
  removeClass: function(element, className) {
    if (!_.hasClass(element, className)) return;
    element.className = element.className.replace(className, ' ').trim();
  },
  attr: function(element, attr, value) {
    if(arguments.length === 2) {
      return element.attributes[attr] ? element.attributes[attr].value : undefined;
    }
    else if(arguments.length === 3) {
      element.setAttribute(attr, value);
    }
  },
  show: function(element) {
    element.style.display = '';
  },
  hide: function(element) {
    element.style.display = 'none';
  },
  remove: function(element) {
    element.parentNode.removeChild(element);
  },
  pageY: function(element) {
    return element.offsetTop + (element.offsetParent ? arguments.callee(element.offsetParent) : 0);
  }
};



function App(count) {
  this.count = count || 1;

  this.availableTd = [];
  this.chooseTd = [];

  this.calendars = [];
  this.events = [];

  this.startDate = null;
  this.endDate = null;
  this.duringDays = 0;
}

App.prototype.on = function(event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback.bind(this));
};

App.prototype.handle = function(event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

App.prototype.set = function(attr, value) {
  this[attr] = value;
  return this;
};

App.prototype.get = function(attr) {
  return this[attr];
};

App.prototype.init = function() {
  if (this.startDate !== null) {
    var year = this.startDate.year,
        month = this.startDate.month - 1,
        date = this.startDate.date;
    if (this.endDate === null) this.endDate = this.startDate.buildNextDate();
  } else {
    var newDay = new Date();
    var year = newDay.getFullYear(),
        month = newDay.getMonth(),
        date = newDay.getDate();
    this.startDate = new MyDate(year, month+1, date);
    this.endDate = this.startDate.buildNextDate();
  }

  if (this.startDate !== null && this.endDate !== null) {
    this.duringDays = this.startDate.getDaysFrom(this.endDate);
  }

  this.calendars[0] = new Calendar({id: 1, year: year, month: month, date: date});

  for (var i = 1; i < this.count; i++) {
    this.calendars[i] = this.calendars[i-1].buildNextMonth();
  }

  this.getAllDateTd();
  this.getMaxTd();
  this.render();
  this.listen();
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
    if (tdBox.innerHTML !== '' && !_.hasClass(tdBox, 'oldDate')) {
      this.availableTd.push(tdBox);
    }
  }
};

App.prototype.getMaxTd = function() {
  if (!this.maxDate) return;

  var valid = this.availableTd.splice(this.maxDate);
  valid.forEach(function(td) {
    _.addClass(td, 'oldDate');
  });
};

/*
App.prototype.getAvailableDateTd = function() {
  for (var i = 0, len = this.td.length; i < len; i++) {
    if (this.td[i].innerHTML !== '' && !_.hasClass(this.td[i], 'oldDate')) {
      this.availableTd.push(this.td[i]);
    }
  }
};
*/

App.prototype.render = function() {
  if (this.startDate) var startDateText = this.startDate.toString();
  if (this.endDate) var endDateText = this.endDate.toString();

  for (var i = 0, len = this.availableTd.length; i < len; i++) {
    var price = this.availableTd[i].getAttribute('data-price');
    if (startDateText === this.availableTd[i].getAttribute('data-date')) {
      //this.availableTd[i].innerHTML = parseInt(this.startDate.date) + '<p>\u5165\u4f4f</p>';
      this.availableTd[i].innerHTML = '\u5165\u4f4f' + '<p>￥' + price + '</p>';
      if (!price) this.availableTd[i].innerHTML = '\u5165\u4f4f';
    }
    if (endDateText === this.availableTd[i].getAttribute('data-date')) {
      //this.availableTd[i].innerHTML = parseInt(this.endDate.date) + '<p>\u79bb\u5e97</p>';
      this.availableTd[i].innerHTML = '\u79bb\u5e97' + '<p>￥' + price + '</p>';
      if (!price) this.availableTd[i].innerHTML = '\u79bb\u5e97';
    }
    // weekend css
    var thisDate = new MyDate();
    thisDate.updateDateFromElement(this.availableTd[i]);
    if (thisDate.day === 0 || thisDate.day === 6) {
      _.addClass(this.availableTd[i], 'weekend');
    }
  }

  var dateInfoBox = document.getElementsByClassName('date-info')[0];
  dateInfoBox.innerHTML = startDateText + '\u5165\u4f4f';
  if (this.endDate !== null) {
    dateInfoBox.innerHTML += ',\u5171 <strong>' + this.duringDays + '</strong> \u665a';
  }

  this.renderChooseDate();

  //var dateBox = document.querySelector('.dateBox');
  //dateBox.innerHTML = '<p>' + startDateText + '(入住)</p><p>' + endDateText + '(离店)</p>';
};

App.prototype.renderChooseDate = function() {
  if (!this.startDate || !this.endDate) return;

  var self = this;
  this.chooseTd = [];

  this.availableTd.forEach(function(td) {
    var newDate = new MyDate();
    newDate.updateDateFromElement(td);

    if (newDate.isAfter(self.startDate) && self.endDate.isAfter(newDate)) {
      self.chooseTd.push(td);
      _.addClass(td, 'availableDate');
    }
  })
};

// price data format 1: {'default': 256, '2015-01-31': 378, '2015-02-24': 745};
App.prototype.renderPrice = function(data) {
  var self = this;

  var dateString = '';
  var price = 0;

  this.availableTd.forEach(function(td) {
    price = data['default'];
    dateString = td.getAttribute('data-date');
    if (data[dateString] !== undefined) price = data[dateString];
    td.innerHTML = self.getDateFromDataRole(td) + '<p>￥' + price + '</p>';
    _.attr(td, 'data-price', price);
  });
};

// price data format 2: array from today [123, 234, 345, 456, 567, 678, 789, 890, 012]
App.prototype.renderPrice1 = function(data) {
  var self = this;

  var price = 0;

  this.availableTd.forEach(function(td, index) {
    price = parseInt(data[index]);
    if (!price) {
      td.innerHTML = self.getDateFromDataRole(td);
    } else {
      td.innerHTML = self.getDateFromDataRole(td) + '<p>￥' + price + '</p>';
      _.attr(td, 'data-price', price);
    }
  });
};

App.prototype.countTotalPrice = function() {
  var self = this;

  var totalPrice = 0;

  for (var i = 0, len = this.chooseTd.length; i < len - 1; i++) {
    totalPrice += _.attr(this.chooseTd[i], 'data-price') * 1;
  }

  return totalPrice;
};

App.prototype.getDateFromDataRole = function(element) {
  return parseInt(element.getAttribute('data-date').substr(8, 2));
};

App.prototype.returnInitState = function() {
  var self = this;

  var price = 0;
  for (var i = 0, len = self.availableTd.length; i < len; i++) {
    //self.availableTd[i].innerHTML = self.getDateFromDataRole(self.availableTd[i]);

    price = self.availableTd[i].getAttribute('data-price');
    self.availableTd[i].innerHTML = self.getDateFromDataRole(self.availableTd[i]) +
        '<p>￥' + price + '</p>';
    if (!price) self.availableTd[i].innerHTML = self.getDateFromDataRole(self.availableTd[i]);

    if (_.hasClass(self.availableTd[i], 'availableDate')) {
      _.removeClass(self.availableTd[i], 'availableDate');
    }

    if (_.hasClass(self.availableTd[i], 'active')) {
      _.removeClass(self.availableTd[i], 'active');
    }
  }
};

App.prototype.listen = function() {
  var self = this;

  for (var i = 0, len = this.availableTd.length; i < len; i++) {
    this.availableTd[i].addEventListener('click', function(event) {
      self.cancel = !0;
      self.returnInitState();
      _.addClass(this, 'active');
      self.checkInAndOut(this);
      self.render();
    });
  }

  var dateBox = document.querySelector('.dateBox');
  var page = document.querySelector('.page');
  _.addClass(page, 'downAnimation');
  //_.hide(page);

  dateBox.onclick = function(event) {
    self.returnInitState();
    self.render()
    self.cancel = !1;
    self.oldStartDate = self.startDate;
    self.oldEndDate = self.endDate;
    _.show(page);
    setTimeout(function() {
      _.removeClass(page, 'downAnimation')
      _.addClass(page, 'upAnimation');
    }, 100);

    self.handle('dateBoxTouch');
  };

  var confirmBtn = document.querySelector('.confirm-btn');
  confirmBtn.onclick = function(event) {
    if (self.endDate === null) {
      var errorInfo = document.querySelector('.calendar-err');
      errorInfo.innerHTML = '\u4eb2\uff01\u60a8\u8fd8\u672a\u9009\u62e9\u79bb\u5e97\u65e5\u671f';
      _.addClass(errorInfo, 'show');
      setTimeout(function() {
        _.removeClass(errorInfo, 'show');
      }, 1200);
      return;
      //return alert('\u4eb2\uff01\u60a8\u8fd8\u672a\u9009\u62e9\u79bb\u5e97\u65e5\u671f');
    }

    self.handle('confirm');
  };

  var cancelBtn = document.querySelector('.cancel-btn');
  cancelBtn.onclick = function(event) {
    if (self.cancel) {
      self.startDate = self.oldStartDate;
      self.endDate = self.oldEndDate;
    }

    self.handle('cancel');
  };
};

App.prototype.checkInAndOut = function(element) {
  var self = this;

  //_.addClass(element, 'active');
  var newDate = new MyDate();
  newDate.updateDateFromElement(element);

  if (self.startDate === null || (self.startDate !== null && self.endDate !== null)) {
    self.endDate = null;
    self.startDate = newDate;
  } else {
    if (newDate.isAfter(self.startDate) && !newDate.equal(self.startDate)) {
      self.endDate = newDate;
      self.duringDays = self.endDate.getDaysFrom(self.startDate);
    } else {
      self.endDate = null;
      self.startDate = newDate;
    }
  }
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
  this.createDOMTree('calendar');

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
  this.renderValidTd();
  this.renderOldDate();
  this.removeValidTr();
};

Calendar.prototype.renderDateBox = function () {
  var self = this;

  for (var i = 0; i < this.td.length; i++) {
    this.td[i].innerHTML = '';
    _.removeClass(this.td[i], 'active');
  }

  var firstDay = this.firstDay;
  for (var j = 0, len = this.monthDays; j < len; j++) {
    var tdBox = this.td[j + firstDay];

    var month = (this.month+1 < 10) ? ('0' + (this.month+1)) : this.month+1;
    var day = (j+1 < 10) ? ('0' + (j+1)) : j+1;
    tdBox.innerHTML = j + 1;
    tdBox.setAttribute('data-date', this.year + '-' + month + '-' + day);

    if (j+1 === this.date && !_.hasClass(tdBox, 'active')) {
      tdBox.innerHTML = '\u4eca\u5929';
    }
  }
};

Calendar.prototype.renderValidTd = function() {
  for (var i = 0; i < 42; i++) {
    if (this.td[i].innerHTML === '') {
      _.addClass(this.td[i], 'null');
    }
  }
};

Calendar.prototype.renderOldDate = function() {
  if (!this.date) return;

  for (var i = 0; i < 42; i++) {
    if (i + 1 >= this.date) break;
    _.addClass(this.td[i + this.firstDay], 'oldDate');
  }
};

Calendar.prototype.removeValidTr = function() {
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
  
  this.day = 0;
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
  this.day = newDate.getDay();
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

  if (date > monthDays) {
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
