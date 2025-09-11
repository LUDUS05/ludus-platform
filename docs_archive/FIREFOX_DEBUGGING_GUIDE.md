# 🔥 Complete Firefox DevTools Debugging Guide for LUDUS Platform

## 📋 Table of Contents
1. [Prerequisites Check](#prerequisites-check)
2. [Opening Your Project](#opening-your-project)
3. [Starting a Debug Session](#starting-a-debug-session)
4. [Setting Breakpoints](#setting-breakpoints)
5. [Using Debug Controls](#using-debug-controls)
6. [Debugging Specific Features](#debugging-specific-features)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Debugging](#advanced-debugging)

---

## 1. Prerequisites Check ✅

Before starting, ensure everything is properly installed:

### Check VS Code Installation
```bash
# In terminal, verify VS Code is installed
code --version
# Should show: 1.5.11 or newer
```

### Check Firefox Developer Edition
```bash
# Verify Firefox Developer Edition is installed
ls -la "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox"
# Should show the executable file
```

### Check Project Dependencies
```bash
# Navigate to your project
cd /Users/xplicit2021/Desktop/ludus-platform

# Check client dependencies
ls client/node_modules
# Should show node_modules directory

# Check server dependencies  
ls server/node_modules
# Should show node_modules directory
```

---

## 2. Opening Your Project 🚀

### Method 1: From Terminal
```bash
# Navigate to your project directory
cd /Users/xplicit2021/Desktop/ludus-platform

# Open VS Code with the project
code .
```

### Method 2: From VS Code
1. **Launch VS Code** (from Applications or Spotlight)
2. **File → Open Folder** (Cmd+O)
3. **Navigate to**: `/Users/xplicit2021/Desktop/ludus-platform`
4. **Click "Open"**

### Verify Project is Loaded
- You should see the LUDUS project structure in the Explorer panel
- Look for folders: `client/`, `server/`, `.vscode/`, etc.
- The `.vscode/` folder should contain our configuration files

---

## 3. Starting a Debug Session 🎯

### Step 1: Access Debug Panel
1. **Click the "Run and Debug" icon** in the left sidebar (looks like a play button with a bug)
2. **Or use keyboard shortcut**: `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows/Linux)

### Step 2: Select Debug Configuration
In the debug panel, you'll see a dropdown at the top. Select one of these configurations:

#### 🟢 **Launch Firefox - LUDUS Client** (Recommended for Development)
- **Purpose**: Start fresh Firefox session and debug React client
- **Best for**: New debugging sessions, component development
- **What it does**: 
  - Starts the React development server
  - Launches Firefox Developer Edition
  - Connects debugger to the client

#### 🔵 **Attach to Firefox - LUDUS Client**
- **Purpose**: Connect to already running Firefox instance
- **Best for**: When Firefox is already open
- **What it does**: Attaches debugger to existing Firefox session

#### 🟡 **Launch Firefox - Production Build**
- **Purpose**: Debug the production build
- **Best for**: Testing production issues
- **What it does**: Builds the app and debugs production version

#### 🟠 **Launch Firefox - Development Server**
- **Purpose**: Launch with development server configuration
- **Best for**: Full-stack debugging
- **What it does**: Starts both client and server for full debugging

### Step 3: Start Debugging
1. **Select your preferred configuration** from the dropdown
2. **Click the green play button** ▶️ (or press `F5`)
3. **Wait for the process**:
   - VS Code will start the development server
   - Firefox Developer Edition will launch
   - The debugger will connect
   - Your LUDUS app will load in Firefox

### Step 4: Verify Connection
- **Firefox should open** with your LUDUS app at `http://localhost:3000`
- **VS Code debug panel** should show "Connected" status
- **Breakpoints panel** should be visible
- **Variables panel** should be ready

---

## 4. Setting Breakpoints 🎯

### Method 1: Click in Gutter
1. **Open any file** in `client/src/` (e.g., `App.js`, `components/Header.jsx`)
2. **Click in the left margin** next to line numbers
3. **Red dots** will appear indicating breakpoints
4. **Hover over red dots** to see breakpoint details

### Method 2: Keyboard Shortcut
1. **Place cursor** on the line where you want to break
2. **Press `F9`** to toggle breakpoint
3. **Red dot** will appear/disappear

### Method 3: Right-Click Menu
1. **Right-click** on a line number
2. **Select "Add Breakpoint"**
3. **Red dot** will appear

### Types of Breakpoints

#### 🔴 **Regular Breakpoints**
- **Purpose**: Pause execution at specific lines
- **Use for**: General debugging, variable inspection
- **Example**: `console.log('User logged in:', user);`

#### 🟡 **Conditional Breakpoints**
1. **Right-click** on a breakpoint
2. **Select "Edit Breakpoint"**
3. **Enter condition** (e.g., `user.role === 'admin'`)
4. **Breakpoint will only trigger** when condition is true

#### 🟢 **Logpoints**
1. **Right-click** on a line
2. **Select "Add Logpoint"**
3. **Enter message** (e.g., `User clicked: {user.name}`)
4. **Logs message** without stopping execution

---

## 5. Using Debug Controls 🎮

### Debug Toolbar (Top of VS Code)
When debugging is active, you'll see these controls:

#### ▶️ **Continue (F5)**
- **Purpose**: Resume execution
- **Use when**: You want to continue after hitting a breakpoint

#### ⏸️ **Pause (Ctrl+Shift+F5)**
- **Purpose**: Pause execution
- **Use when**: You want to stop at current point

#### ⏭️ **Step Over (F10)**
- **Purpose**: Execute current line, don't go into functions
- **Use when**: You want to skip function details

#### ⬇️ **Step Into (F11)**
- **Purpose**: Go into function calls
- **Use when**: You want to debug inside functions

#### ⬆️ **Step Out (Shift+F11)**
- **Purpose**: Exit current function
- **Use when**: You want to return to caller

#### 🔄 **Restart (Ctrl+Shift+F5)**
- **Purpose**: Restart debug session
- **Use when**: You want to start over

#### ⏹️ **Stop (Shift+F5)**
- **Purpose**: Stop debugging
- **Use when**: You're done debugging

### Debug Panels (Left Sidebar)

#### 📊 **Variables Panel**
- **Shows**: Current variable values
- **Expand objects** to see properties
- **Right-click** to copy values
- **Hover** to see full values

#### 👀 **Watch Panel**
- **Add expressions** to monitor
- **Click "+"** to add new watch
- **Examples**: `user.name`, `isAuthenticated`, `currentRoute`

#### 📞 **Call Stack Panel**
- **Shows**: Function call hierarchy
- **Click entries** to jump to different stack frames
- **See**: How you got to current breakpoint

#### 🎯 **Breakpoints Panel**
- **Shows**: All breakpoints in project
- **Enable/disable** breakpoints
- **Delete** unwanted breakpoints
- **Edit** breakpoint conditions

---

## 6. Debugging Specific Features 🔍

### Debugging React Components

#### Component State Changes
1. **Set breakpoint** in component render method
2. **Trigger state change** (click button, form submit)
3. **Inspect state** in Variables panel
4. **Watch state updates** in real-time

```jsx
// Example: Debugging user authentication
const LoginForm = () => {
  const [user, setUser] = useState(null); // Set breakpoint here
  
  const handleLogin = async (credentials) => {
    // Set breakpoint here to debug login flow
    const result = await authService.login(credentials);
    setUser(result.user); // Set breakpoint here to see user data
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* Your form JSX */}
    </form>
  );
};
```

#### Props Debugging
1. **Set breakpoint** in component
2. **Check props** in Variables panel
3. **Verify prop types** and values
4. **Debug prop changes** from parent components

### Debugging Firebase Operations

#### Authentication Flow
1. **Set breakpoints** in auth service functions
2. **Monitor user state** changes
3. **Debug error handling**
4. **Check Firebase responses**

```javascript
// Example: Debug Firebase auth
const signInWithEmail = async (email, password) => {
  try {
    // Set breakpoint here
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Set breakpoint here to inspect userCredential
    return userCredential.user;
  } catch (error) {
    // Set breakpoint here to debug errors
    console.error('Auth error:', error);
    throw error;
  }
};
```

#### Firestore Operations
1. **Set breakpoints** in database functions
2. **Monitor query results**
3. **Debug data transformations**
4. **Check error responses**

```javascript
// Example: Debug Firestore queries
const fetchUserBookings = async (userId) => {
  try {
    // Set breakpoint here
    const querySnapshot = await getDocs(
      collection(db, 'bookings').where('userId', '==', userId)
    );
    // Set breakpoint here to inspect querySnapshot
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return bookings;
  } catch (error) {
    // Set breakpoint here to debug errors
    console.error('Firestore error:', error);
    throw error;
  }
};
```

### Debugging RTL/LTR Layouts

#### Language Switching
1. **Set breakpoints** in language change functions
2. **Monitor direction changes**
3. **Debug CSS class applications**
4. **Check translation loading**

```javascript
// Example: Debug language switching
const switchLanguage = (newLang) => {
  // Set breakpoint here
  i18n.changeLanguage(newLang);
  
  // Set breakpoint here to check direction
  const isRTL = newLang === 'ar';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  
  // Set breakpoint here to verify classes
  document.documentElement.className = isRTL ? 'rtl' : 'ltr';
};
```

### Debugging Payment Flows

#### Moyasar Integration
1. **Set breakpoints** in payment functions
2. **Monitor payment responses**
3. **Debug error handling**
4. **Check transaction states**

```javascript
// Example: Debug payment processing
const processPayment = async (paymentData) => {
  try {
    // Set breakpoint here
    const response = await moyasar.payments.create(paymentData);
    // Set breakpoint here to inspect response
    if (response.status === 'paid') {
      // Set breakpoint here for successful payment
      await updateBookingStatus(response.id, 'confirmed');
    }
    return response;
  } catch (error) {
    // Set breakpoint here to debug payment errors
    console.error('Payment error:', error);
    throw error;
  }
};
```

---

## 7. Troubleshooting 🔧

### Common Issues and Solutions

#### Issue 1: Firefox Not Launching
**Symptoms**: Debug session starts but Firefox doesn't open
**Solutions**:
1. **Check Firefox path** in settings:
   ```json
   "firefox-devtools.firefoxExecutable": "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox"
   ```
2. **Verify Firefox permissions**:
   ```bash
   ls -la "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox"
   ```
3. **Try launching Firefox manually** first
4. **Check for port conflicts** (port 6000)

#### Issue 2: Breakpoints Not Working
**Symptoms**: Breakpoints are set but execution doesn't pause
**Solutions**:
1. **Verify source maps** are enabled in settings
2. **Check webRoot** configuration:
   ```json
   "firefox-devtools.webRoot": "${workspaceFolder}/client/src"
   ```
3. **Ensure files are in correct location**
4. **Restart debug session**

#### Issue 3: Variables Not Showing
**Symptoms**: Variables panel is empty or shows "undefined"
**Solutions**:
1. **Check if you're in the right scope**
2. **Use Call Stack** to navigate to correct frame
3. **Add variables to Watch panel**
4. **Verify breakpoint is in active code path**

#### Issue 4: Source Maps Not Loading
**Symptoms**: Code shows as minified or unreadable
**Solutions**:
1. **Check webpack configuration** for source maps
2. **Verify path mappings** in launch.json
3. **Ensure build process** generates source maps
4. **Check browser developer tools** for source map errors

#### Issue 5: Debug Session Disconnects
**Symptoms**: Debugger loses connection to Firefox
**Solutions**:
1. **Check Firefox console** for errors
2. **Restart debug session**
3. **Clear browser cache**
4. **Check for JavaScript errors** in console

### Debug Logs
Enable detailed logging by adding to settings.json:
```json
{
  "firefox-devtools.logLevel": "debug"
}
```

Check logs in VS Code Output panel:
1. **View → Output**
2. **Select "Firefox Debug"** from dropdown
3. **Look for error messages**

---

## 8. Advanced Debugging 🚀

### Debug Console
Use the Debug Console for advanced debugging:
1. **Open Debug Console** (View → Debug Console)
2. **Type JavaScript expressions**
3. **Execute code** in current context
4. **Inspect variables** and objects

### Examples:
```javascript
// In Debug Console, you can run:
user.name
isAuthenticated
currentRoute
document.querySelector('.header')
localStorage.getItem('user')
```

### Performance Debugging
1. **Use Firefox Developer Tools** (F12)
2. **Performance tab** for profiling
3. **Memory tab** for memory leaks
4. **Network tab** for API calls

### Network Debugging
1. **Set breakpoints** in API calls
2. **Monitor request/response** data
3. **Debug error responses**
4. **Check authentication headers**

### State Management Debugging
1. **Set breakpoints** in state updates
2. **Monitor state changes**
3. **Debug action dispatches**
4. **Check reducer logic**

---

## 🎯 Quick Reference

### Essential Keyboard Shortcuts
- `F5` - Start/Continue debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `Shift+F5` - Stop debugging
- `Cmd+Shift+D` - Open debug panel

### Essential Debug Configurations
- **Launch Firefox - LUDUS Client** - For React development
- **Attach to Firefox - LUDUS Client** - For existing sessions
- **Launch Firefox - Production Build** - For production debugging

### Essential Breakpoint Locations
- **Component render methods** - For state debugging
- **API call functions** - For network debugging
- **Event handlers** - For user interaction debugging
- **Error handling blocks** - For error debugging

---

## 🎉 You're Ready!

Your Firefox DevTools debugging environment is fully configured and ready to use. Start with simple breakpoints and gradually explore more advanced debugging features as you become comfortable with the tools.

**Happy debugging!** 🚀
