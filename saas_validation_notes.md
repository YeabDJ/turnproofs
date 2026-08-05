# SaaS Customer Validation & Market Research Notes

These notes capture the user feedback, pain points, and competitor research gathered during the initial validation phase on Facebook host communities. This context is carried over to guide the product features, copy, and engineering design.

---

## 1. Validated Customer Pain Points (From Facebook Post Comments)

We posted a validation question asking hosts: *"How do you protect yourselves from false cleanliness complaints to scam refunds? Do you make cleaners take photos?"* We received over 20 active comments in under 1 hour.

### Pain Point A: Phone Storage for Cleaners
* **Quote (Monique Rivera - Cleaner)**: *"My host uses breezeway so none of the pictures take any storage on my phone... as a cleaner this is becoming very common for hosts to ask."*
* **Product Requirement**: Cleaners must be able to snap and upload photos directly in the browser *without* downloading a native app, and it must use **0 MB** of their phone's local storage.

### Pain Point B: Disorganized, Slow Sharing Tools
* **Quote (Hayley Curtis - Cleaner)**: *"Yes we videoed every single time... we use Discord and Google Drive to upload."*
* **Quote (Primal Home Solutions - Host)**: *"We save them in folders by property and check-in date so they're easy to retrieve if Airbnb asks..."*
* **Product Requirement**: Hosts and cleaners are spending hours manually organizing files. Our app must **automatically sort** reports and photo uploads by property and date, generating a single-click verification URL.

### Pain Point C: Fear of Fraud / Fake Proof
* **Quote (Anonymous Participant)**: *"If you don't have a timestamped photo then just make a fake one, if they wanna fake & lie then so can you!"*
* **Product Requirement**: Hosts need absolute confidence that the cleaner actually performed the check on-site today. We must enforce **GPS geolocation capturing** at checkout and **browser-locked timestamps** that cannot be manipulated.

### Pain Point D: Standard Photos Get Rejected by Support
* **Quote (Donna Lowry - Host)**: *"I had a guest plant trash... I had time stamped photo proof showing no trash... Airbnb denied review removal, twice! Photos are really to prove damages. They don't really help with review removal."*
* **Product Requirement**: Loose screenshots in a message thread are easily dismissed by Airbnb Support. Our PDF reports must look like **Official Clean Verification Certificates** containing professional layouts, GPS map coordinate plots, cleaner names, and tamper-proof seals to carry structural weight.

---

## 2. Competitor Landscaping

| Competitor | Pricing | Gaps & Opportunities |
| :--- | :--- | :--- |
| **Turno** | Free for 1, then **$8/property/month** | Heavy focus on cleaner marketplace and scheduling. Cleaners must download native apps and register. Gets expensive fast. |
| **Breezeway** | Enterprise billing ($100s/mo) | Built for large property managers (50+ listings). High learning curve and expensive. |
| **PrepBnB** | Free for 1, then flat **$29/month** | Flat rate is a steep jump for hosts with 2–4 listings. Uses simple browser-based links. |
| **CleanerSync** | **$35/month** | Built for commercial cleaning teams with dedicated app downloads. |
| **BowReady** | Free for 2, then charges | Focuses heavily on calendar reminders and text alerts. Doesn't focus on legal/dispute verification proof. |

---

## 3. Product Positioning for TurnProofs

* **Core Mission**: We are NOT just building a "cleaning schedule manager." We are building **Airbnb Refund Protection**. 
* **The Pitch**: Prevent fraudulent guest refunds by generating certified, GPS-validated checkout records in under 3 minutes, with **zero app downloads** for your cleaners.
* **Pricing Window**: Free for 1 property, then **$9/month for up to 5 properties** (capturing the audience that wants to upgrade from 1 property but finds PrepBnB's $29/mo or Turno's per-unit cost too expensive).
