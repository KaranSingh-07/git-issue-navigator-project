🎯 GitHub Issue Difficulty Classifier
An intelligent, automated dashboard to help open-source contributors (especially beginners) find the right issues to tackle by automatically classifying GitHub repository issues into Easy, Medium, and Hard categories.

## The Problem
Student projects and open-source repositories often accumulate massive backlogs of issues. For new contributors, diving into these repositories is daunting. It's incredibly hard to figure out which issues are beginner-friendly and which require deep domain expertise. Manual tagging by maintainers is often inconsistent, tedious, or entirely ignored.

The Solution: A web-based system that fetches issues directly from GitHub, automatically evaluates their complexity using text and metadata heuristics, and presents them in an interactive, searchable dashboard.

## Features
=> Core Functionality
Automated Data Extraction: Seamlessly fetches issues via the GitHub API using just a repository link. Extracts essential metadata (title, body, labels, last updated, comment count).

Smart Difficulty Classification: Evaluates each issue on the fly and assigns it a difficulty tier based on a custom heuristic algorithm.

Interactive Dashboard: A clean, responsive UI to view categorized issues.

Advanced Filtering & Search: Filter issues by Difficulty, Labels, and Date, or use the keyword search to comb through titles and descriptions.

## Bonus Features Included
Personalised Recommendations: Users can input their tech stack (e.g., React, Python, Web) and skill level, and the system curates a custom list of matching issues.

Data Visualisations: * 📊 Pie Charts displaying the distribution of Easy / Medium / Hard issues.

☁️ Word Clouds highlighting the most frequent keywords in different difficulty tiers.

## Tech Stack
This project was built with modern, scalable, and type-safe technologies:

Frontend: React.js, TypeScript, Tailwind CSS (or your preferred UI library)

Backend & Database: Firebase (Firestore for database, Firebase Cloud Functions for backend logic/scraping)

Data Fetching: GitHub REST API

Visualisations: Chart.js / Recharts (for Pie Charts) & React-Wordcloud

## How It Works: The Logic
1. Scraping & Data Extraction
The extraction engine takes a GitHub repository URL (e.g., facebook/react), calls the public GitHub API 
("https://github.com/KaranSingh-07/issue-navigator"), and filters out pull requests.
We extract: title, body (description), labels, updated_at, and comments count. This data is structured and sent to the classification engine.

2. The Classification Engine (Heuristics)
Since manual tagging is flawed, our classifier evaluates multiple data points to assign a difficulty.

🟢 Easy: * Labels: Contains labels like good first issue, documentation, typo, easy.

Description: Generally shorter in length.

Discussion: Low comment count (indicates a straightforward fix without much architectural debate).

🟡 Medium: * Labels: Contains standard labels like enhancement, bug, feature.

Keywords: Contains words like refactor, update, component.

Discussion: Moderate comment count and description length.

🔴 Hard: * Labels: Contains labels like performance, security, architecture, core.

Keywords: Contains highly technical or structural terms (memory leak, async, race condition).

Discussion: High comment count (indicating complex back-and-forth discussion) or exceptionally long descriptions containing stack traces.

(Note: The classification results are immediately persisted into our Firebase Firestore database so that repeat queries to the same repository load instantly).

3. Filtering & Search Architecture
Filtering: Implemented entirely on the frontend using React state. We apply chained array .filter() methods to narrow down the Firestore document collection based on the selected dropdowns (Difficulty, Date Range, Labels).

Searching: A real-time text-matching function that converts user input to lowercase and checks for substring matches against the issue title and body.

4. Profile and File Storage Section
A Profile Section for every user to Create there Account and Fill there Information regarding there Institute Name,Skills etc.Also there is a file storage section where the user can add and keep his important files and folder in a systematic way

5. Email Based Account Creation
The platform Allow user to create the Account Using there and It also include a feature of Registration through Google Account which is more frequently used in most web apps.
Along with this the platform also has a 2nd step email verification step to avoid Dummy and Fake Accounts

Build By Karan Singh 
Thank You

