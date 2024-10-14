const WEBHOOK_ID = PropertiesService.getScriptProperties().getProperty('webhookID');
const WEBHOOK_TOKEN = PropertiesService.getScriptProperties().getProperty('webhookToken');

function sendAnnouncements() {
    const sheetName = "Hackathons";  // source sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    if (!sheet) {
        console.error(`Sheet ${sheetName} not found.`);
        return;
    }

    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();

    const today = new Date();
    // const formattedToday = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd MMM, yyyy');

    // Check for hackathons not yet announced
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rawDate = row[0];
        const hackathonDate = new Date(rawDate);
        const formattedDate = Utilities.formatDate(hackathonDate, Session.getScriptTimeZone(), 'dd MMM, yyyy');
        const WEEKMS = 604800000;

        // Check if the hackathon date is within a week from today
        if (hackathonDate.valueOf() > today.valueOf() && hackathonDate.valueOf() - today.valueOf() <= WEEKMS) {
            const announced = row[8]; // Column I for message sent status

            // Check if the message has not been sent
            if (announced !== true) {
                const formDetails = createForm(formattedDate);

                const text = row[1];
                const level1Doc = row[2];
                const level2Doc = row[3];
                const level3Doc = row[4];
                const deadline = new Date(row[5]);
                const reminder = new Date(row[6]);
                const formUrl = formDetails.formUrl;

                const message = formatMessage(text, level1Doc, level2Doc, level3Doc, hackathonDate, deadline, formattedDate, formUrl);

                // Send the message to Discord
                sendDiscordMessageViaWebhook(message);

                // update the form ID in column H
                sheet.getRange(i + 1, 8).setValue(formDetails.formId);
                // update the form URL in column I
                sheet.getRange(i + 1, 9).setValue(formUrl);
                // update the spreadsheet URL in column J
                sheet.getRange(i + 1, 10).setValue(formDetails.ssUrl);
                // update the row number to mark as sent in column K
                sheet.getRange(i + 1, 11).setValue(true);

                // create triggers on reminder
                const reminderTrigger = ScriptApp.newTrigger("sendReminders")
                    .timeBased()
                    .at(reminder)
                    .create();

                // create trigger to lock the form after the deadline
                const deadlineTrigger = ScriptApp.newTrigger("lockForms")
                    .timeBased()
                    .at(deadline)
                    .create();

            } else {
                console.log("Announcement already sent. Skipping row:", i);
            }
        }
    }
}

function sendReminders() {
    console.log("Sending reminder...");
    const sheetName = "Hackathons";  // source sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    if (!sheet) {
        console.error(`Sheet ${sheetName} not found.`);
        return;
    }

    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();

    // Check for hackathons not yet announced
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const announced = row[10]; // Column I for message sent status
        const remindersSent = row[11]; // Column L for reminders sent status
        const deadline = new Date(row[5]);

        // Check if the message has not been sent
        if (announced === true && remindersSent !== true) {
            // get all submitted forms
            const formId = row[7];
            const form = FormApp.openById(formId);
            const formResponses = form.getResponses();
            const formUrl = row[8];
            const ssUrl = row[9];

            // send reminders to all students
            for (let j = 0; j < formResponses.length; j++) {
                const email = formResponses[j].getRespondentEmail();
                
                // send email to the student for deadline
                const subject = "🚀 Hackathon Submission Deadline Reminder!";
                const message = `
🎉 Attention Hackathon Participants!

This is a friendly reminder that the submission deadline for the hackathon is fast approaching! Make sure to complete and submit your project by ${Utilities.formatDate(deadline, Session.getScriptTimeZone(), 'dd MMM, yyyy HH:mm')}.

🕒 Deadline: ${Utilities.formatDate(deadline, Session.getScriptTimeZone(), 'dd MMM, yyyy HH:mm')}

We can't wait to see your innovative projects. Good luck!

Best regards,
The Hackathon Team
                `;

                MailApp.sendEmail(email, subject, message);
            }

            // update the row number to mark as sent in column L
            sheet.getRange(i + 1, 12).setValue(true);
        } else {
            console.log("Reminders already sent. Skipping row:", i);
        }

    }
}

function lockForms() {
    console.log("Locking form...");
    const sheetName = "Hackathons";  // source sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

    if (!sheet) {
        console.error(`Sheet ${sheetName} not found.`);
        return;
    }

    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();

    // Check for hackathons not yet announced
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const announced = row[10]; // Column K for message sent status
        const locked = row[12]; // Column M for form locked status
        const formId = row[7];

        // Check if the message has not been sent
        if (announced === true && locked !== true) {
            // lock the form after the deadline
            const form = FormApp.openById(formId);
            form.setAcceptingResponses(false);

            // update the row number to mark as sent in column M
            sheet.getRange(i + 1, 13).setValue(true);
        } else {
            console.log("Already locked. Skipping row:", i);
        }

    }
}

// Format the message to be sent to the students.
function formatMessage(text, level1Doc, level2Doc, level3Doc, hackathonDate, deadline, formattedDate, formUrl) {
    return `
@everyone
🎉 **Attention Learners!**
        
We are thrilled to announce the upcoming **Hackathon** on **${formattedDate}**! Get ready to showcase your skills and creativity. Here are the details:

🏆 **Hackathon:** ${text}

📚 **Guides to Help You Succeed:**
- **Level 1 Guide:** [${level1Doc}]
- **Level 2 Guide:** [${level2Doc}]
- **Level 3 Guide:** [${level3Doc}]

⏰ **Hackathon Starts At:** ${hackathonDate}

⏰ **Submission Deadline:** ${deadline}

🚀 **Submit Your Projects Here:** [${formUrl}]

**Good luck to all participants! Let's innovate and create something amazing!**
    `;
}

// Create a form for the hackathon submission with the given date and return the form ID.
function createForm(date) {
    // Open a form by ID and create a new spreadsheet.
    var form = FormApp.create(`Hackathon Submission Form - ${date}`);
    var ss = SpreadsheetApp.create(`Hackathon Submissions - ${date}`);

    // Update form properties via chaining.
    form.setTitle(`Hackathon Submission Form - ${date}`)
        .setDescription('Submit the links to the Github repository here!\n\n**Note: Each member has to create their individual repositories and submit their links here.**')
        .setConfirmationMessage('Thanks for responding!')
        .setRequireLogin(true)
        .setCollectEmail(true)
        .setAllowResponseEdits(true)
        .setLimitOneResponsePerUser(true)
        .setAcceptingResponses(true);

    // Add campus dropdown.
    var campusDropdown = form.addListItem()
        .setRequired(true)
        .setTitle('Campus');
    var campusChoices = []
    for (var campus of campuses) {
        campusChoices.push(campusDropdown.createChoice(campus));
    }
    campusDropdown.setChoices(campusChoices);

    // Add level dropdown.
    var levelDropdown = form.addListItem()
        .setRequired(true)
        .setTitle('Level');
    var levelChoices = []
    for (var level of levels) {
        levelChoices.push(levelDropdown.createChoice(level));
    }
    levelDropdown.setChoices(levelChoices);

    // Add team name text field.
    form.addTextItem()
        .setTitle('Team Name');

    // Link to the Github repository.
    form.addTextItem()
        .setTitle('Link to the Github repository')
        .setRequired(true);

    // Update the form's response destination.
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    console.log(`Form URL: ${form.getPublishedUrl()}`);
    console.log(`Spreadsheet URL: ${ss.getUrl()}`);

    return {
        formId: form.getId(),
        formUrl: form.getPublishedUrl(),
        ssUrl: ss.getUrl(),
    }
}

function sendDiscordMessageViaWebhook(message) {
    const url = `https://discord.com/api/webhooks/${WEBHOOK_ID}/${WEBHOOK_TOKEN}`;
    const payload = {
        content: message,
    };

    const options = {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify(payload),
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    if (responseCode !== 204) {
        Logger.log(`Error sending message to Discord. Response code: ${responseCode}`);
    } else {
        Logger.log("Message sent to Discord successfully.");
    }
}