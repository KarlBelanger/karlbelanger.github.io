---
title: "UEFI-Access: an initiative to solve a major accessibility barrier"
layout: single
permalink: /projects/uefi-access/
toc: true
toc_label: "Article sections"
---

For more than 40 years, access to computers has grown by leaps and bounds. Unfortunately, over all that time, very little work has been done on one specific part of modern computing, one that is on every computer in use today and that loads before any operating system. The Unified Extensible Firmware Interface (UEFI) is the software that decides which operating system boots, controls which hardware is enabled at the system level, adjusts fan and CPU settings, and more. It replaces the older Basic Input/Output System (BIOS). Software built into a computer's hardware like this is often called firmware. This interface has no built-in accessibility, and ways to change its settings from within the operating system are very limited. The lack of accessibility has serious implications for all blind computer users. Because building a screen reader into UEFI itself is so difficult, as discussed below, I have started an initiative called UEFI-Access. Its first goal is a program that gives blind users an accessible way to reach UEFI settings from within the operating system.

The first version of that program is now available. UEFI-Access is a free, open-source Windows program that lets blind users read their computer's UEFI settings with a screen reader and safely change the boot order. The rest of this article explains how it works and where it is headed. The code is available in the [UEFI-Access repository on GitHub](https://github.com/KarlBelanger/UEFI-Access), and you can follow the project in the [UEFI Accessibility Project group on LinkedIn](https://www.linkedin.com/groups/38470006/). The project welcomes contributors, as described at the end of this article.

## Why UEFI accessibility matters

There are many reasons why a user may need to interact with UEFI. A user may want to switch or reinstall the operating system and need to boot from a USB drive. BitLocker or another security measure may have been triggered, requiring a recovery key. A hardware component could have failed and prevented the computer from booting. All these scenarios require a blind user to find sighted assistance or take their computer to an expensive repair shop. Instead of a few minutes or a quick call to tech support, a blind user's computer could be down for hours or days until they find someone to help. That is a serious problem for anyone who relies on their computer for work or school.

## The challenges of native UEFI accessibility

Unlike a modern operating system such as Windows or Linux, UEFI does not have the drivers, software, and existing accessibility infrastructure that a screen reader needs. UEFI implementations run on limited storage and resources embedded directly on the motherboard. Any audio drivers, text-to-speech software, and the screen reader itself would need to be incredibly small and efficient. UEFI also lacks the accessibility layer that modern screen readers depend on. In a full operating system, screen readers use libraries, code-level hooks, and other tools built into the system. Through these, a screen reader learns each control's name, position, state, and other details. This lets it give the user an accurate spoken description of what is happening on the screen. On top of that, each vendor's implementation of UEFI is slightly different, potentially requiring more customization across motherboards and computer brands.

None of these challenges are insurmountable. A few groups have experimented with playing audio from within UEFI and have had some success. This is a good sign for a future UEFI screen reader.

## UEFI-Access: a first step toward an interim solution

Given all the challenges involved in building a native screen reader, a faster route to UEFI is through the operating system. Linux has some command-line tools that give limited access, and Dell offers a tool called Dell Command Configure, which allows administrators to change UEFI settings from within Windows. However, there is no accessible, broadly compatible solution that works across operating systems and PC models. The UEFI-Access program is attempting to change that. As a first step and proof of concept, we contracted an independent developer through a freelance platform to build an initial prototype. The prototype is a fully accessible Windows program that can change the boot order on one specific model of computer. We chose the Dell OptiPlex 7020 because it is affordable on the refurbished market, and Dell's management software gave the program a way to read the machine's BIOS settings from within Windows.

### How the project was built

UEFI-Access was a collaboration between two roles. I defined what the program needed to do and how it needed to work for blind users, and the developer decided how to build it.

My direction set the requirements at a high level. The program had to follow Microsoft's accessibility guidelines and best practices and work fully with NVDA and Narrator, with every component accessible. It had to use UI Automation, the Windows technology that screen readers use to read a program's controls. It also had to protect the computer it runs on. Every write had to be verified, no unintended change could be possible, and there had to be a way to undo a change. I also specified the program's functionality and its general layout.

The developer turned those requirements into a working program, written in C# on .NET 8 and using the firmware functions built into Windows. He chose those tools, designed how the program reads and writes UEFI variables, and designed and built the safety mechanisms that meet the requirements. I am not an expert in UEFI or its implementation, and I do not claim to be. I know enough to recognize when something is going seriously wrong, but the technical decisions were the developer's. They are documented in the developer guide in the [UEFI-Access repository on GitHub](https://github.com/KarlBelanger/UEFI-Access).

My main hands-on role was testing. I tested every component for accessibility and function on the OptiPlex 7020, using NVDA and Narrator, and worked with the developer to fix the problems I found. The accessibility section later in this article covers that work.

## The UEFI-Access program

### Live and baseline modes

The program works in one of two modes. On first launch, a Refresh button loads the detectable UEFI variables on the current system. Variables are how UEFI stores its settings, such as the boot order. Reading them directly from the computer is called live mode, and it is the only mode in which anything can be changed. Baseline mode instead opens a baseline, a saved folder that records every variable and details about the machine at one point in time. Baselines can be opened on any Windows PC, even an unsupported one. They are useful for keeping a record before a change, or for sharing it with someone who is helping to troubleshoot. The project also includes a sample baseline, so anyone can explore the program without touching a real computer's settings.

### The interface

The window is divided into seven regions, including the variable list, a details pane, the Dell settings, and a status area. Pressing F6 moves between regions, and Tab moves between the controls inside them. Each row of the variable list is read as a single sentence that gives the variable's name, group, size, and a short summary of its value.

Pressing Enter on a variable opens the details pane. Where the program understands a variable, it translates the raw data into plain language. For example, the boot order is read as a list of named devices, such as Windows Boot Manager or a USB drive, instead of a string of numbers. A line labeled Writability states plainly whether the program can change the variable.

Every action the program takes is announced once in the status area, so the screen reader speaks each result without the user having to look for it. Keyboard focus never jumps on its own, so a screen reader user always knows where they are and what just happened.

### Other features

The Dell settings region shows ten common BIOS settings, such as Secure Boot and virtualization, in plain words. This view only reads the settings and never changes them. For technical users, the program's command-line tool offers the same features as the main window and is also how baselines are saved.

## Changing the boot order

Changing the boot order is the main task the prototype was built for. The boot order is the list of devices the computer tries, in turn, when it starts. Moving a USB drive to the top of that list, for example, lets a user start the computer from an installer or a recovery drive.

To change it, the user opens the BootOrder variable and rearranges a copy of the current order with the Move up and Move down buttons. Nothing on the computer changes yet. Choosing Review change runs the program's safety checks and then opens a Confirm change dialog. The dialog describes the change in one sentence and lists the order before and after, the BitLocker state, the risks, and where a backup copy will be saved. It has no default button, so an accidental press of Enter cannot approve the change, and Escape cancels it.

After the user confirms, the program saves a backup copy, called a snapshot, writes the new order, and reads it back to confirm the firmware accepted it. The new order takes effect the next time the computer starts, and a Restore previous value button can put the old order back. Some computers, or Windows itself, may move Windows Boot Manager back to the top of the list after a restart. That is normal behavior and not a fault in the program.

The program can also set a one-time boot. Choosing Boot once from this entry on an active boot entry tells the computer to start from that device on the next restart only. This is often the simplest way to start from a USB drive without making a permanent change.

## Safety considerations

Changing firmware settings carries real risk. A bad boot order can leave a computer that starts from the wrong device or does not start Windows at all. For a blind user, that is exactly the situation this project is trying to prevent, since fixing it may require the inaccessible setup screen. Safety was built in from the beginning, and the developer added several layers of protection to the program:

- Only two settings can change: the boot order and the one-time boot. Everything else on the computer is read-only to the program.
- Every change is previewed and checked before anything is written, and it can be undone from a backup copy.
- BitLocker users are protected. A boot order change can make BitLocker ask for the recovery key at the next restart, so the program offers to suspend BitLocker for that one restart.
- Changes work on only one computer, the OptiPlex 7020 we used for testing. Each manufacturer's UEFI can behave differently, so each new model needs testing before the program is trusted to change it.
- Writes are limited. The program allows no more than seven writes between restarts, because Windows offers no way to check how much firmware storage is left.

More than 3,600 automated tests back the project, including guard tests that fail if anything outside the approved write path could change the firmware or other system settings.

The project also includes a recovery guide in case a computer does not start normally after a change.

## Accessibility features and testing

Full screen reader and visual accessibility was a core requirement from the start, and the final program has been tested with NVDA and Narrator. The program uses standard Windows UI Automation, with a few additions of its own. Every control is labeled. Along with the status area and F6 navigation described earlier, the program makes automatic announcements. They report things like the result of a variable refresh, a change to the filter, or whether a write succeeded. Every color comes from Windows itself, so high-contrast themes and larger text sizes work as Windows intends. Both were checked during testing.

Testing turned up a few issues along the way. In the first test build, several things were read more than once, including group headings, navigation hints, and the read-only status of the details fields. The Copy log button was also cut off when text was scaled to 200%. Long values, such as a device path, were sometimes read only to the end of their first line. Each of these was fixed and confirmed in later testing.

The most stubborn problem was lag. When I arrowed quickly through the variable list, NVDA sometimes cut off a row's name or read it late. To find the cause, I asked the developer for a log of key presses and UI Automation events in the order they happened. He built a small recorder tool for this, and its log showed that every update of the details pane sent the screen reader a burst of around 200 events. The fix was to update the pane in place instead of rebuilding it, and the lag went away.

One area that deserves special mention is the splitters, the dividers that adjust the size of the list, details, and log panes. Many programs leave these out of the tab order entirely. UEFI-Access lets you adjust them with the keyboard and announces their position. Early versions read out raw numbers that did not relate to anything. Now, as you move the splitter between the list and details panes, it tells you each one's share of the width in percent. For example, it might say "List 63 percent of the width, details 37 percent."

A few limitations remain. Narrator sometimes repeats or drops a status announcement, which NVDA does not do. Because the program runs as an administrator, it needs an installed copy of NVDA rather than a portable one. JAWS was outside the scope of this release and has not been tested.

## Future improvements

As a proof of concept, this release is only a starting point, and development will move in a few broad directions.

The first is support for more settings. Today the program can change only the boot order and the one-time boot, but many of the tasks that send blind users looking for help involve other firmware settings. Each new setting carries its own risks, so settings will be added gradually, with the same focus on safety and testing on real hardware.

The second is support for more computers. Much of the program already follows the UEFI standard, and reading variables works on any UEFI computer running Windows 11. The parts that differ are each manufacturer's own settings and the way each computer's UEFI handles changes. Over time, the goal is to support more Dell models and computers from other manufacturers, with each one tested before changes are enabled on it. Further out, the same approach could come to Linux, which already offers basic access to UEFI variables. Apple's newer Macs are a different case, since they do not use UEFI at all.

Even platforms that have removed the traditional firmware setup screen still rely on a startup environment for choosing a startup disk, changing security settings, and recovering a computer that will not start. Screen reader support in those environments, where it exists at all, is often limited. Moving settings into the operating system helps, but it cannot remove the need for accessibility before the operating system loads.

In the long run, the goal remains a screen reader that runs inside UEFI itself, so blind users can work with their computers from the moment they press the power button. UEFI-Access is a practical step toward that goal. It gives blind users some independence today, and it shows firmware vendors, computer makers, and the UEFI Forum that accessible firmware is both needed and achievable.

## Get involved

UEFI-Access is open source, and the project welcomes contributors. Developers, firmware engineers, testers, and blind computer users can all help move it forward. The code and documentation are in the [UEFI-Access repository on GitHub](https://github.com/KarlBelanger/UEFI-Access). To follow the project and take part in the discussion, join the [UEFI Accessibility Project group on LinkedIn](https://www.linkedin.com/groups/38470006/).
