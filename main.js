// Pink Birthday Surprise Website - Main Application Entry Point

// Browser Compatibility Checks - Requirements 7.3
const BrowserCompatibility = {
    checkCompatibility() {
        const results = {
            compatible: true,
            features: {},
            warnings: [],
            errors: []
        };
        
        results.features.hashchange = 'onhashchange' in window;
        if (!results.features.hashchange) {
            results.warnings.push('Hash-based routing may not work properly');
        }
        
        results.features.promises = typeof Promise !== 'undefined';
        if (!results.features.promises) {
            results.errors.push('Promises are not supported');
            results.compatible = false;
        }
        
        results.features.map = typeof Map !== 'undefined';
        if (!results.features.map) {
            results.errors.push('Map is not supported');
            results.compatible = false;
        }
        
        results.features.localStorage = this.checkLocalStorage();
        results.features.touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return results;
    },
    
    checkLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    displayWarnings(results) {
        if (results.warnings.length > 0) {
            console.warn('Browser compatibility warnings:', results.warnings);
        }
        if (results.errors.length > 0) {
            console.error('Browser compatibility errors:', results.errors);
        }
    },
    
    showFallbackUI(results) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = '<div style="text-align: center; padding: 40px; font-family: Georgia, serif; background: #fff; border-radius: 20px; margin: 20px; max-width: 500px;"><h1 style="color: #ff4db3;">🎂 Happy Birthday!</h1><p style="color: #666; margin: 20px 0;">Your browser may not support all features. Please use a modern browser.</p><div style="margin-top: 30px; padding: 20px; background: #ffe6f2; border-radius: 10px;"><p style="color: #e6007a; font-weight: bold;">🎉 Wishing you a wonderful birthday! 🎉</p></div></div>';
        }
    }
};

// Error Handler - Centralized error handling - Requirements 7.3
const ErrorHandler = {
    handleError(error, context = 'Unknown') {
        console.error('Error in ' + context + ':', error);
        if (error && error.stack) {
            console.debug('Stack trace:', error.stack);
        }
    },
    
    handleNavigationError(targetPage, error) {
        console.error('Navigation error to ' + targetPage + ':', error);
        if (window.router && targetPage !== 'home') {
            try {
                window.router.navigate('home');
            } catch (fallbackError) {
                this.showErrorPage('Navigation failed. Please refresh the page.');
            }
        }
    },
    
    handleAssetError(assetName, error) {
        console.warn('Asset loading error for ' + assetName + ':', error);
    },
    
    showErrorPage(message) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = '<div class="page"><h1>⚠️ Something Went Wrong</h1><p>' + message + '</p><button class="btn" onclick="location.reload()">Refresh Page</button></div>';
        }
    },
    
    setupGlobalHandlers() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(error || new Error(message), 'Global (' + source + ':' + lineno + ')');
            return false;
        };
        
        window.onunhandledrejection = (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        };
        
        console.log('Global error handlers set up');
    }
};

// Application State Management
const AppState = {
    currentPage: 'home',
    pinValidated: false,
    userPin: null,
    pinValidationError: null,
    
    init() {
        // Load saved PIN state from localStorage
        const savedPin = localStorage.getItem('birthdayPinValidated');
        if (savedPin) {
            this.pinValidated = true;
            this.userPin = savedPin;
        }
    },
    
    validatePin(pin) {
        this.pinValidationError = null;
        
        if (typeof pin !== 'string') {
            this.pinValidationError = 'PIN must be a string';
            return false;
        }
        
        if (!/^\d{4}$/.test(pin)) {
            this.pinValidationError = 'กรอกวันเกิดให้ถูกต้อง';
            return false;
        }
        
        // Only accept 2912 (29 December)
        if (pin !== '2912') {
            this.pinValidationError = 'กรอกวันเกิดให้ถูกต้อง';
            return false;
        }
        
        return true;
    },
    
    setPinValidated(pin) {
        if (this.validatePin(pin)) {
            this.userPin = pin;
            this.pinValidated = true;
            this.pinValidationError = null;
            // Save to localStorage
            localStorage.setItem('birthdayPinValidated', pin);
            return true;
        }
        return false;
    },
    
    getPinValidationError() {
        return this.pinValidationError;
    },
    
    canNavigateTo(targetPage) {
        if (targetPage === 'home' || targetPage === 'pin') {
            return true;
        }
        return this.pinValidated;
    },
    
    reset() {
        this.currentPage = 'home';
        this.pinValidated = false;
        this.userPin = null;
        this.pinValidationError = null;
        localStorage.removeItem('birthdayPinValidated');
    }
};


// Enhanced Asset Management System - Requirements 7.2, 7.3
const Assets = {
    images: {
        cake: './images/birthday-cake.png',
        giftBox: './images/gift-box.png', 
        envelope: './images/envelope.png'
    },
    
    fallbackImages: {
        cake: 'data:image/svg+xml,' + encodeURIComponent('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffb3d9"/><text x="50%" y="50%" font-family="Arial" font-size="48" text-anchor="middle" dy=".3em">🎂</text></svg>'),
        giftBox: 'data:image/svg+xml,' + encodeURIComponent('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffb3d9"/><text x="50%" y="50%" font-family="Arial" font-size="48" text-anchor="middle" dy=".3em">🎁</text></svg>'),
        envelope: 'data:image/svg+xml,' + encodeURIComponent('<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffb3d9"/><text x="50%" y="50%" font-family="Arial" font-size="48" text-anchor="middle" dy=".3em">💌</text></svg>')
    },
    
    imageCache: new Map(),
    loadingStates: new Map(),
    
    getImagePath(imageName) {
        return this.images[imageName] || '';
    },
    
    getFallbackImage(imageName) {
        return this.fallbackImages[imageName] || this.fallbackImages.cake;
    },
    
    async loadImage(imageName) {
        if (this.imageCache.has(imageName)) {
            return this.imageCache.get(imageName);
        }
        
        if (this.loadingStates.has(imageName)) {
            return this.loadingStates.get(imageName);
        }
        
        const imagePath = this.getImagePath(imageName);
        
        if (!imagePath) {
            console.warn('Asset loading: Unknown image name "' + imageName + '"');
            const fallbackSrc = this.getFallbackImage(imageName);
            this.imageCache.set(imageName, fallbackSrc);
            return fallbackSrc;
        }
        
        const self = this;
        const loadingPromise = new Promise(function(resolve) {
            const img = new Image();
            
            img.onload = function() {
                console.log('Asset loading: Successfully loaded ' + imageName);
                self.imageCache.set(imageName, imagePath);
                self.loadingStates.delete(imageName);
                resolve(imagePath);
            };
            
            img.onerror = function() {
                console.warn('Asset loading: Failed to load ' + imageName + ', using fallback');
                const fallbackSrc = self.getFallbackImage(imageName);
                self.imageCache.set(imageName, fallbackSrc);
                self.loadingStates.delete(imageName);
                resolve(fallbackSrc);
            };
            
            img.src = imagePath;
        });
        
        this.loadingStates.set(imageName, loadingPromise);
        return loadingPromise;
    },
    
    async preloadAllImages() {
        console.log('Asset loading: Starting preload of all images...');
        
        const imageNames = Object.keys(this.images);
        const self = this;
        const loadPromises = imageNames.map(function(name) {
            return self.loadImage(name).then(function(src) {
                return { name: name, src: src };
            });
        });
        
        try {
            const results = await Promise.all(loadPromises);
            const loadedImages = {};
            
            results.forEach(function(result) {
                loadedImages[result.name] = result.src;
            });
            
            console.log('Asset loading: All images preloaded successfully');
            return loadedImages;
        } catch (error) {
            console.error('Asset loading: Error during preload:', error);
            const fallbackImages = {};
            const self = this;
            imageNames.forEach(function(name) {
                fallbackImages[name] = self.getFallbackImage(name);
            });
            return fallbackImages;
        }
    },
    
    async validateAssets() {
        console.log('Asset loading: Validating all assets...');
        
        const validation = {
            valid: true,
            missing: [],
            available: [],
            usingFallbacks: []
        };
        
        const imageNames = Object.keys(this.images);
        
        for (const imageName of imageNames) {
            const imagePath = this.getImagePath(imageName);
            
            try {
                const loadedSrc = await this.loadImage(imageName);
                
                if (loadedSrc === imagePath) {
                    validation.available.push(imageName);
                } else {
                    validation.usingFallbacks.push(imageName);
                }
            } catch (error) {
                validation.missing.push(imageName);
                validation.valid = false;
            }
        }
        
        console.log('Asset validation results:', validation);
        return validation;
    },
    
    clearCache() {
        this.imageCache.clear();
        this.loadingStates.clear();
        console.log('Asset loading: Cache cleared');
    }
};

// Navigation Flow Configuration - Requirements 8.1
const NavigationFlow = {
    'home': 'pin',
    'pin': 'gift',
    'gift': 'menu', 
    'menu': 'envelope',
    'envelope': 'letter',
    'letter': null
};


// Router Class for Hash-based Navigation - Requirements 8.1
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.appContainer = document.getElementById('app');
        this.isTransitioning = false;
        
        const self = this;
        window.addEventListener('hashchange', function() {
            self.handleHashChange();
        });
        
        window.addEventListener('load', function() {
            self.handleHashChange();
        });
    }
    
    addRoute(hash, component) {
        this.routes.set(hash, component);
    }
    
    navigate(hash) {
        if (this.isTransitioning) {
            return;
        }
        
        if (AppState.canNavigateTo(hash)) {
            window.location.hash = hash;
        } else {
            console.warn('Navigation to ' + hash + ' blocked: PIN validation required');
        }
    }
    
    async handleHashChange() {
        if (this.isTransitioning) {
            return;
        }
        
        const hash = window.location.hash.slice(1) || 'home';
        
        if (!AppState.canNavigateTo(hash)) {
            console.warn('Access to ' + hash + ' denied: PIN validation required');
            if (!AppState.pinValidated && hash !== 'pin') {
                window.location.hash = 'pin';
                return;
            }
        }
        
        const component = this.routes.get(hash);
        
        if (component) {
            await this.transitionToComponent(hash, component);
        } else {
            console.warn('Route not found: ' + hash + ', redirecting to home');
            this.navigate('home');
        }
    }
    
    async transitionToComponent(hash, component) {
        this.isTransitioning = true;
        
        try {
            this.currentRoute = hash;
            AppState.currentPage = hash;
            
            await this.renderComponent(component);
        } catch (error) {
            console.error('Error during page transition:', error);
            ErrorHandler.handleNavigationError(hash, error);
        } finally {
            this.isTransitioning = false;
        }
    }
    
    async renderComponent(component) {
        if (this.appContainer) {
            this.appContainer.innerHTML = component.render();
            
            if (typeof component.afterRender === 'function') {
                try {
                    await component.afterRender();
                } catch (error) {
                    console.error('Error in component afterRender:', error);
                    ErrorHandler.handleError(error, 'Component afterRender');
                }
            }
        }
    }
}


// LetterPage Component - Requirements 6.1, 6.2, 6.3
class LetterPage {
    render() {
        return '<div class="page" style="max-width: 600px;">' +
            '<h1 style="font-size:1.7rem; margin-bottom: 15px; color: #ff85b3;">🎉 Happy Birth Day To You Naa 🎉</h1>' +
            '<div style="background: var(--soft-pink); padding: 15px; border-radius: 15px; margin: 10px 0; text-align: left;">' +
            '<p style="font-size: 1.3rem; line-height: 1.8; color: black;">' +
            'Dear Birthday Khing <br>' +
            '<img src="./images/khing.png" alt="Khing" style="max-width: 200px; width: 100%; border-radius: 10%; margin: 15px auto; display: block; box-shadow: 0 4px 15px rgba(255, 153, 204, 0.4);"><br>' +
            'สุขสันต์วันเกิดนะ ไม่ว่าปีนี้หรือปีไหนๆ อยากให้รู้ว่าเค้าหวังดีและเป็นกำลังใจให้เธอเสมอ ขอให้โลกนี้ใจดีกับเธอเท่าที่เธอใจดีกับคนอื่นนะ ยิ้มเยอะๆ ดูแลตัวเองด้วย แก่ขึ้นอีกปีแล้ว  มีความสุขมากๆนะ🎂🎉🐷🦋 <br><br>' +
            'ถึงไม่ได้อยู่ข้างๆก็ขอให้เขารักเธอมากๆนะ 😊</p>' +
            '</p></div>' +
            '<div style="margin-top: 30px;"><p style="font-style: italic; color: black;">🎈 Hope your day is as Happy and Happy everyday.🎈</p></div>' +
            '</div>';
    }
    
    afterRender() {
        console.log('Birthday letter displayed successfully!');
    }
}

// EnvelopePage Component - Requirements 5.1, 5.2, 5.3
class EnvelopePage {
    render() {
        return '<div class="page envelope-page">' +
            '<div class="envelope-content">' +
            '<img src="" alt="Envelope" class="envelope-img" id="envelope">' +
            '<p class="envelope-message">Happy Birth Day To You</p>' +
            '<button class="btn envelope-btn" id="open-letter-btn">เปิดอ่าน</button>' +
            '</div>' +
            '</div>';
    }
    
    async afterRender() {
        const envelopeImg = document.getElementById('envelope');
        if (envelopeImg) {
            try {
                const envelopeSrc = await Assets.loadImage('envelope');
                envelopeImg.src = envelopeSrc;
            } catch (error) {
                console.error('Error loading envelope image:', error);
                envelopeImg.src = Assets.getFallbackImage('envelope');
            }
        }
        
        const openLetterButton = document.getElementById('open-letter-btn');
        if (openLetterButton) {
            openLetterButton.addEventListener('click', function() {
                // Change to letter song when clicking the button (for mobile)
                setTimeout(() => {
                    BackgroundMusic.changeTrack('letter');
                }, 5000);
                window.router.navigate('letter');
            });
        }
    }
}

// MenuPage Component - Requirements 4.1, 4.2
class MenuPage {
    render() {
        return '<div class="page">' +
            '<h1>Menu </h1>'+
            '<p>เลือกของขวัญวันเกิด</p>' +
            '<div class="card birthday-letter-card" id="birthday-letter-card">' +
            '<h2>💌 จดหมายสำหรับคนน่ารัก</h2>' +
            '<p>A special birthday letter just for you</p>' +
            '</div></div>';
    }
    
    afterRender() {
        const birthdayLetterCard = document.getElementById('birthday-letter-card');
        if (birthdayLetterCard) {
            birthdayLetterCard.addEventListener('click', function() {
                window.router.navigate('envelope');
            });
        }
    }
}

// GiftPage Component - Requirements 3.1, 3.2, 3.3
class GiftPage {
    render() {
        return '<div class="page gift-page">' +
            '<div class="gift-content">' +
            '<img src="" alt="Gift Box" class="gift-image" id="gift-box">' +
            '<p class="gift-message">ของขวัญสำหรับคนน่ารัก</p>' +
            '<button class="btn gift-btn" id="receive-gift-btn">รับของขวัญ</button>' +
            '</div>' +
            '</div>';
    }
    
    async afterRender() {
        const giftImg = document.getElementById('gift-box');
        if (giftImg) {
            try {
                const giftSrc = await Assets.loadImage('giftBox');
                giftImg.src = giftSrc;
            } catch (error) {
                console.error('Error loading gift box image:', error);
                giftImg.src = Assets.getFallbackImage('giftBox');
            }
        }
        
        const receiveGiftButton = document.getElementById('receive-gift-btn');
        if (receiveGiftButton) {
            receiveGiftButton.addEventListener('click', function() {
                window.router.navigate('menu');
            });
        }
    }
}


// PinPage Component - Requirements 2.1, 2.2, 2.3, 2.4
class PinPage {
    render() {
        return '<div class="page pin-page">' +
            '<div class="pin-container">' +
            '<div class="pin-box">' +
            '<h2 class="pin-title">กรอกวันเกิด</h2>' +
            '<p class="pin-hint">คำใบ้ : วัน / เดือนเกิด</p>' +
            '<div class="pin-inputs">' +
            '<input type="text" class="pin-digit" id="pin-1" maxlength="1" inputmode="numeric" pattern="[0-9]">' +
            '<input type="text" class="pin-digit" id="pin-2" maxlength="1" inputmode="numeric" pattern="[0-9]">' +
            '<input type="text" class="pin-digit" id="pin-3" maxlength="1" inputmode="numeric" pattern="[0-9]">' +
            '<input type="text" class="pin-digit" id="pin-4" maxlength="1" inputmode="numeric" pattern="[0-9]">' +
            '</div>' +
            '</div>' +
            '<div id="pin-error" class="error-message hidden"></div>' +
            '<button class="btn pin-btn" id="pin-submit-btn">ยืนยัน</button>' +
            '</div>' +
            '</div>';
    }
    
    afterRender() {
        const pinInputs = document.querySelectorAll('.pin-digit');
        const submitButton = document.getElementById('pin-submit-btn');
        const errorDiv = document.getElementById('pin-error');
        
        // Auto-focus and auto-move to next input
        pinInputs.forEach((input, index) => {
            input.addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                if (errorDiv) {
                    errorDiv.classList.add('hidden');
                }
                // Move to next input
                if (e.target.value.length === 1 && index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
            });
            
            input.addEventListener('keydown', function(e) {
                // Move to previous input on backspace
                if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                    pinInputs[index - 1].focus();
                }
                // Submit on Enter at last input
                if (e.key === 'Enter' && index === pinInputs.length - 1) {
                    handleSubmit();
                }
            });
        });
        
        // Focus first input
        if (pinInputs[0]) {
            pinInputs[0].focus();
        }
        
        const handleSubmit = function() {
            let pin = '';
            pinInputs.forEach(input => {
                pin += input.value;
            });
            
            if (AppState.validatePin(pin)) {
                AppState.setPinValidated(pin);
                window.router.navigate('gift');
            } else {
                const errorMessage = AppState.getPinValidationError() || 'กรุณากรอกวันเกิดให้ถูกต้อง';
                if (errorDiv) {
                    errorDiv.textContent = errorMessage;
                    errorDiv.classList.remove('hidden');
                }
            }
        };
        
        if (submitButton) {
            submitButton.addEventListener('click', handleSubmit);
        }
    }
}

// Background Music Manager
const BackgroundMusic = {
    audio: null,
    isPlaying: false,
    currentTrack: '',
    
    tracks: {
        birthday: './audio/Happy%20Birthday%20Piano.mp3',
        letter: './audio/BYE.mp3'
    },
    
    init(track = 'birthday') {
        if (this.audio && this.currentTrack === track) return;
        
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        this.audio = new Audio(this.tracks[track] || this.tracks.birthday);
        this.audio.loop = true;
        this.audio.volume = 0.5;
        this.currentTrack = track;
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
        });
    },
    
    play(track = 'birthday') {
        if (this.currentTrack !== track || !this.audio) {
            this.init(track);
        }
        
        if (!this.isPlaying) {
            this.audio.play().then(() => {
                this.isPlaying = true;
                console.log('Background music started:', track);
            }).catch(err => {
                console.warn('Could not play music:', err);
            });
        }
    },
    
    changeTrack(track) {
        const wasPlaying = this.isPlaying;
        this.pause();
        this.init(track);
        if (wasPlaying) {
            this.play(track);
        }
    },
    
    pause() {
        if (this.audio && this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    },
    
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play(this.currentTrack);
        }
    },
    
    setVolume(vol) {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, vol));
        }
    }
};

// HomePage Component - Requirements 1.1, 1.2, 1.3
class HomePage {
    render() {
        return '<div class="page home-page">' +
            '<div class="home-content">' +
            '<img src="" alt="Birthday Cake" class="home-image" id="birthday-cake">' +
            '<p class="home-message">ของขวัญมาส่งแล้ว !</p>' +
            '<button class="btn home-btn" id="wishes-btn">เปิด</button>' +
            '</div>' +
            '</div>';
    }
    
    async afterRender() {
        const cakeImg = document.getElementById('birthday-cake');
        if (cakeImg) {
            try {
                const cakeSrc = await Assets.loadImage('cake');
                cakeImg.src = cakeSrc;
            } catch (error) {
                console.error('Error loading birthday cake image:', error);
                cakeImg.src = Assets.getFallbackImage('cake');
            }
        }
        
        const wishesButton = document.getElementById('wishes-btn');
        if (wishesButton) {
            wishesButton.addEventListener('click', function() {
                console.log('Button clicked, starting music...');
                // Start background music when user clicks
                BackgroundMusic.play();
                window.router.navigate('pin');
            });
        }
    }
}


// Application Controller - Manages overall application lifecycle - Requirements 8.1
const AppController = {
    router: null,
    initialized: false,
    compatibilityResults: null,
    
    async initialize() {
        if (this.initialized) {
            console.warn('Application already initialized');
            return true;
        }
        
        console.log('Pink Birthday Surprise Website - Initializing...');
        
        try {
            // Step 0: Set up global error handlers - Requirements 7.3
            ErrorHandler.setupGlobalHandlers();
            
            // Step 1: Check browser compatibility - Requirements 7.3
            this.compatibilityResults = BrowserCompatibility.checkCompatibility();
            BrowserCompatibility.displayWarnings(this.compatibilityResults);
            
            if (!this.compatibilityResults.compatible) {
                console.error('Browser is not compatible');
                BrowserCompatibility.showFallbackUI(this.compatibilityResults);
                return false;
            }
            
            // Step 2: Preload all images - Requirements 7.2, 7.3
            await this.preloadAssets();
            
            // Step 3: Validate assets
            await this.validateAssets();
            
            // Step 4: Initialize router with all page routes - Requirements 8.1
            this.initializeRouter();
            
            // Step 5: Set up application state management
            this.setupStateManagement();
            
            // Step 6: Connect all navigation flows
            this.connectNavigationFlows();
            
            this.initialized = true;
            console.log('Application initialized successfully');
            return true;
        } catch (error) {
            console.error('Application initialization failed:', error);
            ErrorHandler.handleError(error, 'Application Initialization');
            this.handleInitializationError(error);
            return false;
        }
    },
    
    async preloadAssets() {
        console.log('Preloading assets...');
        try {
            await Assets.preloadAllImages();
            console.log('Asset preloading completed');
        } catch (error) {
            console.warn('Asset preloading failed, continuing with fallbacks:', error);
            ErrorHandler.handleAssetError('all', error);
        }
    },
    
    async validateAssets() {
        try {
            const validation = await Assets.validateAssets();
            if (!validation.valid) {
                console.warn('Some assets are missing:', validation.missing);
            }
            if (validation.usingFallbacks.length > 0) {
                console.info('Using fallback images for:', validation.usingFallbacks);
            }
            return validation;
        } catch (error) {
            console.warn('Asset validation failed:', error);
            ErrorHandler.handleAssetError('validation', error);
            return { valid: false, missing: [], available: [], usingFallbacks: [] };
        }
    },
    
    initializeRouter() {
        console.log('Initializing router with all page routes...');
        
        this.router = new Router();
        window.router = this.router;
        
        const pageComponents = {
            'home': new HomePage(),
            'pin': new PinPage(),
            'gift': new GiftPage(),
            'menu': new MenuPage(),
            'envelope': new EnvelopePage(),
            'letter': new LetterPage()
        };
        
        const self = this;
        Object.entries(pageComponents).forEach(function(entry) {
            const route = entry[0];
            const component = entry[1];
            self.router.addRoute(route, component);
            console.log('Route registered: ' + route);
        });
        
        console.log('Router initialization complete');
    },
    
    setupStateManagement() {
        console.log('Setting up application state management...');
        // Load saved state instead of reset
        AppState.init();
        window.AppState = AppState;
        console.log('State management setup complete');
        console.log('PIN validated from storage:', AppState.pinValidated);
    },
    
    connectNavigationFlows() {
        console.log('Connecting navigation flows...');
        const flowKeys = Object.keys(NavigationFlow);
        console.log('Navigation flow configured for ' + flowKeys.length + ' pages: ' + flowKeys.join(' → '));
        window.NavigationFlow = NavigationFlow;
        console.log('Navigation flows connected');
    },
    
    handleInitializationError(error) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = '<div class="page"><h1>⚠️ Oops!</h1><p>Something went wrong while loading your birthday surprise.</p><p>Please refresh the page to try again.</p><button class="btn" onclick="location.reload()">Refresh Page</button></div>';
        }
    },
    
    reset() {
        AppState.reset();
        Assets.clearCache();
        if (this.router) {
            this.router.navigate('home');
        }
        console.log('Application reset complete');
    },
    
    getStatus() {
        return {
            initialized: this.initialized,
            currentPage: AppState.currentPage,
            pinValidated: AppState.pinValidated,
            routerReady: this.router !== null,
            assetsLoaded: Assets.imageCache.size > 0,
            browserCompatible: this.compatibilityResults ? this.compatibilityResults.compatible : null
        };
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    await AppController.initialize();
    window.AppController = AppController;
    
    // Create falling hearts
    createFallingHearts();
});

// Falling Hearts Effect
function createFallingHearts() {
    const container = document.getElementById('hearts-container');
    if (!container) {
        console.error('Hearts container not found!');
        return;
    }
    
    console.log('Creating falling hearts...');
    const heartSymbols = ['♥', '♡', '❤'];
    
    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 12 + 12) + 'px';
        heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
        heart.style.animationDelay = Math.random() * 2 + 's';
        
        container.appendChild(heart);
        
        // Remove heart after animation
        setTimeout(() => {
            heart.remove();
        }, 12000);
    }
    
    // Create initial hearts
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createHeart(), i * 300);
    }
    
    // Continue creating hearts
    setInterval(createHeart, 800);
    
    console.log('Falling hearts initialized!');
}
