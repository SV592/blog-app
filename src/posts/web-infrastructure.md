---
title: Web Infrastructure's Core - Caching, CDNs, & Load Balancing
date: "2025-08-18"
description: An in-depth exploration of the foundational technologies and architectural patterns that ensure a fast, scalable, and reliable web.
tags: ["Web", "Infrastructure", "Design"]
image: "/blogImages/web-tree.jpg"
slug: web-infrastructure
---

### Caching and Its Methodologies

Caching is a strategy that stores data copies in a temporary storage area, known as a cache, for faster access. This process significantly reduces latency and server load by serving requests from a location closer to the user or from a faster medium.

#### **Data Structures for Caching**

Cache eviction policies dictate which data to remove when the cache is full. Two prominent algorithms govern this:

- **LRU (Least Recently Used):** This algorithm discards the least recently used items first. It's often implemented using a combination of a **doubly linked list** and a **hash map**. The hash map provides `O(1)` access to nodes in the linked list, while the linked list maintains the order of usage. An item is moved to the head of the list on access, and the tail of the list represents the least recently used item, which gets evicted.

- **LFU (Least Frequently Used):** This algorithm discards the least frequently used items first. It uses a **min-heap** or a more complex structure like a **frequency list of doubly linked lists**. Each node in the list stores a frequency count, and the lists themselves are ordered by frequency. When an item is accessed, its frequency count increases, and the node moves to a linked list corresponding to its new frequency.

#### **Examples**

- **Social Media:** An **LRU cache** is a great fit for a social media feed where a user's focus is on the most recent content.

- **E-Commerce:** The **LFU method** proves highly effective for e-commerce sites where specific product information and key/value pairs are repeatedly requested, making frequency a more effective metric for retention than recency.

### Content Delivery Networks (CDNs): A Global Footprint

A CDN is a geographically distributed network of proxy servers and their data centers. Their primary function is to serve static assets (like images, CSS, and JavaScript files) from a location close to the end user, dramatically reducing latency and improving page load times.

#### **CDN Protocols and Distribution Models**

CDNs operate using various protocols and models to optimize content delivery:

- **Push Model:** The origin server actively "pushes" content to all CDN edge servers whenever an update occurs. This is a proactive approach, ensuring content consistency across the network.

- **Pull Model:** The CDN server "pulls" the content from the origin server only when a user requests it for the first time. The content is then cached on that specific edge server for subsequent requests.

#### **Examples**

- **Push Model:** This model is well-suited for websites with predictable content updates and large static assets.

- **Pull Model:** This is an on-demand approach, making it efficient for websites with dynamic content or large volumes of unique files, such as an individual user's Twitter feed.

### Proxies: The Web's Intermediaries

A proxy server acts as a gateway between a client and a server, or vice versa, forwarding requests and responses. The way a proxy is deployed determines its role.

- **Forward Proxy:** A forward proxy operates on behalf of the client, forwarding requests from a client to the internet. This hides the client's IP address and location, providing privacy and security. The client is explicitly configured to route its requests through the proxy.

- **Reverse Proxy:** A reverse proxy operates on behalf of the server. It sits in front of one or more web servers, intercepting client requests. It then forwards the requests to the appropriate back-end server. This abstraction provides several benefits, including load balancing, security (by hiding the origin server's IP), and SSL termination.

#### **Examples**

- **Forward Proxy:** VPNs and corporate firewalls often function as forward proxies.

- **Reverse Proxy:** Both CDNs and load balancers are types of reverse proxies.

### Load Balancers: The Traffic Directors

A load balancer is a type of reverse proxy that distributes network traffic across multiple servers. It ensures no single server becomes a bottleneck, thereby increasing application availability and scalability.

#### **Load Balancer Layers and Protocols**

Load balancers operate at different layers of the OSI model, with each layer providing distinct functionalities.

- **Layer 4 (Transport Layer):** A Layer 4 load balancer uses information from the TCP or UDP headers, such as the source IP and port, to make routing decisions. It does not inspect the content of the packets themselves. This approach is extremely fast and efficient, as it requires minimal processing overhead.

- **Layer 7 (Application Layer):** A Layer 7 load balancer inspects the application-layer data (e.g., HTTP headers, cookies, URL paths). This allows for more intelligent routing decisions, such as sending API requests to one server pool and static file requests to another. However, this deep packet inspection requires more computational resources and is slower. It also enables features like SSL termination at the load balancer, which offloads the CPU-intensive encryption/decryption process from the back-end servers.

#### **The Challenge of Session Persistence: Consistent Hashing**

In a distributed system, a key challenge is ensuring that requests from a single client consistently go to the same server (session persistence). **Consistent hashing** is a technique that addresses this. It maps both servers and keys (e.g., a user's ID) onto a circular ring. When a server is added or removed, only a small fraction of the keys need to be remapped to a different server, minimizing disruption. This is significantly more efficient than traditional modulo-based hashing, which would require remapping all keys when a server count changes.

### Conclusion

A robust web infrastructure hinges on the interplay of these core components. **Caching** accelerates data retrieval with clever algorithms like LRU and LFU. **CDNs** bring content closer to the user through global networks. **Proxies** and **load balancers** manage traffic flow, ensuring security and high availability. These systems, working in concert, form the backbone of a fast, reliable, and scalable web.
