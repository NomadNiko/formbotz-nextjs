import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const useFormBuilderTour = () => {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: "Welcome to the Form Builder! 🎯",
            description:
              "Let's build a simple form together. We'll create a form that asks if someone wants to provide their name, then shows different messages based on their answer.",
          },
        },
        {
          element: '[data-tour="add-step-button"]',
          popover: {
            title: "Adding Steps",
            description:
              "Click this button to add steps to your form. Let's start by adding a Yes/No question.",
            side: "right",
          },
        },
        {
          popover: {
            title: "Step 1: Choose Yes/No",
            description:
              "From the menu that appears, select 'Yes/No Question'. This will ask users if they want to provide their name.",
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Edit the Message",
            description:
              "Change the message to: 'Would you like to provide your name?' This is what users will see.",
            side: "left",
          },
        },
        {
          element: '[data-tour="data-collection"]',
          popover: {
            title: "Collect the Response",
            description:
              "Enable 'Collect and store this data' and set the variable name to 'wantsName'. We'll use this to show different steps based on their answer.",
            side: "left",
          },
        },
        {
          element: '[data-tour="add-step-button"]',
          popover: {
            title: "Add Name Input Step",
            description:
              "Now add a 'String Input' step. This will collect the user's name if they said yes.",
            side: "right",
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Ask for Their Name",
            description: "Set the message to: 'Great! What's your name?'",
            side: "left",
          },
        },
        {
          element: '[data-tour="data-collection"]',
          popover: {
            title: "Store the Name",
            description:
              "Enable data collection and set the variable name to 'userName'. We'll use this to personalize the greeting.",
            side: "left",
          },
        },
        {
          element: '[data-tour="conditional-logic"]',
          popover: {
            title: "Add Conditional Logic",
            description:
              "Enable conditional logic. Set it to show this step only if 'wantsName' equals 'true'. This ensures we only ask for their name if they said yes!",
            side: "left",
          },
        },
        {
          element: '[data-tour="add-step-button"]',
          popover: {
            title: "Add Greeting Step",
            description:
              "Add an 'Info Message' step. This will show a personalized greeting using their name.",
            side: "right",
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Personalize with Variables",
            description:
              "Set the message to: 'Thanks {userName}, nice to meet you!' The {userName} will be replaced with their actual name.",
            side: "left",
          },
        },
        {
          element: '[data-tour="conditional-logic"]',
          popover: {
            title: "Show Only If They Said Yes",
            description:
              "Enable conditional logic and set it to show if 'wantsName' equals 'true'. This greeting only appears if they provided their name.",
            side: "left",
          },
        },
        {
          element: '[data-tour="add-step-button"]',
          popover: {
            title: "Add Dismissal Step",
            description:
              "Add another 'Info Message' step. This will show if they said no to providing their name.",
            side: "right",
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Polite Dismissal",
            description:
              "Set the message to: 'Okay, no worries! Thanks for stopping by.'",
            side: "left",
          },
        },
        {
          element: '[data-tour="conditional-logic"]',
          popover: {
            title: "Show Only If They Said No",
            description:
              "Enable conditional logic and set it to show if 'wantsName' equals 'false'. This message only appears if they declined to share their name.",
            side: "left",
          },
        },
        {
          element: '[data-tour="save-button"]',
          popover: {
            title: "Save Your Work",
            description:
              "Always save your form after making changes. The button will be highlighted when there are unsaved changes.",
            side: "bottom",
          },
        },
        {
          element: '[data-tour="preview-button"]',
          popover: {
            title: "Test Your Form",
            description:
              "After publishing, use the Preview button to test your form and see how the conditional logic works in action!",
            side: "bottom",
          },
        },
        {
          popover: {
            title: "You're All Set! 🎉",
            description:
              "You've learned the basics of building conditional forms! Try creating more complex flows with multiple conditions, variable interpolation, and different step types.",
          },
        },
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  return { startTour };
};
