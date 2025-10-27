import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Form from '@/lib/db/models/Form';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ publicUrl: string }> }
) {
  const params = await props.params;
  try {
    await connectDB();

    const { publicUrl } = params;

    // Fetch form to get widget settings
    const form = await Form.findOne({ publicUrl, status: 'published' }).lean();

    if (!form) {
      return new NextResponse('// Form not found', {
        status: 404,
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    // Extract widget settings with defaults
    const widgetSettings = form.settings?.widgetSettings || {};
    const position = widgetSettings.position || 'bottom-right';
    const buttonColor = widgetSettings.buttonColor || form.settings?.brandColor || '#3b82f6';
    const buttonSize = widgetSettings.buttonSize || 100;
    const horizontalOffset = widgetSettings.horizontalOffset || 20;
    const verticalOffset = widgetSettings.verticalOffset || 20;
    const customCSS = widgetSettings.customCSS || '';

    // Determine position CSS
    let positionCSS = '';
    switch (position) {
      case 'bottom-right':
        positionCSS = `bottom: ${verticalOffset}px; right: ${horizontalOffset}px;`;
        break;
      case 'bottom-left':
        positionCSS = `bottom: ${verticalOffset}px; left: ${horizontalOffset}px;`;
        break;
      case 'top-right':
        positionCSS = `top: ${verticalOffset}px; right: ${horizontalOffset}px;`;
        break;
      case 'top-left':
        positionCSS = `top: ${verticalOffset}px; left: ${horizontalOffset}px;`;
        break;
      default:
        positionCSS = `bottom: ${verticalOffset}px; right: ${horizontalOffset}px;`;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate the widget JavaScript
    const widgetScript = `
(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.FormBotzWidgetLoaded) return;
  window.FormBotzWidgetLoaded = true;

  const WIDGET_CONFIG = {
    publicUrl: "${publicUrl}",
    appUrl: "${appUrl}",
    buttonSize: ${buttonSize},
    buttonColor: "${buttonColor}",
    position: "${positionCSS}",
    positionType: "${position}",
    horizontalOffset: ${horizontalOffset},
    verticalOffset: ${verticalOffset},
    customCSS: ${JSON.stringify(customCSS)}
  };

  // Create widget button
  function createButton() {
    const button = document.createElement('button');
    button.id = 'formbotz-widget-button';
    button.setAttribute('aria-label', 'Open chat');
    button.style.cssText = \`
      position: fixed;
      \${WIDGET_CONFIG.position}
      width: \${WIDGET_CONFIG.buttonSize}px;
      height: \${WIDGET_CONFIG.buttonSize}px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
      padding: 0;
      overflow: hidden;
      background-color: \${WIDGET_CONFIG.buttonColor};
    \`;

    // Add icon
    const img = document.createElement('img');
    img.src = \`\${WIDGET_CONFIG.appUrl}/formbotz-star.png\`;
    img.alt = 'Chat';
    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
    button.appendChild(img);

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    button.addEventListener('click', openWidget);
    document.body.appendChild(button);
  }

  // Create widget overlay
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'formbotz-widget-overlay';
    overlay.style.cssText = \`
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s;
    \`;

    // Create iframe container
    const container = document.createElement('div');
    container.id = 'formbotz-widget-container';

    // Detect if mobile
    const isMobile = window.innerWidth <= 768;

    // Calculate container position based on button position (desktop only)
    let containerPosition = '';
    const containerWidth = 400;
    const containerHeight = 650;

    if (isMobile) {
      // Mobile: full screen
      container.style.cssText = \`
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background: white;
        overflow: hidden;
        transition: transform 0.3s;
        z-index: 10001;
        transform: scale(0.9);
      \`;
    } else {
      // Desktop: positioned based on button
      switch (WIDGET_CONFIG.positionType) {
        case 'bottom-right':
          containerPosition = \`bottom: \${WIDGET_CONFIG.verticalOffset}px; right: \${WIDGET_CONFIG.horizontalOffset}px;\`;
          break;
        case 'bottom-left':
          containerPosition = \`bottom: \${WIDGET_CONFIG.verticalOffset}px; left: \${WIDGET_CONFIG.horizontalOffset}px;\`;
          break;
        case 'top-right':
          containerPosition = \`top: \${WIDGET_CONFIG.verticalOffset}px; right: \${WIDGET_CONFIG.horizontalOffset}px;\`;
          break;
        case 'top-left':
          containerPosition = \`top: \${WIDGET_CONFIG.verticalOffset}px; left: \${WIDGET_CONFIG.horizontalOffset}px;\`;
          break;
        default:
          containerPosition = \`bottom: \${WIDGET_CONFIG.verticalOffset}px; right: \${WIDGET_CONFIG.horizontalOffset}px;\`;
      }

      container.style.cssText = \`
        position: fixed;
        \${containerPosition}
        transform: scale(0.9);
        width: \${containerWidth}px;
        height: \${containerHeight}px;
        max-height: calc(100vh - 40px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        transition: transform 0.3s;
        z-index: 10001;
      \`;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'formbotz-widget-iframe';
    iframe.src = \`\${WIDGET_CONFIG.appUrl}/widget/\${WIDGET_CONFIG.publicUrl}\`;
    iframe.style.cssText = \`
      width: 100%;
      height: 100%;
      border: none;
    \`;
    iframe.setAttribute('allow', 'clipboard-write');

    container.appendChild(iframe);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeWidget();
      }
    });
  }

  // Open widget
  function openWidget() {
    const overlay = document.getElementById('formbotz-widget-overlay');
    const container = document.getElementById('formbotz-widget-container');
    const iframe = document.getElementById('formbotz-widget-iframe');

    if (overlay) {
      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.style.opacity = '1';
        if (container) {
          container.style.transform = 'scale(1)';
        }
        // Focus the iframe so autofocus works inside it
        if (iframe) {
          iframe.focus();
        }
      }, 10);
    }
  }

  // Close widget
  function closeWidget() {
    const overlay = document.getElementById('formbotz-widget-overlay');
    const container = document.getElementById('formbotz-widget-container');

    if (overlay && container) {
      overlay.style.opacity = '0';
      container.style.transform = 'scale(0.9)';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }
  }

  // Listen for close message from iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'FORMBOTZ_WIDGET_CLOSE') {
      closeWidget();
    }
  });

  // Apply custom CSS if provided
  if (WIDGET_CONFIG.customCSS) {
    const style = document.createElement('style');
    style.textContent = WIDGET_CONFIG.customCSS;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createButton();
      createOverlay();
    });
  } else {
    createButton();
    createOverlay();
  }

  // Expose close function globally
  window.FormBotzWidget = {
    close: closeWidget,
    open: openWidget
  };
})();
`;

    return new NextResponse(widgetScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=60, must-revalidate', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error generating widget loader:', error);
    return new NextResponse('// Error loading widget', {
      status: 500,
      headers: { 'Content-Type': 'application/javascript' },
    });
  }
}
