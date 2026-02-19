// --- Year Planner Calendar Rendering ---
function renderYearPlannerCalendar(selectedDate) {
  const calendarContainer = document.getElementById('calendarContainer');
  if (!calendarContainer) return;
  const now = new Date();
  const year = now.getFullYear();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  let html = '';
  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    html += `<div class="calendar-month"><div class="calendar-month-header">${months[m]} ${year}</div><div class="calendar-grid">`;
    // Weekday headers
    for (let d = 0; d < 7; d++) {
      html += `<div class="calendar-day calendar-header">${['S','M','T','W','T','F','S'][d]}</div>`;
    }
    // Empty days before first
    for (let d = 0; d < firstDay.getDay(); d++) {
      html += `<div class="calendar-day other-month"></div>`;
    }
    // Days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateObj = new Date(year, m, d);
      const iso = dateObj.toISOString().slice(0, 10);
      let classes = 'calendar-day';
      if (iso === selectedDate) classes += ' selected';
      if (iso === now.toISOString().slice(0, 10)) classes += ' today';
      // Mark days with scheduled tasks
      let dot = '';
      if (state.scheduledTasks && state.scheduledTasks[iso] && state.scheduledTasks[iso].length > 0) {
        classes += ' has-tasks';
        // Add a small dot for future dates with tasks
        if (dateObj > now) {
          dot = '<span class="calendar-task-dot"></span>';
        }
      }
      html += `<div class="${classes}" data-date="${iso}">${d}${dot}</div>`;
    }
    // Fill out last week
    const lastDayOfWeek = lastDay.getDay();
    if (lastDayOfWeek < 6) {
      for (let d = lastDayOfWeek + 1; d <= 6; d++) {
        html += `<div class="calendar-day other-month"></div>`;
      }
    }
    html += '</div></div>';
  }
  calendarContainer.innerHTML = html;
}
const STORAGE_KEY = 'improvement_dashboard_v2';

// Fallback for localStorage when not available (file:// protocol)
const storage = typeof localStorage !== 'undefined' ? localStorage : (() => {
  const memoryStore = {};
  return {
    getItem: (key) => memoryStore[key] || null,
    setItem: (key, value) => { memoryStore[key] = value; },
    removeItem: (key) => { delete memoryStore[key]; },
    clear: () => { Object.keys(memoryStore).forEach(key => delete memoryStore[key]); }
  };
})();

const DEFAULT_GOALS = [
  {
    id: 'health',
    icon: '💚',
    title: 'Health',
    label: 'DAILY HABITS',
    description: 'Build healthy routines every day',
    tasks: [
      { id: 1, title: 'Quality Sleep', description: 'Sleep 7-8 hours tonight', done: false },
      { id: 2, title: 'Exercise', description: '30+ minutes of physical activity', done: false },
      { id: 3, title: 'Hydration', description: 'Drink 8 glasses of water (2+ liters)', done: false },
      { id: 4, title: 'Healthy Eating', description: '3 nutritious meals with fruits/vegetables', done: false },
      { id: 5, title: 'Stretching/Mobility', description: '10 minutes of stretching or yoga', done: false },
      { id: 21, title: 'Walk 7,000–10,000 steps', description: 'Aim for 7,000–10,000 steps today', done: false }
    ]
  },
  
  {
    id: 'pm-skills',
    icon: '🚀',
    title: 'Skills Improvement',
    label: 'DAILY HABITS',
    description: 'Complete daily to build mastery',
    tasks: [
      { id: 22, title: '20–30 minutes learning', description: 'Course, reading, or hands-on practice for 20–30 minutes', done: false },
      { id: 23, title: 'Improve one technical skill', description: 'Work on a product management skill — e.g., roadmapping, user research', done: false },
      { id: 24, title: 'Improve one soft skill', description: 'Practice communication, leadership, or collaboration', done: false },
      { id: 25, title: 'Apply something new you learned', description: 'Use a new idea or technique in a task or project', done: false },
      { id: 26, title: 'Read one industry article', description: 'Read an article related to your industry and note key takeaways', done: false },
      { id: 27, title: 'Review and improve previous work', description: 'Revisit recent work and make one improvement', done: false }
    ]
  },
  {
    id: 'mental-wellbeing',
    icon: '🧘',
    title: 'Mental Wellbeing',
    label: 'DAILY HABITS',
    description: 'Nurture your mind every day',
    tasks: [
      { id: 11, title: 'Mindfulness Practice', description: '10 minutes of meditation or breathing', done: false },
      { id: 12, title: 'Gratitude Journaling', description: 'Write 3 things you\'re grateful for', done: false },
      { id: 15, title: 'Social Connection', description: 'Meaningful conversation with someone', done: false },
      { id: 28, title: 'Limit social media time', description: 'Set and follow a daily limit for social media use', done: false },
      { id: 29, title: 'No phone during meals', description: 'Avoid phone use during breakfast/lunch/dinner', done: false },
      { id: 30, title: 'Stop one bad habit', description: 'Choose one habit to stop and maintain consistency in not doing it', done: false }
    ]
  },
  {
    id: 'balance-lifestyle',
    icon: '⚖️',
    title: 'Balance & Lifestyle Quality',
    label: 'WELLBEING',
    description: 'Small actions to boost daily balance, joy, and resilience',
    tasks: [
      { id: 31, title: 'Laugh at least once', description: 'Find something that makes you laugh today', done: false },
      { id: 32, title: 'Engage in a hobby', description: 'Spend time on a hobby you enjoy', done: false },
      { id: 33, title: 'Spend time outdoors', description: 'Get outside for fresh air or a short walk', done: false },
      { id: 34, title: 'Listen to music you enjoy', description: 'Play music that lifts your mood', done: false },
      { id: 35, title: 'Do something spontaneous or fun', description: 'Do a small, unplanned fun activity', done: false },
      { id: 36, title: 'Try something new (small)', description: 'Try a small new experience or habit', done: false },
      { id: 37, title: 'Connect with nature', description: 'Sunlight, plants, or a nature walk', done: false },
      { id: 38, title: 'Avoid negative/unproductive content', description: 'Limit consumption of negative or unhelpful media', done: false }
    ]
  },
  {
    id: 'financial-health',
    icon: '💰',
    title: 'Financial Health (Monthly)',
    type: 'metrics',
    description: 'Monthly snapshot: fill the values and set a focus for next month',
    metrics: [
      { id: 'total-income', label: 'Total Income', value: 0, unit: '₹', subtitle: '' },
      { id: 'total-expenses', label: 'Total Expenses', value: 0, unit: '₹', subtitle: 'Within Budget? Yes / No' },
      { id: 'saved-invested', label: 'Saved / Invested', value: 0, unit: '₹', subtitle: '___ % of income' },
      { id: 'emergency-fund', label: 'Emergency Fund Balance', value: 0, unit: '₹', subtitle: '' }
    ],
    tasks: [
      { id: 40, title: 'One Financial Improvement Goal for Next Month', description: '', done: false }
    ]
  },
  
  {
    id: 'todays-tasks',
    icon: '✅',
    title: 'Scheduled Task for Today',
    label: 'RESETS DAILY',
    description: 'Track your specific daily to-dos and priorities',
    type: 'todos',
    tasks: []
  }
];

// Initialize state with scheduledTasks storage
let state = loadData();

// Temporary storage used when viewing a specific planner date to avoid persisting
// scheduled tasks into the permanent `todays-tasks` goal until the user saves.
let _plannerTempTodayTasks = null;

// ...existing code...
