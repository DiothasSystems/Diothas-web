# Editing the main page

Each section of the site reads one XML file in this folder. Edit the text
between the tags, commit, and the site rebuilds. You do not need to touch code.

| File | What it controls |
|---|---|
| `site.xml` | Logo, brand name, tagline, nav links, the Contact button, the site's base URL |
| `hero.xml` | The banner: eyebrow, headline, italic subtitle, the four paragraphs, the two closing lines, both buttons, the panning backdrop |
| `perspectives.xml` | The Writing section's **heading and chrome only** |
| `workshop.xml` | The Workshop section's **heading and chrome only** |
| `about.xml` | About copy, the emblem, the three stat blocks |
| `contact.xml` | The Correspondence band at the foot of the page |
| `footer.xml` | Footer blurb, the three link columns, copyright, tagline |

## The five element types

Every file is built from the same five tags. The `key` binds an element to a
slot in the design and **must not be renamed**.

```xml
<field key="heading">Plain text</field>
<link  key="cta" href="mailto:you@example.com">Button label</link>
<image key="logo" src="uploads/DiothasIcon.png" alt="Description"/>

<group key="featured">          <!-- a fixed cluster of fields -->
  <field key="title">…</field>
</group>

<list key="paragraphs">         <!-- a repeatable collection -->
  <item><field key="text">First paragraph.</field></item>
  <item><field key="text">Second paragraph.</field></item>
</list>
```

Add or remove `<item>` blocks freely — the hero's paragraphs, the About stats,
and the footer's link columns all grow and shrink with them.

## Two rules worth knowing

**Articles and applications do not live here.** `perspectives.xml` and
`workshop.xml` hold only the kicker, the heading, and the "view all" link. The
featured card, the numbered list, the theme chips, and the app grid are all
generated from the folders in `content/`. Adding an `<item>` here would create a
second source of truth for the same pixels, and it would lose.

**An `href` starting with `#` is a home-page anchor** — `#writing`, `#work`,
`#about`. The build rewrites it to `/#writing` automatically on inner pages, so
write it the short way everywhere.

## Escaping

XML reserves five characters. Inside text you must write `&amp;` for `&` and
`&lt;` for `<`. The rest — em-dashes, `·`, `©`, curly quotes — can be typed
directly, because these files are UTF-8.

## Images

Anything referenced by `src` must exist under `uploads/`. Drop new graphics
there and point at them: `src="uploads/my-banner.png"`.

## If you break a file

An unparseable XML file fails the build with the filename, and nothing deploys —
the live site keeps serving the last good version. Run `npm run preview` first
if you want to see it before you push.
