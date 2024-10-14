# Hackathon Planner Automation

Welcome to the Hackathon Planner Automation project! This project automates various tasks related to organizing and managing hackathons using Google Apps Script.

## Features

- **Automated Announcements**: Sends announcements to Discord channels via webhooks.
- **Reminders**: Sends reminders to participants.
- **Form Management**: Automatically locks Google Forms after the submission deadline.
- **Customizable Messages**: Formats and sends custom messages to participants.

## How It Works

### 1. Sending Announcements

The script sends announcements to a Discord channel using a webhook. The announcement includes details about the hackathon, guides for different levels, and submission deadlines.

### 2. Sending Reminders

Reminders are sent to participants to ensure they are aware of upcoming deadlines and events.

### 3. Locking Forms

After the submission deadline, the script automatically locks the Google Forms to prevent further submissions.

## Setup Instructions

1. **Clone the Repository**: Clone this repository to your local machine.

    ```sh
    git clone <repository-url>
    ```

2. **Install Google Apps Script CLI**: If you haven't already, install the Google Apps Script CLI (`clasp`).

    ```sh
    npm install -g @google/clasp
    ```

3. **Login to Google**: Authenticate `clasp` with your Google account.

    ```sh
    clasp login
    ```

4. **Pull the Project**: Navigate to the project directory and pull the existing project.

    ```sh
    clasp pull
    ```

5. **Set Up Script Properties**: Set up the required script properties for the webhook ID and token.

    ```js
    const WEBHOOK_ID = PropertiesService.getScriptProperties().setProperty('webhookID', 'your-webhook-id');
    const WEBHOOK_TOKEN = PropertiesService.getScriptProperties().setProperty('webhookToken', 'your-webhook-token');
    ```

6. **Deploy the Script**: Deploy the script to Google Apps Script.

    ```sh
    clasp push
    ```

## Usage

### Sending Announcements

To send an announcement, call the `sendAnnouncements` function. This will format and send the announcement message to the specified Discord channel.

### Sending Reminders

To send reminders, call the `sendReminders` function. This will send reminder messages to participants.

### Locking Forms

To lock forms after the submission deadline, call the `lockForms` function. This will lock the Google Forms and update the status in the spreadsheet.

## Configuration

### Campuses and Levels

The list of campuses and levels can be configured in the [Configs.js](Configs.js) file.

```js
const campuses = [
    "Pune",
    "Dharamshala",
    "Sarjapura",
    "Amravati/Bengaluru",
    "Udaipur",
    "Raipur",
    "Dantewada",
    "Jashpur",
    "Kishanganj"
];

const levels = [
    "Level 1",
    "Level 2",
    "Level 3"
];
```

### Contributing
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

### License
This project is licensed under the MIT License.