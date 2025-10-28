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
            title: 'Dashboard Stats',
            description: 'Track your forms, submissions, and completion rates here.',
          }
        },
        {
          element: '[data-tour="recent-forms"]',
          popover: {
            title: 'Recent Forms',
            description: 'Quick access to your latest forms with edit and view options.',
          }
        },
        {
          element: '[data-tour="recent-submissions"]',
          popover: {
            title: 'Recent Submissions',
            description: 'See the latest responses from your forms.',
          }
        },
        {
          element: '[data-tour="sidebar"]',
          popover: {
            title: 'Navigation',
            description: 'Access all features: Dashboard, Forms, Create Form, Actions, and Profile.',
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
