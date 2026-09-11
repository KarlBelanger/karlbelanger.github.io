---
title: "My Linux Accessibility Journey"
layout: single
permalink: /accessibility-journey/
toc: true
toc_label: "Topics"
---

As a blind technology user, I've always been interested in trying new accessibility tools. I've used screen readers on a variety of platforms, starting all the way back in Dos with a screen reader called VocalEyes. As my technology journey progressed, I've had several opportunities to try Linux accessibility features. Unfortunately, my experience on Linux has been decidedly mixed. While some distributions clearly thought through their experience for blind users, others have not fared as well. In this post, I'll share some of my experiences with Linux accessibility and how it has impacted my work as a Linux administrator.
## The install: will it talk or not?
The first big question when starting any Linux installation is whether I can get it to talk during the install. Some distributions, like Ubuntu, allow you to just press a key combination when the installer starts. Others make you select a talking install from a menu which doesn't speak, which somewhat defeats the intent of having an accessible installation. Some don't have a talking installation at all, requiring sighted assistance to get the distribution installed. Whether the installer talks or not, once the main interface comes up, the next phase begins.
## Using the Linux Desktop
Once the installation is complete, the next step is getting the distribution talking at login and on the desktop. Fortunately, if the installer was talking, the screen reader will usually start automatically, and if not the keyboard shortcut will start it. During my time experimenting with distributions, I found one which had the underlying accessibility services disabled by default, and they needed to be enabled through a checkbox in settings. This also makes it so that a blind user cannot independently use the OS until they get sighted assistance to make that settings change. Aside from initially getting the Screen Reader running, each distribution has its own set of behaviors and issues which can impact the experience for a Blind user.
### Red Hat voice changes
Red Hat Linux has some internal changes to the Screen Reader which cause it to use a higher voice for certain readouts. While this could be useful, the change is fairly drastic, and the voice can sometimes stay in that higher pitched setting until Orca is restarted. This is also not done by changing the defaults in Orca's settings, so many users likely won't know how to change these settings.
### Fedora hadPtyxis accessibility off by default
When I first installed Fedora 43, I was confused as to why Orca would not work in the terminal. Nothing I typed was read, and nothing I did could review the output. After some investigating and a bit of sighted assistance, I determined that Ptyxis, the default terminal application, has a checkbox in settings for screen reader support. This had come disabled with my default installation. Fortunately, enabling this checkbox was all that was needed to get my terminal up and running.
# Work in Progress