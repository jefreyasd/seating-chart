const id = '1094575956524-73phj5g8irgj7jvq1g2vc5c12dvov3md.apps.googleusercontent.com';
const scopes = 'https://www.googleapis.com/auth/forms.body';

let button = document.getElementById("sortbutton");
let input = document.getElementById("fileInput");
let tc;
let accessToken = null;

// Initialize the token client
window.onload = function() {
    tc = google.accounts.oauth2.initTokenClient({
        client_id: id,
        scope: scopes,
        callback: (tokenResponse) => {
            accessToken = tokenResponse.access_token;
            runSeatingLogic();
        },
    });
};
//creates a seating chart form with the given student names
async function createSeatingChartForm(authClient, studentNames) {
    const baseUrl = "https://forms.googleapis.com/v1/forms";

    const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            info: { title: "Seating Chart Preferences", documentTitle: "Seating Chart Preferences" }
        })
    });
    const formData = await createRes.json();
    const formId = formData.formId;
    const formUrl = formData.responderUri;

    const nameOptions = studentNames.map(name => ({ value: name }));
    const updateRequest = {
        requests: [
            {
                createItem: {
                    item: {
                        title: "What is your name?",
                        questionItem: { question: { required: true, choiceQuestion: { type: 'RADIO', options: nameOptions } } }
                    },
                    location: { index: 0 }
                }
            },
            {
                createItem: {
                    item: {
                        title: "Who would you like to sit with?",
                        questionItem: { question: { required: false, choiceQuestion: { type: 'RADIO', options: nameOptions } } }
                    },
                    location: { index: 1 }
                }
            },
            {
                createItem: {
                    item: {
                        title: "Is there anyone you would prefer NOT to sit with?",
                        questionItem: { question: { required: false, choiceQuestion: { type: 'RADIO', options: nameOptions } } }
                    },
                    location: { index: 2 }
                }
            },
            {
                createItem: {
                    item: {
                        title: "I have trouble seeing the board from the back.",
                        questionItem: { question: { required: true, choiceQuestion: { type: 'RADIO', options: [{ value: "True" }, { value: "False" }] } } }
                    },
                    location: { index: 3 }
                }
            }
        ]
    };

    await fetch(`${baseUrl}/${formId}:batchUpdate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updateRequest)
    });

    console.log(`Share this URL with students: ${formUrl}`);
    alert("Form Created: " + formUrl);
    return formUrl;
}
//handles the button click event so it makes it into a list for the code to use to make the form
button.onclick = function() {
    if (!accessToken) {
        tc.requestAccessToken();
    } else {
        runSeatingLogic();
    }
};
async function runSeatingLogic() {
    const file = input.files[0];
    const filename = String(file.name);
    const text = await file.text();
    let data = JSON.parse(text);
    let studentNames = [];
    if (filename.startsWith("roster(api)")) {
        for (let i = 0; i < data.length; i++) {
            studentNames.push(data[i].fullName);
        }
    }
    else if (filename.startsWith("roster(manual)")) {
        for (let i = 0; i < data.length; i++)
            studentNames.push(data[i]);
    }
    else {
        window.prompt("please use a valid file (name strats with roster(api) or roster(manual)) and make sure if it is a manual file that it is a json file and is a list of names")
        return;
    }
    
    let studentNames = rawNames.filter((name, index) => {
    return rawNames.indexOf(name) === index;});

    studentNames.sort();
    if (studentNames.length > 0) {
        await createSeatingChartForm(accessToken, studentNames);
        window.location.href = 'Seatings.html'
    }
};
//no preferences button
let noprefbutton = document.getElementById("noprefbutton")
noprefbutton.onclick = function(){
    window.location.href = 'Seatings.html'
}
