---
title: "Projects"
layout: single
permalink: /projects/
toc: true
toc_label: "On this page"
---

This is the primary page for all my Linux Administration projects. This page will grow over time as I complete more Linux admin projects.
## My home lab architecture
All my projects are completed on my three Intel NUC home lab. All the details of my chosen setup and networking are on [My Home Lab Architecture.](./home-lab.md)
## Deploying NextCloud on my home lab
My most ambitious project so far: I have deployed Nextcloud AIO with Netdata for monitoring, and you can read more about my [Nextcloud deployment project.](./nextcloud-aio-project.md)
## Recovering a dead USB Drive
I recently had a cheap USB drive which was no longer recognized by Windows or Linux that I had been using for bootable ISOs. Here is how [I recovered the drive](./usb_drive_recovery.md)

## Other projects
This section covers a few other projects that I've done.

### The UEFI Access Project
I have started the UEFI Accessibility Project. This project aims to solve one of the biggest remaining accessibility barriers in modern computing, the Unified Extensible Firmware Interface. We have developed a prototype tool which can change the boot order from within Windows. The initial prototype is released under the Mozilla Public License v2.0. Read about the [UEFI-Access project](./uefi-access.md), and access the [Project Repository](https://github.com/KarlBelanger/UEFI-Access) (private).
### Improving the accessibility of the online game Fundamental
I enjoy playing an online incremental game called Fundamental. While it has some screen reader support, the experience left a lot to be desired. I decided to put Claude Code to the test and see if I could improve its accessibility. The final result is a pull request with a ton of improvements, which you can read about on my [Accessibility overhaul of Fundamental](./game-accessibility-overhaul.md) page.

### Other Linux projects
These will be written up fully in the near future.
- Selecting a Virtual Machine platform: I wanted to continue experimenting with Linux distributions without having to wipe or dual-boot one of my home lab machines every time. After many issues with VmWare, I settled on Qemu+LibVirt+VirtManager.
- Recovering from a catastrophic Gnome failure: Gnome catastrophically failed on one of my machines which was running Fedora 44 at the time. Recovering it involved multiple full app suite reinstalls, ssh issues, and package verification.