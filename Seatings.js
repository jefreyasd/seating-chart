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
    table.innerText = `Table ${i + 1}`;
    table.style.left = (20 + (i * 10)) + 'px';
    table.style.top = (20 + (i * 10)) + 'px';
    const tablenames = document.createElement("table");
    tablenames.classList.add("tablenames");
    tablenames.id = "table-display-" + i; 
    tablenames.style.margin = "15px";
    table.appendChild(tablenames)
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
    //moves the table

    function onMouseMove(e) {
        if (drag !== true) {
            return;
        }
        const containerRect = container.getBoundingClientRect();
        let newX = e.clientX - offsetX - containerRect.left;
        let newY = e.clientY - offsetY - containerRect.top;
        table.style.left = String(newX) + 'px';
        table.style.top = String(newY) + 'px';
    }
//releases the table
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
let userdiv = document.getElementById("userinputdiv")
let nopref;
let sortingdata;
//handles the button click event
button.onclick = function(){
    const file = inputpref.files[0];
    if(!file) { alert("Please select a file"); return; }

    const reader = new FileReader();
    const filename = String(file.name);

    if (filename.startsWith("roster(manual)") || filename.startsWith("roster(api)")){
        runSeatingLogic()
        return; 
    }
//reads the file
    reader.onload = function(e){
        const text = e.target.result;  
        const lines = text.split('\n');
        const data = [];

        for (let i = 0; i < lines.length; i++) {
            data.push(lines[i].split(','));
        }
        sortingdata = maketable(data)

        sorting();
    };
//makes the table
    function maketable(data){
        let gooddata = [];
        for (let i = 1; i < data.length; i++){
            if(data[i].length > 1) { 
                gooddata.push(data[i].slice(1, 5));
            }
        }
        return gooddata;
    }
    reader.readAsText(file)
}
//runs the seating logic and allows for no preferences
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
    else {
        window.prompt("Please use a valid file")
        return;
    }

    studentNames.sort(() => Math.random() - 0.5);

    sortingdata = studentNames.map(name => [name, "", "", "FALSE"]);

    nopref = true

    sorting();
};

let inputfronttable = document.getElementById("fronttableinput")
let inputnumstudents = document.getElementById("numStudentsatable")
//sorts the students into tables
function sorting() {
    let tablecount = Number(input.value);
    if (document.getElementsByClassName('tables').length === 0) {
        alert("create the table first using the top button.");
        return;
    }

    let tables = {};
    for (let i = 0; i < tablecount; i++) {
        tables[i] = [];
    }

    let students = [];

    for (let s of sortingdata) {
        let named = s[0];
        let likes = "";
        let dislike = "";
        let see = "FALSE";

        if (s[1]) {
            likes = s[1].trim();
        } else {
            likes = "";
        }
        if (s[2]) {
            dislike = s[2].trim();
        } else {
            dislike = "";
        }

        if (s[3]) {
            see = s[3].trim().toUpperCase();
        } else {
            see = "FALSE";
        }
        students.push({
            name: named,
            like: likes,
            dislike: dislike,
            vision: see,
            assigned: false
        });
    }
    
    let maxstudents = Number(inputnumstudents.value);
    let fronttables = Number(inputfronttable.value);
//checks if the student can sit at the table
    function canSit(student, idoftable) {
        for (let seatedName of tables[idoftable]) {
            if (student.dislike === seatedName) return false;
            let seatedObj = students.find(s => s.name === seatedName);
            if (seatedObj && seatedObj.dislike === student.name) return false;
        }
        return true;
    }

    let frontStudents = students.filter(s => s.vision === "TRUE");
    frontStudents.sort(() => Math.random() - 0.5); 

    for (let s of frontStudents) {
        for (let i = 0; i < fronttables; i++) {
            if (tables[i].length < maxstudents && canSit(s, i)) {
                tables[i].push(s.name);
                s.assigned = true;
                break;
            }
        }
        if (!s.assigned) {
            for (let i = 0; i < tablecount; i++) {
                if (tables[i].length < maxstudents) {
                    tables[i].push(s.name);
                    s.assigned = true;
                    break;
                }
            }
        }
    }

    let regularStudents = students.filter(s => !s.assigned);
    regularStudents.sort(() => Math.random() - 0.5);

    for (let s of regularStudents) {
        let placed = false;

        if (s.like) {
            for (let i = 0; i < tablecount; i++) {
                if (tables[i].includes(s.like) && tables[i].length < maxstudents && canSit(s, i)) {
                    tables[i].push(s.name);
                    s.assigned = true;
                    placed = true;
                    break;
                }
            }
        }

        if (!placed) {
            for (let i = 0; i < tablecount; i++) {
                if (tables[i].length < maxstudents && canSit(s, i)) {
                    tables[i].push(s.name);
                    s.assigned = true;
                    placed = true;
                    break;
                }
            }
        }

        if (!placed) {
            for (let i = 0; i < tablecount; i++) {
                if (tables[i].length < maxstudents) {
                    tables[i].push(s.name);
                    s.assigned = true;
                    break;
                }
            }
        }
    }

    for (let i = 0; i < tablecount; i++) {
        let liststudentinconatnor = document.getElementById("table-display-" + i);
        if (liststudentinconatnor) {
                liststudentinconatnor.innerHTML = "";
            for (let named of tables[i]) {
                let namediv = document.createElement("div");
                namediv.innerText = named;
                liststudentinconatnor.appendChild(namediv);
            }
        }
    }

    console.log("Seating Chart Complete:", tables);
}
