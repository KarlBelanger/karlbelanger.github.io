---
title: "Accessibility Overhaul: Screen Reader and Keyboard Parity for Fundamental"
layout: single
permalink: /projects/game-accessibility-overhaul/
toc: true
toc_label: "Project sections"
---

## Overview

This project is a contribution to [Fundamental](https://awwhy.github.io/Fundamental/), a free browser-based idle/incremental game I play regularly. It's different from the rest of the projects on this site, which are infrastructure I own outright. Its [README](https://github.com/awWhy/Fundamental) lists screen reader support as a supported platform, but that claim wasn't true in practice. Support existed in patches, not as something a screen reader or keyboard-only player could rely on. This write-up covers the accessibility pass I did to close that gap: keyboard parity, screen reader support verified on actual assistive technology, and one interaction redesign that ended up affecting every player, not just the ones using AT.

The work is submitted as [pull request #25](https://github.com/awWhy/Fundamental/pull/25) against the [upstream repo](https://github.com/awWhy/Fundamental). It's open as of this writing, but not yet merged. I'm including it here because of the engineering discipline behind it: testing claims against real hardware instead of assuming correctness, documenting a genuine trade-off instead of hiding it, and treating "it looks right in the DOM" as a hypothesis rather than a conclusion. That's the same discipline I bring to the Linux and homelab work elsewhere on this site.

## Why I took this on

I'm a screen reader user day to day, on Linux and on Windows (my [accessibility journey post](/accessibility-journey/) covers that in more detail). The gap between Fundamental's README and its actual behavior is a familiar one from the OS level, too. It's a feature that exists on paper, but nobody actually tested it end to end. Rather than just note it, I decided to fix it, the same way I'd approach a broken service in my home lab. That means finding where the claim and the reality diverge, then working through it systematically instead of patching symptoms one at a time.

## How I worked: my role and Claude Code's

I want to be direct about this, the same way I was in my [USB drive recovery write-up](/projects/usb-drive-recovery/) about using Microsoft Copilot as a diagnostic partner. For this project, I worked with Claude Code (Anthropic's coding assistant) to handle implementation, and the division of labor was specific, not a vague "AI helped."

I decided what to fix and in what order. Every prioritization call and every design decision, including the interaction redesign below, was mine. Claude Code wrote the code and managed the git history under that direction, one small, individually-documented commit at a time rather than one large diff. All the accessibility testing was mine, on real hardware. Every NVDA, JAWS, and TalkBack claim in this write-up reflects me personally listening to the result, on a Windows desktop for NVDA/JAWS and a physical Android device for TalkBack. Claude can verify structural things, like confirming a live region's attributes changed at the right moment. That catches logic errors, but it isn't the same as a human listening to what a screen reader actually says, and I didn't treat it as a substitute.

## What I fixed

### Making state visible to screen readers

A lot of this work had the same shape. State that a sighted player could see at a glance, like whether a toggle was on or which tab was active, had no equivalent for a screen reader user. They got only a label, with no sense of current state.

Screen reader support itself was also opt-in. A blind player had to already know it existed and go find it in settings before they could use it. I flipped that default too, after checking it wouldn't change anything for sighted or mouse players who don't need it.

From there it was the same fix, applied everywhere it was missing. Toggle-style controls now announce their on/off state. Tab-like selectors mark which one is current. Grouped sections use proper landmark elements, so a screen reader can jump straight between them instead of tabbing through everything.

Routing it all through the game's existing shared logic, rather than patching each control by hand, kept it consistent. It also led to one good find. Merging in an unrelated upstream change to the theme system turned up two pre-existing bugs in the theme selector that had nothing to do with either change. The whole control was invisible to screen readers, and its trigger button was unreachable by keyboard. Neither would have surfaced without touching that code for an unrelated reason. Both are now fixed and confirmed with real NVDA, JAWS, and TalkBack.

### The description panel that took five tries

Most panels in the game show an Effect/Cost description elsewhere on the screen when you hover or focus an item. That description block predates my work. The problem was how the two were connected: via `aria-controls`, an attribute most screen readers don't actually announce. A keyboard user could reach the description, but only by tabbing away from the control and back, with no indication anything had changed.

My first fix made the visible description block itself into a live region. The logic tried to tell a game tick apart from a focus event, so only the latter would announce. Five increasingly careful refinements of that approach all passed Claude's structural checks. Each one still occasionally failed real NVDA testing: a dropped word, an unstable read order. The real problem was structural. Two independent writers, game ticks and user focus, were sharing one screen-reader-facing element. Neither the browser nor the screen reader guarantees the fine-grained timing that the fix depended on.

The fix that actually held: stop sharing the element. Ticks and focus both still write the same visible text as before. Only a focus or hover event writes to a separate, screen-reader-only live region, so a tick has no path to an announcement at all. It's the kind of fix that's obvious in retrospect and invisible from code review alone. I only found it by continuing to test against real NVDA after each "should be right this time." A couple of older panels with a different, unrelated implementation got migrated onto the same fixed mechanism.

### Redesigning the challenge selector

Three challenge-mode icons in the game used to do two different things, depending on hidden state. Hovering over one, or focusing it for keyboard users, previewed that challenge's description. Clicking the same control a second time did something very different: if it was already the one being previewed, that click actually entered or exited the challenge, a real, consequential change. A keyboard or screen reader user had no reliable way to know, before pressing, whether that press would be harmless or would commit them to something real. Mouse users never noticed, because hovering gave them a preview state they could see first.

I redesigned these into plain, click-only tabs. Clicking one always means "show me this challenge's info," matching every other tab in the game. A separate, dedicated button is now the only thing that enters or exits the currently viewed challenge. It disables itself with a stated reason when entry isn't currently possible.

Stated plainly, mouse users lose the ability to preview a challenge just by hovering. It now takes an actual click, like any other tab. That's a real cost, and I made the call deliberately. For keyboard and screen reader users, the ambiguity wasn't a minor inconvenience. It was the difference between "safe to explore" and "might trigger something I didn't mean to." Touch users, notably, already had this exact ambiguity before my change, so for them it's a straightforward improvement.

### Mobile and other fixes

TalkBack surfaced its own class of bugs that desktop testing never would have. Its touch-exploration model consumes single-finger gestures for navigation, so a plain double-tap-to-activate never reached any description panel at all. On a physical device, double-tapping an item just did nothing. I added a listener that triggers the same preview/announce behavior used everywhere else. A double-tap now reads an item's description and marks it selected: the actual "select" step of the mobile purchase flow. A couple of related bugs turned up the same way, confirmed and fixed only once I tested on the real device rather than assuming desktop coverage was enough.

A few smaller fixes rounded this out. Three "buy everything" buttons used to fire a separate screen-reader announcement per item, which could flood a held-down button with dozens of overlapping messages. Now they read one combined summary once activity settles. Several maxed-out items that were already hidden from keyboard tab order got the equivalent treatment for touchscreens, since that mechanism has no touch equivalent on its own.

### The one deliberate gap: the Quantum minigame

One corner of the game didn't get this treatment. It's a hidden, April-only Easter egg minigame, reachable only during a one-week calendar window with a specific save state already in progress. That's not a scheduling inconvenience. It's a standing gate that makes real testing genuinely impractical. Rather than skip it, or hold up everything else chasing a test window I can't reliably reach, I applied a handful of low-risk, static fixes: state announcements, a landmark region, and labeled keyboard shortcuts. I shipped them with the gap disclosed rather than hidden. Claude verified them structurally, but I haven't confirmed them against real assistive technology, and I'm not claiming otherwise.

## Testing

Every behavioral change here was verified in-browser against a real save file, not just reasoned about from reading the code. Every fix specifically targeting screen reader behavior was tested against real NVDA, JAWS, or TalkBack, rather than assumed correct from code review alone. That distinction mattered more than once. Fixes that passed every structural check Claude ran still occasionally failed on a real screen reader, for reasons a DOM diff alone couldn't show. The one exception is the Quantum minigame above, confirmed structurally but not against real assistive technology, for the reasons already given.

## Lessons learned

A few things from this project apply well beyond this one game. Structural verification catches logic errors, but it doesn't catch assistive-tech behavior. I stopped trusting a DOM diff as a substitute for actually listening to a screen reader. I also kept the failed attempts documented in the commit history, rather than just the fix that worked, since it's useful to know what's already been ruled out and why.

Ambiguous controls also hurt non-mouse users disproportionately. A control that means two different things depending on invisible state is a minor UX wrinkle for a mouse user, who gets a free hover-preview as an implicit safety check, but for a keyboard or screen reader user, there's no equivalent preview, so the same ambiguity risks triggering something unintended. Also, desktop-clean doesn't mean mobile-clean. Some of the more interesting bugs here only existed on touch input and were invisible from desktop testing no matter how thorough. Platform parity means testing each platform, rather than extrapolating from one.
