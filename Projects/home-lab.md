---
title: "My home lab architecture as of August 2026"
layout: single
toc: true
toc_label: "Architecture sections"
---
## Overview
When I decided to start learning Linux, I knew WSL on my laptop wouldn't be enough to give me real exposure to Linux workflows. I was able to obtain three Intel NUC 10i5FNH machines and started exp[...]
One of my first major decisions was which distribution to put on each machine. Ubuntu and Red Hat Enterprise Linux (RHEL) were two obvious choices. They are two of the most popular distributions, a[...]
For networking, I originally just had my home LAN and an SSH bastion for external access. Since then, I have transitioned to using Tailscale for all my networking. It gives me SSH access from anywh[...]
My goal with this setup is to have three different distributions, each with different philosophies and architectures, to experiment and learn with. All three operating systems run directly on bare[...]
## Networking
### Tailscale: Flexible, stable, and secure networking
As mentioned above, my home lab is interconnected through Tailscale. This gives me several key benefits:
- Stable 100.x.x.x IP addresses, useful for service linking, configurations, and avoiding DHCP changes that could break things
- MagicDNS, which gives each machine a clear, readable name that makes it easier to remember and address
- Easy SSH access to any machine, even when I'm not on my home network, with advanced access controls and identity management for various projects
- Improved security because I don't have to forward ports or expose my LAN to the internet, which helps minimize risk
Together, these features provide stability, security, and flexibility for my lab. Whether I'm building a set of distributed services with Docker or integrating them into a Kubernetes cluster, I'm [...]
### SSH Bastion: My initial networking adventure
When I initially set up my home lab, I quickly ran into a problem. I could SSH into any of my machines while on my home network, but I wanted a way to access a system when I was on the go. My init[...]
Eventually, I discovered Tailscale and set it up as described above. It resolved nearly all of my issues with the SSH bastion.
### Access Model
I access my lab through SSH on my Windows laptop, either directly or in a WSL environment. I then SSH into the desired machine using its friendly name, and Tailscale handles the authorization proc[...]
## Topology (Text Diagram)
```text
  - Ubuntu 26.04
  - RHEL 10.2
Tailscale gives me flexibility and built-in security, so I don't have to expose ports on my router to the wider internet. It also gives me tools to connect services, set up VPNs, and otherwise exp[...]
```
## Accessibility
Accessibility is an important part of my workflow, from local control to remote access and even this website. Whenever possible, I run Orca inside a live USB before installing a distribution. I've[...]
## Future Plans
Some of my plans for this home lab include:
- Turning the projects from the Decoding DevOps Udemy course into distributed projects across my three systems
- Setting up Prometheus and Grafana for a unified monitoring dashboard for all my systems, replacing the individual Cockpit installations I currently use
- Setting up Ansible and Terraform for orchestration of my lab
- Eventually turning everything into a Kubernetes K3s cluster
## Lessons Learned
Setting up my home lab has given me valuable skills and lessons. Tailscale is far simpler and more reliable than an SSH bastion, and it removes the single point of failure. Distribution difference[...]
