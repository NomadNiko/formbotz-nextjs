import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { StepType } from "@/types";

interface TourCallbacks {
  onAddStep: (type: StepType) => void;
  onUpdateStepMessage: (message: string) => void;
  onToggleDataCollection: (enabled: boolean, variableName?: string) => void;
  onToggleConditionalLogic: (enabled: boolean) => void;
  onAddCondition: (variableName: string, operator: string, value: string) => void;
}

export const useFormBuilderTour = (callbacks: TourCallbacks) => {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: "Welcome to the Form Builder! 🎯",
            description: "Let's build a simple form together. I'll create the steps for you and show you how everything works. Click Next to begin!",
            onNextClick: () => {
              driverObj.moveNext();
            },
          },
        },
        {
          popover: {
            title: "Step 1: Adding a Yes/No Question",
            description: "First, I'll add a Yes/No question step. Watch as it appears in the sidebar!",
            onNextClick: () => {
              callbacks.onAddStep(StepType.YES_NO);
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Setting the Message",
            description: "Now I'll set the message to ask if they want to provide their name.",
            side: "left",
            onNextClick: () => {
              callbacks.onUpdateStepMessage("Would you like to provide your name?");
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="data-collection"]',
          popover: {
            title: "Collecting the Response",
            description: "I'll enable data collection and save this as 'wantsName'. This variable will control which steps show next.",
            side: "left",
            onNextClick: () => {
              callbacks.onToggleDataCollection(true, "wantsName");
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          popover: {
            title: "Step 2: Name Input (Conditional)",
            description: "Next, I'll add a String Input step to collect their name - but only if they said yes!",
            onNextClick: () => {
              callbacks.onAddStep(StepType.STRING_INPUT);
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Asking for the Name",
            description: "Setting the message to ask for their name.",
            side: "left",
            onNextClick: () => {
              callbacks.onUpdateStepMessage("Great! What's your name?");
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="data-collection"]',
          popover: {
            title: "Storing the Name",
            description: "I'll save this as 'userName' so we can use it later for personalization.",
            side: "left",
            onNextClick: () => {
              callbacks.onToggleDataCollection(true, "userName");
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="conditional-logic"]',
          popover: {
            title: "Adding Conditional Logic",
            description: "Here's the magic! I'll add a condition so this step only shows if they answered 'Yes' (wantsName = true).",
            side: "left",
            onNextClick: () => {
              callbacks.onToggleConditionalLogic(true);
              setTimeout(() => {
                callbacks.onAddCondition("wantsName", "equals", "true");
                setTimeout(() => driverObj.moveNext(), 300);
              }, 300);
            },
          },
        },
        {
          popover: {
            title: "Step 3: Personalized Greeting",
            description: "Now I'll add an Info step with a personalized greeting using their name.",
            onNextClick: () => {
              callbacks.onAddStep(StepType.INFO);
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Variable Interpolation",
            description: "Watch this! I'll use {userName} in the message - it will be replaced with their actual name.",
            side: "left",
            onNextClick: () => {
              callbacks.onUpdateStepMessage("Thanks {userName}, nice to meet you!");
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="conditional-logic"]',
          popover: {
            title: "Conditional Greeting",
            description: "This greeting should also only show if they said yes.",
            side: "left",
            onNextClick: () => {
              callbacks.onToggleConditionalLogic(true);
              setTimeout(() => {
                callbacks.onAddCondition("wantsName", "equals", "true");
                setTimeout(() => driverObj.moveNext(), 300);
              }, 300);
            },
          },
        },
        {
          popover: {
            title: "Step 4: Polite Dismissal",
            description: "Finally, I'll add a message for people who said no.",
            onNextClick: () => {
              callbacks.onAddStep(StepType.INFO);
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="message-input"]',
          popover: {
            title: "Friendly Message",
            description: "Setting a polite message for those who declined.",
            side: "left",
            onNextClick: () => {
              callbacks.onUpdateStepMessage("Okay, no worries! Thanks for stopping by.");
              setTimeout(() => driverObj.moveNext(), 300);
            },
          },
        },
        {
          element: '[data-tour="conditional-logic"]',
          popover: {
            title: "Opposite Condition",
            description: "This time, the condition is wantsName = false, so it only shows if they said no.",
            side: "left",
            onNextClick: () => {
              callbacks.onToggleConditionalLogic(true);
              setTimeout(() => {
                callbacks.onAddCondition("wantsName", "equals", "false");
                setTimeout(() => driverObj.moveNext(), 300);
              }, 300);
            },
          },
        },
        {
          element: '[data-tour="save-button"]',
          popover: {
            title: "Save Your Work",
            description: "Now you can save this form! The button is highlighted because there are unsaved changes.",
            side: "bottom",
            onNextClick: () => {
              driverObj.moveNext();
            },
          },
        },
        {
          popover: {
            title: "You're All Set! 🎉",
            description: "I've created a complete conditional form for you! Save it, publish it, and test it with the Preview button. Try modifying the steps or creating your own forms with different logic!",
            onNextClick: () => {
              driverObj.destroy();
            },
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
