"""Original 64-second pentatonic meditation loop; no third-party music samples."""
import numpy as np
import wave
from pathlib import Path

rate, seconds = 24000, 64
n = rate * seconds
mix = np.zeros((n, 2), dtype=np.float64)

def note(midi, start, length, level, pan=0, bowl=False):
    t = np.arange(int(length*rate))/rate
    f = 440*2**((midi-69)/12)
    env = (1-np.exp(-t/0.035))*np.exp(-t/(2.2 if bowl else 1.35))
    env *= np.minimum(1, (length-t)/0.16)
    ratios = [(1,1), (2.71,.12), (4.1,.035)] if bowl else [(1,1),(2,.27),(3,.075)]
    y = sum(a*np.sin(2*np.pi*f*r*t) for r,a in ratios)*env*level
    for delay, amp, spread in [(0,1,pan),(.29,.20,-pan),(.61,.12,pan)]:
        idx = (np.arange(len(t))+int((start+delay)*rate))%n
        for ch, gain in enumerate([np.sqrt((1-spread)/2),np.sqrt((1+spread)/2)]):
            np.add.at(mix[:,ch], idx, y*amp*gain)

# Four related phrases: statement, response, expansion, homecoming, at 60 BPM.
phrases = [[62,69,74,69,66,64,69,66],[62,66,69,76,74,69,66,64],
           [69,74,78,76,74,69,66,69],[66,69,74,69,66,64,62,62]]
for bar, phrase in enumerate(phrases):
    for i, pitch in enumerate(phrase):
        note(pitch,bar*16+i*2,6,.15 if i%4==0 else .105,(-1)**i*.3)
    note(38 if bar!=2 else 45,bar*16,12,.065,0,True)
    note(57,bar*16+8,7,.035,.5,True)
t=np.arange(n)/rate
# Frequencies chosen to wrap exactly at 64s, slow breath pad under the melody.
pad=sum(np.sin(2*np.pi*f*t)*a for f,a in [(110,.016),(165,.009),(220,.006)])
pad*=.75+.25*np.sin(2*np.pi*t/16)
mix+=pad[:,None]
peak=np.max(np.abs(mix)); mix*=.8/max(peak,.001)
out=Path(__file__).resolve().parents[1]/'public/assets/meditation-loop.wav'
with wave.open(str(out),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate)
    w.writeframes((mix*32767).astype('<i2').tobytes())
print(out, 'peak', round(float(np.max(np.abs(mix))),3))
