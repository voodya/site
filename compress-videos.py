import json
import os
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent
ffmpeg = Path(os.environ['TEMP']) / 'portfolio-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
out = root / 'compressed-content'
out.mkdir(exist_ok=True)
work = out / '_encoding-logs'
work.mkdir(exist_ok=True)
files = [f for f in json.loads((root / 'static-assets-audit.json').read_text(encoding='utf-8-sig'))['Files'] if not f['FitsStaticAssets']]
report = []

def inspect(path):
    result = subprocess.run([str(ffmpeg), '-hide_banner', '-i', str(path)], capture_output=True, text=True, encoding='utf-8', errors='replace')
    match = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', result.stderr)
    if not match:
        raise RuntimeError(result.stderr)
    hours, minutes, seconds = map(float, match.groups())
    return hours * 3600 + minutes * 60 + seconds, result.stderr

for index, file in enumerate(files, 1):
    source = Path(file['Path'])
    destination = out / file['RelativePath']
    destination.parent.mkdir(parents=True, exist_ok=True)
    duration, info = inspect(source)
    audio = 'Audio:' in info
    bitrate = int((23 * 1024 * 1024 * 8 / duration - (96000 if audio else 0)) * 0.98)
    if bitrate < 100000:
        raise RuntimeError('Video too long for selected target: ' + str(source))
    print(f'[{index}/7] {file["RelativePath"]}: {duration:.2f}s, video {bitrate // 1000} kbps', flush=True)
    base = [str(ffmpeg), '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source), '-map', '0:v:0', '-c:v', 'libx264', '-preset', 'medium', '-threads', '4', '-b:v', str(bitrate), '-pix_fmt', 'yuv420p', '-passlogfile', str(work / str(index))]
    for phase in (1, 2):
        command = base + ['-pass', str(phase)]
        if phase == 1:
            command += ['-an', '-f', 'null', os.devnull]
        else:
            command += ['-map', '0:a:0?', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(destination)]
        with (work / f'{index}-pass{phase}.log').open('w', encoding='utf-8') as log:
            subprocess.run(command, stdout=log, stderr=log, check=True)
        print(f'[{index}/7] pass {phase} complete', flush=True)
    size = destination.stat().st_size
    if size > 24 * 1024 * 1024:
        raise RuntimeError(f'Output exceeds 24 MiB: {destination}')
    new_duration, new_info = inspect(destination)
    if abs(new_duration - duration) > 0.5:
        raise RuntimeError('Duration mismatch: ' + str(destination))
    validation = subprocess.run([str(ffmpeg), '-v', 'error', '-xerror', '-i', str(destination), '-map', '0:v:0', '-map', '0:a:0?', '-f', 'null', os.devnull], capture_output=True, text=True)
    if validation.returncode:
        raise RuntimeError(validation.stderr)
    report.append({'source': str(source), 'output': str(destination), 'original_bytes': source.stat().st_size, 'compressed_bytes': size, 'duration_seconds': new_duration, 'decode_verified': True})
    (out / 'compression-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'[{index}/7] verified {size / 1024 / 1024:.2f} MiB', flush=True)
print('All 7 videos compressed and decoded successfully.', flush=True)
