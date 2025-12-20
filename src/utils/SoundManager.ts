export class SoundManager {
    private context: AudioContext | null = null;
    private gainNode: GainNode | null = null;

    constructor() {
        try {
            // Initialize AudioContext contentiously (user interaction required usually, 
            // but we can init it on first play)
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.context = new AudioContextClass();
            this.gainNode = this.context.createGain();
            this.gainNode.connect(this.context.destination);
            // Lower volume slightly
            this.gainNode.gain.value = 0.3;
        } catch (e) {
            console.error('Web Audio API is not supported in this browser', e);
        }
    }

    private ensureContext() {
        if (this.context?.state === 'suspended') {
            this.context.resume();
        }
    }

    // Ping Pong sound (High 'ding-dong')
    playCorrect() {
        if (!this.context || !this.gainNode) return;
        this.ensureContext();

        const t = this.context.currentTime;
        const osc1 = this.context.createOscillator();

        // "Ping" (High E)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(660, t);
        osc1.frequency.exponentialRampToValueAtTime(0.01, t + 1.5);

        // "Pong" (High C) - slightly delayed? 
        // Actually a simple "Ding" is usually one or two tones.
        // Let's do a classic "Ding-Dong" (High C -> G?)

        // Tone 1: High C (1046Hz) for short duration
        const ding = this.context.createOscillator();
        const dingGain = this.context.createGain();
        ding.type = 'sine';
        ding.frequency.setValueAtTime(1046.50, t);
        dingGain.gain.setValueAtTime(0.5, t);
        dingGain.gain.exponentialRampToValueAtTime(0.01, t + 0.8);

        ding.connect(dingGain);
        dingGain.connect(this.gainNode);
        ding.start(t);
        ding.stop(t + 0.8);

        // Tone 2: G (783Hz) slightly after
        // Delay 0.1s
        const dong = this.context.createOscillator();
        const dongGain = this.context.createGain();
        dong.type = 'sine';
        dong.frequency.setValueAtTime(783.99, t + 0.15);
        dongGain.gain.setValueAtTime(0.5, t + 0.15);
        dongGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

        dong.connect(dongGain);
        dongGain.connect(this.gainNode);
        dong.start(t + 0.15);
        dong.stop(t + 1.5);
    }

    // Incorrect sound (Low 'Buzz-Buzz')
    playIncorrect() {
        if (!this.context || !this.gainNode) return;
        this.ensureContext();

        const t = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        // Sawtooth for "Harsh" sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t); // Low B
        // osc.frequency.linearRampToValueAtTime(100, t + 0.2); // Pitch drop

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.4);

        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.4);
    }
}

export const soundManager = new SoundManager();
