# Web-OS-2-

Vansh's WebOS

Hey, this is my custom WebOS project built using HTML, CSS, and vanilla JavaScript! I wanted to build a fake desktop operating system that runs entirely in the browser — draggable windows, a taskbar, its own boot sequence, and a handful of built-in apps — made for Hack Club's Stardance Challenge.

Live Demo & Preview
Live Repository: 
Screenshot:

What I Built
Draggable Window System: Built absolute-positioned windows you can drag by their header, with a z-index counter so clicking a window brings it to the front of the stack.

Taskbar + Minimize: Windows minimize down to a chip on a taskbar instead of just closing, and restoring one from the taskbar brings it right back where you left it.

Custom Theme Builder: Designed a theme panel with live color pickers for background, accent, and text color that reskins the entire UI in real time and saves automatically to localStorage.

Boot Sequence: Wrote a fake terminal boot log that types itself out line by line on load — "loading kernel... ok," "mounting /desktop... ok" — instead of a generic progress bar.

Calculator & Todo Apps: Added two working built-in apps — a calculator with safe expression evaluation and a todo list with add, check-off, and delete — both persisted so they're still there after a refresh.

Right-Click Context Menu: Added a desktop context menu for quickly cycling wallpapers or jumping straight into the theme builder.

What I Learned
Building this helped me get a lot better at managing UI state without relying on the DOM to tell me what's true — tracking every window's open/minimized/position state in one object made everything downstream way easier to reason about. Figuring out how to drive an entire theme system off a handful of CSS custom properties, and using color-mix() to derive the extra shades automatically, was definitely the trickiest part, but super satisfying once it clicked!
