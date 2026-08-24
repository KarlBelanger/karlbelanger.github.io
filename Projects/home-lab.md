---
title: "My home lab architecture as of August 2026"
layout: single
toc: true
toc_label: "Architecture sections"
---
# My 2026 Home Lab Architecture
## Overview
When I decided to start learning Linux, I knew WSL on my laptop wouldn’t be enough to give me real exposure to Linux workflows. I was able to obtain three Intel NUC 10i5FNH machines and started experimenting with different distributions. I knew I would need to learn system administration, networking, virtualization, and how to connect distributed services. Linux accessibility was another key component for me. As a blind user, I needed to learn Orca and get a feel for how different distributions worked with accessibility services. From prior tinkering, I knew SSH was accessible and would work even if local accessibility broke or wasn’t fully available, so remote access to the systems became a high priority. These three machines would enable me to do all that and more.
One of my first major decisions was which distribution to put on each machine. Ubuntu and Red Hat Enterprise Linux (RHEL) were two obvious choices. They are two of the most popular distributions, and RHEL specifically is used in many enterprise environments. That left the third machine. For a while, I used it as a distro-hopper machine, trying different distributions, experimenting with distro-specific workflows and interface differences, and even testing immutable distros. Eventually, I settled on openSUSE Tumbleweed. Unlike many others I tried, Tumbleweed is not directly based on Ubuntu or RHEL, and it gives me a rolling-release distribution experience without some of the stability issues common to Arch. I thought about using Fedora Silverblue for its stability and rollback capability, but I didn’t want to deal with the extra complexity that immutable distros can introduce. I already had a bit of that experience with my [USB Drive recovery project.](/Projects/usb_drive_recovery.md)
For networking, I originally just had my home LAN and an SSH bastion for external access. Since then, I have transitioned to using Tailscale for all my networking. It gives me SSH access from anywhere without complex configurations or key sharing, and I can use exit nodes and subnet routers to expand my lab in the future.
My goal with this setup is to have three different distributions, each with different philosophies and architectures, to experiment and learn with. All three operating systems run directly on bare metal, removing any complexity or potential instability introduced by a VM layer. Tailscale gives me flexibility and built-in security, so I don’t have to expose ports on my router to the wider internet. It also gives me tools to connect services, set up VPNs, and otherwise expand the lab.
## Networking
### Tailscale: Flexible, stable, and secure networking
As mentioned above, my home lab is interconnected through Tailscale. This gives me several key benefits:
-	- Stable 100.x.x.x IP addresses, useful for service linking, configurations, and avoiding DHCP changes that could break things
-	- MagicDNS, which gives each machine a clear, readable name that makes it easier to remember and address
-	- Easy SSH access to any machine, even when I’m not on my home network, with advanced access controls and identity management for various projects
-	- Improved security because I don’t have to forward ports or expose my LAN to the internet, which helps minimize risk
Together, these features provide stability, security, and flexibility for my lab. Whether I’m building a set of distributed services with Docker or integrating them into a Kubernetes cluster, I’m working with a user-friendly, accessible interface.
### SSH Bastion: My initial networking adventure
When I initially set up my home lab, I quickly ran into a problem. I could SSH into any of my machines while on my home network, but I wanted a way to access a system when I was on the go. My initial solution was an SSH bastion. Using an ancient laptop with Linux Lite, I set up port forwarding to that system and configured my .ssh/config file to use it as a bastion server. I then generated an SSH key and distributed it to all my systems. While this worked, it had a few issues. My network now had a single point of failure. If the laptop went down, a service crashed, or anything else stopped working, I would lose access to my home network until I could be physically present to troubleshoot the issue. Since I had exposed a port, I also had to be extra careful about security by making sure the firewall was set up and properly configured, as well as checking logs for unauthorized access attempts.
Eventually, I discovered Tailscale and set it up as described above. It resolved nearly all of my issues with the SSH bastion.
### Access Model
I access my lab through SSH on my Windows laptop, either directly or in a WSL environment. I then SSH into the desired machine using its friendly name, and Tailscale handles the authorization process for me.
## Topology (Text Diagram)
```text
Internet
  ↓
Tailscale Mesh Network
  ├── Ubuntu 26.04
  ├── RHEL 10.2 
  └── openSUSE Tumbleweed
```
## Accessibility
Accessibility is an important part of my workflow, from local control to remote access and even this website. Whenever possible, I run Orca inside a live USB before installing a distribution. I’ve seen several distributions where the installed tools have accessibility issues, some don’t have talking installers, and others don’t have accessibility enabled when the distribution is initially installed. All three distributions I chose have solid accessibility support and performed well out of the box. Another key part of my workflow is SSH. SSH works well with Windows screen readers such as NVDA and JAWS, and it allows me to control systems through the command line, troubleshoot issues, and even rebuild a completely broken GNOME environment, as I did when one of my machines was running Fedora 44. That experience will soon be another write-up, which I will link here once it’s posted. The accessibility of my GitHub site is also important. I use text-based diagrams like the one above so that I can produce them independently, and so they are readable for blind visitors without needing alternative text on a graphical diagram. I will continue to ensure that each new component and article on the site is accessible.
## Future Plans
Some of my plans for this home lab include:
-	- Turning the projects from the Decoding DevOps Udemy course into distributed projects across my three systems
-	- Setting up Prometheus and Grafana for a unified monitoring dashboard for all my systems, replacing the individual Cockpit installations I currently use
-	- Setting up Ansible and Terraform for orchestration of my lab
-	- Eventually turning everything into a Kubernetes K3s cluster
## Lessons Learned
Setting up my home lab has given me valuable skills and lessons. Tailscale is far simpler and more reliable than an SSH bastion, and it removes the single point of failure. Distribution differences can have a significant impact, from package management to accessibility issues and immutability challenges. Picking the right distribution for the job can make a big difference in the workflow. SSH is a critical component of my workflow because, in combination with Tailscale, it lets me control and monitor systems from anywhere and overcome accessibility issues by connecting from a working remote machine. My lab is in a good place to build out additional services, monitoring, and self-hosting.
