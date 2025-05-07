import * as habitTracker from './habitTracker.js';

// DOM Elements
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


export const initUI = () => {
  
  renderHabits();
  updateStats();
  updateProgressBar(); 
  
  
  habitForm.addEventListener('submit', handleAddHabit);
  filterCategory.addEventListener('change', handleFilterChange);
  closeModalBtn.addEventListener('click', closeEditModal);
  editHabitForm.addEventListener('submit', handleEditHabit);
  
  
  window.addEventListener('click', (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });
};


const handleAddHabit = (e) => {
  e.preventDefault();
  
  const nameInput = document.getElementById('habit-name');
  const categoryInput = document.getElementById('habit-category');
  const goalInput = document.getElementById('habit-goal');
  
  const name = nameInput.value;
  const category = categoryInput.value;
  const goal = goalInput.value;
  
  if (!name || !category || !goal) {
    alert('Please fill all fields');
    return;
  }
  
  habitTracker.createHabit(name, category, goal);
  
 
  nameInput.value = '';
  categoryInput.value = '';
  goalInput.value = '';
  
  
  renderHabits();
  updateStats();
  updateProgressBar(); 
};


const handleFilterChange = () => {
  renderHabits();
};


export const renderHabits = () => {
  const category = filterCategory.value;
  const habits = habitTracker.filterHabitsByCategory(category);
  
  if (habits.length === 0) {
    habitsList.innerHTML = `
      <div class="habits-empty">
        <i class="fas fa-tasks"></i>
        <p>No habits ${category !== 'all' ? `in ${category} category` : ''} yet. Start by adding a new habit!</p>
      </div>
    `;
    return;
  }
  
  habitsList.innerHTML = '';
  
  habits.forEach(habit => {
    const isCompletedToday = habitTracker.isCompletedToday(habit);
    const habitElement = document.createElement('div');
    habitElement.className = `habit-item ${isCompletedToday ? 'completed' : ''}`;
    habitElement.dataset.id = habit.id;
    
    habitElement.innerHTML = `
      <div class="habit-info">
        <div class="habit-name">${habit.name}</div>
        <div class="habit-category">${habit.category} · Goal: ${habit.goal}</div>
      </div>
      <div class="streak-counter">
        <i class="fas fa-fire"></i>
        <span>${habit.currentStreak || 0}</span>
      </div>
      <div class="habit-actions">
        <button class="action-btn complete-btn" title="Mark as Complete">
          <i class="fas ${isCompletedToday ? 'fa-check-circle' : 'fa-circle'}"></i>
        </button>
        <button class="action-btn edit-btn" title="Edit Habit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" title="Delete Habit">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    
    const completeBtn = habitElement.querySelector('.complete-btn');
    const editBtn = habitElement.querySelector('.edit-btn');
    const deleteBtn = habitElement.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => handleCompleteHabit(habit.id));
    editBtn.addEventListener('click', () => openEditModal(habit));
    deleteBtn.addEventListener('click', () => handleDeleteHabit(habit.id));
    
    habitsList.appendChild(habitElement);
  });
};


const handleCompleteHabit = (id) => {
  habitTracker.completeHabit(id);
  renderHabits();
  updateStats();
  updateProgressBar(); 
};


const handleDeleteHabit = (id) => {
  if (confirm('Are you sure you want to delete this habit?')) {
    habitTracker.deleteHabit(id);
    renderHabits();
    updateStats();
    updateProgressBar(); 
  }
};


const openEditModal = (habit) => {
  document.getElementById('edit-habit-id').value = habit.id;
  document.getElementById('edit-habit-name').value = habit.name;
  document.getElementById('edit-habit-category').value = habit.category;
  document.getElementById('edit-habit-goal').value = habit.goal;
  
  editModal.style.display = 'flex';
};


const closeEditModal = () => {
  editModal.style.display = 'none';
};


const handleEditHabit = (e) => {
  e.preventDefault();
  
  const id = document.getElementById('edit-habit-id').value;
  const name = document.getElementById('edit-habit-name').value;
  const category = document.getElementById('edit-habit-category').value;
  const goal = document.getElementById('edit-habit-goal').value;
  
  if (!name || !category || !goal) {
    alert('Please fill all fields');
    return;
  }
  
  habitTracker.updateHabit(id, { name, category, goal });
  
  closeEditModal();
  renderHabits();
  updateStats();
  updateProgressBar(); 
};


const updateStats = () => {
  const stats = habitTracker.getStats();
  
  totalHabitsElement.textContent = stats.total;
  completedTodayElement.textContent = stats.completedToday;
  bestStreakElement.textContent = stats.bestStreak;
  missedDaysElement.textContent = stats.missedDays || 0; 
};


const updateProgressBar = () => {
  const stats = habitTracker.getStats();
  const totalHabits = stats.total;
  const completedHabits = stats.completedToday;
  
  
  completedCountElement.textContent = completedHabits;
  totalCountElement.textContent = totalHabits;
  
  
  const progressPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  progressBarElement.style.width = `${progressPercentage}%`;
};