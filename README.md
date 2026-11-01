# FoundIt - Lost & Found App

## Description
FoundIt is a full-stack web application that helps people report, search for and recover lost items. The frontend is built with React and the backend with Flask and PostgreSQL.

The application provides a central platform for lost and found reports instead of relying on scattered WhatsApp groups, social media posts, word of mouth or physical lost-and-found offices.

FoundIt also helps users identify possible matches between lost and found reports by comparing details such as item category, date, location and description. Users can view possible matching items and submit private ownership verification details when claiming a found item.

This repository contains the React frontend. It connects to the [FoundIt backend](https://github.com/trizahn2002-source/foundit-backend), a separate repository that stores users, reports and claims.

## Screenshot
<img src="src/assets/screenshot.png" alt="FoundIt App" width="800"/> 

## Features
- Register and log in with email verification or Google sign-in, with password recovery and account settings
- Browse, search and filter lost, found and returned items
- Report a lost or found item with a photo, date and location (Geoapify address search)
- View full item details on a dedicated page, with a map link and a share button
- Find and rank possible matches for active lost items
- Submit a claim with private ownership verification details
- Finders approve or reject claims from their dashboard and mark items as handed over
- Email notifications when a claim is received, approved or rejected
- Optional tip for the finder, shown as a sandbox demo (no real payments)
- Personal dashboard and a responsive layout for phones and desktops

## How Possible Matching Works
FoundIt uses rule-based matching to identify possible matches between lost and found reports.

The matching process considers:
- Item category
- Date proximity
- Location proximity
- Keywords from the item name and description

Only active reports that meet the matching criteria are considered. Stronger possible matches are displayed first.

A possible match does not automatically confirm that two reports refer to the same item. A user must still provide private ownership verification details when claiming a found item.

## Pages and Routes

| Route | Page |
|---|---|
| `/` | Home - browse, search and filter items |
| `/report` | Report a lost or found item (login required) |
| `/items/:id` | View item details, share the item, see possible matches, claim an item or review claims |
| `/dashboard` | User dashboard - reports, claims, claim requests and account settings |
| `/login` | Login / register |
| `/login/verify-otp` | Enter the one-time code to finish logging in |
| `/verify-email` | Confirm your email address after registering |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password from the reset link |
| `*` | Not Found page |

## How to Run the Project

1. Clone the repository:

```bash
git clone git@github.com:trizahn2002-source/foundit.git
```

2. Navigate into the project folder:

```bash
cd foundit
```

3. Install dependencies:

```bash
npm install
```

4. Copy the environment file:

```bash
cp .env.example .env
```

5. Add your Geoapify API key to the `.env` file.

6. Set up and start the backend. FoundIt needs its backend running, otherwise the frontend shows a "database couldn't be reached" error. Clone the FoundIt backend repository (a separate repository), go into its folder and install its dependencies:

```bash
git clone git@github.com:trizahn2002-source/foundit-backend.git
cd foundit-backend
pipenv install
```

7. Start PostgreSQL:

```bash
sudo service postgresql start
```

8. In a separate terminal, run the backend from its folder:

```bash
pipenv run python app.py
```

9. Back in the frontend terminal, start the development server:

```bash
npm run dev
```

10. Open the local URL displayed in the terminal.

## Technologies Used
- React
- React Router DOM
- Vite
- JavaScript
- CSS3
- Geoapify Geocoding API
- Flask and PostgreSQL backend (separate repository)
- Gmail API (verification and claim emails, sent by the backend)
- Vercel (frontend hosting)
- Git and GitHub

## API Used
FoundIt uses the Geoapify Geocoding API for location functionality when reporting items.

The API key should be stored in the `.env` file and should not be committed to GitHub.

## Future Implementations
- Replace the sandbox M-Pesa tipping demo with live payments
- Notify users when new possible matches are found
- Add a hamburger menu for the mobile navbar if more links are added
- Improve the matching system as more reports are added

## Collaborators
- [Trizah Njeri](https://github.com/trizahn2002-source) — Scrum Master, Home Page, Search and Filtering
- [Abigail Tandiwe](https://github.com/tandisimelane-15) — Possible Matches and Claim Item
- [Samuel Mwaura](https://github.com/kimz-art) — Report Item Form and Geoapify API
- [Regan Njeru](https://github.com/toshregan94-hub) — Item Details
- [Wesley Were](https://github.com/WesleyWanga) — Login, Registration and Dashboard

## How to Contribute
1. Create a feature branch for your task
2. Make and test your changes
3. Commit your changes with a clear commit message
4. Push your branch to GitHub
5. Open a pull request to merge your changes into `main`

Pull requests are welcome. For major changes, please open an issue first.

## License
MIT License

Copyright (c) 2026 FoundIt Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.