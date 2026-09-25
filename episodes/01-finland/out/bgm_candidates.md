# BGM candidates (found by search; not listened to — check by ear)

Aim: something **fuller and with more drive** than the code-composed track ("too lonely" feedback). Piano + strings + a pulse or light beat.

| # | Track | Artist | Source | License | Character (from the page) | Link |
|---|---|---|---|---|---|---|
| 1 | Cinematic Documentary | Lexin_Music | Pixabay | Pixabay Content License (free, no credit needed) | Orchestral, keeps evolving; 2.8M plays | https://pixabay.com/music/beautiful-plays-cinematic-documentary-115669/ |
| 2 | Upbeat Documentary | Lexin_Music | Pixabay | Same as above | Upbeat documentary cue with forward motion, 2:25 | https://pixabay.com/music/adventure-upbeat-documentary-116202/ |
| 3 | Inspiring Cinematic Ambient | Lexin_Music | Pixabay | Same as above | Popular, uplifting cinematic ambient; 5.2M plays | https://pixabay.com/music/beautiful-plays-inspiring-cinematic-ambient-116199/ |
| 4 | Documentary Suspense | leberch | Pixabay | Same as above | Pulse-driven, tense; good for the investigative parts | https://pixabay.com/music/pulses-cinematic-atmospheric-pulse-suspense-375268/ |
| 5 | Cinematic Documentary (Upbeat) | — | Pixabay | Same as above | Upbeat cinematic | https://pixabay.com/music/upbeat-cinematic-documentary-278522/ |
| 6 | Investigations | Kevin MacLeod | incompetech / YouTube Audio Library | CC BY (credit required) | Moody, investigative, suspense | https://archive.org/details/investigations-by-kevin-macleod |
| 7 | Eyes In The Void / Meanwhile | Scott Buckley | YouTube Audio Library | Check credit terms in the Audio Library (Buckley is often CC BY) | Dramatic, documentary background | https://music.youtube.com/playlist?list=PLzCxunOM5WFK7WGa3wGjlONp_9R66a2zz |

Searches to try in the YouTube Audio Library (Studio → Audio Library): genre "Cinematic", mood "Dramatic" or "Inspirational", credit "Not required".

Once you've picked one: `python3 tools/pipeline.py episode --bgm path/to/track.mp3`
If the licence requires credit, add a line to `credits.csv` and to the description in `out/youtube.md`.
