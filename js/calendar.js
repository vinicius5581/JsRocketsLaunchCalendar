function Calendar(day, month, year, wrap) {
  const dateNow = new Date();
  this.year = year || dateNow.getFullYear();
  this.month = month || dateNow.getMonth();
  this.day = day || dateNow.getDate();
  this.renderInit();
  // this.updateMonth(this.month, this.year);
  this.updateMonth(this.month, this.year);
};

Calendar.prototype.renderInit = function() {
  const self = this;
  const el = document.getElementById('calendar');

  if (!this.hasDom) {
    el.innerHTML = this.getMainTemplate();
    this.hasDom = true;
  }

  el.addEventListener('click', (e) => {
    const eventSource = e.target.id;
    if (eventSource === 'next') {
      if (this.month === 11) {
        this.month = 0;
        this.year = this.year + 1;
      } else {
        this.month++;
      }
    }
    if (eventSource === 'prev') {
      if (this.month === 0) {
        this.month = 11;
        this.year--;
      } else {
        this.month--;
      }
    }
    this.updateMonth(this.month, this.year);
  })
}

Calendar.prototype.getMainTemplate =  function() {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let weekDaysLabelsHtml = '';

  for (let i = 0; i < weekDays.length; i++) {
    weekDaysLabelsHtml += `<div>${weekDays[i]}</div>`
  }

  const mainTemplate = `
    <div id="calendar">
      <header>
        <div>
          <button class="left button" id="prev"> &lang; </button>
          <h2 class="month-year" id="calendar-label">Month - Year</h2>
          <button class="right button" id="next"> &rang; </button>
        </div>
        <div id="calendar-weekdays-labels">${weekDaysLabelsHtml}</div>
      </header>
      <main id="calendar-body">
        Loading...
      </main>
    </div>
  `;
  return mainTemplate;
}

Calendar.prototype.fetchMonthEvents = () => {
  var monthEvents = [];
  fetch('https://launchlibrary.net/1.2/launch/2017-08-03/2017-09-03')
    .then(function(data) {
      return data.json();
    })
    .then((data) => {
      monthEvents = data.launches;
      return monthEvents;
    })

}

Calendar.prototype.updateMonth = function(month, year) {
  const currentMonth = month + 1;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December'];
  const febDays = ((year%100!=0) && (year%4==0) || (year%400==0)) ? 28 : 29;
  const daysInMonth = [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const currentMonthDays = daysInMonth[month];
  const currentMonthFirstWeekday = new Date(`${currentMonth} 1 ${year}`).getDay();
  let previousMonthDays = daysInMonth[month - 1];

  const titleHtml = `${months[month]} - ${year}`;
  let calendarDaysHtml = '';

  if (currentMonth === 1) {
    previousMonthDays = daysInMonth[11];
  }

  let weekDaysQty = 7;
  let count = 0;

  calendarDaysHtml = `<div class="week">`;


  for (let i = 0; i < currentMonthFirstWeekday; i++) {
    count++;
    var diff = currentMonthFirstWeekday - i - 1;
    calendarDaysHtml += `<div class="previousMonthDay">${previousMonthDays - diff}</div>`;
  }


  for (let i = 0; i < currentMonthDays; i++) {
    count++;
    calendarDaysHtml += `<div class="currentMonthDay">${i+1}</div>`;
    if (count % 7 === 0){
      calendarDaysHtml += `
        </div>
        <div class="week">
      `;
    }
  }

  calendarDaysHtml += `</div>`;

  var calTitle = document.getElementById('calendar-label');
  var calBody = document.getElementById('calendar-body');


  calTitle.innerHTML = titleHtml;
  calBody.innerHTML = calendarDaysHtml;
  this.fetchMonthEvents();
  console.log(this.fetchMonthEvents());

}


var calendar = new Calendar();


// console.log(calendar.year);
// console.log(calendar.month);
// console.log(calendar.day);
// console.log(calendar.renderMonth());
// console.log(calendar.year);
// console.log(calendar.renderMonth());
// console.log(calendar.year);
