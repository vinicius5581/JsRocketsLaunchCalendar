function Calendar(day, month, year, wrap) {
  const dateNow = new Date();
  this.year = year || dateNow.getFullYear();
  this.month = month || dateNow.getMonth();
  this.day = day || dateNow.getDate();
  this.renderInit();
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
      this.updateMonth(this.month, this.year);
    }
    if (eventSource === 'prev') {
      if (this.month === 0) {
        this.month = 11;
        this.year--;
      } else {
        this.month--;
      }
      this.updateMonth(this.month, this.year);
    }
  });
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


Calendar.prototype.fetchMonthEvents = (month, year) => {
  const startMonth = (month < 10) ? '0' + month : '' + month;
  const endMonth = (month === 12) ? '01' : ((month + 1) < 10) ? '0' + (month + 1) : '' + (month + 1);
  const startYear = year;
  const endYear = (month === 12) ? year + 1 : year;
  const el = document.getElementById('calendar');

  fetch(`https://launchlibrary.net/1.2/launch/${startYear}-${startMonth}-01/${endYear}-${endMonth}-01`)
    .then(function(data) {
      return data.json();
    })
    .then((data) => {
      data.launches.forEach((launch) => {
        let launchDay = new Date(launch.windowstart).getDate();
        let launchMonth = new Date(launch.windowstart).getMonth() + 1;
        console.log(launchDay + '/' + launchMonth);
        el.addEventListener('mouseover', (e) => {
          const eventSource = e.target;
          if (eventSource.dataset.day === launchDay && eventSource.dataset.month === launchMonth) {
            console.log('in' + e.target.dataset.day);
            console.log(launch);
          }
        });
        el.addEventListener('mouseout', (e) => {
          const eventSource = e.target;
          if (eventSource.dataset.day === launchDay && eventSource.dataset.month === launchMonth) {
            console.log('out' + e.target.dataset.day);
          }
        });
      });
    })
    .catch((error) => {
      console.log(error);
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
  let count = 0;
  let calendarDaysHtml = '';
  let diff;
  let day;

  if (currentMonth === 1) {
    previousMonthDays = daysInMonth[11];
  }

  calendarDaysHtml = `<div class="week">`;

  for (let i = 0; i < currentMonthFirstWeekday; i++) {
    count++;
    diff = currentMonthFirstWeekday - i - 1;
    day = previousMonthDays - diff;
    calendarDaysHtml += `<div class="previousMonthDay" data-day="${day}">${day}</div>`;
  }

  for (let i = 0; i < currentMonthDays; i++) {
    count++;
    day = i+1;
    calendarDaysHtml += `<div class="currentMonthDay" data-day="${day}" data-month="${currentMonth}">${day}</div>`;
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
  this.fetchMonthEvents(currentMonth, year);

  console.log(this.monthEvents);
}


var calendar = new Calendar();
