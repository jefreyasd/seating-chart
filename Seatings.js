const submit = document.getElementById('submitBtn');
const input = document.getElementById('tableCount');
const container = document.getElementById('container');

//creates the tables
submit.onclick = function() {
    const count = Number(input.value);
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        createTable(i);
    }
}

//creates the table element
function createTable(i) {
    const table = document.createElement('div');
    table.classList.add('tables');
    table.style.position = "absolute"; 
    table.innerText = `Table ${i + 1}`;
    const horizontalSpacing = 150; 
    const verticalSpacing = 200;
    const startX = 50;
    const startY = 50;
    let col = Math.floor(i / 2);
    let row = i % 2;
    table.style.left = (startX + (col * horizontalSpacing)) + 'px';
    table.style.top = (startY + (row * verticalSpacing)) + 'px';
    const tablenames = document.createElement("table");
    tablenames.classList.add("tablenames");
    tablenames.id = "table-display-" + i; 
    tablenames.style.margin = "15px";
    table.appendChild(tablenames);
    container.appendChild(table);
    applyDragToElement(table);
}
//allows the tables to be dragged
function applyDragToElement(table) {
    let drag = false;
    let offsetX = 0;
    let offsetY = 0;

    table.addEventListener('mousedown', (e) => {
        drag = true;
        table.style.cursor = 'grabbing';
        const rect = table.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (drag !== true) return;
        const containerRect = container.getBoundingClientRect();
        let newX = e.clientX - offsetX - containerRect.left;
        let newY = e.clientY - offsetY - containerRect.top;
        table.style.left = String(newX) + 'px';
        table.style.top = String(newY) + 'px';
    }

    function onMouseUp() {
        drag = false;
        table.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

//sorting
let inputpref = document.getElementById("fileInput");
let button = document.getElementById("submitfilebutton");
let sortingdata;

button.onclick = function() {
    const file = inputpref.files[0];
    if(!file) { alert("select a file"); return; }

    const reader = new FileReader();
    const filename = String(file.name);
//check if the file is a roster file so then no sorting is needed
    if (filename.startsWith("roster(manual)") || filename.startsWith("roster(api)")){
        runSeatingLogic();
        return; 
    }

    reader.onload = function(e){
        const text = e.target.result;  
        const lines = text.split('\n');
        const data = [];

        for (let i = 0; i < lines.length; i++) {
            data.push(lines[i].split(','));
        }
        sortingdata = maketable(data);
        sorting();
    };

    function maketable(data){
        let gooddata = [];
        for (let i = 1; i < data.length; i++){
            if(data[i].length > 1) { 
                gooddata.push(data[i].slice(1, 5)); 
            }
        }
        return gooddata;
    }
    reader.readAsText(file);
}
//this is to parse the json file so i can use it
async function runSeatingLogic() {
    const file = inputpref.files[0];
    const filename = String(file.name);
    const text = await file.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) { console.log("JSON Error"); return; }

    let studentNames = [];
    if (filename.startsWith("roster(api)")) {
        for (let i = 0; i < data.length; i++) {
            studentNames.push(data[i].fullName);
        }
    } 
    else if (filename.startsWith("roster(manual)")) {
        for (let i = 0; i < data.length; i++) {
            studentNames.push(data[i]);
        }
    }

    studentNames.sort(() => Math.random() - 0.5);
    sortingdata = studentNames.map(name => [name, "", "", "FALSE"]);
    sorting();
};

let inputfronttable = document.getElementById("fronttableinput");
let inputnumstudents = document.getElementById("numStudentsatable");
//sorting function
function sorting() {
    let tablecount = Number(input.value);
    let maxstudents = Number(inputnumstudents.value);
    let fronttables = Number(inputfronttable.value);

    if (document.getElementsByClassName('tables').length === 0) {
        alert("create the table first using the top button.");
        return;
    }
//makes the tables
    let tables = {};
    for (let i = 0; i < tablecount; i++) {
        tables[i] = [];
    }
//makes the students data better to use
    let students = [];
    for (let s of sortingdata) {
        students.push({
            name: (s[0] || "").trim(),
            like: s[1] ? s[1].trim() : "",
            dislike: s[2] ? s[2].trim() : "",
            vision: (s[3] && s[3].trim().toUpperCase() === "TRUE"),
            assigned: false
        });
    }
//checks if the student can sit at the table
    function doseating(studentss, tabless){
        let currentTable = tables[tabless];
        if (!currentTable || currentTable.length >= maxstudents) {
            return false;
        }
        for (let classmate of currentTable) {
            if (studentss.dislike == classmate.name || classmate.dislike == studentss.name) {
                return false;
            }
        }
        currentTable.push(studentss);
        return true;
    }
//checks if the student can sit at the front table
    let possiblestudentsinfront = maxstudents * fronttables;
    let frontstudents = [];
    let truefrontstudents = [];
    for(let i = 0; i < students.length; i++){
        if(students[i].vision === true)
             frontstudents.push(students[i]);
    }

    if(frontstudents.length > possiblestudentsinfront){
        for (let i = 0; i < possiblestudentsinfront; i++){
            let randommsss = Math.floor(Math.random() * frontstudents.length);
            truefrontstudents.push(frontstudents.splice(randommsss, 1)[0]);
        }
    } else {
        truefrontstudents = frontstudents;
    }
//seats the students
    let ii = 0;
    while (ii < truefrontstudents.length){
        let currentS = truefrontstudents[ii];
        let didseating = false;

        for (let t = 0; t < fronttables; t++) {
            if (tables[t].some(s => s.name === currentS.like)) {
                didseating = doseating(currentS, t);
                if (didseating) break;
            }
        }

        if (!didseating) {
            let randomssss = Math.floor(Math.random() * fronttables);
            didseating = doseating(currentS, randomssss);
        }

        if (!didseating) {
            for (let t = 0; t < fronttables; t++) {
                if (doseating(currentS, t)) { didseating = true; break; }
            }
        }

        if (didseating) currentS.assigned = true;
        ii++;
    }

    let unsortedstudents = students.filter(student => !student.assigned);
    let iii = 0;
    while(iii < unsortedstudents.length){
        let currentS = unsortedstudents[iii];
        let didseating = false;

        for (let t = 0; t < tablecount; t++) {
            if (tables[t].some(s => s.name === currentS.like)) {
                didseating = doseating(currentS, t);
                if (didseating) break;
            }
        }

        if (!didseating) {
            let randomsssss = Math.floor(Math.random() * tablecount);
            didseating = doseating(currentS, randomsssss);
        }

        if (!didseating) {
            for (let t = 0; t < tablecount; t++) {
                if (doseating(currentS, t)) { didseating = true; break; }
            }
        }

        if (didseating) currentS.assigned = true;
        iii++;
    }

    for (let i = 0; i < tablecount; i++) {
        let displayTable = document.getElementById("table-display-" + i);
        if (displayTable) {
            displayTable.innerHTML = ""; 
            for (let student of tables[i]) {
                let row = displayTable.insertRow();
                let cell = row.insertCell();
                cell.innerText = student.name;
            }
        }
    }
}
