# Apeiron Design Plan

Reading this as: an editorial astronomy scrollytelling site for curious non-experts, in a quiet observational visual language, dial ENERGY 1 / RHYTHM 2 / MOTION 3.

The palette and type stacks are pinned by the PRD. This plan does not re-pick them. Its job is to choose the layout logic and the one signature element, and to state a one-line reason for each decision (R-31).

## Subject / audience / job

- Subject: the scale of the cosmos seen from Earth, from a point of light to the observable universe.
- Audience: curious non-experts, not astronomers. They arrive with wonder, not a textbook.
- Job: make cosmic scale felt from one point of light, so the reader leaves with a sense of the distance, not a list of numbers.

## Color (four PRD tokens plus functional values)

- `--color-void` `#05060A`: the night sky itself, the ground every stage sits on (background).
- `--color-starlight` `#E8E4DC`: primary text, warm off-white like starlight, not clinical white.
- `--color-dust` `#8A8D98`: secondary text and labels, dimmer so it defers to starlight.
- `--color-amber` `#E8A15B`: the single accent, used only on the ruler marker and the "you are here" pulse.
- `--line` `rgba(232,228,220,.16)`: the hairline for ruler ticks and dividers, starlight at 16 percent so it is structure, never decoration.
- `--sky-glow` `#0B1020`: the top of the sky gradient, a slightly bluer near-black that suggests atmosphere above the deep void.

Four core tokens plus one accent (R-29). No fifth decorative accent exists.

## Type (three roles)

- Display = Instrument Serif: editorial voice for the headline and the big numbers, an astronomy-magazine serif rather than a neutral UI face.
- Body = Inter: quiet, legible UI text for explanations and labels, stays out of the display's way.
- Data / units / orders of magnitude = JetBrains Mono: a monospace so units, exponents, and ranges align in a column and read as measurements, not prose.

## Layout concept

One continuous full-viewport stage. A fixed vertical scale ruler sits on the right edge and persists across all seven stages; one amber marker travels outward along it as the reader scrolls. Text panels anchor bottom-left on desktop, so the eye stays left while the ruler stays right. In the reduced-motion path the stages stack in normal single-column flow with no pinning, and the ruler becomes a simple static readout.

Desktop wireframe:

```
+--------------------------------------------------+
|                                                  |
|   (continuous cosmic field, one accent = marker) |
|                                                  |
|                                                  |
|  +-----------------------------+          |  -  |
|  | stage label (mono, dust)    |          |     |
|  | HEADLINE (serif, large)     |          |  *  |  <- amber marker
|  | body copy (Inter, starlight)|          |     |     travels outward
|  | 27 orders / data (mono)     |          |     |
|  +-----------------------------+          |  -  |
+--------------------------------------------------+
   text panel, bottom-left                 scale ruler, right
```

Mobile wireframe (reduced-motion, single column, no pin):

```
+----------------------+
| stage label (mono)   |
| HEADLINE (serif)     |
| body copy (Inter)    |
| data (mono)          |
|                      |
| ruler readout (static|
| exponent + label)    |
+----------------------+
| next stage ...       |
+----------------------+
```

## Signature element

The continuous scale ruler. It is the one bold device: a single vertical logarithmic ruler that stays on screen through all seven stages and moves one glowing amber marker outward as the reader travels. It is logarithmic because the journey spans 27 orders of magnitude and only a log scale can hold that range on one axis. Everything else (the field, the panels, the labels) stays quiet around it, so the whole page is remembered as one journey along one ruler.

## Self-critique

Re-read against the three model-default looks:

- Cream + serif + terracotta: not this. The ground is near-black void, not cream, and the accent is amber on a night sky, not a warm editorial paper palette.
- Near-black + acid-green accent: not this. The near-black is here because it is the subject (the night sky), not a default "tech dark" choice, and the accent is warm amber `#E8A15B`, never acid green.
- Broadsheet hairline: not this. The hairline `--line` exists only as ruler ticks and dividers, not as an all-over broadsheet grid of rules; the composition is a single field, not a printed page.

Generic defaults named and revised:

- First draft leaned on a card panel behind each text block, which is the template-card default. Revised: text sits directly on the field with no card, so the only framed thing on screen is the ruler.
- First draft tinted the whole page. Revised: the sky glow is one gradient stop at the top only, so the void stays a subject, not a wash.
- First draft used two accents (marker plus a glow on every stage title). Revised: amber is capped to the ruler marker and the "you are here" pulse only (R-13 dose cap), so there is one focal point per stage.
