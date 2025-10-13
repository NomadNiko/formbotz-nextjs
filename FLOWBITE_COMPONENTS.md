# Flowbite Components Reference

This document provides comprehensive documentation for Flowbite React and vanilla Flowbite components available in this project.

## Table of Contents

- [Flowbite React Components](#flowbite-react-components)
- [Vanilla Flowbite Components](#vanilla-flowbite-components)
- [Integration Guide](#integration-guide)

---

## Flowbite React Components

### Card Component

**Description:** Show content in a box such as titles, descriptions, and images.

**Import:**
```jsx
import { Card } from "flowbite-react";
```

**Props:**
- `className`: Customize card styling
- `href`: Add hyperlink to entire card
- `imgSrc`: Add image to card
- `imgAlt`: Alternative text for image
- `horizontal`: Display card in horizontal layout
- `renderImage`: Custom image rendering function

**Examples:**

1. **Default Card:**
```jsx
<Card href="#" className="max-w-sm">
  <h5>Noteworthy technology acquisitions 2021</h5>
  <p>Here are the biggest enterprise technology acquisitions of 2021</p>
</Card>
```

2. **Card with Image:**
```jsx
<Card
  className="max-w-sm"
  imgSrc="/path/to/image.jpg"
  imgAlt="Image description"
>
  <h5>Title</h5>
  <p>Description</p>
</Card>
```

3. **Horizontal Card:**
```jsx
<Card className="max-w-sm" imgSrc="/image.jpg" horizontal>
  <h5>Title</h5>
  <p>Description</p>
</Card>
```

**Additional Variants:** User Profile Card, E-commerce Product Card, Pricing Card, CTA Card

---

### Table Component

**Description:** Show complex amounts of data in structured rows and columns.

**Import:**
```jsx
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeadCell } from "flowbite-react";
```

**Props:**
- `striped` (boolean): Alternates background color of rows
- `hoverable` (boolean): Adds hover effect to rows

**Example:**

```jsx
<Table striped hoverable>
  <TableHead>
    <TableRow>
      <TableHeadCell>Product name</TableHeadCell>
      <TableHeadCell>Color</TableHeadCell>
      <TableHeadCell>Category</TableHeadCell>
      <TableHeadCell>Price</TableHeadCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>Apple MacBook Pro 17"</TableCell>
      <TableCell>Silver</TableCell>
      <TableCell>Laptop</TableCell>
      <TableCell>$2999</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Variants:** Default, Striped Rows, Hoverable Rows, Table with Checkboxes

---

### Navbar Component

**Description:** Navigation section for website header with logo, menu items, and CTAs.

**Import:**
```jsx
import { Navbar, NavbarBrand, NavbarCollapse, NavbarLink, NavbarToggle } from "flowbite-react";
```

**Example:**

```jsx
<Navbar fluid rounded>
  <NavbarBrand href="https://flowbite-react.com">
    <img src="/favicon.svg" alt="Logo" />
    <span>Flowbite React</span>
  </NavbarBrand>
  <NavbarToggle />
  <NavbarCollapse>
    <NavbarLink href="#" active>Home</NavbarLink>
    <NavbarLink href="#">About</NavbarLink>
    <NavbarLink href="#">Services</NavbarLink>
  </NavbarCollapse>
</Navbar>
```

**Variants:** Default Navbar, Navbar with CTA Button, Navbar with Dropdown

---

### Sidebar Component

**Description:** Navigation sidebar for websites and applications.

**Import:**
```jsx
import { Sidebar, SidebarItems, SidebarItemGroup, SidebarItem, SidebarCollapse, SidebarLogo, SidebarCTA } from "flowbite-react";
```

**Example:**

```jsx
<Sidebar>
  <SidebarLogo href="#" img="/favicon.svg" imgAlt="Flowbite logo">
    Flowbite
  </SidebarLogo>
  <SidebarItems>
    <SidebarItemGroup>
      <SidebarItem href="#" icon={HiChartPie}>
        Dashboard
      </SidebarItem>
      <SidebarCollapse icon={HiShoppingBag} label="E-commerce">
        <SidebarItem href="#">Products</SidebarItem>
        <SidebarItem href="#">Sales</SidebarItem>
      </SidebarCollapse>
    </SidebarItemGroup>
  </SidebarItems>
</Sidebar>
```

**Variants:** Default Sidebar, Multi-Level Dropdown, Sidebar with Logo, Sidebar with CTA

---

### Button Component

**Description:** Trigger actions with various styles and sizes.

**Import:**
```jsx
import { Button } from "flowbite-react";
```

**Props:**
- `color`: default, alternative, dark, light, green, red, yellow, purple, blue, cyan, indigo, teal, pink
- `size`: xs, sm, md, lg, xl
- `pill`: Rounded corners
- `outline`: Transparent with colored border
- `disabled`: Disable interaction
- `as`: Transform to different element

**Examples:**

```jsx
<Button color="blue">Default Button</Button>
<Button pill outline color="green">Pill Outline</Button>
<Button size="xs" color="red">Small Button</Button>

{/* Button with Icon */}
<Button>
  <HiShoppingCart className="mr-2 h-5 w-5" />
  Buy now
</Button>

{/* Loading State */}
<Button>
  <Spinner size="sm" className="me-3" />
  Loading...
</Button>
```

---

### Forms Components

**Description:** Collect input data using various form elements.

**Import:**
```jsx
import { TextInput, Checkbox, Radio, Select, Textarea, FileInput, ToggleSwitch, RangeSlider, Label, HelperText } from "flowbite-react";
```

#### TextInput

**Props:**
- `type`: email, password, text
- `size`: sm, md, lg
- `color`: gray, info, success, failure, warning
- `icon`: Left-side icon
- `rightIcon`: Right-side icon
- `addon`: Add-on text/element
- `shadow`: Add shadow effect

**Example:**
```jsx
<TextInput
  id="email"
  type="email"
  placeholder="name@flowbite.com"
  icon={HiMail}
  required
  shadow
/>
```

#### Checkbox
```jsx
<Checkbox id="agree" />
<Label htmlFor="agree">I agree with the terms and conditions</Label>
```

#### Select
```jsx
<Select id="countries" required>
  <option>United States</option>
  <option>Canada</option>
  <option>France</option>
</Select>
```

#### Textarea
```jsx
<Textarea
  id="comment"
  placeholder="Leave a comment..."
  required
  rows={4}
/>
```

#### ToggleSwitch
```jsx
<ToggleSwitch
  checked={true}
  label="Toggle me"
  onChange={(checked) => console.log(checked)}
/>
```

---

### Toast Component

**Description:** Push notifications with various styles and colors.

**Import:**
```jsx
import { Toast, ToastToggle } from "flowbite-react";
```

**Example:**

```jsx
<Toast>
  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500">
    <HiFire className="h-5 w-5" />
  </div>
  <div className="ml-3 text-sm font-normal">Set yourself free.</div>
  <ToastToggle />
</Toast>
```

**Variants:** Default Toast, Color Variations (success, error, warning), Feedback Toast, Interactive Toast

---

### Modal Component

**Description:** Interactive dialog overlaying main content.

**Import:**
```jsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from "flowbite-react";
```

**Props:**
- `show`: Boolean to control visibility
- `dismissible`: Allow closing by clicking outside
- `popup`: Confirmation/pop-up style
- `size`: sm, md, lg, xl, 2xl-7xl
- `position`: center, top-left, bottom-right, etc.
- `onClose`: Callback when closed

**Example:**

```jsx
const [openModal, setOpenModal] = useState(false);

<Modal show={openModal} onClose={() => setOpenModal(false)}>
  <ModalHeader>Terms of Service</ModalHeader>
  <ModalBody>
    <p>Modal content here</p>
  </ModalBody>
  <ModalFooter>
    <Button onClick={() => setOpenModal(false)}>Accept</Button>
    <Button color="gray" onClick={() => setOpenModal(false)}>Decline</Button>
  </ModalFooter>
</Modal>
```

---

### Dropdown Component

**Description:** Display list of items when trigger element is clicked.

**Import:**
```jsx
import { Dropdown, DropdownItem, DropdownDivider, DropdownHeader } from "flowbite-react";
```

**Props:**
- `label`: Text for trigger
- `dismissOnClick`: Control closing behavior
- `inline`: Inline appearance
- `size`: sm, md, lg
- `placement`: top, right, bottom, left
- `renderTrigger`: Custom trigger element

**Example:**

```jsx
<Dropdown label="Dropdown button">
  <DropdownHeader>
    <span>Bonnie Green</span>
    <span>bonnie@flowbite.com</span>
  </DropdownHeader>
  <DropdownItem icon={HiViewGrid}>Dashboard</DropdownItem>
  <DropdownItem icon={HiCog}>Settings</DropdownItem>
  <DropdownDivider />
  <DropdownItem>Sign out</DropdownItem>
</Dropdown>
```

---

### Badge Component

**Description:** Show text, labels, and counters in small boxes.

**Import:**
```jsx
import { Badge } from "flowbite-react";
```

**Props:**
- `color`: info, gray, failure, success, warning, indigo, purple, pink
- `size`: xs, sm
- `icon`: Optional icon component

**Example:**

```jsx
<Badge color="info">Default</Badge>
<Badge color="success" icon={HiCheck}>Verified</Badge>
<Badge color="failure" size="sm">Error</Badge>
```

---

### Alert Component

**Description:** Show contextual messages like success or error notifications.

**Import:**
```jsx
import { Alert } from "flowbite-react";
```

**Props:**
- `color`: info, warning, success, failure
- `icon`: Add icon from React Icons
- `onDismiss`: Dismiss button with callback
- `rounded`: Rounded corners
- `withBorderAccent`: Add border accent

**Example:**

```jsx
<Alert color="failure" icon={HiInformationCircle} onDismiss={() => console.log('dismissed')}>
  <span className="font-medium">Error!</span> Something went wrong.
</Alert>
```

---

### Spinner Component

**Description:** Loading indicator with animations.

**Import:**
```jsx
import { Spinner } from "flowbite-react";
```

**Props:**
- `color`: info, success, failure, warning, pink, purple
- `size`: xs, sm, md, lg, xl
- `aria-label`: Accessibility label

**Example:**

```jsx
<Spinner color="info" size="lg" aria-label="Loading" />
```

---

### Avatar Component

**Description:** Visual representation of user or team account.

**Import:**
```jsx
import { Avatar, AvatarGroup } from "flowbite-react";
```

**Props:**
- `img`: Image URL
- `alt`: Image description
- `rounded`: Rounded avatar
- `bordered`: Add border
- `placeholderInitials`: Display initials
- `status`: online, offline, busy, away
- `statusPosition`: Position of status dot
- `size`: xs, sm, md, lg, xl

**Example:**

```jsx
<Avatar
  img="/user.jpg"
  alt="User"
  rounded
  bordered
  status="online"
  statusPosition="top-right"
/>

<AvatarGroup>
  <Avatar img="/user1.jpg" stacked />
  <Avatar img="/user2.jpg" stacked />
  <Avatar.Counter total={99} href="#" />
</AvatarGroup>
```

---

### Tabs Component

**Description:** Switch between different content sections.

**Import:**
```jsx
import { Tabs, TabItem } from "flowbite-react";
```

**Props (Tabs):**
- `variant`: default, underline, pills, fullWidth
- `onActiveTabChange`: Callback for tab change

**Props (TabItem):**
- `title`: Tab text
- `active`: Default active tab
- `disabled`: Disable tab
- `icon`: Optional icon

**Example:**

```jsx
<Tabs variant="underline">
  <TabItem active title="Profile" icon={HiUserCircle}>
    Profile content
  </TabItem>
  <TabItem title="Dashboard" icon={HiChartPie}>
    Dashboard content
  </TabItem>
</Tabs>
```

---

### Pagination Component

**Description:** Navigate through multiple pages of data.

**Import:**
```jsx
import { Pagination } from "flowbite-react";
```

**Props:**
- `currentPage`: Currently active page
- `totalPages`: Total number of pages
- `onPageChange`: Page change handler
- `layout`: pagination, navigation, table
- `showIcons`: Add next/previous icons
- `previousLabel`: Custom previous button text
- `nextLabel`: Custom next button text

**Example:**

```jsx
const [currentPage, setCurrentPage] = useState(1);

<Pagination
  currentPage={currentPage}
  totalPages={100}
  onPageChange={(page) => setCurrentPage(page)}
  showIcons
/>
```

---

## Vanilla Flowbite Components

These components require vanilla Flowbite (^3.1.2) and use HTML/CSS/JavaScript instead of React.

### Chat Bubble Component

**Description:** Building block for chat interfaces with messages, attachments, and actions.

**HTML Structure:**
```html
<div class="flex items-start gap-2.5">
   <img class="w-8 h-8 rounded-full" src="profile.jpg" alt="User image">
   <div class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
      <div class="flex items-center space-x-2 rtl:space-x-reverse">
         <span class="text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</span>
         <span class="text-sm font-normal text-gray-500 dark:text-gray-400">11:46</span>
      </div>
      <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">That's awesome. I think our users will really appreciate the improvements.</p>
      <span class="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>
   </div>
</div>
```

**Variants:**
- Default Chat Bubble
- Voice Note Message
- File Attachment
- Image Attachment
- Image Gallery
- URL Preview
- Outline/Clean Styles

**Features:**
- Dropdown menus for actions (Reply, Forward, Copy, Delete)
- Timestamp display
- Read/delivered status
- Supports multimedia content

---

### Timeline Component

**Description:** Show data chronologically with multiple styles.

**HTML Structure:**
```html
<ol class="relative border-s border-gray-200 dark:border-gray-700">
    <li class="mb-10 ms-4">
        <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
        <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">February 2022</time>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Application UI code in Tailwind CSS</h3>
        <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p>
        <a href="#" class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100">Learn more</a>
    </li>
</ol>
```

**Variants:**
- Default Timeline
- Vertical Timeline
- Horizontal Timeline
- Activity Log
- Grouped Timeline

**Features:**
- Supports icons and avatars
- Customizable dots/markers
- Responsive design
- Dark mode support

---

### Rating Component

**Description:** Show reviews and ratings using stars and scores.

**HTML Structure:**
```html
<div class="flex items-center">
    <svg class="w-4 h-4 text-yellow-300 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
    </svg>
    {/* Repeat for more stars */}
    <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded ms-3">5.0</span>
</div>
```

**Variants:**
- Default Rating
- Rating with Text
- Rating Count
- Star Sizes (sm, md, lg)
- Advanced Rating with Reviews
- Score Rating

**Features:**
- Customizable star count
- Half-star support
- Review statistics
- Dark mode support

---

### Progress Component

**Description:** Show completion rate or loading status.

**HTML Structure:**
```html
<div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
  <div class="bg-blue-600 h-2.5 rounded-full" style="width: 45%"></div>
</div>
```

**Sizes:**
- Small: `h-1.5`
- Default: `h-2.5`
- Large: `h-4`
- Extra Large: `h-6`

**Colors:** blue, red, green, yellow, indigo, purple, pink

**Example with Label:**
```html
<div class="mb-1 text-base font-medium dark:text-white">Progress</div>
<div class="w-full bg-gray-200 rounded-full h-2.5">
  <div class="bg-blue-600 h-2.5 rounded-full" style="width: 45%"></div>
</div>
```

---

### Drawer Component

**Description:** Off-canvas sidebar for navigation, forms, or additional content.

**HTML Structure:**
```html
<!-- Trigger Button -->
<button data-drawer-target="drawer-example" data-drawer-show="drawer-example" type="button">
  Show drawer
</button>

<!-- Drawer Component -->
<div id="drawer-example" class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-80 dark:bg-gray-800" tabindex="-1">
   <h5 class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
      Info
   </h5>
   <button type="button" data-drawer-hide="drawer-example">
      <svg>...</svg>
   </button>
   <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Drawer content...</p>
</div>
```

**Data Attributes:**
- `data-drawer-target`: Specifies drawer ID
- `data-drawer-show`: Shows drawer
- `data-drawer-hide`: Hides drawer
- `data-drawer-toggle`: Toggles visibility
- `data-drawer-placement`: left, right, top, bottom
- `data-drawer-backdrop`: Enable/disable backdrop

**Positioning Options:**
- Left drawer (default)
- Right drawer
- Top drawer
- Bottom drawer

**Variants:**
- Navigation drawer
- Contact form drawer
- Form elements drawer

---

### Accordion Component

**Description:** Vertically collapsing header and body elements.

**HTML Structure:**
```html
<div id="accordion-collapse" data-accordion="collapse">
  <h2 id="accordion-collapse-heading-1">
    <button type="button" data-accordion-target="#accordion-collapse-body-1" aria-expanded="true">
      <span>What is Flowbite?</span>
      <svg>...</svg>
    </button>
  </h2>
  <div id="accordion-collapse-body-1" aria-labelledby="accordion-collapse-heading-1">
    <div class="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
      <p class="mb-2 text-gray-500 dark:text-gray-400">Accordion content...</p>
    </div>
  </div>
</div>
```

**Data Attributes:**
- `data-accordion="collapse"`: Only one item open at a time
- `data-accordion="open"`: Multiple items can be open
- `data-accordion-target`: Target body element
- `aria-expanded`: Active/inactive state

**JavaScript Initialization:**
```javascript
const accordion = new Accordion(accordionElement, accordionItems, options);

// Methods
accordion.open('item-id');
accordion.close('item-id');
accordion.toggle('item-id');
```

**Variants:**
- Default Accordion
- Always Open Accordion
- Color Options
- Flush Accordion
- Arrow Style
- Nested Accordions

---

### Datepicker Component

**Description:** Date and time input with calendar interface.

**HTML Structure:**
```html
<div class="relative max-w-sm">
  <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400">...</svg>
  </div>
  <input datepicker type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5" placeholder="Select date">
</div>
```

**JavaScript Initialization:**
```javascript
const datepicker = new Datepicker(element, {
  format: 'mm/dd/yyyy',
  maxDate: null,
  minDate: null,
  orientation: 'bottom',
  buttons: false,
  autoSelectToday: 0,
  title: null,
  rangePicker: false
});

// Methods
datepicker.getDate();
datepicker.setDate(date);
datepicker.show();
datepicker.hide();
```

**Configuration Options:**
- `format`: Date display format
- `maxDate`/`minDate`: Date range limits
- `orientation`: Positioning
- `buttons`: Show/hide action buttons
- `rangePicker`: Enable date range selection
- `autohide`: Auto-hide after selection

**Variants:**
- Standard datepicker
- Inline datepicker
- Date range picker
- Custom date formats

---

### Breadcrumb Component

**Description:** Show current location in hierarchical page structure.

**HTML Structure:**
```html
<nav class="flex" aria-label="Breadcrumb">
  <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
    <li class="inline-flex items-center">
      <a href="#" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
        <svg class="w-3 h-3 me-2.5">...</svg>
        Home
      </a>
    </li>
    <li>
      <div class="flex items-center">
        <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1">...</svg>
        <a href="#" class="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">Projects</a>
      </div>
    </li>
    <li aria-current="page">
      <div class="flex items-center">
        <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1">...</svg>
        <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">Flowbite</span>
      </div>
    </li>
  </ol>
</nav>
```

**Variants:**
- Default Breadcrumb
- Solid Background
- Breadcrumb with Icons
- Breadcrumb with Dropdown

**Features:**
- Separator icons between items
- Active page indicator (`aria-current="page"`)
- Responsive design
- Dark mode support

---

## Integration Guide

### Flowbite React Integration

Flowbite React components are already integrated and configured in this project:

1. **Import components:**
```jsx
import { Button, Card, Modal } from "flowbite-react";
```

2. **Use in your React components:**
```jsx
function MyComponent() {
  return (
    <Card>
      <h5>Card Title</h5>
      <Button>Click me</Button>
    </Card>
  );
}
```

3. **Theme customization:**
   - Edit `.flowbite-react/config.json` for global theme settings
   - The `<ThemeInit />` component in `app/layout.tsx` initializes the theme
   - Dark mode is enabled by default

### Vanilla Flowbite Integration

For vanilla Flowbite components (Chat Bubble, Timeline, etc.):

1. **The library is installed:**
```bash
# Already in package.json
"flowbite": "^3.1.2"
```

2. **Initialize Flowbite in Next.js:**

Add to `app/layout.tsx` or create a client component:

```tsx
'use client';

import { useEffect } from 'react';
import { initFlowbite } from 'flowbite';

export function FlowbiteInit() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return null;
}
```

3. **Use vanilla components in client components:**

```tsx
'use client';

export function ChatComponent() {
  return (
    <div className="flex items-start gap-2.5">
      <img className="w-8 h-8 rounded-full" src="/avatar.jpg" alt="User" />
      <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
        <p className="text-sm font-normal text-gray-900">Message content</p>
      </div>
    </div>
  );
}
```

4. **For components requiring JavaScript (Drawer, Accordion, Datepicker):**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Drawer } from 'flowbite';

export function MyDrawer() {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (drawerRef.current) {
      const drawer = new Drawer(drawerRef.current, options);
      // Use drawer methods: drawer.show(), drawer.hide()
    }
  }, []);

  return (
    <div ref={drawerRef} id="drawer-example" className="...">
      {/* Drawer content */}
    </div>
  );
}
```

### Best Practices

1. **Prefer Flowbite React components** when available for better React integration
2. **Use vanilla Flowbite** for components not available in Flowbite React (Chat Bubble, Timeline, etc.)
3. **Mark components as 'use client'** when using vanilla Flowbite JavaScript features
4. **Initialize Flowbite** once in your app for interactive vanilla components
5. **Use TypeScript** for better type safety with Flowbite React components

### Additional Resources

- **Flowbite React Docs:** https://flowbite-react.com/docs/getting-started/introduction
- **Vanilla Flowbite Docs:** https://flowbite.com/docs/getting-started/introduction/
- **All React Components:** https://flowbite-react.com/docs/components/accordion (navigate sidebar for full list)
- **All Vanilla Components:** https://flowbite.com/docs/components/alerts/ (navigate sidebar for full list)
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Next.js App Router:** https://nextjs.org/docs/app
