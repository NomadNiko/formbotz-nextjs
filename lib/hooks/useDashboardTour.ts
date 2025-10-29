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
            description: 'Let me show you around your dashboard.',
          }
        },
        {
          element: '[data-tour="stats"]',
          popover: {
            title: 'Dashboard Overview',
            description: 'Track your key metrics: forms, submissions, and completion rates.',
            side: 'bottom'
          }
        },
        {
          element: '[data-tour="nav-my-forms"]',
          popover: {
            title: 'My Forms',
            description: 'View and manage all your forms.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="recent-forms"]',
          popover: {
            title: 'Recent Forms',
            description: 'Quick access to your recently updated forms with Edit, View Live, and Submissions actions.',
            side: 'left'
          }
        },
        {
          element: '[data-tour="recent-submissions"]',
          popover: {
            title: 'Recent Submissions',
            description: 'See the latest responses from all your forms.',
            side: 'right'
          }
        },
        {
          element: '[data-tour="nav-create-form"]',
          popover: {
            title: 'Create Form',
            description: 'Start building your first conversational form.',
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
