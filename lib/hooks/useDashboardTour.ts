import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const useDashboardTour = () => {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: 'Welcome to FormBotz! 🤖',
            description: 'Let me show you around your dashboard and all its features.',
          }
        },
        {
          element: '[data-tour="stats"]',
          popover: {
            title: 'Dashboard Overview',
            description: 'Track your key metrics: total forms, submissions, completion rates, and active form actions.',
            side: 'bottom'
          }
        },
        {
          element: '[data-tour="nav-dashboard"]',
          popover: {
            title: 'Dashboard',
            description: 'You can return to this overview page at any time by clicking here.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="nav-my-forms"]',
          popover: {
            title: 'My Forms',
            description: 'View and manage all your forms in one place with advanced filtering and search.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="recent-forms"]',
          popover: {
            title: 'Recent Forms Panel',
            description: 'Quick access to your 5 most recently updated forms.',
            side: 'left'
          }
        },
        {
          element: '[data-tour="view-all-forms"]',
          popover: {
            title: 'View All Forms',
            description: 'Click this button to see all your forms - same destination as the "My Forms" navigation link.',
            side: 'left'
          }
        },
        {
          element: '[data-tour="form-actions"]',
          popover: {
            title: 'Form Action Buttons',
            description: 'Quick actions for each form: Edit, View Live, and View Submissions.',
            side: 'left'
          }
        },
        {
          element: '[data-tour="form-edit-btn"]',
          popover: {
            title: 'Edit Button',
            description: 'Opens the form builder to edit steps, add conditional logic, and configure settings.',
            side: 'left'
          }
        },
        {
          element: '[data-tour="form-view-btn"]',
          popover: {
            title: 'View Live Button',
            description: 'Opens your published form in a new tab so you can see how users experience it.',
            side: 'left'
          }
        },
        {
          element: '[data-tour="form-submissions-btn"]',
          popover: {
            title: 'Submissions Button',
            description: 'View all submissions for this specific form with export options (CSV/JSON).',
            side: 'left'
          }
        },
        {
          element: '[data-tour="recent-submissions"]',
          popover: {
            title: 'Recent Submissions Panel',
            description: 'See the latest responses from all your forms in one place.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="submission-actions"]',
          popover: {
            title: 'Submission Action Buttons',
            description: 'View submission details or see all submissions for that form.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="submission-view-btn"]',
          popover: {
            title: 'View Details Button',
            description: 'Opens a modal showing the collected data for this submission.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="submission-all-btn"]',
          popover: {
            title: 'All Submissions Button',
            description: 'View all submissions for this specific form.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="nav-create-form"]',
          popover: {
            title: 'Create Form',
            description: 'Click here to create your first conversational form with our step-by-step builder.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="nav-actions"]',
          popover: {
            title: 'Form Actions',
            description: 'Once you have a form collecting data, create actions to automatically send submissions via Email or API webhook.',
            side: 'right'
          }
        },
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
      }
    });

    driverObj.drive();
  };

  return { startTour };
};
