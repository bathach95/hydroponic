module.exports = class Timer {
    
        constructor(timestamp, callback) {
            this.elapsed = 0;
            this.active = 1;
            this.timestamp = timestamp;
            this.callback = callback;
        }
    
        setTimestamp(timestamp) {
            this.timestamp = timestamp;
        }
    
        setActive(active) {
            this.active = active;
        }
    
        setElapsed(elapsed) {
            this.elapsed = elapsed;
        }
    
        setCallback(callback) {
            this.callback = callback;
        }
    
        getCallback() {
            return this.callback;
        }
    
        getTimeStamp() {
            return this.timestamp;
        }
    
        getActive() {
            return this.active;
        }
    
        getElapsed() {
            return this.elapsed;
        }
    
    };