"""Only receives controlled game announcement text through stdin, never a shell."""
import asyncio, json, sys
import edge_tts

async def main():
    data=json.loads(sys.stdin.buffer.read().decode('utf-8'))
    await edge_tts.Communicate(data['text'][:200], 'vi-VN-NamMinhNeural', rate='-4%', pitch='-6Hz').save(data['output'])

asyncio.run(main())
