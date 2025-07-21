/**
 * Stack Trace Manipulation Examples
 * Shows what's possible and what's not with JavaScript stack traces
 */

// Example 1: Basic stack trace modification
function demonstrateStackModification() {
    const err = new Error("Test error");
    
    console.log("Original stack:");
    console.log(err.stack);
    
    // Modify the stack string (just cosmetic)
    const lines = err.stack.split('\n');
    err.stack = lines.slice(1).join('\n'); // Remove first line (Error message)
    
    console.log("\nModified stack (removed error message line):");
    console.log(err.stack);
    
    // Completely replace stack
    err.stack = "Custom Stack Trace:\n  at myCustomFunction (custom.js:1:1)";
    console.log("\nCompletely custom stack:");
    console.log(err.stack);
}

// Example 2: Using Error.captureStackTrace to exclude functions (V8 only)
function levelOne() {
    return levelTwo();
}

function levelTwo() {
    return levelThree();
}

function levelThree() {
    // Normal error - includes all functions
    const normalError = new Error("Normal error");
    
    // Error with captureStackTrace - excludes levelThree
    const cleanError = {};
    if (Error.captureStackTrace) {
        Error.captureStackTrace(cleanError, levelThree);
    }
    
    return {
        normal: normalError.stack,
        clean: cleanError.stack
    };
}

function demonstrateCaptureStackTrace() {
    const { normal, clean } = levelOne();
    
    console.log("Normal stack trace:");
    console.log(normal);
    
    console.log("\nCleaned stack trace (levelThree excluded):");
    console.log(clean);
}

// Example 3: Console override that cleans its own traces
function createCleanConsoleOverride() {
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = function(...args) {
        // If there's an Error object, clean our function from its stack
        args.forEach(arg => {
            if (arg instanceof Error && arg.stack) {
                const lines = arg.stack.split('\n');
                // Remove lines that mention this console override
                arg.stack = lines.filter(line => 
                    !line.includes('console.log') && 
                    !line.includes('createCleanConsoleOverride')
                ).join('\n');
            }
        });
        
        return originalLog.apply(console, args);
    };
    
    console.error = function(...args) {
        // Similar cleaning for console.error
        args.forEach(arg => {
            if (arg instanceof Error && arg.stack) {
                const lines = arg.stack.split('\n');
                arg.stack = lines.filter(line => 
                    !line.includes('console.error') && 
                    !line.includes('createCleanConsoleOverride')
                ).join('\n');
            }
        });
        
        return originalError.apply(console, args);
    };
    
    return {
        restore: () => {
            console.log = originalLog;
            console.error = originalError;
        }
    };
}

// Example 4: Stack trace parsing and enhancement
function enhanceStackTrace(error) {
    if (!error.stack) return error;
    
    const lines = error.stack.split('\n');
    const enhancedLines = lines.map(line => {
        // Add file-based coloring info to stack trace
        if (line.includes('animations.js')) {
            return `🎨 ${line}`;
        } else if (line.includes('game.js')) {
            return `🎮 ${line}`;
        } else if (line.includes('ui.js')) {
            return `🖼️ ${line}`;
        }
        return line;
    });
    
    // Create new error with enhanced stack
    const enhanced = new Error(error.message);
    enhanced.stack = enhancedLines.join('\n');
    return enhanced;
}

// Example 5: File detection without polluting current stack
function getCallingFileClean() {
    // Create error in a separate function to isolate stack pollution
    function captureStack() {
        const obj = {};
        if (Error.captureStackTrace) {
            // Exclude both captureStack AND getCallingFileClean
            Error.captureStackTrace(obj, getCallingFileClean);
        } else {
            obj.stack = (new Error()).stack;
        }
        return obj.stack;
    }
    
    const stack = captureStack();
    if (stack) {
        const lines = stack.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/([^\/\\]+\.js)/);
            if (match) {
                return match[1];
            }
        }
    }
    return 'unknown';
}

// Example 6: Console with clean file detection
function createFileBasedConsoleClean() {
    const original = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
    };
    
    const colors = {
        'animations.js': '#FF69B4',
        'game.js': '#4169E1',
        'ui.js': '#32CD32',
        'players.js': '#9932CC',
        'board.js': '#FF8C00',
        'board-data.js': '#FF8C00',
        'cards.js': '#FFD700',
        'resourcemanagement.js': '#00FFFF'
    };
    
    function wrapConsoleMethod(method, level) {
        return function(...args) {
            // For Error objects, pass through unchanged
            if (args[0] instanceof Error) {
                return original[method].apply(console, args);
            }
            
            // For styled messages, pass through unchanged
            if (typeof args[0] === 'string' && args[0].startsWith('%c')) {
                return original[method].apply(console, args);
            }
            
            // Get calling file and apply styling
            const file = getCallingFileClean();
            const color = colors[file] || '#FFFFFF';
            const message = args[0] || '';
            
            const styledMessage = `%c[${file}] %c${message}`;
            const prefixStyle = `color: ${color}; font-weight: bold;`;
            const messageStyle = `color: ${color};`;
            
            return original[method](styledMessage, prefixStyle, messageStyle, ...args.slice(1));
        };
    }
    
    console.log = wrapConsoleMethod('log', 'log');
    console.error = wrapConsoleMethod('error', 'error');
    console.warn = wrapConsoleMethod('warn', 'warn');
    console.info = wrapConsoleMethod('info', 'info');
    
    return {
        restore: () => {
            Object.assign(console, original);
        }
    };
}

// Test functions
function testStackManipulation() {
    console.log("=== Stack Manipulation Tests ===\n");
    
    console.log("1. Basic stack modification:");
    demonstrateStackModification();
    
    console.log("\n2. Error.captureStackTrace (V8 only):");
    demonstrateCaptureStackTrace();
    
    console.log("\n3. Enhanced stack trace:");
    const error = new Error("Test error");
    const enhanced = enhanceStackTrace(error);
    console.log("Original:", error.stack);
    console.log("Enhanced:", enhanced.stack);
    
    console.log("\n4. Clean file detection:");
    console.log("Detected file:", getCallingFileClean());
}

// Export for testing
window.stackTraceUtils = {
    demonstrateStackModification,
    demonstrateCaptureStackTrace,
    enhanceStackTrace,
    getCallingFileClean,
    createCleanConsoleOverride,
    createFileBasedConsoleClean,
    test: testStackManipulation
};