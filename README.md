Vansh's WebOS Hey, this is my custom WebOS project built using HTML, CSS, and vanilla JavaScript! I wanted to build a fake desktop operating system that runs entirely in the browser — draggable windows, a taskbar, its own boot sequence, and a handful of built-in apps — made for Hack Club's Stardance Challenge.

Live Demo & Preview Live Repository: 

Demo:https://beautiful-bunny-72ae15.netlify.app/
Repository:https://github.com/vansh-creator-ctrl/Web-OS-2-

Screenshot:<img width="939" height="441" alt="Capture webos" src="https://github.com/user-attachments/assets/d15b815c-f184-4bc6-a62b-a429b22f4650" />


What I Built Taskbar + Minimize: Windows minimize down to a chip on a taskbar instead of just closing, and restoring one from the taskbar brings it right back where you left it.

Custom Theme Builder: Designed a theme panel with live color pickers for background, accent, and text color that reskins the entire UI in real time and saves automatically to localStorage.

Calculator App: A working calculator with safe expression evaluation and operator-chaining handling, built as its own draggable window.

Todo List App: Add, check off, and delete tasks — persisted to localStorage so your list survives a refresh.

Right-Click Context Menu: Added a desktop context menu for quickly cycling wallpapers or jumping straight into the theme builder.

Boot Sequence: Wrote a fake terminal boot log that types itself out line by line on load — "loading kernel... ok," "mounting /desktop... ok" — instead of a generic progress bar.

What I Learned Building this helped me get a lot better at managing UI state without relying on the DOM to tell me what's true — tracking every window's open/minimized/position state in one object made everything downstream way easier to reason about. Figuring out how to drive an entire theme system off a handful of CSS custom properties, and using color-mix() to derive the extra shades automatically, was definitely the trickiest part, but super satisfying once it clicked!
