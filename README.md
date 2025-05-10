# Habit Tracker Application

A modern JavaScript application for tracking daily habits, built with ES6+ features, local storage persistence, and unit-tested with Jest.

##  Features

- Add, edit, and remove habits
- Track daily completion and streaks
- Persist data using `localStorage`
- Visualize completion rates and statistics
- Responsive design for mobile and desktop
- Unit tested with **Jest**


##  Technologies Used

- **ES6+ JavaScript** (arrow functions, template literals, spread/rest operators, destructuring)
- **ES6 Modules** (import/export)
- **Modern Array Methods** (`map`, `filter`, `reduce`)
- **Local Storage API**
- **Jest** for Unit Testing
- **CSS Grid** and **Flexbox** for layout


##  Project Structure

habit-tracker/
├── index.html
├── js/
│ ├── main.js
│ ├── habitTracker.js
│ ├── storage.js
│ └── ui.js
├── tests/
│ └── habit.test.js
├── babel.config.js
└── package.json

### Core Functionality

The app allows users to:

- Create habits with a name, category, goal, and frequency
- Mark habits as complete for the current day
- Automatically track and update streaks
- View statistics about habit completion trends

##  ES6+ Features Used

- **Arrow Functions**: Cleaner function expressions
- **Template Literals**: Used for dynamic HTML generation
- **Spread/Rest Operators**: For immutable updates
- **Destructuring**: Clean variable assignments
- **Array Methods**: `map`, `filter`, `reduce` for transformation


## Local Storage

- Habits are saved in `localStorage` in structured JSON format
- The app detects date changes and updates streaks accordingly

##  Testing Strategy

Unit tests cover:

- Habit addition and removal
- Streak calculation logic
- `localStorage` read/write
- Day change handling
