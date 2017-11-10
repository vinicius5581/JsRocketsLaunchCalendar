function Calendar(day, month, year, wrap) {
  const dateNow = new Date();
  this.year = year || dateNow.getFullYear();
  this.month = month || dateNow.getMonth();
  this.day = day || dateNow.getDate();
  this.launches = {};
  this.renderInit();
  this.updateMonth(this.month, this.year);
};

Calendar.prototype.renderInit = function() {
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


  el.addEventListener('click', e => {
    if (e.target.id) {
      var launch = this.launches[e.target.id];
      if (launch) {
        window.alert(`
          rocket: ${launch.rocket.name}
          location: ${launch.location.name}
        `)
      }
    }
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

Calendar.prototype.fetchMonthEvents = function(month, year) {
  const startMonth = (month < 10) ? '0' + month : '' + month;
  const endMonth = (month === 12) ? '01' : ((month + 1) < 10) ? '0' + (month + 1) : '' + (month + 1);
  const startYear = year;
  const endYear = (month === 12) ? year + 1 : year;
  const el = document.getElementById('calendar');
  const monthEvents = {};
  const self = this;

  // TODO: memoize fetch result for a given month

  fetch(`https://launchlibrary.net/1.2/launch/${startYear}-${startMonth}-01/${endYear}-${endMonth}-01`)
    .then(data => data.json())
    .then((data) => {
      data.launches.forEach((launch) => {
        const launchDate = new Date(launch.windowstart);
        const launchDay = launchDate.getDate();
        const launchMonth = launchDate.getMonth() + 1;
        const launchYear = launchDate.getFullYear();
        const launchEl = el.querySelector("[data-day='" + launchDay + "'][data-month='" + launchMonth + "'][data-year='" + launchYear + "']");
        if (launchEl) {
            if(!launchEl.className.includes('hasLaunch')){
              launchEl.className += ' hasLaunch';
            }
            const launchElHeader = launchEl.querySelector('header');
            const launchElMain = launchEl.querySelector('main');
            const launchLabel = document.createElement('div');
            const launchLabelText = document.createTextNode(`${launch.name}`);
            launchLabel.setAttribute('id', launch.id);
            launchLabel.setAttribute('class', 'launch');
            launchLabel.appendChild(launchLabelText);
            launchElMain.appendChild(launchLabel);
            this.launches[launch.id] = launch;
        }
      });
    })
    .catch((error) => {
      console.log(error);
    })
}

Calendar.prototype.updateMonth = function(month, year) {
  const el = document.getElementById('calendar');
  const currentMonth = month + 1;
  const nextMonth = (currentMonth === 12) ? 1 : month + 2;
  const nextMonthYear = (currentMonth === 12) ? year + 1 : year;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December'];
  const febDays = ((year%100!=0) && (year%4==0) || (year%400==0)) ? 29 : 28;
  const daysInMonth = [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const currentMonthDays = daysInMonth[month];
  const currentMonthFirstWeekday = new Date(`${currentMonth} 1 ${year}`).getDay();
  const nextMonthFirstWeekday = new Date(`${nextMonth} 1 ${nextMonthYear}`).getDay();


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

  // UI previous months days
  for (let i = 0; i < currentMonthFirstWeekday; i++) {
    count++;
    diff = currentMonthFirstWeekday - i - 1;
    day = previousMonthDays - diff;
    calendarDaysHtml += `
      <div class="previousMonthDay" data-day="${day}">
        ${day}
      </div>
    `;
  }
  // UI current months days
  for (let i = 0; i < currentMonthDays; i++) {
    count++;
    day = (i !== 0 ) ? i + 1 : months[month].substring(0,3) + ' ' + i + 1;

    calendarDaysHtml += `
      <div class="currentMonthDay" data-day="${day}" data-month="${currentMonth}" data-year="${year}">
        <header>${day}</header>
        <main></main>
      </div>
    `;
    // End of Week
    if (count % 7 === 0){
      calendarDaysHtml += `
        </div>
        <div class="week">
      `;
    }
  }
  // UI next months days
  if (nextMonthFirstWeekday !== 0) {
    for (let i = 0; i < 7 - nextMonthFirstWeekday; i++) {
      count++;
      day = i + 1;
      calendarDaysHtml += `
        <div class="nextMonthDay" data-day="${day}" data-month="${currentMonth + 1}" data-year="${year}">
          ${day}
        </div>
      `;
    }
  }
  calendarDaysHtml += `</div>`;
  const calTitle = document.getElementById('calendar-label');
  const calBody = document.getElementById('calendar-body');

  // UI current Month - DOM
  calTitle.innerHTML = titleHtml;
  calBody.innerHTML = calendarDaysHtml;

  // Fetch events for current Month
  this.fetchMonthEvents(currentMonth, year);
}
