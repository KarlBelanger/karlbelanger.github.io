---
title: "Recovering a Dead USB Drive"
layout: single
toc: true
toc_label: "Usb Drive Recovery"
---

# Recovering a Dead USB Drive Using Linux Tools

## Technical Summary

This write-up covers how I diagnosed and temporarily recovered a 16GB USB flash drive that Windows could see but could not repair. Windows showed confusing information: the drive looked healthy in some places, but it also showed a 0B volume and would not let me run the clean operation. I switched to Fedora SilverBlue so I could test whether the drive could still accept lower-level writes. The eventual fix required working directly with the block device from an elevated Linux environment so the partition and filesystem changes actually stuck. The process gave me a better understanding of controller-reported state, raw disk access, and why Windows and Linux behave differently during this kind of recovery.

## Introduction

As I began exploring Linux, I wanted a simple way to test different distributions on real hardware. I bought a cheap two-pack of Onn 16GB USB drives and used them for bootable ISO images. After only a few writes, one drive stopped behaving normally: Windows could still see that something was attached, but it could not format the device, and Balena Etcher no longer recognized it as a usable target. What started as a failed USB stick turned into a deeper troubleshooting exercise around partitions, controller behavior, and the difference between surface-level formatting tools and direct block-device access.

## Environments Used

Throughout this process, I used the following environments:

## Troubleshooting Flow Summary

Windows Disk Management → DiskPart reports no read-only flag and “OK” status → clean fails with access denied  
↓  
Fedora SilverBlue dd test → raw write to LBA0 succeeds  
↓  
GNOME Disks appears to create and format the volume → Windows still sees the same broken 0B volume  
↓  
fdisk + mkfs.vfat report success → changes do not persist after reconnecting  
↓  
Elevated SilverBlue root shell → partition table and filesystem writes sync correctly → drive is usable again

-   Windows 11, my primary OS, plus Balena Etcher, Disk Management, and DiskPart through PowerShell.
-   Fedora SilverBlue, the distro I had installed on the Linux box I used.
    -   GNOME Disks: the GUI tool I attempted.
    -   CLI tools: fdisk and mkfs, the tools that actually worked.

## The Process

### Initial attempts using Windows

I started by using Disk Management to manually create a partition on the disk, attempting to get it back into a usable state. I was able to successfully create a simple volume that used the drive’s entire space, but Windows would not format it. This is when I knew something was wrong at a deeper level than a simple broken partition.

### Deeper investigation with DiskPart

Rather than doing extensive Googling, I thought I would see if an AI could help me speed the process along. I explained the symptoms to Microsoft Copilot, along with what I had tried so far. At each step, I described the behavior I was seeing and which commands I had tried, then interpreted Copilot’s responses and decided what to run next. Copilot indicated that my drive issue might be a problem with bad early blocks in the memory chip and suggested using DiskPart via PowerShell. I loaded up DiskPart, selected the disk, and inspected it. The disk showed only one 0B volume, with the rest of the disk listed as unallocated space. It also showed that the Read Only flag was not set, eliminating that issue. I then attempted to wipe the disk with the clean command, but I received an access denied error. After unplugging and reinserting the drive, I still got the error, so DiskPart could not be used to reset the partition table.

### Further analysis using other PowerShell commands

Once the simple diskpart\>clean command failed, I gathered more information using Get-Disk \| Format-List \* and detail disk and detail volume within DiskPart. Everything came back as healthy. The disk was set up with an MBR, but it showed no partitions and only the one 0B volume I had identified earlier. Finally, I ran “wmic diskdrive get status,model,size” for one last check that the controller was reporting things correctly. This also showed the status as OK and reported the correct size. After confirming all the information listed above, Copilot recommended that I switch to Linux because it could handle the drive better than Windows.

## Working with Fedora SilverBlue: The Process That Eventually Fixed It

After all the Windows commands went nowhere, I decided to attempt the fix with Linux, specifically Fedora SilverBlue, which was the version I had installed at the time. This would go on to cause its own issues because of the immutable nature of the distribution. I first ran sudo dd if=/dev/zero of=/dev/sda bs=512 count=1 to see if dd could write to the disk. It worked, so I knew the disk was not totally dead.

### First pass with Gnome Disks

I first started by using GNOME’s Disks utility. The volume creation and formatting steps all appeared to work perfectly. The system said the volume was created, the drive was formatted, and everything worked just fine. However, after unplugging the drive and putting it back into my Windows machine, nothing was resolved. Everything looked the same, with the one 0B volume that Windows could not do anything with. After the GNOME Disks failure, I went to the terminal to try things the manual way.

Looking back, this is where SilverBlue may have complicated the troubleshooting. Because SilverBlue is built around an immutable base system, some changes that look successful in a desktop utility do not always behave the way I would expect from a more traditional Linux install. At this point, I did not know whether the tool had failed, the drive had ignored the write, or SilverBlue’s permissions model was getting in the way, so I moved to the terminal to get more direct control over what was being written.

### First pass with the command line

Since GNOME Disks did not work, I tried using fdisk and mkfs.vfat. I followed this sequence:

1.  I entered fdisk with the flash drive.
2.  O created a new mbr partition table.
3.  N created a new primary partition that used the entire disk.
4.  T, b set the partition to fat32.
5.  W wrote the changes to disk.

After exiting fdisk, I used mkfs.vfat on my disk to format it and get it ready for use. Everything reported success, so I ejected the disk and thought I had succeeded.

### The drive still didn’t work

After plugging the drive back into Windows, the 0B volume was still there, and Windows still could not do anything with it. I suspected that the block device had been updated, but nothing had actually been written to the drive. After some extra research, I confirmed that this was likely the case.

## Evidence from the Troubleshooting Notes

Two observations from the process made the failure pattern clear: “The disk showed only one 0B volume, with the rest of the disk listed as unallocated space,” and “the volume creation and formatting steps all appeared to work perfectly” in GNOME Disks even though Windows still showed the same broken state afterward. Together, those details pointed away from a simple formatting problem and toward a lower-level write or controller issue.

### The Solution: An Elevated Environment

I went back to my SilverBlue machine and ran sudo -E bash. This put me in an elevated root environment. Then, I ran the same commands as before. This time, the changes synced to the disk properly, and when I plugged it back into my Windows machine, I had a working 16GB flash drive.

## Root Cause Analysis

Based on everything I saw, the most likely issue was either a degraded controller or bad early blocks near the beginning of the drive. That area is important because it is where the partition table and other metadata live, so if writes there fail or do not persist, Windows cannot treat the drive normally. Windows seemed to respect what the controller was reporting, even when that information did not line up with what I was seeing. Linux gave me a way to work closer to the raw block device, which is what finally let me rebuild the partition table and filesystem from the right elevated environment. Even though the drive worked again afterward, I would still treat it as degraded hardware rather than something I actually fixed.

## What I Would Do Differently Next Time

-   Use Ventoy for repeated ISO testing so I can copy ISO files onto one reusable boot drive instead of re-imaging the device for every distro.
-   Reserve cheap USB drives for temporary file transfer, not OS imaging or repeated boot media work.
-   Use Fedora Media Writer or Rufus when I need a dedicated image-writing tool with a more focused boot-media workflow.
-   Consider PXE or iVentoy for frequent testing so I can reduce USB wear, avoid device churn, and make installs easier to repeat.
-   Retire any flash drive that shows this kind of failure instead of trusting it after a one-time recovery.

## Tools Used

| Tool                        | Purpose                                                                      | Why it mattered                                                                                                      |
|-----------------------------|------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| Windows Disk Management     | Attempted to recreate and format a usable volume.                            | Showed that Windows could see the device, but that normal partition and format options were not enough to fix it.    |
| DiskPart                    | Inspected disk flags, volume state, and attempted a clean operation.         | Reported no read-only flag and a healthy controller state, but still failed with access denied.                      |
| PowerShell storage commands | Collected additional disk and controller details.                            | Confirmed that Windows was receiving contradictory information: an OK device status alongside an unusable 0B volume. |
| dd                          | Tested whether Linux could write directly to the first sector of the device. | Confirmed the drive was not completely dead and that raw block access could still reach the hardware.                |
| GNOME Disks                 | Attempted a GUI-based volume creation and format.                            | Appeared successful but did not persist changes, which helped reveal the SilverBlue environment issue.               |
| fdisk                       | Rebuilt the MBR partition table and created a new primary partition.         | Provided manual control over the disk layout once the command was run from the right environment.                    |
| mkfs.vfat                   | Created a FAT32 filesystem on the new partition.                             | Made the recovered drive readable by Windows after the partition changes actually synced.                            |
| SilverBlue root shell       | Ran the recovery commands from an explicitly elevated environment.           | Allowed the partition and filesystem writes to persist to hardware.                                                  |

## Lessons Learned

The biggest lesson from this repair was that a success message does not always mean the hardware actually accepted the change. Several tools reported healthy status or completed operations, but the drive still looked broken after I unplugged it and checked it again. I also learned why the operating system matters during recovery: Windows was more limited by what the controller reported, while Linux gave me a way to test and write closer to the block-device level. Just as important, getting the drive to show up again did not make it trustworthy. Once a flash drive starts acting like this, I would treat it as degraded hardware even if I can temporarily bring it back.

## Conclusion

In the end, this started as a cheap USB drive that failed after only a small amount of ISO writing, which reinforced how fragile low-end flash media can be when it is used over and over for boot drives. It also showed me a real difference between Windows and Linux for this kind of problem. Windows could see the device and report useful information, but Linux gave me a way to test and rewrite parts of the disk that Windows would not touch. SilverBlue also introduced me to some of the complications that can come from using an immutable distro, especially when a GUI tool looks like it worked but the changes do not actually persist. After the recovery, I wrote a Zorin ISO to the drive as a test; the write completed, but the USB still failed to boot. That confirmed this was only a patch, not a true fix, and that the drive was more useful as a troubleshooting lesson than as reliable hardware.
