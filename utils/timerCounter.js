var events = require('events');

module.exports = class TimerCounter {
    constructor(timer) {
        this.loop = 1;
        this.timer = timer;
        this.eventEmitter = new events.EventEmitter();
        this.init();
    }

    init() {
        console.log("timer init");
        this.timer.setElapsed(0);
        this.timer.setActive(0);
        this.eventEmitter.on('timeout', this.timer.getCallback());
        setInterval(this.execute.bind(this), 1000);
    }
    reset() {
        console.log("timer reset");
        this.timer.setElapsed(0);
        this.timer.setActive(1);
        this.loop = 1;
    }
    resetForOneTime() {
        console.log("timer reset one time");
        this.timer.setElapsed(0);
        this.timer.setActive(1);
        this.loop = 0;
    }

    active() {
        this.timer.setActive(1);
    }

    deactive() {
        this.timer.setActive(0);
    }

    execute() {
        if (this.timer.getActive() === 1) {
            this.timer.setElapsed(this.timer.getElapsed() + 1);
            if (this.timer.getElapsed() >= this.timer.getTimeStamp()) {
                this.eventEmitter.emit('timeout');
                this.timer.setElapsed(0);
                if(this.loop !== 1){
                    this.deactive();
                }
            }
        }

    }

};