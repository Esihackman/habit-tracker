import * as habitTracker from './habitTracker.js';

const habitForm = document.getElementById('habit-form');
const habitsList = document.getElementById('habits-list');
const filterCategory = document.getElementById('filter-category');
const editModal = document.getElementById('edit-modal');
const closeModalBtn = document.querySelector('.close-modal');
const editHabitForm = document.getElementById('edit-habit-form');
const totalHabitsElement = document.getElementById('total-habits');
const completedTodayElement = document.getElementById('completed-today');
const bestStreakElement = document.getElementById('best-streak');
const missedDaysElement = document.getElementById('missed-days');
const progressBarElement = document.getElementById('progress-bar');
const completedCountElement = document.getElementById('completed-count');
const totalCountElement = document.getElementById('total-count');
const calendarModal = document.getElementById('calendar-modal');
const datePicker = document.getElementById('date-picker');
const selectedDateDisplay = document.getElementById('selected-date-display');

export const initUI = () => {
  renderHabits();
  updateStats();
  updateProgressBar();
  initDatePicker();
  initDaySelectors();
  setupEventListeners();
};

const setupEventListeners = () => {
  habitForm.addEventListener('submit', handleAddHabit);
  filterCategory.addEventListener('change', handleFilterChange);
  closeModalBtn.addEventListener('click', closeEditModal);
  editHabitForm.addEventListener('submit', handleEditHabit);
  
  window.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
    if (e.target === calendarModal) closeCalendarModal();
  });
};

const initDatePicker = () => {
  flatpickr(datePicker, {
    defaultDate: "today",
    onChange: function(_selectedDates, dateStr) {
      updateDateDisplay(dateStr);
      renderHabits();
      updateStats();
      updateProgressBar();
    }
  });
  
  updateDateDisplay(new Date().toISOString().split('T')[0]);
};

const updateDateDisplay = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    selectedDateDisplay.textContent = "Today's";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    selectedDateDisplay.textContent = "Tomorrow's";
  } else {
    selectedDateDisplay.textContent = `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })}'s`;
  }
};

const initDaySelectors = () => {
  const dayButtons = document.querySelectorAll('.day-btn');
  
  dayButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      
      // Determine which form the day selector belongs to
      const form = this.closest('form');
      if (form) {
        const selectedDaysInput = form.querySelector('[id$="selected-days"]');
        if (selectedDaysInput) {
          updateSelectedDaysInput(selectedDaysInput.id);
        }
      }
    });
  });
};

const updateSelectedDaysInput = (inputId = 'selected-days') => {
  const formSelector = inputId === 'edit-selected-days' ? '#edit-habit-form' : '#habit-form';
  const activeButtons = document.querySelectorAll(`${formSelector} .day-btn.active`);
  const selectedDays = Array.from(activeButtons).map(btn => btn.dataset.day);
  document.getElementById(inputId).value = selectedDays.join(',');
};

const handleAddHabit = (e) => {
  e.preventDefault();
  
  const name = document.getElementById('habit-name').value.trim();
  const category = document.getElementById('habit-category').value;
  const goal = document.getElementById('habit-goal').value.trim();
  
  const selectedDays = document.getElementById('selected-days').value
    .split(',')
    .filter(Boolean)
    .map(Number);
  
  if (!name || !category || !goal) {
    alert('Please fill all fields');
    return;
  }
  
  if (selectedDays.length === 0) {
    alert('Please select at least one day of the week');
    return;
  }
  
  habitTracker.createHabit(name, category, goal, selectedDays);
  resetHabitForm();
  
  renderHabits();
  updateStats();
  updateProgressBar();
};

const resetHabitForm = () => {
  document.getElementById('habit-name').value = '';
  document.getElementById('habit-category').value = '';
  document.getElementById('habit-goal').value = '';
  document.querySelectorAll('#habit-form .day-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('selected-days').value = '';
};

const handleFilterChange = () => {
  renderHabits();
};

export const renderHabits = () => {
  const category = filterCategory.value;
  const selectedDate = datePicker._flatpickr ? 
    datePicker._flatpickr.selectedDates[0] || new Date() : new Date();
  const dayOfWeek = selectedDate.getDay();
  
  const habits = habitTracker.getHabitsForDay(dayOfWeek, category);
  
  if (habits.length === 0) {
    showEmptyState(category);
    return;
  }
  
  habitsList.innerHTML = '';
  habits.forEach(habit => renderHabitItem(habit, selectedDate));
};

const showEmptyState = (category) => {
  habitsList.innerHTML = `
    <div class="habits-empty">
      <i class="fas fa-tasks"></i>
      <p>No habits ${category !== 'all' ? `in ${category} category` : ''} scheduled for this day.</p>
    </div>
  `;
};

const renderHabitItem = (habit, selectedDate) => {
  const isCompleted = habitTracker.isCompletedOnDate(habit.id, selectedDate);
  const scheduledDays = formatDaysDisplay(habit.days);
  
  const habitElement = document.createElement('div');
  habitElement.className = `habit-item ${isCompleted ? 'completed' : ''}`;
  habitElement.dataset.id = habit.id;
  
  habitElement.innerHTML = `
    <div class="habit-info">
      <div class="habit-name">${habit.name}</div>
      <div class="habit-meta">
        <span class="habit-category">${habit.category}</span>
        <span class="habit-goal">${habit.goal} min</span>
        <span class="habit-days">${scheduledDays}</span>
      </div>
    </div>
    <div class="habit-actions">
      <div class="streak-counter">
        <i class="fas fa-fire"></i>
        <span>${habit.currentStreak || 0}</span>
      </div>
      <button class="action-btn complete-btn" title="${isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}">
        <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i>
      </button>
      <button class="action-btn edit-btn" title="Edit Habit">
        <i class="fas fa-edit"></i>
      </button>
      <button class="action-btn calendar-btn" title="View Calendar">
        <i class="fas fa-calendar-alt"></i>
      </button>
      <button class="action-btn delete-btn" title="Delete Habit">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  const completeBtn = habitElement.querySelector('.complete-btn');
  const editBtn = habitElement.querySelector('.edit-btn');
  const calendarBtn = habitElement.querySelector('.calendar-btn');
  const deleteBtn = habitElement.querySelector('.delete-btn');
  
  completeBtn.addEventListener('click', () => toggleHabitCompletion(habit.id, selectedDate));
  editBtn.addEventListener('click', () => openEditModal(habit));
  calendarBtn.addEventListener('click', () => openCalendarModal(habit));
  deleteBtn.addEventListener('click', () => deleteHabit(habit.id));
  
  habitsList.appendChild(habitElement);
};

const formatDaysDisplay = (days) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(day => daysOfWeek[day]).join(', ');
};

const toggleHabitCompletion = (habitId, date) => {
  habitTracker.toggleHabitCompletion(habitId, date);
  renderHabits();
  updateStats();
  updateProgressBar();
};

const openEditModal = (habit) => {
  document.getElementById('edit-habit-id').value = habit.id;
  document.getElementById('edit-habit-name').value = habit.name;
  document.getElementById('edit-habit-category').value = habit.category;
  document.getElementById('edit-habit-goal').value = habit.goal;
  

  document.querySelectorAll('#edit-habit-form .day-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
 
  document.querySelectorAll('#edit-habit-form .day-btn').forEach(btn => {
    if (habit.days.includes(parseInt(btn.dataset.day))) {
      btn.classList.add('active');
    }
  });
  
  updateSelectedDaysInput('edit-selected-days');
  
  editModal.style.display = 'flex';
};

const closeEditModal = () => {
  editModal.style.display = 'none';
};

const handleEditHabit = (e) => {
  e.preventDefault();
  
  const id = document.getElementById('edit-habit-id').value;
  const name = document.getElementById('edit-habit-name').value.trim();
  const category = document.getElementById('edit-habit-category').value;
  const goal = document.getElementById('edit-habit-goal').value.trim();
  const selectedDays = document.getElementById('edit-selected-days').value.split(',').filter(Boolean).map(Number);
  
  if (!name || !category || !goal) {
    alert('Please fill all fields');
    return;
  }
  
  if (selectedDays.length === 0) {
    alert('Please select at least one day of the week');
    return;
  }
  
  habitTracker.updateHabit(id, { name, category, goal, days: selectedDays });
  
  closeEditModal();
  renderHabits();
  updateStats();
  updateProgressBar();
};

const deleteHabit = (habitId) => {
  if (confirm('Are you sure you want to delete this habit?')) {
    habitTracker.deleteHabit(habitId);
    renderHabits();
    updateStats();
    updateProgressBar();
  }
};

const openCalendarModal = (habit) => {
  const modal = document.getElementById('calendar-modal');
  const calendarEl = document.getElementById('habit-calendar');
  
  
  if (window.habitCalendar) {
    window.habitCalendar.destroy();
  }
  

  const completedDates = habit.completedDates || [];
  
  window.habitCalendar = flatpickr(calendarEl, {
    inline: true,
    mode: "multiple",
    defaultDate: completedDates,
    dateFormat: "Y-m-d",
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      const dateStr = dayElem.dateObj.toISOString().split('T')[0];
      if (completedDates.includes(dateStr)) {
        dayElem.classList.add('completed');
      }
      if (habit.missedDates && habit.missedDates.includes(dateStr)) {
        dayElem.classList.add('missed');
      }
    }
  });
  
  modal.querySelector('.modal-header h2').textContent = `Habit: ${habit.name}`;
  
  document.getElementById('save-calendar').onclick = function() {
    try {
      const selectedDates = window.habitCalendar && window.habitCalendar.selectedDates 
        ? window.habitCalendar.selectedDates.map(date => date.toISOString().split('T')[0])
        : [];
      
      habitTracker.updateHabitDates(habit.id, selectedDates);
      closeCalendarModal();
      renderHabits();
      updateStats();
      updateProgressBar();
    } catch (error) {
      console.error('Error saving calendar dates:', error);
      alert('There was an error saving the dates. Please try again.');
    }
  };
  
  modal.style.display = 'flex';
};

const closeCalendarModal = () => {
  document.getElementById('calendar-modal').style.display = 'none';
  if (window.habitCalendar) {
    window.habitCalendar.destroy();
    window.habitCalendar = null;
  }
};

const updateStats = () => {
  const selectedDate = datePicker._flatpickr ? 
    datePicker._flatpickr.selectedDates[0] || new Date() : new Date();
  
  try {
    const stats = habitTracker.getStats(selectedDate);
    
    totalHabitsElement.textContent = stats.total;
    completedTodayElement.textContent = stats.completedToday;
    bestStreakElement.textContent = stats.bestStreak;
    missedDaysElement.textContent = stats.missedDays || 0;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
};

const updateProgressBar = () => {
  const selectedDate = datePicker._flatpickr ? 
    datePicker._flatpickr.selectedDates[0] || new Date() : new Date();
  
  try {
    const stats = habitTracker.getStats(selectedDate);
    const totalHabits = stats.total;
    const completedHabits = stats.completedToday;
    
    completedCountElement.textContent = completedHabits;
    totalCountElement.textContent = totalHabits;
    
    const progressPercentage = totalHabits > 0 ? 
      Math.round((completedHabits / totalHabits) * 100) : 0;
    progressBarElement.style.width = `${progressPercentage}%`;
  } catch (error) {
    console.error('Error updating progress bar:', error);
    progressBarElement.style.width = '0%';
    completedCountElement.textContent = '0';
    totalCountElement.textContent = '0';
  }
};